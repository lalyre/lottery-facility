#!/usr/bin/env node
'use strict'
import readline from 'node:readline';
import * as lotteryFacility from '../dist/cjs/index.js';

// === CONFIGURATION DURCIE (HARDCODED) ===
// Covering design of 2/TICKET_SIZE if 2/TOTAL_BALLS
const TOTAL_BALLS = 20;
const DRAW_SIZE = 8;
const TICKET_SIZE = 10;
const TARGET_HITS = 5;
const TARGET_COUNT = 5; // Nombre minimum de grilles atteignant TARGET_HITS par tirage.
const BUDGET_TICKETS = 20;
const MONTE_CARLO_DRAWS = 10000;
const NB_SWAP = 200;
const STATUS_EVERY = 1000;
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
if (referenceSystem.length > BUDGET_TICKETS) {
    throw new Error(
        `Le bootSystem contient ${referenceSystem.length} grilles pour un budget total de ${BUDGET_TICKETS}.`
    );
}
const generatedTicketsCount = BUDGET_TICKETS - referenceSystem.length;

console.log(`--- Systeme Crescendo : Recherche Optimisee ---`);
console.log(`Configuration: ${TICKET_SIZE}/${TOTAL_BALLS}`);
console.log(`Tirage: ${DRAW_SIZE}/${TOTAL_BALLS}`);
console.log(`Objectif: au moins ${TARGET_COUNT} grilles a ${TARGET_HITS}/${TICKET_SIZE} ou mieux par tirage`);
console.log(`Budget: ${BUDGET_TICKETS} tickets`);
console.log(`Reference fixe: ${referenceSystem.length} tickets`);
console.log(`Grilles generees: ${generatedTicketsCount} tickets`);
console.log(`Monte-Carlo: ${MONTE_CARLO_DRAWS} tirages fixes par execution`);
console.log(`Score: echecs Monte-Carlo, deficit en grilles, puis non-redondance K2 a K5`);

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

const monteCarloDraws = Array.from(
    { length: MONTE_CARLO_DRAWS },
    createRandomDrawMask
);

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
        const ticket = [...new Set(rawTicket)].sort((left, right) => left - right);
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

    for (const drawMask of monteCarloDraws) {
        let qualifyingTickets = 0;
        for (const ticketMask of ticketMasks) {
            const hits = popcount32(drawMask.low & ticketMask.low)
                + popcount32(drawMask.high & ticketMask.high);
            if (hits >= TARGET_HITS) qualifyingTickets++;
            if (qualifyingTickets >= TARGET_COUNT) break;
        }
        if (qualifyingTickets < TARGET_COUNT) {
            failures++;
            deficit += TARGET_COUNT - qualifyingTickets;
        }
    }

    return { failures, deficit, total: monteCarloDraws.length };
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
    const monteCarlo = `MC Echecs:${coverage.failures}/${coverage.total} DeficitGrilles:${coverage.deficit}`;
    return `${monteCarlo} | ${score.redundancy.map(formatKStats).join(' | ')}`;
};

const isBetterScore = (left, right) => {
    if (!right) return true;
    if (left.coverage.failures !== right.coverage.failures) {
        return left.coverage.failures < right.coverage.failures;
    }
    if (left.coverage.deficit !== right.coverage.deficit) {
        return left.coverage.deficit < right.coverage.deficit;
    }
    for (let index = 0; index < left.redundancy.length; index++) {
        if (left.redundancy[index].uniqueCovered !== right.redundancy[index].uniqueCovered) {
            return left.redundancy[index].uniqueCovered > right.redundancy[index].uniqueCovered;
        }
    }
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
    let current = system.map((ticket) => [...ticket].sort((left, right) => left - right));
    let currentScore = getSystemScore(current, reference);
    if (system.length < 2 || attempts < 1) return { system: current, score: currentScore };

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
        if (firstBall === secondBall || firstTicket.includes(secondBall) || secondTicket.includes(firstBall)) continue;

        const candidate = current.map((ticket) => [...ticket]);
        candidate[firstTicketIndex][firstBallIndex] = secondBall;
        candidate[secondTicketIndex][secondBallIndex] = firstBall;
        candidate[firstTicketIndex].sort((left, right) => left - right);
        candidate[secondTicketIndex].sort((left, right) => left - right);

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
    const safeText = text.length >= columns ? text.slice(0, Math.max(0, columns - 4)) + "..." : text;
    clearStatusLine();
    process.stdout.write(safeText);
    statusActive = true;
};

const flushStatusLine = () => {
    if (!statusActive) return;
    process.stdout.write("\n");
    statusActive = false;
};

let iter = 0;
while (true) {
    iter++;

    const initialTickets = box.drawMaximizePairCoveringTickets(
        generatedTicketsCount,
        TICKET_SIZE,
        1,
        null,
        NB_SWAP
    );
    const improved = improveNonRedundancy(initialTickets, referenceSystem);
    const currentTickets = improved.system;
    const currentScore = improved.score;
    if (iter % STATUS_EVERY === 0) {
        writeStatusLine(`Test en cours (iter. ${iter}) ->   ${formatScore(currentScore)}`);
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
            `Record trouve (iter. ${iter}) (${new Date().toISOString()}) ->   ${formatScore(bestScore)}\n`
        );

        console.log();
        console.log();
    }
}
