#!/usr/bin/env node
// Fixed targets, monetary objective: all winning ranks contribute to the total.
// node bin/target-recovery.mjs --profile profiles/keno.json --ticket-size 10 --tickets 10 --target 8 --draws 2000
// Replace --draws 2000 with --combinations mes-tirages.txt to use your own sample.
import { parseArgs } from 'node:util';
import { closeSync, createReadStream, existsSync, mkdirSync, openSync, readFileSync, readSync,
    realpathSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { makeTargets, randomGenerator, popcount, validateRow, validateRows, validateConfig,
    loadRows, parseTextRow } from './target-covering.mjs';

export const HELP = `Usage: node bin/target-recovery.mjs [paramètres]

Mode filtrage :
  --filter                     Évaluer les tirages d’un fichier avec un jeu existant
  --tickets-game fichier.txt   Jeu champion, une grille par ligne
  --combinations fichier.txt   Stock de tirages, un tirage complet par ligne
  --profile fichier.json       Géométrie, mise et tableau des lots
  --target EUR                 Seuil de gain brut pour ce filtrage, ex. 15
  --output results/mon-filtre  Préfixe facultatif des fichiers .recovered.txt et .unrecovered.txt
  node bin/target-recovery.mjs --filter --profile profiles/keno.json --tickets-game champion.txt --combinations stock.txt --target 15
  Chaque grille est évaluée avec le barème de sa taille dans le profil.
  Le fichier .recovered.txt contient les gains >= au seuil, .unrecovered.txt les gains < au seuil.

Paramètres obligatoires en mode recherche :
  --profile fichier.json      Géométrie, mise et tableau des lots
  --ticket-size N              Nombre de numéros par grille
  --tickets N                  Nombre de grilles distinctes
  --target EUR                 Gain TOTAL brut souhaité par tirage, ex. 8 ou 8.50
  --draws N                    Tirages distincts à générer, OU :
  --combinations fichier      Tous les tirages de ton échantillon fixe
  --targets fichier           Alias de --combinations

Options facultatives :
  --start fichier.txt|json     Jeu initial, de même taille que le budget
  --output results/mon-jeu    Préfixe des cibles, copies de profil et champions
  --seconds N                  Durée de recherche ; défaut 0 = sans limite
  --iterations N               Remplacements essayés ; défaut 0 = sans limite
  --help, -h                   Afficher cette aide

Réglages avancés facultatifs :
  --seed N                     Graine ; sinon générée, affichée et sauvegardée
  --candidates N               Pistes de construction par grille ; défaut 24
  --replacement-candidates N   Pistes par remplacement ; défaut 8
  --restart-every N            Remplacements entre redémarrages ; défaut 10000

Exemple : dix grilles à 1 EUR, récupérer au moins 8 EUR sur un maximum de cibles :
  node bin/target-recovery.mjs --profile profiles/keno.json --ticket-size 10 --tickets 10 --target 8 --draws 2000
Avec tes cibles, remplacer --draws 2000 par --combinations mes-tirages.txt.
Pour Crescendo, utiliser --profile profiles/crescendo.json --ticket-size 10.
Tous les rangs de gains du profil sont additionnés entre les grilles.
Fichier de tirages : une ligne par tirage complet ; commentaires # et lignes vides ignorés.
Pas de directive @hits ici : l’objectif est défini par --target et le barème par --profile.
Exemple commenté : bin/examples/target-recovery-keno-draws.txt
Classement : fréquence du montant atteint, puis manque total sous ce montant.
Les cibles restent fixes ; pas d’arrêt à 90 %. Ctrl+C ou limites explicites pour arrêter.
Les euros sont calculés en centimes entiers. Le profil est copié dans les exports.
Le résultat dépend du modèle de lots : ce n’est pas une garantie sur de futurs tirages.`;

export function cents(value, name = 'Montant') {
    const text = String(value);
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error(`${name}: montant positif ou nul avec au plus deux décimales`);
    const [whole, fraction = ''] = text.split('.');
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (!Number.isSafeInteger(result)) throw new Error(`${name}: montant trop élevé`);
    return result;
}

function loadProfile(file) {
    const profile = JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    if (profile.schemaVersion !== 1 || profile.currency !== 'EUR' ||
        !['fixed_nominal', 'fixed_base_with_jackpot_floor', 'fixed_simulation'].includes(profile.payoutModel)) {
        throw new Error('Profil EUR version 1 requis, avec lots fixes, plancher de jackpot ou barème de simulation explicite');
    }
    if (profile.payoutModel === 'fixed_simulation' &&
        (profile.simulationAssumptions?.guaranteedMinimum !== false ||
         typeof profile.simulationAssumptions?.explanation !== 'string' ||
         !profile.simulationAssumptions.explanation.trim())) {
        throw new Error('Le barème de simulation doit expliciter ses hypothèses et son absence de minimum garanti');
    }
    const stake = cents(profile.stakePerTicket, 'Mise par grille');
    if (stake < 1) throw new Error('La mise du profil doit être strictement positive');
    return { profile, stake };
}

function profilePayouts(profile, ticketSize) {
    const row = profile.payoutsByTicketSize?.[ticketSize];
    if (!Array.isArray(row) || row.length !== ticketSize + 1 || row.some(x => typeof x !== 'number')) {
        throw new Error(`Le profil doit fournir ${ticketSize + 1} montants numériques pour les grilles de ${ticketSize} numéros`);
    }
    return row.map((amount, hits) => cents(amount, `Lot ${hits}/${ticketSize}`));
}

function validateJackpot(profile, ticketSize, payouts) {
    if (profile.payoutModel === 'fixed_base_with_jackpot_floor') {
        const jackpot = profile.jackpot;
        if (!jackpot || jackpot.ticketSize !== ticketSize || !Number.isInteger(jackpot.hits) ||
            jackpot.hits < 0 || jackpot.hits > ticketSize || jackpot.simulationPolicy !== 'conservative_floor' ||
            cents(jackpot.simulationAmount, 'Valorisation du jackpot') !== payouts[jackpot.hits]) {
            throw new Error('Plancher de jackpot absent ou incohérent avec le tableau des lots');
        }
    }
}

export function readProfile(file, ticketSize) {
    const { profile, stake } = loadProfile(file);
    const payouts = profilePayouts(profile, ticketSize);
    validateJackpot(profile, ticketSize, payouts);
    return { profile, payouts, stake };
}

function sample(items, count, random) {
    const copy = [...items];
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(random() * (copy.length - i));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

function maskOf(row) {
    const mask = new Uint32Array(3);
    for (const ball of row) mask[(ball - 1) >>> 5] |= 1 << ((ball - 1) & 31);
    return mask;
}

function payoutForMasks(ticket, draw, payouts) {
    const hits = popcount(ticket[0] & draw[0]) + popcount(ticket[1] & draw[1]) + popcount(ticket[2] & draw[2]);
    return payouts[hits];
}

export function recoveryScore(totals, target) {
    let successes = 0, deficit = 0;
    for (const total of totals) {
        if (total >= target) successes++; else deficit += target - total;
    }
    return { successes, deficit };
}

export function better(left, right) {
    return !right || left.successes > right.successes ||
        (left.successes === right.successes && left.deficit < right.deficit);
}

export class RecoveryIndex {
    constructor(targets, config, payouts) {
        this.config = config;
        this.payouts = payouts;
        this.targets = validateRows(targets, config.drawSize, config.totalBalls, 'Cibles');
        this.masks = this.targets.map(maskOf);
        this.universe = Array.from({ length: config.totalBalls }, (_, i) => i + 1);
        this.maximumPayout = Math.max(...payouts);
        this.ArrayType = this.maximumPayout <= 0xFFFFFFFF ? Uint32Array : Float64Array;
        const bytes = targets.length * (config.tickets + 4) * this.ArrayType.BYTES_PER_ELEMENT;
        if (bytes > 512 * 1024 * 1024) throw new Error('Configuration dépassant 512 Mio de tableaux de gains');
        if (!Number.isSafeInteger(this.maximumPayout * config.tickets) ||
            !Number.isSafeInteger(config.targetCents * targets.length)) throw new Error('Sommes trop élevées pour un calcul entier exact');
    }

    gains(ticket, output = new this.ArrayType(this.targets.length)) {
        const mask = maskOf(ticket);
        for (let d = 0; d < this.masks.length; d++) {
            output[d] = payoutForMasks(mask, this.masks[d], this.payouts);
        }
        return output;
    }

    randomTicket(random, forbidden) {
        for (let attempt = 0; attempt < 1000; attempt++) {
            const ticket = sample(this.universe, this.config.ticketSize, random).sort((a, b) => a - b);
            if (!forbidden.has(ticket.join('-'))) return ticket;
        }
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

    candidate(baseTotals, forbidden, tries, random, previous) {
        const failing = [];
        for (let d = 0; d < baseTotals.length; d++) if (baseTotals[d] < this.config.targetCents) failing.push(d);
        let best = null;
        const scratch = new this.ArrayType(baseTotals.length);
        const proposedTotals = new Float64Array(baseTotals.length);
        for (let attempt = 0; attempt < tries; attempt++) {
            let ticket;
            if (previous && attempt % 3 === 0) {
                ticket = [...previous];
                const outside = this.universe.filter(ball => !ticket.includes(ball));
                if (outside.length) ticket[Math.floor(random() * ticket.length)] = outside[Math.floor(random() * outside.length)];
            } else if (failing.length && attempt % 5 !== 4) {
                const anchor = failing[Math.floor(random() * failing.length)];
                const draw = this.targets[anchor];
                const outside = this.universe.filter(ball => !draw.includes(ball));
                const ranks = this.payouts.map((gain, hits) => ({ gain, hits })).filter(rank => rank.gain > 0 &&
                    rank.hits <= draw.length && this.config.ticketSize - rank.hits <= outside.length);
                if (ranks.length) {
                    const needed = this.config.targetCents - baseTotals[anchor];
                    const preferred = ranks.filter(rank => rank.gain >= needed).sort((a, b) => a.gain - b.gain || a.hits - b.hits);
                    const rank = attempt % 2 === 0 && preferred.length ? preferred[0] : ranks[Math.floor(random() * ranks.length)];
                    ticket = [...sample(draw, rank.hits, random), ...sample(outside, this.config.ticketSize - rank.hits, random)];
                }
            }
            ticket ??= this.randomTicket(random, forbidden);
            ticket.sort((a, b) => a - b);
            const key = ticket.join('-');
            if (forbidden.has(key)) continue;
            this.gains(ticket, scratch);
            for (let d = 0; d < proposedTotals.length; d++) proposedTotals[d] = baseTotals[d] + scratch[d];
            const score = recoveryScore(proposedTotals, this.config.targetCents);
            if (better(score, best?.score)) best = { ticket, key, score, gains: scratch.slice() };
        }
        return best;
    }
}

export class RecoverySystem {
    constructor(index, tickets = []) {
        this.index = index;
        this.tickets = [];
        this.gains = [];
        this.keys = new Set();
        this.totals = new Float64Array(index.targets.length);
        for (const ticket of tickets) this.add(ticket);
    }
    add(ticket, gains = this.index.gains(ticket)) {
        const key = ticket.join('-');
        if (this.keys.has(key)) throw new Error('Grille dupliquée');
        this.keys.add(key);
        this.tickets.push([...ticket]);
        this.gains.push(gains);
        for (let d = 0; d < this.totals.length; d++) this.totals[d] += gains[d];
    }
    without(slot) {
        return this.totals.map((total, d) => total - this.gains[slot][d]);
    }
    replace(slot, candidate) {
        this.keys.delete(this.tickets[slot].join('-'));
        for (let d = 0; d < this.totals.length; d++) this.totals[d] += candidate.gains[d] - this.gains[slot][d];
        this.tickets[slot] = candidate.ticket;
        this.gains[slot] = candidate.gains;
        this.keys.add(candidate.key);
    }
}

// Independent monetary verification: ordinary sets, no cached gains or masks.
export function verifyTotals(tickets, targets, payouts) {
    const sets = tickets.map(ticket => new Set(ticket));
    return targets.map(draw => sets.reduce((sum, ticket) =>
        sum + payouts[draw.filter(ball => ticket.has(ball)).length], 0));
}

export async function searchRecovery(index, config, { onRecord = () => {}, onProgress = () => {},
    shouldStop = () => false, initial } = {}) {
    const random = randomGenerator(config.seed), started = performance.now();
    const expired = () => shouldStop() || (config.seconds > 0 && performance.now() - started >= config.seconds * 1000);
    const yieldLoop = () => new Promise(done => setImmediate(done));
    let current, best = null, iterations = 0, restarts = 0, accepted = 0, lastProgress = started;
    const progress = stage => {
        if (performance.now() - lastProgress >= 5000) {
            onProgress({ stage, iterations, restarts, best: best?.score });
            lastProgress = performance.now();
        }
    };
    const remember = () => {
        const score = recoveryScore(current.totals, config.targetCents);
        if (better(score, best?.score)) {
            best = { score, tickets: current.tickets.map(ticket => [...ticket]), iterations, restarts,
                elapsedSeconds: (performance.now() - started) / 1000 };
            onRecord(best);
        }
    };
    const construct = async () => {
        const system = new RecoverySystem(index);
        while (system.tickets.length < config.tickets) {
            const candidate = !expired() ? index.candidate(system.totals, system.keys, config.candidates, random) : null;
            if (candidate) system.add(candidate.ticket, candidate.gains);
            else system.add(index.randomTicket(random, system.keys));
            progress('construction');
            await yieldLoop();
        }
        return system;
    };
    current = new RecoverySystem(index);
    while (current.tickets.length < config.tickets) current.add(index.randomTicket(random, current.keys));
    const baselineScore = recoveryScore(current.totals, config.targetCents);
    remember();
    if (initial) {
        const rows = validateRows(initial, config.ticketSize, config.totalBalls, 'Système initial');
        if (rows.length !== config.tickets) throw new Error('Le système initial doit contenir exactement le budget de grilles');
        current = new RecoverySystem(index, rows);
        remember();
        if (better(baselineScore, recoveryScore(current.totals, config.targetCents))) current = new RecoverySystem(index, best.tickets);
    } else if (best.score.successes < index.targets.length) {
        current = null;
        current = await construct();
        remember();
    }
    let sinceRestart = 0;
    while (!expired() && best.score.successes < index.targets.length && (!config.iterations || iterations < config.iterations)) {
        const slot = Math.floor(random() * current.tickets.length), base = current.without(slot);
        const forbidden = new Set(current.keys);
        forbidden.delete(current.tickets[slot].join('-'));
        const candidate = index.candidate(base, forbidden, config.replacementCandidates, random, current.tickets[slot]);
        const score = recoveryScore(current.totals, config.targetCents);
        if (candidate && (better(candidate.score, score) ||
            (candidate.score.successes === score.successes && candidate.score.deficit === score.deficit && random() < 0.1))) {
            current.replace(slot, candidate);
            accepted++;
        }
        iterations++;
        sinceRestart++;
        remember();
        if (sinceRestart >= config.restartEvery && !expired() && (!config.iterations || iterations < config.iterations)) {
            restarts++;
            if (restarts % 2 === 0) { current = null; current = await construct(); }
            else {
                current = new RecoverySystem(index, best.tickets);
                for (let i = 0; i < Math.max(1, Math.ceil(config.tickets / 10)); i++) {
                    const slot = Math.floor(random() * current.tickets.length);
                    const forbidden = new Set(current.keys);
                    forbidden.delete(current.tickets[slot].join('-'));
                    const ticket = index.randomTicket(random, forbidden);
                    current.replace(slot, { ticket, key: ticket.join('-'), gains: index.gains(ticket) });
                }
            }
            sinceRestart = 0;
            remember();
        }
        progress('remplacements');
        await yieldLoop();
    }
    return { ...best, baselineScore, iterations, restarts, acceptedReplacements: accepted,
        elapsedSeconds: (performance.now() - started) / 1000 };
}

function rowText(row) {
    return row.map(ball => String(ball).padStart(2, '0')).join(' ');
}

function rowsText(rows) {
    return rows.map(rowText).join('\n') + '\n';
}

async function* drawLines(file) {
    const fd = openSync(file, 'r');
    const bom = Buffer.alloc(2);
    try { readSync(fd, bom, 0, bom.length, 0); }
    finally { closeSync(fd); }
    const encoding = bom[0] === 0xFF && bom[1] === 0xFE ? 'utf16le' : 'utf8';
    let remainder = '';
    for await (const chunk of createReadStream(file, { encoding })) {
        const lines = (remainder + chunk).split('\n');
        remainder = lines.pop();
        yield* lines;
    }
    if (remainder) yield remainder;
}

async function filterRecovery(values) {
    const required = ['profile', 'tickets-game', 'combinations', 'target'];
    const missing = required.filter(flag => values[flag] === undefined);
    if (missing.length) throw new Error(`Paramètres manquants : ${missing.map(flag => '--' + flag).join(', ')}`);
    const extra = Object.keys(values).filter(flag => !required.includes(flag) && flag !== 'filter' && flag !== 'output');
    if (extra.length) throw new Error(`Options incompatibles avec --filter : ${extra.map(flag => '--' + flag).join(', ')}`);

    const target = cents(values.target, 'Objectif');
    if (target < 1) throw new Error('L’objectif doit être strictement positif');
    const tickets = loadRows(values['tickets-game'], 'tickets');
    if (!Array.isArray(tickets) || !tickets.length) throw new Error('Jeu champion : liste non vide requise');
    const { profile } = loadProfile(values.profile);
    const { totalBalls, drawSize } = profile;
    if (!Number.isInteger(totalBalls) || totalBalls < 1 || totalBalls > 96 ||
        !Number.isInteger(drawSize) || drawSize < 1 || drawSize > totalBalls) {
        throw new Error('Univers maximal 96 ; tailles dans l’univers');
    }
    const payoutTables = new Map();
    if (profile.payoutModel === 'fixed_base_with_jackpot_floor') {
        const size = profile.jackpot?.ticketSize;
        if (!Number.isInteger(size) || size < 1 || size > totalBalls) {
            throw new Error('Taille de grille du jackpot absente ou invalide');
        }
        const payouts = profilePayouts(profile, size);
        validateJackpot(profile, size, payouts);
        payoutTables.set(size, { payouts, maximum: Math.max(...payouts) });
    }
    const seen = new Set();
    let maximumTotal = 0;
    const game = tickets.map((ticket, index) => {
        const size = ticket?.length;
        const line = index + 1;
        if (!Number.isInteger(size) || size < 1 || size > totalBalls) {
            throw new Error(`Jeu champion, ligne ${line} : de 1 à ${totalBalls} numéros requis`);
        }
        validateRow(ticket, size, totalBalls, 'Jeu champion', line);
        const key = [...ticket].sort((a, b) => a - b).join('-');
        if (seen.has(key)) throw new Error(`Jeu champion, ligne ${line} : doublon`);
        seen.add(key);
        if (!payoutTables.has(size)) {
            const payouts = profilePayouts(profile, size);
            payoutTables.set(size, { payouts, maximum: Math.max(...payouts) });
        }
        const { payouts, maximum } = payoutTables.get(size);
        maximumTotal += maximum;
        return { mask: maskOf(ticket), payouts };
    });
    if (!Number.isSafeInteger(maximumTotal)) {
        throw new Error('Sommes trop élevées pour un calcul entier exact');
    }

    const prefix = resolve(values.output ?? `results/target-recovery-filter-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    const recovered = { file: `${prefix}.recovered.txt`, count: 0, buffer: '' };
    const unrecovered = { file: `${prefix}.unrecovered.txt`, count: 0, buffer: '' };
    const outputs = [recovered, unrecovered];
    if (outputs.some(({ file }) => existsSync(file))) throw new Error('Préfixe déjà utilisé ; choisir un autre --output');
    mkdirSync(dirname(prefix), { recursive: true });
    let lineNumber = 0;
    let complete = false;
    try {
        for (const output of outputs) output.fd = openSync(output.file, 'wx');
        for await (const line of drawLines(values.combinations)) {
            lineNumber++;
            const draw = parseTextRow(line);
            if (!draw) continue;
            validateRow(draw, drawSize, totalBalls, 'Tirages', lineNumber);
            const mask = maskOf(draw);
            let total = 0;
            for (const ticket of game) {
                total += payoutForMasks(ticket.mask, mask, ticket.payouts);
                if (total >= target) break;
            }
            const output = total >= target ? recovered : unrecovered;
            output.count++;
            output.buffer += rowText(draw) + '\n';
            if (output.buffer.length >= 65536) {
                writeFileSync(output.fd, output.buffer);
                output.buffer = '';
            }
        }
        if (!recovered.count && !unrecovered.count) throw new Error('Tirages : liste non vide requise');
        for (const output of outputs) writeFileSync(output.fd, output.buffer);
        complete = true;
    } finally {
        for (const output of outputs) {
            if (output.fd === undefined) continue;
            closeSync(output.fd);
            if (!complete) unlinkSync(output.file);
        }
    }
    console.log(`${recovered.count + unrecovered.count} tirages évalués, seuil ${(target / 100).toFixed(2)} EUR.`);
    console.log(`${recovered.count} recouvrés → ${recovered.file}`);
    console.log(`${unrecovered.count} non recouvrés → ${unrecovered.file}`);
}

export async function main(args = process.argv.slice(2)) {
    try {
        const stringFlags = ['profile', 'ticket-size', 'tickets', 'target', 'draws', 'targets', 'combinations',
            'start', 'output', 'seed', 'candidates', 'replacement-candidates', 'restart-every', 'iterations', 'seconds',
            'tickets-game'];
        const { values } = parseArgs({ args, options: { ...Object.fromEntries(stringFlags.map(flag => [flag, { type: 'string' }])),
            filter: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } } });
        if (!args.length || values.help) { console.log(HELP); return; }
        for (const flag of stringFlags) if (values[flag] !== undefined && !values[flag].trim()) throw new Error(`${flag}: valeur vide`);
        if (values.filter) { await filterRecovery(values); return; }
        if (values['tickets-game']) throw new Error('--tickets-game requiert --filter');
        const required = ['profile', 'ticket-size', 'tickets', 'target'];
        if (!values.targets && !values.combinations) required.push('draws');
        const missing = required.filter(flag => values[flag] === undefined);
        if (missing.length) throw new Error(`Paramètres manquants : ${missing.map(flag => '--' + flag).join(', ')}`);
        if (values.targets && values.combinations) throw new Error('Utiliser --targets ou --combinations, pas les deux');
        const ticketSize = Number(values['ticket-size']);
        if (!Number.isInteger(ticketSize) || ticketSize < 1 || ticketSize > 96) throw new Error('ticket-size: entier de 1 à 96');
        const model = readProfile(values.profile, ticketSize);
        const config = { totalBalls: model.profile.totalBalls, drawSize: model.profile.drawSize, ticketSize,
            tickets: Number(values.tickets), targetCents: cents(values.target, 'Objectif'),
            draws: Number(values.draws), seed: values.seed === undefined ? Math.floor(Math.random() * 4294967296) : Number(values.seed),
            candidates: Number(values.candidates ?? 24), replacementCandidates: Number(values['replacement-candidates'] ?? 8),
            restartEvery: Number(values['restart-every'] ?? 10000), iterations: Number(values.iterations ?? 0), seconds: Number(values.seconds ?? 0) };
        if (config.targetCents < 1) throw new Error('L’objectif doit être strictement positif');
        const inputFile = values.targets ?? values.combinations;
        let targets = inputFile ? loadRows(inputFile, 'targets') : undefined;
        if (inputFile) {
            if (!Array.isArray(targets)) throw new Error('Liste de tirages requise');
            config.draws = targets.length;
        }
        // Shared geometry/search validation only; hits/quota are not recovery parameters.
        validateConfig({ ...config, hits: 1, targetCount: 1 });
        if (!Number.isSafeInteger(model.stake * config.tickets)) throw new Error('Mise totale trop élevée');
        targets ??= makeTargets(config);
        const index = new RecoveryIndex(targets, config, model.payouts);
        const initial = values.start ? validateRows(loadRows(values.start, 'tickets'), ticketSize, config.totalBalls, 'Système initial') : undefined;
        if (initial && initial.length !== config.tickets) throw new Error('Le système initial doit contenir exactement le budget de grilles');
        const prefix = resolve(values.output ?? `results/target-recovery-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        const profileFile = `${prefix}.profile.json`, targetsFile = `${prefix}.targets.json`, targetsTextFile = `${prefix}.targets.txt`;
        for (const suffix of ['.profile.json', '.targets.json', '.targets.txt', '.summary.json', '.record-000001.json', '.record-000001.txt']) {
            if (existsSync(prefix + suffix)) throw new Error('Préfixe déjà utilisé ; choisir un autre --output');
        }
        mkdirSync(dirname(prefix), { recursive: true });
        writeFileSync(profileFile, JSON.stringify(model.profile, null, 2), { flag: 'wx' });
        writeFileSync(targetsFile, JSON.stringify({ config, targets: index.targets }, null, 2), { flag: 'wx' });
        writeFileSync(targetsTextFile, rowsText(index.targets), { flag: 'wx' });
        const context = { model: 'fixed-target-recovery-v1', config, profileFile, profile: model.profile,
            targetsFile, targetsTextFile, currency: 'EUR', targetEUR: config.targetCents / 100,
            stakePerTicketEUR: model.stake / 100, totalStakeEUR: model.stake * config.tickets / 100,
            scope: 'Gains bruts selon ce profil et cet ensemble fixe de cibles ; aucune garantie sur un nouveau tirage.' };
        console.log(`${config.tickets} grilles de ${ticketSize}/${config.totalBalls} ; tirage ${config.drawSize}/${config.totalBalls} ; mise totale ${context.totalStakeEUR.toFixed(2)} EUR ; objectif >= ${context.targetEUR.toFixed(2)} EUR.`);
        console.log(`Profil : ${model.profile.name}. ${model.profile.scope}`);
        console.log(`${targets.length} cibles FIXES ; graine ${config.seed}. Échantillon : ${targetsTextFile}`);
        let stop = false, records = 0;
        const requestStop = () => { stop = true; };
        process.on('SIGINT', requestStop);
        try {
            const result = await searchRecovery(index, config, { initial, shouldStop: () => stop,
                onProgress: state => console.log(`${state.stage}: ${state.iterations} remplacements ; champion ${state.best.successes}/${targets.length}.`),
                onRecord: record => {
                    records++;
                    const file = `${prefix}.record-${String(records).padStart(6, '0')}`;
                    const report = { ...context, ...record, coveragePercent: 100 * record.score.successes / targets.length,
                        deficitEUR: record.score.deficit / 100 };
                    writeFileSync(`${file}.json`, JSON.stringify(report, null, 2), { flag: 'wx' });
                    writeFileSync(`${file}.txt`, rowsText(record.tickets), { flag: 'wx' });
                    console.log(`Record ${records}: ${record.score.successes}/${targets.length} (${report.coveragePercent.toFixed(2)} %) ; manque total ${report.deficitEUR.toFixed(2)} EUR -> ${file}.txt`);
                } });
            const totals = verifyTotals(result.tickets, index.targets, model.payouts);
            const verified = recoveryScore(totals, config.targetCents);
            if (verified.successes !== result.score.successes || verified.deficit !== result.score.deficit) throw new Error('Échec de la vérification indépendante des gains');
            const sorted = [...totals].sort((a, b) => a - b);
            const summary = { ...context, ...result, records, verifiedScore: verified,
                coveragePercent: 100 * verified.successes / totals.length,
                deficitEUR: verified.deficit / 100, minimumEUR: sorted[0] / 100,
                percentile10EUR: sorted[Math.floor(sorted.length / 10)] / 100,
                medianEUR: sorted[Math.floor(sorted.length / 2)] / 100,
                meanEUR: totals.reduce((sum, amount) => sum + amount / totals.length, 0) / 100 };
            writeFileSync(`${prefix}.summary.json`, JSON.stringify(summary, null, 2), { flag: 'wx' });
            console.log(`Terminé : ${verified.successes}/${targets.length} (${summary.coveragePercent.toFixed(2)} %), gains vérifiés indépendamment. Référence aléatoire : ${result.baselineScore.successes}/${targets.length}.`);
            return summary;
        } finally { process.off('SIGINT', requestStop); }
    } catch (error) {
        console.error(error.message);
        console.log(HELP);
        process.exitCode = 1;
    }
}

if (process.argv[1] && existsSync(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) main();
