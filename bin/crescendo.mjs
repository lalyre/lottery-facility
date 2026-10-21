#!/usr/bin/env node
'use strict'
import readline from 'node:readline';
import { createReadStream } from 'node:fs';
import { parseArgs } from 'node:util';
import * as lotteryFacility from '../dist/cjs/index.js';

const { values: options } = parseArgs({
    options: {
        combinations: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
    },
});

if (options.help) {
    console.log(`Usage: node bin/crescendo.mjs [--combinations fichier.txt]

Une combinaison par ligne, numeros separes par des espaces, taille libre.
Les lignes vides sont ignorees et les lignes repetees sont conservees.
Les lignes commencant par # sont des commentaires.
Un en-tete facultatif, unique et place avant les combinaisons, definit les seuils :
  @hits 3=3 4=3 12=7
Cela demande 3 correspondances pour les tailles 3 et 4, et 7 pour la taille 12.
Toute taille absente utilise TARGET_HITS ; sans en-tete, toutes l'utilisent.
Tailles et seuils : entiers entre 1 et TOTAL_BALLS, sans taille repetee.
Un seuil superieur a la taille reste autorise : la combinaison sera en echec.
TARGET_COUNT reste le nombre minimum de grilles atteignant le seuil.
Le pourcentage de couverture porte sur toutes les lignes de combinaisons du fichier.
Exemple commente : bin/examples/crescendo-combinations.txt
Sans fichier, les tirages Monte-Carlo sont generes comme auparavant.`);
    process.exit(0);
}

if (options.combinations !== undefined && options.combinations.trim() === '') {
    throw new Error('--combinations doit designer un fichier non vide.');
}

// === CONFIGURATION ===

// TARGET_COUNT		Nombre minimum de grilles atteignant TARGET_HITS par tirage.


const TOTAL_BALLS = 25;
const DRAW_SIZE = 12;
const TICKET_SIZE = 10;
const TARGET_HITS = 7;
const TARGET_COUNT = 1;
const BUDGET_TICKETS = 10;



// const TOTAL_BALLS = 56;
// const DRAW_SIZE = 23;
// const TICKET_SIZE = 10;
// const TARGET_HITS = 6;
// const TARGET_COUNT = 8;
// const BUDGET_TICKETS = 50;


const MONTE_CARLO_DRAWS = 100000;
const NB_SWAP = 200;
const STATUS_EVERY = 500;
const TRACKED_K = [2, 3, 4, 5];

if (!Number.isInteger(TARGET_COUNT) || TARGET_COUNT < 1 || TARGET_COUNT > BUDGET_TICKETS) {
    throw new Error(`TARGET_COUNT doit etre un entier entre 1 et ${BUDGET_TICKETS}.`);
}

const parseSystem = (text) => {
    const trimmed = text.trim();
    if (trimmed === "") return [];
    return trimmed
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .map((line) => line.split(/\s+/).map(Number));
};

const bootSystem = `
`;
const referenceSystem = parseSystem(bootSystem);

// Jeu complet servant uniquement de record initial a battre (bootSystem inclus s'il y en a un).
// Laisser vide pour commencer sans record. Une grille par ligne, comme bootSystem.
const startingSystem = `
`;
const startingTickets = parseSystem(startingSystem);

const validateSystem = (system, name) => {
    system.forEach((ticket, index) => {
        if (
            ticket.length !== TICKET_SIZE ||
            new Set(ticket).size !== TICKET_SIZE ||
            ticket.some((number) => !Number.isInteger(number) || number < 1 || number > TOTAL_BALLS)
        ) {
            throw new Error(
                `${name}, grille ${index + 1} : fournir ${TICKET_SIZE} numeros distincts entre 1 et ${TOTAL_BALLS}.`
            );
        }
    });
};

validateSystem(referenceSystem, 'bootSystem');
validateSystem(startingTickets, 'startingSystem');

if (referenceSystem.length > BUDGET_TICKETS) {
    throw new Error(
        `Le bootSystem contient ${referenceSystem.length} grilles pour un budget total de ${BUDGET_TICKETS}.`
    );
}

if (startingTickets.length > 0 && startingTickets.length !== BUDGET_TICKETS) {
    throw new Error(`Le startingSystem doit contenir exactement ${BUDGET_TICKETS} grilles, ou etre vide.`);
}

const generatedTicketsCount = BUDGET_TICKETS - referenceSystem.length;

console.log(`--- Systeme Crescendo : Recherche Optimisee ---`);
console.log(`Configuration: ${TICKET_SIZE}/${TOTAL_BALLS}`);
if (!options.combinations) console.log(`Tirage: ${DRAW_SIZE}/${TOTAL_BALLS}`);
console.log(options.combinations
    ? `Objectif: au moins ${TARGET_COUNT} grilles atteignant le seuil de chaque combinaison (TARGET_HITS par defaut: ${TARGET_HITS})`
    : `Objectif: au moins ${TARGET_COUNT} grilles a ${TARGET_HITS}/${TICKET_SIZE} ou mieux par tirage`);
console.log(`Budget: ${BUDGET_TICKETS} tickets`);
console.log(`Reference fixe: ${referenceSystem.length} tickets`);
console.log(`Grilles generees: ${generatedTicketsCount} tickets`);
console.log(`Score: echecs, deficit, total de grilles gagnantes sur les tirages reussis, puis non-redondance K2 a K5`);

const box = new lotteryFacility.DrawBox(TOTAL_BALLS);
let bestTickets = [];
let bestScore = null;
let statusActive = false;

const toMask = (numbers) => {
    let low = 0;
    let high = 0;
    for (const number of numbers) {
        if (number <= 32) {
            low |= 1 << (number - 1);
        } else {
            high |= 1 << (number - 33);
        }
    }
    return { low, high };
};

const popcount32 = (value) => {
    value -= (value >>> 1) & 0x55555555;
    value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
    return (((value + (value >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
};

const createRandomDrawMask = () => {
    const numbers = Array.from({ length: TOTAL_BALLS }, (_, index) => index + 1);
    for (let index = 0; index < DRAW_SIZE; index++) {
        const selectedIndex = index + Math.floor(Math.random() * (TOTAL_BALLS - index));
        [numbers[index], numbers[selectedIndex]] = [numbers[selectedIndex], numbers[index]];
    }
    return toMask(numbers.slice(0, DRAW_SIZE));
};

// Format : commentaires #, puis un unique @hits taille=seuil ... facultatif,
// puis une combinaison par ligne. Les tailles absentes gardent TARGET_HITS.
// Les repetitions de lignes pesent autant de fois dans le score ; TARGET_COUNT
// s'applique toujours. Un seuil impossible n'est jamais abaisse automatiquement.
const loadCombinationMasks = async (filePath) => {
    const input = createReadStream(filePath, { encoding: 'utf8' });
    const lines = readline.createInterface({
        input,
        crlfDelay: Infinity,
    });
    const masks = [];
    const hitsBySize = new Map();
    let hasHeader = false;
    let lineNumber = 0;
    const invalidLine = (message) => new Error(`${filePath}, ligne ${lineNumber} : ${message}`);
    try {
        for await (const line of lines) {
            lineNumber++;
            const trimmed = line.trim();
            if (trimmed === '' || trimmed.startsWith('#')) continue;
            if (trimmed.startsWith('@')) {
                if (hasHeader || masks.length > 0) {
                    throw invalidLine('un seul en-tete @hits est autorise, avant les combinaisons.');
                }
                const [directive, ...rules] = trimmed.split(/\s+/);
                if (directive !== '@hits' || rules.length === 0) {
                    throw invalidLine('en-tete attendu : @hits 3=3 4=3 12=7.');
                }
                for (const rule of rules) {
                    if (!/^\d+=\d+$/.test(rule)) {
                        throw invalidLine(`regle invalide "${rule}" : utiliser taille=seuil.`);
                    }
                    const [size, hits] = rule.split('=').map(Number);
                    if (![size, hits].every((value) => Number.isInteger(value) && value >= 1 && value <= TOTAL_BALLS)) {
                        throw invalidLine(`taille et seuil doivent etre des entiers entre 1 et ${TOTAL_BALLS}.`);
                    }
                    if (hitsBySize.has(size)) {
                        throw invalidLine(`taille ${size} definie plusieurs fois dans @hits.`);
                    }
                    hitsBySize.set(size, hits);
                }
                hasHeader = true;
                continue;
            }
            const numbers = trimmed.split(/\s+/).map(Number);
            if (
                new Set(numbers).size !== numbers.length ||
                numbers.some((number) => !Number.isInteger(number) || number < 1 || number > TOTAL_BALLS)
            ) {
                throw new Error(
                    `${filePath}, ligne ${lineNumber} : fournir des numeros distincts entre 1 et ${TOTAL_BALLS}.`
                );
            }
            masks.push({ ...toMask(numbers), targetHits: hitsBySize.get(numbers.length) ?? TARGET_HITS });
        }
    } finally {
        lines.close();
        input.destroy();
    }
    if (masks.length === 0) {
        throw new Error(`${filePath} : aucune combinaison a evaluer.`);
    }
    return masks;
};

const evaluationDraws = options.combinations
    ? await loadCombinationMasks(options.combinations)
    : Array.from({ length: MONTE_CARLO_DRAWS }, createRandomDrawMask);

console.log(options.combinations
    ? `Fichier: ${options.combinations} (${evaluationDraws.length} combinaisons fixes par execution)`
    : `Monte-Carlo: ${evaluationDraws.length} tirages fixes par execution`);

const getEvaluatedSystem = (system, reference = []) => {
    return reference.length > 0 ? [...reference, ...system] : system;
};

const getKStats = (system, k) => {
    const frequencies = new Map();
    let totalPlacements = 0;

    const visit = (ticket, start, depth, combination) => {
        if (depth === k) {
            const key = combination.join('-');
            frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
            totalPlacements++;
            return;
        }
        for (let index = start; index <= ticket.length - (k - depth); index++) {
            combination[depth] = ticket[index];
            visit(ticket, index + 1, depth + 1, combination);
        }
    };

    for (const rawTicket of system) {
        const ticket = [...new Set(rawTicket)].sort((a, b) => a - b);
        if (ticket.length >= k) visit(ticket, 0, 0, new Array(k));
    }

    let maxFrequency = 0;
    let collisionPenalty = 0;
    for (const frequency of frequencies.values()) {
        maxFrequency = Math.max(maxFrequency, frequency);
        collisionPenalty += frequency * (frequency - 1) / 2;
    }

    return {
        k,
        uniqueCovered: frequencies.size,
        totalPossible: Number(lotteryFacility.TupleHelper.binomial(TOTAL_BALLS, k)),
        duplicatePlacements: totalPlacements - frequencies.size,
        collisionPenalty,
        maxFrequency,
    };
};

const getRedundancyScore = (system) => {
    return TRACKED_K.map((k) => getKStats(system, k));
};

const getCoverageStats = (system) => {
    const ticketMasks = system.map(toMask);
    let failures = 0;
    let deficit = 0;
    let qualifyingTicketsTotal = 0;

    for (const drawMask of evaluationDraws) {
        let qualifyingTickets = 0;
        const targetHits = drawMask.targetHits ?? TARGET_HITS;

        // Compter toutes les grilles gagnantes, sans s'arreter a TARGET_COUNT.
        for (const ticketMask of ticketMasks) {
            const hits = popcount32(drawMask.low & ticketMask.low)
                + popcount32(drawMask.high & ticketMask.high);

            if (hits >= targetHits) {
                qualifyingTickets++;
            }
        }

        // Total de grilles gagnantes sur tous les tirages simules.
        ///////////////qualifyingTicketsTotal += qualifyingTickets;

        if (qualifyingTickets < TARGET_COUNT) {
            failures++;
            deficit += TARGET_COUNT - qualifyingTickets;
        } else {
			qualifyingTicketsTotal += qualifyingTickets;
		}
    }

    return {
        failures,
        deficit,
        qualifyingTicketsTotal,
        total: evaluationDraws.length
    };
};

const getSystemScore = (system, reference = []) => {
    const evaluatedSystem = getEvaluatedSystem(system, reference);
    return {
        coverage: getCoverageStats(evaluatedSystem),
        redundancy: getRedundancyScore(evaluatedSystem),
    };
};

const formatKStats = (stats) => {
    return `K${stats.k}:${stats.uniqueCovered}/${stats.totalPossible} Dup:${stats.duplicatePlacements} Col:${stats.collisionPenalty} Max:${stats.maxFrequency}`;
};

const formatScore = (score) => {
    const coverage = score.coverage;
    const coverageText =
        `${options.combinations ? 'Fichier' : 'MC'} Echecs:${coverage.failures}/${coverage.total} (${(100 * coverage.failures / coverage.total).toFixed(2)}%)` +
        ` Couverture:${(100 * (coverage.total - coverage.failures) / coverage.total).toFixed(2)}%` +
        ` DeficitGrilles:${coverage.deficit}` +
        ` GrillesGagnantes:${coverage.qualifyingTicketsTotal}`;

    return `${coverageText} | ${score.redundancy.map(formatKStats).join(' | ')}`;
};

const isBetterScore = (left, right) => {
    if (!right) return true;

    // PRIORITE 1 : minimiser les tirages avec moins de TARGET_COUNT gagnantes.
    if (left.coverage.failures !== right.coverage.failures) {
        return left.coverage.failures < right.coverage.failures;
    }

    // PRIORITE 2 : minimiser le deficit total de grilles.
    if (left.coverage.deficit !== right.coverage.deficit) {
        return left.coverage.deficit < right.coverage.deficit;
    }

    // PRIORITE 3 : maximiser les grilles gagnantes sur les tirages reussis.
    if (left.coverage.qualifyingTicketsTotal !== right.coverage.qualifyingTicketsTotal) {
        return left.coverage.qualifyingTicketsTotal > right.coverage.qualifyingTicketsTotal;
    }

    // PRIORITE 4 : maximiser la couverture des combinaisons uniques.
    for (let index = 0; index < left.redundancy.length; index++) {
        if (left.redundancy[index].uniqueCovered !== right.redundancy[index].uniqueCovered) {
            return left.redundancy[index].uniqueCovered > right.redundancy[index].uniqueCovered;
        }
    }

    // PRIORITE 5 : minimiser les répétitions.
    for (let index = 0; index < left.redundancy.length; index++) {
        if (left.redundancy[index].collisionPenalty !== right.redundancy[index].collisionPenalty) {
            return left.redundancy[index].collisionPenalty < right.redundancy[index].collisionPenalty;
        }
        if (left.redundancy[index].maxFrequency !== right.redundancy[index].maxFrequency) {
            return left.redundancy[index].maxFrequency < right.redundancy[index].maxFrequency;
        }
    }

    return false;
};

const improveNonRedundancy = (system, reference = [], attempts = NB_SWAP) => {
    let current = system.map((ticket) => [...ticket].sort((a, b) => a - b));
    let currentScore = getSystemScore(current, reference);

    if (system.length < 2 || attempts < 1) {
        return { system: current, score: currentScore };
    }

    for (let attempt = 0; attempt < attempts; attempt++) {
        const firstTicketIndex = Math.floor(Math.random() * current.length);
        let secondTicketIndex = Math.floor(Math.random() * (current.length - 1));
        if (secondTicketIndex >= firstTicketIndex) secondTicketIndex++;

        const firstTicket = current[firstTicketIndex];
        const secondTicket = current[secondTicketIndex];
        const firstBallIndex = Math.floor(Math.random() * firstTicket.length);
        const secondBallIndex = Math.floor(Math.random() * secondTicket.length);
        const firstBall = firstTicket[firstBallIndex];
        const secondBall = secondTicket[secondBallIndex];

        if (
            firstBall === secondBall ||
            firstTicket.includes(secondBall) ||
            secondTicket.includes(firstBall)
        ) continue;

        const candidate = current.map((ticket) => [...ticket]);
        candidate[firstTicketIndex][firstBallIndex] = secondBall;
        candidate[secondTicketIndex][secondBallIndex] = firstBall;
        candidate[firstTicketIndex].sort((a, b) => a - b);
        candidate[secondTicketIndex].sort((a, b) => a - b);

        const candidateScore = getSystemScore(candidate, reference);

        if (isBetterScore(candidateScore, currentScore)) {
            current = candidate;
            currentScore = candidateScore;
        }
    }

    return { system: current, score: currentScore };
};

const clearStatusLine = () => {
    if (!statusActive) return;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    statusActive = false;
};

const writeStatusLine = (text) => {
    const columns = process.stdout.columns ?? 120;
    const safeText = text.length >= columns
        ? text.slice(0, Math.max(0, columns - 4)) + "..."
        : text;

    clearStatusLine();
    process.stdout.write(safeText);
    statusActive = true;
};

const flushStatusLine = () => {
    if (!statusActive) return;
    process.stdout.write("\n");
    statusActive = false;
};

if (startingTickets.length > 0) {
    // Le jeu de depart est complet : ne pas lui ajouter referenceSystem une seconde fois.
    bestScore = getSystemScore(startingTickets);
    console.log(`Record initial (startingSystem) -> ${formatScore(bestScore)}`);
    console.log();
}

let iter = 0;

while (true) {
    iter++;

    // Generation equilibree : decommenter ce bloc et commenter le suivant pour comparer.
    const initialTickets = box.drawMaximizePairCoveringTickets(
        generatedTicketsCount,
        TICKET_SIZE,
        1,
        null,
        NB_SWAP
    );

    // Generation aleatoire pure : grilles independantes, sans remise dans chaque grille.
    // const initialTickets = Array.from(
    //     { length: generatedTicketsCount },
    //     () => box.drawFisherYates(TICKET_SIZE).sort((a, b) => a - b)
    // );

    const improved = improveNonRedundancy(initialTickets, referenceSystem);
    const currentTickets = improved.system;
    const currentScore = improved.score;

    if (iter % STATUS_EVERY === 0) {
        writeStatusLine(`Test en cours (iter. ${iter}) -> ${formatScore(currentScore)}`);
    }

    if (isBetterScore(currentScore, bestScore)) {
        bestTickets = currentTickets;
        bestScore = currentScore;
        flushStatusLine();

        referenceSystem.forEach((ticket) => {
            const sortedTicket = lotteryFacility.TupleHelper.toCanonicalString(ticket, ' ');
            console.log(`${sortedTicket}`);
        });

        console.log();

        bestTickets.forEach((ticket) => {
            const sortedTicket = lotteryFacility.TupleHelper.toCanonicalString(ticket, ' ');
            console.log(`${sortedTicket}`);
        });

        process.stdout.write(
            `Record trouve (iter. ${iter}) (${new Date().toISOString()}) -> ${formatScore(bestScore)}\n`
        );

        console.log();
        console.log();
    }
}


