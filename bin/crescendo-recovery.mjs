#!/usr/bin/env node
// Single-draw Crescendo / KENO search: maximize P(total base payouts >= target).
// Source checked 2026-10-28: https://cdn-media.fdj.fr/static/contrib/files/pdf/reglement-crescendo-2025.pdf
// Letters are deliberately ignored. No jackpot redistribution at 19:00 is included.
import { parseArgs } from 'node:util';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// === CONFIGURATION DU JEU (comme crescendo.mjs) ===
// Un seul bloc doit être actif. Pour passer au KENO : commenter le bloc
// CRESCENDO entier et retirer /* et */ autour du bloc KENO. Rien d'autre
// n'est à modifier dans le moteur ; TICKET_SIZE sélectionne la ligne de gains.


// --- DEBUT CONFIG CRESCENDO ---
// Crescendo : gains sans lettre. Index de chaque ligne = nombre de bons numéros.
// Le 10/10 est un jackpot variable ; cette valeur est uniquement son plancher
// prudent pour le classement, pas une estimation du jackpot réellement versé.
export const TOTAL_BALLS = 25;
export const DRAW_SIZE = 10;
export const TICKET_SIZE = 10;
export const BUDGET_TICKETS = 120;
export const TARGET_GAIN = 90;
export const JACKPOT_FLOOR = 1000;
export const JACKPOT_HITS = 10;
export const PAYOUTS_BY_TICKET_SIZE = {
    10: [0, 0, 0, 0, 0, 0, 1, 7, 50, 500, JACKPOT_FLOOR],
};
// --- FIN CONFIG CRESCENDO ---


// KENO : exemple de barème fourni par l'utilisateur, pour une mise de 1 EUR.
// Les paramètres 56 numéros / 16 tirés et les gains sont ceux de cet exemple.
// Toutes les grilles ont TICKET_SIZE numéros : choisir une taille de 4 à 10.
// --- DEBUT CONFIG KENO ---
/*
export const TOTAL_BALLS = 56;
export const DRAW_SIZE = 16;
export const TICKET_SIZE = 10;
export const BUDGET_TICKETS = 120;
export const TARGET_GAIN = 90;
export const JACKPOT_HITS = null; // Gains fixes, y compris le dernier rang.
export const JACKPOT_FLOOR = 0;   // Inutilisé puisque JACKPOT_HITS est null.
export const PAYOUTS_BY_TICKET_SIZE = {
    4:  [0, 0, 0, 3, 70],
    5:  [0, 0, 0, 2, 10, 80],
    6:  [0, 0, 0, 0, 3, 30, 900],
    7:  [0, 0, 0, 0, 2, 5, 90, 3000],
    8:  [2, 0, 0, 0, 0, 5, 30, 100, 8000],
    9:  [2, 0, 0, 0, 1, 2, 8, 25, 100, 30000],
    10: [2, 0, 0, 0, 0, 2, 5, 15, 150, 2000, 200000],
};
*/
// --- FIN CONFIG KENO ---

export function selectPayouts(ticketSize, tables = PAYOUTS_BY_TICKET_SIZE) {
    const row = tables[ticketSize];
    if (!Array.isArray(row) || row.length !== ticketSize + 1 ||
        !row.every((amount) => Number.isSafeInteger(amount) && amount >= 0 && amount <= 1000000)) {
        throw new Error(`PAYOUTS_BY_TICKET_SIZE[${ticketSize}] doit contenir ${ticketSize + 1} montants entiers, du rang 0 au rang ${ticketSize}`);
    }
    return [...row];
}

// Sélection automatique du barème pour les grilles, toutes de même taille.
export const PAYOUT_BY_HITS = Object.freeze(selectPayouts(TICKET_SIZE));
export const DEFAULT_GAME = Object.freeze({ totalBalls: TOTAL_BALLS, drawSize: DRAW_SIZE, ticketSize: TICKET_SIZE,
    jackpotHits: JACKPOT_HITS, jackpotFloor: JACKPOT_FLOOR });

export function randomGenerator(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
}

export function popcount(value) {
    value -= value >>> 1 & 0x55555555;
    value = (value & 0x33333333) + (value >>> 2 & 0x33333333);
    return ((value + (value >>> 4) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

export function ticketMask(numbers) {
    let low = 0, high = 0, upper = 0;
    for (const number of numbers) {
        if (!Number.isInteger(number) || number < 1 || number > 96) throw new Error('Numéro attendu entre 1 et 96');
        if (number <= 32) low |= 1 << (number - 1);
        else if (number <= 64) high |= 1 << (number - 33);
        else upper |= 1 << (number - 65);
    }
    return { low: low >>> 0, high: high >>> 0, upper: upper >>> 0 };
}
export const maskKey = (mask) => `${mask.low}:${mask.high}:${mask.upper ?? 0}`;
export const maskCount = (mask) => popcount(mask.low) + popcount(mask.high) + popcount(mask.upper ?? 0);
const matches = (mask, low, high = 0, upper = 0) => popcount(mask.low & low) + popcount(mask.high & high) + popcount(mask.upper & upper);

export function payout(hits, payouts = PAYOUT_BY_HITS, game = DEFAULT_GAME) {
    if (hits < 0 || hits > game.ticketSize || !Number.isInteger(hits)) throw new Error('Invalid hit count');
    // Jackpot lower bound: minimum 100000 EUR / maximum 100 copies worldwide.
    // This is NOT an estimate of the jackpot; it suffices for thresholds <= 1000.
    if (hits === game.jackpotHits) return game.jackpotFloor;
    return payouts[hits];
}

export function parsePayouts(text, base = PAYOUT_BY_HITS, ticketSize = TICKET_SIZE) {
    const payouts = Array.from({ length: ticketSize + 1 }, (_, hits) => base[hits] ?? 0);
    const seen = new Set();
    if (!text) throw new Error('Barème attendu : 6=1,7=7,8=50,9=500');
    for (const rule of text.split(',')) {
        if (!/^\d+=\d+$/.test(rule)) throw new Error(`Gain invalide : ${rule} (entiers en euros)`);
        const [hits, amount] = rule.split('=').map(Number);
        if (hits > ticketSize || seen.has(hits) || !Number.isSafeInteger(amount) || amount > 1000000) {
            throw new Error(`Gain invalide ou seuil répété : ${rule}.`);
        }
        seen.add(hits);
        payouts[hits] = amount;
    }
    return payouts;
}

export function makeScenarios(count, random, game = DEFAULT_GAME) {
    const draws = new Uint32Array(count);
    const highDraws = new Uint32Array(count);
    const upperDraws = new Uint32Array(count);
    for (let draw = 0; draw < count; draw++) {
        const balls = Array.from({ length: game.totalBalls }, (_, index) => index + 1);
        for (let index = 0; index < game.drawSize; index++) {
            const chosen = index + Math.floor(random() * (game.totalBalls - index));
            [balls[index], balls[chosen]] = [balls[chosen], balls[index]];
            if (balls[index] <= 32) draws[draw] |= 1 << (balls[index] - 1);
            else if (balls[index] <= 64) highDraws[draw] |= 1 << (balls[index] - 33);
            else upperDraws[draw] |= 1 << (balls[index] - 65);
        }
    }
    return { draws, highDraws, upperDraws };
}

export function balancedSystem(count, random, game = DEFAULT_GAME) {
    const frequencies = Array(game.totalBalls).fill(0);
    const used = new Set();
    return Array.from({ length: count }, () => {
        let ticket;
        let attempts = 0;
        do {
            if (++attempts > 128) throw new Error('Cannot generate another distinct balanced ticket; try a different seed.');
            const candidates = frequencies.map((frequency, index) => ({ frequency, number: index + 1, tie: random() }));
            candidates.sort((a, b) => a.frequency - b.frequency || a.tie - b.tie);
            ticket = candidates.slice(0, game.ticketSize).map(({ number }) => number).sort((a, b) => a - b);
        } while (used.has(maskKey(ticketMask(ticket))));
        for (const number of ticket) frequencies[number - 1]++;
        used.add(maskKey(ticketMask(ticket)));
        return ticket;
    });
}

export function totalsFor(system, scenarios, payouts = PAYOUT_BY_HITS, game = DEFAULT_GAME) {
    const totals = new Uint32Array(scenarios.draws.length);
    for (let ticket = 0; ticket < system.length; ticket++) {
        const mask = ticketMask(system[ticket]);
        for (let draw = 0; draw < totals.length; draw++) {
            totals[draw] += payout(matches(mask, scenarios.draws[draw], scenarios.highDraws?.[draw], scenarios.upperDraws?.[draw]), payouts, game);
        }
    }
    return totals;
}

export function recoveryScore(totals, target) {
    let successes = 0, deficit = 0;
    for (const total of totals) {
        if (total >= target) successes++;
        else deficit += target - total;
    }
    return { successes, deficit };
}

export function redundancyScore(system) {
    return [2, 3, 4, 5].map((k) => {
        const frequencies = new Map();
        const visit = (ticket, start, depth, low, high, upper) => {
            if (depth === k) {
                const key = `${low >>> 0}:${high >>> 0}:${upper >>> 0}`;
                frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
                return;
            }
            for (let index = start; index <= ticket.length - (k - depth); index++) {
                const number = ticket[index];
                visit(ticket, index + 1, depth + 1,
                    number <= 32 ? low | 1 << (number - 1) : low,
                    number > 32 && number <= 64 ? high | 1 << (number - 33) : high,
                    number > 64 ? upper | 1 << (number - 65) : upper);
            }
        };
        for (const ticket of system) visit(ticket, 0, 0, 0, 0, 0);
        let collisions = 0, maxFrequency = 0;
        for (const frequency of frequencies.values()) {
            collisions += frequency * (frequency - 1) / 2;
            maxFrequency = Math.max(maxFrequency, frequency);
        }
        return { k, uniqueCovered: frequencies.size, collisions, maxFrequency };
    });
}

export function isBetterScore(left, right) {
    if (!right) return true;
    if (left.successes !== right.successes) return left.successes > right.successes;
    if (left.deficit !== right.deficit) return left.deficit < right.deficit;
    if (left.redundancy && right.redundancy) {
        for (let index = 0; index < left.redundancy.length; index++) {
            if (left.redundancy[index].uniqueCovered !== right.redundancy[index].uniqueCovered) {
                return left.redundancy[index].uniqueCovered > right.redundancy[index].uniqueCovered;
            }
        }
        for (let index = 0; index < left.redundancy.length; index++) {
            for (const key of ['collisions', 'maxFrequency']) {
                if (left.redundancy[index][key] !== right.redundancy[index][key]) {
                    return left.redundancy[index][key] < right.redundancy[index][key];
                }
            }
        }
    }
    return false;
}

export function optimize(initial, scenarios, target, iterations, random, progress = () => {}, payouts = PAYOUT_BY_HITS, game = DEFAULT_GAME) {
    const system = initial.map((ticket) => [...ticket]);
    const masks = system.map(ticketMask);
    const used = new Set(masks.map(maskKey));
    let totals = totalsFor(system, scenarios, payouts, game);
    let score = { ...recoveryScore(totals, target), redundancy: redundancyScore(system) };
    let proposed = new Uint32Array(totals.length);
    let accepted = 0;
    for (let step = 1; step <= iterations; step++) {
        const a = Math.floor(random() * system.length);
        let b = Math.floor(random() * (system.length - 1));
        if (b >= a) b++;
        const ai = Math.floor(random() * game.ticketSize), bi = Math.floor(random() * game.ticketSize);
        const first = system[a][ai], second = system[b][bi];
        if (system[a].includes(second) || system[b].includes(first)) continue;
        const toggle = ticketMask([first, second]);
        const nextA = { low: (masks[a].low ^ toggle.low) >>> 0, high: (masks[a].high ^ toggle.high) >>> 0, upper: (masks[a].upper ^ toggle.upper) >>> 0 };
        const nextB = { low: (masks[b].low ^ toggle.low) >>> 0, high: (masks[b].high ^ toggle.high) >>> 0, upper: (masks[b].upper ^ toggle.upper) >>> 0 };
        const keyA = maskKey(nextA), keyB = maskKey(nextB);
        if (keyA === keyB || (used.has(keyA) && keyA !== maskKey(masks[b])) || (used.has(keyB) && keyB !== maskKey(masks[a]))) continue;
        let successes = 0, deficit = 0;
        for (let draw = 0; draw < totals.length; draw++) {
            const drawMask = scenarios.draws[draw];
            const drawHigh = scenarios.highDraws?.[draw] ?? 0;
            const drawUpper = scenarios.upperDraws?.[draw] ?? 0;
            const total = totals[draw]
                - payout(matches(masks[a], drawMask, drawHigh, drawUpper), payouts, game) - payout(matches(masks[b], drawMask, drawHigh, drawUpper), payouts, game)
                + payout(matches(nextA, drawMask, drawHigh, drawUpper), payouts, game) + payout(matches(nextB, drawMask, drawHigh, drawUpper), payouts, game);
            proposed[draw] = total;
            if (total >= target) successes++;
            else deficit += target - total;
        }
        const candidateScore = { successes, deficit };
        if (successes === score.successes && deficit === score.deficit) {
            const candidate = system.map((ticket) => [...ticket]);
            candidate[a][ai] = second; candidate[b][bi] = first;
            candidateScore.redundancy = redundancyScore(candidate);
        }
        if (isBetterScore(candidateScore, score)) {
            used.delete(maskKey(masks[a])); used.delete(maskKey(masks[b]));
            masks[a] = nextA; masks[b] = nextB;
            used.add(keyA); used.add(keyB);
            system[a][ai] = second; system[b][bi] = first;
            [totals, proposed] = [proposed, totals];
            score = { ...candidateScore, redundancy: candidateScore.redundancy ?? redundancyScore(system) };
            accepted++;
        }
        if (step % 1000 === 0) progress({ step, accepted, score });
    }
    return { system: system.map((ticket) => ticket.sort((a, b) => a - b)), score, accepted };
}

export function summarize(totals, target) {
    const thresholds = [...new Set([30, 60, target, 120])].sort((a, b) => a - b);
    const probabilities = {};
    for (const threshold of thresholds) {
        const successes = recoveryScore(totals, threshold).successes;
        const n = totals.length, p = successes / n, z = 1.959964;
        const center = (p + z * z / (2 * n)) / (1 + z * z / n);
        const radius = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n);
        probabilities[threshold] = { successes, probability: p, interval95: [center - radius, center + radius] };
    }
    const sorted = Array.from(totals).sort((a, b) => a - b);
    return {
        scenarios: totals.length, probabilities,
        medianBasePayout: sorted[Math.floor(sorted.length / 2)],
        percentile10BasePayout: sorted[Math.floor(sorted.length / 10)],
        meanShortfallToTarget: recoveryScore(totals, target).deficit / totals.length,
        meanShortfallWhenBelowTarget: recoveryScore(totals, target).deficit / Math.max(1, totals.length - recoveryScore(totals, target).successes),
    };
}

export function hitStatistics(system, scenarios, game = DEFAULT_GAME) {
    const gridCounts = Array(game.ticketSize + 1).fill(0);
    const drawCounts = Array(game.ticketSize + 1).fill(0);
    const masks = system.map(ticketMask);
    for (let index = 0; index < scenarios.draws.length; index++) {
        const seen = Array(game.ticketSize + 1).fill(false);
        for (const mask of masks) {
            const hits = matches(mask, scenarios.draws[index], scenarios.highDraws?.[index], scenarios.upperDraws?.[index]);
            gridCounts[hits]++;
            seen[hits] = true;
        }
        for (let hits = 0; hits <= game.ticketSize; hits++) if (seen[hits]) drawCounts[hits]++;
    }
    return gridCounts.map((grids, hits) => ({
        hits, grids, meanGridsPerDraw: grids / scenarios.draws.length,
        drawsWithAtLeastOne: drawCounts[hits], probabilityAtLeastOne: drawCounts[hits] / scenarios.draws.length,
    }));
}

export async function main(args = process.argv.slice(2)) {
    const { values } = parseArgs({ args, options: {
        tickets: { type: 'string', default: String(BUDGET_TICKETS) }, target: { type: 'string', default: String(TARGET_GAIN) },
        'total-balls': { type: 'string' }, 'draw-size': { type: 'string' }, 'ticket-size': { type: 'string' },
        'jackpot-hits': { type: 'string' }, 'jackpot-floor': { type: 'string', default: String(JACKPOT_FLOOR) },
        iterations: { type: 'string', default: '10000' }, train: { type: 'string', default: '30000' },
        validation: { type: 'string', default: '200000' }, seed: { type: 'string', default: '20261028' },
        rounds: { type: 'string', default: '0' }, payouts: { type: 'string' },
        output: { type: 'string' }, help: { type: 'boolean', short: 'h' },
    } });
    if (values.help) {
        console.log(`Usage : node bin/crescendo-recovery.mjs [options]
  --total-balls 25   Univers de 2 à 96 numéros (trois UInt32)
  --draw-size 10     Nombre de numéros tirés
  --ticket-size 10   Nombre de numéros par grille
  --jackpot-hits none Désactive le jackpot pour un barème à gains fixes
  --jackpot-floor 1000 Plancher prudent si un rang jackpot est configuré
  --tickets 120       Nombre de grilles distinctes, un seul tirage
  --target 90         Objectif de récupération en euros
  --payouts 6=1,7=7,8=50,9=500
                      Barème sans lettre (montants entiers en euros)
  --iterations 10000 Échanges essayés par passe
  --train 30000      Tirages Monte-Carlo fixes servant à la recherche
  --validation 200000 Tirages indépendants pour évaluer chaque record
  --seed 20261028    Graine reproductible
  --rounds 0         Recherche continue ; 1 ou plus pour limiter les passes
  --output results/crescendo-120-sans-lettre
                      Exporte chaque record dans des fichiers .record-NNNNNN.txt/.json
Ctrl+C pour arrêter. Lettres et redistribution du jackpot à 19 h exclues.
Le rang jackpot est configurable ; --jackpot-hits none utilise uniquement le barème.
Classement : fréquence du seuil atteint, déficit sous le seuil, redondance K2 à K5.`);
        return;
    }
    const config = {};
    for (const name of ['tickets', 'target', 'iterations', 'train', 'validation', 'seed']) {
        config[name] = Number(values[name]);
        if (!Number.isSafeInteger(config[name]) || config[name] < 1) throw new Error(`${name}: positive integer required`);
    }
    config.rounds = Number(values.rounds);
    if (!Number.isSafeInteger(config.rounds) || config.rounds < 0) throw new Error('rounds: entier positif ou zéro');
    const game = {
        totalBalls: Number(values['total-balls'] ?? TOTAL_BALLS),
        drawSize: Number(values['draw-size'] ?? DRAW_SIZE),
        ticketSize: Number(values['ticket-size'] ?? TICKET_SIZE),
        jackpotFloor: Number(values['jackpot-floor']),
    };
    const changedGeometry = game.totalBalls !== TOTAL_BALLS || game.drawSize !== DRAW_SIZE || game.ticketSize !== TICKET_SIZE;
    const jackpotHits = values['jackpot-hits'] ?? (changedGeometry ? 'none' : JACKPOT_HITS);
    game.jackpotHits = jackpotHits === 'none' || jackpotHits === null ? null : Number(jackpotHits);
    if (!Number.isInteger(game.totalBalls) || game.totalBalls < 2 || game.totalBalls > 96 ||
        ![game.drawSize, game.ticketSize].every((size) => Number.isInteger(size) && size >= 1 && size <= game.totalBalls)) {
        throw new Error('Univers de 2 à 96 numéros ; tailles de tirage et de grille entre 1 et TOTAL_BALLS');
    }
    if (game.jackpotHits !== null && (!Number.isInteger(game.jackpotHits) || game.jackpotHits < 0 || game.jackpotHits > game.ticketSize ||
        !Number.isSafeInteger(game.jackpotFloor) || game.jackpotFloor < config.target || game.jackpotFloor > 1000000)) {
        throw new Error('Rang jackpot invalide ou plancher inférieur à la cible (maximum 1000000 EUR)');
    }
    if (changedGeometry && values.payouts === undefined) throw new Error('Fournir --payouts pour ce jeu, afin de ne pas réutiliser le barème Crescendo');
    config.game = game;
    config.payouts = values.payouts === undefined ? selectPayouts(game.ticketSize)
        : parsePayouts(values.payouts, changedGeometry ? [] : selectPayouts(game.ticketSize), game.ticketSize);
    if (config.payouts.length !== game.ticketSize + 1 || !config.payouts.every((amount) => Number.isSafeInteger(amount) && amount >= 0 && amount <= 1000000)) {
        throw new Error('Le barème doit contenir un montant entier pour chaque rang de 0 à TICKET_SIZE');
    }
    let possible = 1;
    for (let index = 1; index <= Math.min(game.ticketSize, game.totalBalls - game.ticketSize); index++) possible *= (game.totalBalls - index + 1) / index;
    if (config.tickets < 2 || config.tickets > Math.round(possible) || config.tickets > 1000) throw new Error('Budget incompatible avec le nombre de grilles distinctes possibles (maximum 1000)');
    if (values.output !== undefined && !values.output.trim()) throw new Error('output: préfixe non vide requis');
    const random = randomGenerator(config.seed);
    const training = makeScenarios(config.train, random, game);
    // Validation randomness is never used by the optimizer or record comparator.
    const validationRandom = randomGenerator((config.seed ^ 0x9E3779B9) >>> 0);
    let bestScore = null, bestReport = null, records = 0, stop = false;
    const requestStop = () => { stop = true; };
    process.on('SIGINT', requestStop);
    console.log(`Recherche ${config.tickets} grilles de ${game.ticketSize}/${game.totalBalls}, tirage ${game.drawSize}/${game.totalBalls}, seuil ${config.target} EUR, SANS LETTRE.`);
    console.log(`Barème : ${config.payouts.map((amount, hits) => `${hits}/${game.ticketSize}=${amount}`).join(' ')}${game.jackpotHits === null ? '' : ` ; ${game.jackpotHits}/${game.ticketSize}=jackpot (plancher ${game.jackpotFloor} EUR)`}.`);
    console.log(`${config.train} tirages fixes ; ${config.rounds || 'infinité de'} passes ; Ctrl+C pour arrêter.`);
    try {
        for (let round = 1; !stop && (config.rounds === 0 || round <= config.rounds); round++) {
            const initial = balancedSystem(config.tickets, random, game);
            const result = optimize(initial, training, config.target, config.iterations, random, () => {}, config.payouts, game);
            console.log(`Passe ${round} : seuil atteint ${(100 * result.score.successes / config.train).toFixed(2)}% (recherche).`);
            if (isBetterScore(result.score, bestScore)) {
                bestScore = result.score;
                records++;
                const validationSeed = Math.floor(validationRandom() * 4294967296);
                const validation = makeScenarios(config.validation, randomGenerator(validationSeed), game);
                const describe = (system, scenarios) => ({
                    ...summarize(totalsFor(system, scenarios, config.payouts, game), config.target),
                    hits: hitStatistics(system, scenarios, game),
                });
                bestReport = {
                    modelVersion: 'three-uint32-without-letters-v4', config, round, record: records, validationSeed,
                    acceptedSwaps: result.accepted, score: bestScore,
                    assumptions: ['One draw; user-configured payout table', 'Letters completely excluded',
                        'No jackpot redistribution', game.jackpotHits === null ? 'Fixed payouts only' : `Jackpot rank ${game.jackpotHits}, conservative floor ${game.jackpotFloor} EUR`,
                        'Records selected on fixed training draws only; fresh validation for each record',
                        'Heuristic search; simulation frequencies are not guarantees'],
                    source: game.totalBalls === 25 && game.drawSize === 10 && game.ticketSize === 10 && values.payouts === undefined
                        ? 'https://cdn-media.fdj.fr/static/contrib/files/pdf/reglement-crescendo-2025.pdf' : 'User-configured game and payout table',
                    sourceChecked: '2026-10-28',
                    training: { initial: describe(initial, training), optimized: describe(result.system, training) },
                    validation: { initial: describe(initial, validation), optimized: describe(result.system, validation) },
                    system: result.system,
                };
                console.log(`\nRECORD ${records} — passe ${round}`);
                for (const ticket of result.system) console.log(ticket.map((number) => String(number).padStart(2, '0')).join(' '));
                const summary = bestReport.validation.optimized;
                const probability = summary.probabilities[config.target];
                console.log(`Validation indépendante : >= ${config.target} EUR ${(100 * probability.probability).toFixed(2)}% (IC95% ${(100 * probability.interval95[0]).toFixed(2)}–${(100 * probability.interval95[1]).toFixed(2)}%).`);
                console.log(`Médiane : ${summary.medianBasePayout} EUR ; déficit moyen sous le seuil : ${summary.meanShortfallWhenBelowTarget.toFixed(2)} EUR.`);
                for (const entry of summary.hits) {
                    console.log(`${entry.hits}/${game.ticketSize}${entry.hits === game.jackpotHits ? ' (jackpot)' : ''} : ${entry.grids} grilles sur ${summary.scenarios} tirages ; moyenne ${entry.meanGridsPerDraw.toFixed(4)}/tirage ; au moins une ${(100 * entry.probabilityAtLeastOne).toFixed(2)}%.`);
                }
                console.log(`Redondance : ${bestScore.redundancy.map((entry) => `K${entry.k} uniques=${entry.uniqueCovered} collisions=${entry.collisions}`).join(' | ')}\n`);
                if (values.output) {
                    const prefix = resolve(values.output) + `.record-${String(records).padStart(6, '0')}`;
                    if (existsSync(prefix + '.json') || existsSync(prefix + '.txt')) {
                        throw new Error(`Record déjà présent : ${prefix}. Choisir un autre préfixe --output.`);
                    }
                    mkdirSync(dirname(prefix), { recursive: true });
                    writeFileSync(prefix + '.json', JSON.stringify(bestReport, null, 2) + '\n', { flag: 'wx' });
                    writeFileSync(prefix + '.txt', result.system.map((ticket) => ticket.map((number) => String(number).padStart(2, '0')).join(' ')).join('\n') + '\n', { flag: 'wx' });
                    console.log(`Sauvegardé : ${prefix}.txt et .json`);
                }
            }
            // Permit Ctrl+C to be handled between bounded search passes.
            await new Promise((resume) => setImmediate(resume));
        }
    } finally {
        process.removeListener('SIGINT', requestStop);
    }
    if (stop) console.log('Recherche arrêtée. Le dernier record reste affiché et, si demandé, sauvegardé.');
    return bestReport;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
