#!/usr/bin/env node
// Search for distinct tickets covering a FIXED set of target draws.
// Exemple : 50 grilles de 4 numéros, au moins 4 grilles à 3/4 par cible, sur 2000 tirages fixes.
// node bin/target-covering.mjs --draws 2000 --tickets 50 --ticket-size 4 --hits 3 --target-count 4
// Avec tes propres tirages : ajouter --combinations mes-tirages.txt (alias de --targets).
// Recherche continue jusqu’à Ctrl+C ou couverture complète ; ajouter --seconds 60 pour un essai limité.
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULTS = Object.freeze({
    totalBalls: 56, drawSize: 16, ticketSize: 5, hits: 4, targetCount: 1, tickets: 50,
    draws: 2000, seed: 20261104, candidates: 24, replacementCandidates: 8,
    restartEvery: 10000, iterations: 0, seconds: 0,
});

export function randomGenerator(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function choose(items, size, random) {
    const copy = [...items];
    for (let i = 0; i < size; i++) {
        const j = i + Math.floor(random() * (copy.length - i));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, size);
}

function binomial(n, k) {
    let result = 1n;
    for (let i = 1; i <= Math.min(k, n - k); i++) {
        result = result * BigInt(n - i + 1) / BigInt(i);
    }
    return result;
}

export function validateConfig(config) {
    for (const field of ['totalBalls', 'drawSize', 'ticketSize', 'hits', 'targetCount', 'tickets',
        'draws', 'candidates', 'replacementCandidates', 'restartEvery']) {
        if (!Number.isSafeInteger(config[field]) || config[field] < 1) {
            throw new Error(`${field}: entier strictement positif requis`);
        }
    }
    for (const field of ['seed', 'iterations', 'seconds']) {
        if (!Number.isSafeInteger(config[field]) || config[field] < 0) {
            throw new Error(`${field}: entier positif ou nul requis`);
        }
    }
    if (config.totalBalls > 96 || config.drawSize > config.totalBalls || config.ticketSize > config.totalBalls ||
        config.hits > Math.min(config.drawSize, config.ticketSize)) {
        throw new Error('Univers maximal 96 ; tailles dans l’univers ; seuil compatible avec tirage et grille');
    }
    if (config.seed > 0xFFFFFFFF) throw new Error('seed: maximum 4294967295');
    if (config.targetCount > config.tickets) throw new Error('targetCount ne peut pas dépasser le nombre de grilles');
    if (config.tickets > 10000 || BigInt(config.tickets) > binomial(config.totalBalls, config.ticketSize)) {
        throw new Error('Budget de grilles distinctes impossible ou supérieur à 10000');
    }
}

export function validateRows(rows, size, total, name) {
    if (!Array.isArray(rows) || !rows.length) throw new Error(`${name}: liste non vide requise`);
    const seen = new Set();
    return rows.map((row, index) => {
        if (!Array.isArray(row) || row.length !== size || new Set(row).size !== size ||
            row.some(value => !Number.isInteger(value) || value < 1 || value > total)) {
            throw new Error(`${name}, ligne ${index + 1}: ${size} numéros distincts entre 1 et ${total} requis`);
        }
        const canonical = [...row].sort((a, b) => a - b);
        const key = canonical.join('-');
        if (seen.has(key)) throw new Error(`${name}, ligne ${index + 1}: doublon`);
        seen.add(key);
        return canonical;
    });
}

export function loadRows(file, property) {
    const text = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim();
    if (text.startsWith('[') || text.startsWith('{')) {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : data[property];
    }
    return text.split(/\r?\n/).map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split(/[\s|,;]+/).map(Number));
}

export function makeTargets(config) {
    if (BigInt(config.draws) > binomial(config.totalBalls, config.drawSize)) {
        throw new Error('Plus de cibles demandées que de tirages distincts possibles');
    }
    const random = randomGenerator(config.seed ^ 0xA5A5A5A5);
    const universe = Array.from({ length: config.totalBalls }, (_, i) => i + 1);
    const seen = new Set(), targets = [];
    // Near saturation, enumeration avoids an arbitrarily slow coupon-collector loop.
    if (binomial(config.totalBalls, config.drawSize) <= BigInt(config.draws) * 2n) {
        const all = [];
        const visit = (row, minimum) => {
            if (row.length === config.drawSize) { all.push(row); return; }
            for (let ball = minimum; ball <= config.totalBalls - config.drawSize + row.length + 1; ball++) {
                visit([...row, ball], ball + 1);
            }
        };
        visit([], 1);
        return choose(all, config.draws, random);
    }
    while (targets.length < config.draws) {
        const row = choose(universe, config.drawSize, random).sort((a, b) => a - b);
        const key = row.join('-');
        if (!seen.has(key)) { seen.add(key); targets.push(row); }
    }
    return targets;
}

export function popcount(value) {
    value -= (value >>> 1) & 0x55555555;
    value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
    return (((value + (value >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

function visitBits(words, visit) {
    for (let word = 0; word < words.length; word++) {
        let bits = words[word] >>> 0;
        while (bits) {
            const low = bits & -bits;
            visit(word * 32 + 31 - Math.clz32(low));
            bits = (bits ^ low) >>> 0;
        }
    }
}

export class TargetIndex {
    constructor(targets, config) {
        this.config = config;
        this.targets = validateRows(targets, config.drawSize, config.totalBalls, 'Cibles');
        this.words = Math.ceil(targets.length / 32);
        const bytes = (config.totalBalls + config.tickets + 8) * this.words * 4;
        if (bytes > 256 * 1024 * 1024) throw new Error('Configuration dépassant 256 Mio de tableaux de couverture');
        this.membership = Array.from({ length: config.totalBalls + 1 }, () => new Uint32Array(this.words));
        for (let draw = 0; draw < targets.length; draw++) {
            for (const ball of targets[draw]) this.membership[ball][draw >>> 5] |= 1 << (draw & 31);
        }
        this.all = new Uint32Array(this.words).fill(0xFFFFFFFF);
        if (targets.length % 32) this.all[this.words - 1] = 0xFFFFFFFF >>> (32 - targets.length % 32);
        this.universe = Array.from({ length: config.totalBalls }, (_, i) => i + 1);
    }

    coverage(ticket) {
        const covered = new Uint32Array(this.words);
        const members = ticket.map(ball => this.membership[ball]);
        if (ticket.length === 5 && this.config.hits === 4) {
            // At least four among A..E: ABC(D|E) or DE(AB|AC|BC).
            const [a, b, c, d, e] = members;
            for (let w = 0; w < this.words; w++) {
                covered[w] = (a[w] & b[w] & c[w] & (d[w] | e[w])) |
                    (d[w] & e[w] & ((a[w] & b[w]) | (a[w] & c[w]) | (b[w] & c[w])));
            }
        } else {
            // Bitset dynamic programming for any supported ticket size / threshold.
            const atLeast = new Uint32Array(this.config.hits + 1);
            for (let w = 0; w < this.words; w++) {
                atLeast.fill(0);
                atLeast[0] = this.all[w];
                for (let i = 0; i < members.length; i++) {
                    for (let h = Math.min(i + 1, this.config.hits); h >= 1; h--) {
                        atLeast[h] |= atLeast[h - 1] & members[i][w];
                    }
                }
                covered[w] = atLeast[this.config.hits];
            }
        }
        return covered;
    }

    score(mask, missing = this.all) {
        let count = 0;
        for (let w = 0; w < this.words; w++) count += popcount(mask[w] & missing[w]);
        return count;
    }

    candidate(missing, forbidden, tries, random, critical = missing) {
        const indices = [];
        visitBits(missing, index => indices.push(index));
        if (!indices.length) return null;
        let best = null, bestCount = -1, bestFulfilled = -1;
        const consider = ticket => {
            ticket.sort((a, b) => a - b);
            const key = ticket.join('-');
            if (forbidden.has(key)) return;
            const mask = this.coverage(ticket);
            const count = this.score(mask, critical);
            const fulfilled = this.score(mask, missing);
            if (count > bestCount || (count === bestCount && fulfilled > bestFulfilled)) {
                bestCount = count;
                bestFulfilled = fulfilled;
                best = { ticket, mask, key };
            }
        };
        for (let attempt = 0; attempt < tries; attempt++) {
            const target = this.targets[indices[Math.floor(random() * indices.length)]];
            const core = choose(target, this.config.hits, random);
            const remaining = this.universe.filter(ball => !core.includes(ball));
            const extra = this.config.ticketSize - core.length;
            if (extra === 1) {
                // Exhaust all completions, as in the initial 4/5 prototype.
                for (const ball of remaining) consider([...core, ball]);
            } else {
                for (let i = 0; i < (extra === 0 ? 1 : 8); i++) {
                    consider([...core, ...choose(remaining, extra, random)]);
                }
            }
        }
        return best;
    }

    randomTicket(random, forbidden) {
        for (let attempt = 0; attempt < 1000; attempt++) {
            const ticket = choose(this.universe, this.config.ticketSize, random).sort((a, b) => a - b);
            if (!forbidden.has(ticket.join('-'))) return ticket;
        }
        // Deterministic fallback when almost all combinations are already in use.
        const row = Array.from({ length: this.config.ticketSize }, (_, i) => i + 1);
        while (true) {
            if (!forbidden.has(row.join('-'))) return [...row];
            let i = row.length - 1;
            while (i >= 0 && row[i] === this.config.totalBalls - row.length + i + 1) i--;
            if (i < 0) throw new Error('Aucune grille distincte disponible');
            row[i]++;
            for (let j = i + 1; j < row.length; j++) row[j] = row[j - 1] + 1;
        }
    }
}

export class CoveringSystem {
    constructor(index, tickets = []) {
        this.index = index;
        this.tickets = [];
        this.masks = [];
        this.keys = new Set();
        this.counts = new Uint32Array(index.targets.length);
        this.covered = new Uint32Array(index.words);
        this.score = 0;
        this.fulfilled = 0;
        for (const ticket of tickets) this.add(ticket);
    }

    add(ticket, mask = this.index.coverage(ticket)) {
        const key = ticket.join('-');
        if (this.keys.has(key)) throw new Error('Grille dupliquée');
        this.keys.add(key);
        this.tickets.push([...ticket]);
        this.masks.push(mask);
        visitBits(mask, draw => {
            if (this.counts[draw]++ < this.index.config.targetCount) this.fulfilled++;
            if (this.counts[draw] === this.index.config.targetCount) {
                this.score++;
                this.covered[draw >>> 5] |= 1 << (draw & 31);
            }
        });
    }

    missingWithout(slot = -1) {
        const missing = this.index.all.map((value, w) => value & ~this.covered[w]);
        if (slot >= 0) visitBits(this.masks[slot], draw => {
            if (this.counts[draw] === this.index.config.targetCount) missing[draw >>> 5] |= 1 << (draw & 31);
        });
        return missing;
    }

    criticalWithout(slot = -1) {
        if (this.index.config.targetCount === 1) return this.missingWithout(slot);
        const critical = new Uint32Array(this.index.words);
        for (let draw = 0; draw < this.counts.length; draw++) {
            const removed = slot < 0 ? 0 : (this.masks[slot][draw >>> 5] >>> (draw & 31)) & 1;
            if (this.counts[draw] - removed === this.index.config.targetCount - 1) {
                critical[draw >>> 5] |= 1 << (draw & 31);
            }
        }
        return critical;
    }

    replace(slot, candidate) {
        const old = this.masks[slot];
        this.keys.delete(this.tickets[slot].join('-'));
        visitBits(old, draw => {
            if (this.counts[draw] <= this.index.config.targetCount) this.fulfilled--;
            if (this.counts[draw]-- === this.index.config.targetCount) {
                this.score--;
                this.covered[draw >>> 5] &= ~(1 << (draw & 31));
            }
        });
        visitBits(candidate.mask, draw => {
            if (this.counts[draw]++ < this.index.config.targetCount) this.fulfilled++;
            if (this.counts[draw] === this.index.config.targetCount) {
                this.score++;
                this.covered[draw >>> 5] |= 1 << (draw & 31);
            }
        });
        this.tickets[slot] = candidate.ticket;
        this.masks[slot] = candidate.mask;
        this.keys.add(candidate.key);
    }
}

// Independent reference scorer, intentionally using ordinary sets instead of bitsets.
export function verifyCoverage(tickets, targets, hits, targetCount = 1) {
    const sets = tickets.map(ticket => new Set(ticket));
    return targets.reduce((count, draw) => {
        let qualifying = 0;
        for (const ticket of sets) {
            let matches = 0;
            for (const ball of draw) if (ticket.has(ball)) matches++;
            if (matches >= hits && ++qualifying >= targetCount) return count + 1;
        }
        return count;
    }, 0);
}

const yieldEventLoop = () => new Promise(done => setImmediate(done));

export async function search(index, config, { onRecord = () => {}, onProgress = () => {}, shouldStop = () => false, initial } = {}) {
    const random = randomGenerator(config.seed);
    const started = performance.now();
    const expired = () => shouldStop() || (config.seconds > 0 && performance.now() - started >= config.seconds * 1000);
    let best = null, baseline = null, current, iterations = 0, restarts = 0, accepted = 0, neutral = 0;
    let lastProgress = started;
    const progress = (stage, ticketCount = config.tickets) => {
        if (performance.now() - lastProgress >= 5000) {
            onProgress({ stage, ticketCount, iterations, restarts, covered: best?.covered ?? 0,
                total: index.targets.length });
            lastProgress = performance.now();
        }
    };
    const remember = () => {
        if (!best || current.score > best.covered || (current.score === best.covered && current.fulfilled > best.fulfilled)) {
            best = { covered: current.score, fulfilled: current.fulfilled,
                deficit: index.targets.length * config.targetCount - current.fulfilled, total: index.targets.length,
                tickets: current.tickets.map(ticket => [...ticket]), iterations, restarts,
                elapsedSeconds: (performance.now() - started) / 1000 };
            onRecord(best);
        }
    };
    const construct = async () => {
        const system = new CoveringSystem(index);
        while (system.tickets.length < config.tickets) {
            const candidate = !expired() && system.score < index.targets.length
                ? index.candidate(system.missingWithout(), system.keys, config.candidates, random, system.criticalWithout()) : null;
            if (candidate) system.add(candidate.ticket, candidate.mask);
            else system.add(index.randomTicket(random, system.keys));
            progress('construction', system.tickets.length);
            await yieldEventLoop();
        }
        return system;
    };
    const baselineSystem = new CoveringSystem(index);
    while (baselineSystem.tickets.length < config.tickets) baselineSystem.add(index.randomTicket(random, baselineSystem.keys));
    baseline = baselineSystem.score;
    if (initial) {
        const rows = validateRows(initial, config.ticketSize, config.totalBalls, 'Système initial');
        if (rows.length !== config.tickets) throw new Error('Le système initial doit contenir exactement le budget de grilles');
        current = new CoveringSystem(index, rows);
        remember();
    } else {
        current = baselineSystem;
        remember();
        if (best.covered < index.targets.length) {
            current = await construct();
            remember();
        }
    }
    let sinceRestart = 0;
    while (!expired() && best.covered < index.targets.length && (!config.iterations || iterations < config.iterations)) {
        const slot = Math.floor(random() * current.tickets.length);
        const missing = current.missingWithout(slot);
        const forbidden = new Set(current.keys);
        forbidden.delete(current.tickets[slot].join('-'));
        const critical = current.criticalWithout(slot);
        const candidate = index.candidate(missing, forbidden, config.replacementCandidates, random, critical);
        iterations++;
        sinceRestart++;
        if (candidate) {
            const gain = index.score(candidate.mask, critical) - index.score(current.masks[slot], critical);
            const fulfillmentGain = index.score(candidate.mask, missing) - index.score(current.masks[slot], missing);
            // Neutral moves explore plateaus; the champion is retained separately.
            const improved = gain > 0 || (gain === 0 && fulfillmentGain > 0);
            if (improved || (gain === 0 && fulfillmentGain === 0 && random() < 0.1)) {
                current.replace(slot, candidate);
                if (improved) accepted++; else neutral++;
                remember();
            }
        }
        if (sinceRestart >= config.restartEvery && !expired() && (!config.iterations || iterations < config.iterations)) {
            restarts++;
            if (restarts % 2 === 0) {
                current = await construct();
            } else {
                // Reuse the champion, then perturb a few tickets to escape its basin.
                current = new CoveringSystem(index, best.tickets);
                for (let i = 0; i < Math.max(1, Math.ceil(config.tickets / 10)); i++) {
                    const slot = Math.floor(random() * current.tickets.length);
                    const ticket = index.randomTicket(random, current.keys);
                    current.replace(slot, { ticket, mask: index.coverage(ticket), key: ticket.join('-') });
                }
            }
            sinceRestart = 0;
            remember();
        }
        await yieldEventLoop();
        progress('remplacements');
    }
    return { ...best, baselineCovered: baseline, iterations, restarts, acceptedReplacements: accepted,
        neutralReplacements: neutral, elapsedSeconds: (performance.now() - started) / 1000 };
}

export async function main(args = process.argv.slice(2)) {
    const names = { 'total-balls': 'totalBalls', 'draw-size': 'drawSize', 'ticket-size': 'ticketSize',
        hits: 'hits', 'target-count': 'targetCount', tickets: 'tickets', draws: 'draws', seed: 'seed', candidates: 'candidates',
        'replacement-candidates': 'replacementCandidates', 'restart-every': 'restartEvery',
        iterations: 'iterations', seconds: 'seconds' };
    const { values } = parseArgs({ args, options: {
        ...Object.fromEntries(Object.keys(names).map(key => [key, { type: 'string' }])),
        targets: { type: 'string' }, combinations: { type: 'string' },
        start: { type: 'string' }, output: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
    } });
    if (values.help) {
        console.log(`Usage: node bin/target-covering.mjs [options]
  --total-balls 56 --draw-size 16 --ticket-size 5 --hits 4
  --target-count 1             Nombre minimum de grilles gagnantes par cible
  --tickets 50 --draws 2000 --seed 20261104
  --targets fichier.txt|json   Cibles fixes, sinon génération de tirages distincts
  --combinations fichier      Alias de --targets, comme dans crescendo.mjs
  --start fichier.txt|json     Système initial de exactement --tickets grilles
  --candidates 24              Noyaux cibles essayés par grille à la construction
  --replacement-candidates 8   Noyaux essayés par remplacement
  --restart-every 10000        Redémarrage après ce nombre de remplacements
  --iterations 0              Maximum de remplacements ; 0 = sans limite
  --seconds 0                 Durée maximale ; 0 = sans limite
  --output results/target     Préfixe des cibles et de chaque record .txt/.json
Par défaut : recherche continue jusqu’à Ctrl+C ou 100 % de couverture.
Une cible est couverte par au moins --target-count grilles distinctes atteignant --hits.
Texte : une ligne par tirage, numéros séparés par espaces, |, virgules ou ;.
JSON : tableau de tirages ou objet avec targets (tickets pour --start).
Doublons refusés. Même graine et mêmes paramètres = mêmes cibles générées.
Les records portent uniquement sur les cibles choisies, pas sur tous les tirages.`);
        return;
    }
    const config = { ...DEFAULTS };
    for (const [flag, key] of Object.entries(names)) if (values[flag] !== undefined) config[key] = Number(values[flag]);
    validateConfig(config);
    for (const flag of ['targets', 'combinations', 'start', 'output']) {
        if (values[flag] !== undefined && !values[flag].trim()) throw new Error(`${flag}: chemin non vide requis`);
    }
    if (values.targets !== undefined && values.combinations !== undefined) {
        throw new Error('Utiliser --targets ou --combinations, pas les deux');
    }
    const inputFile = values.targets ?? values.combinations;
    const targets = inputFile ? loadRows(inputFile, 'targets') : makeTargets(config);
    const index = new TargetIndex(targets, config);
    config.draws = targets.length;
    const initial = values.start ? loadRows(values.start, 'tickets') : undefined;
    if (initial) {
        validateRows(initial, config.ticketSize, config.totalBalls, 'Système initial');
        if (initial.length !== config.tickets) throw new Error('Le système initial doit contenir exactement le budget de grilles');
    }
    const prefix = resolve(values.output ?? `results/target-covering-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    const targetsFile = `${prefix}.targets.json`;
    // Refuse to overwrite another run: the targets and its records must stay linked.
    if (existsSync(targetsFile) || existsSync(`${prefix}.record-000001.json`) || existsSync(`${prefix}.record-000001.txt`)) {
        throw new Error('Préfixe de sortie déjà utilisé ; choisir un autre --output');
    }
    mkdirSync(dirname(prefix), { recursive: true });
    writeFileSync(targetsFile, JSON.stringify({ config, targets: index.targets }, null, 2), { flag: 'wx' });
    let records = 0, stop = false;
    const requestStop = () => { stop = true; };
    process.on('SIGINT', requestStop);
    console.log(`${config.tickets} grilles de ${config.ticketSize}/${config.totalBalls} ; objectif au moins ${config.targetCount} fois ${config.hits}/${config.ticketSize}.`);
    console.log(`${targets.length} cibles FIXES de ${config.drawSize} numéros ; graine ${config.seed}. Cibles : ${targetsFile}`);
    console.log('Recherche du meilleur score, sans seuil à 90 %. Ctrl+C pour arrêter.');
    const saveRecord = record => {
        records++;
        const file = `${prefix}.record-${String(records).padStart(6, '0')}`;
        const report = { model: 'fixed-target-covering-v1', config, targetsFile,
            ...record, coveragePercent: 100 * record.covered / record.total,
            failures: record.total - record.covered,
            scope: 'Couverture conditionnelle de ces cibles fixes ; aucune garantie sur un nouveau tirage.' };
        writeFileSync(`${file}.json`, JSON.stringify(report, null, 2), { flag: 'wx' });
        writeFileSync(`${file}.txt`, record.tickets.map(ticket => ticket.map(n => String(n).padStart(2, '0')).join(' ')).join('\n') + '\n', { flag: 'wx' });
        console.log(`Record ${records}: ${record.covered}/${record.total} (${report.coveragePercent.toFixed(2)} %) ; déficit ${record.deficit} ; ${record.iterations} remplacements, ${record.restarts} redémarrages -> ${file}.txt`);
    };
    try {
        const result = await search(index, config, { onRecord: saveRecord, shouldStop: () => stop, initial,
            onProgress: progress => console.log(`${progress.stage}: ${progress.ticketCount}/${config.tickets} grilles ; meilleur ${progress.covered}/${progress.total} ; ${progress.iterations} remplacements.`) });
        const verified = verifyCoverage(result.tickets, index.targets, config.hits, config.targetCount);
        if (verified !== result.covered) throw new Error('Désaccord entre le score incrémental et la vérification indépendante');
        const summary = { config, targetsFile, ...result, verifiedCovered: verified,
            coveragePercent: 100 * result.covered / result.total, records };
        writeFileSync(`${prefix}.summary.json`, JSON.stringify(summary, null, 2), { flag: 'wx' });
        console.log(`Terminé : ${verified}/${result.total} (${summary.coveragePercent.toFixed(2)} %), vérifié indépendamment. Référence aléatoire : ${result.baselineCovered}/${result.total}.`);
        return summary;
    } finally {
        process.off('SIGINT', requestStop);
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
    main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
