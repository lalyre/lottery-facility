#!/usr/bin/env node
'use strict'
import readline from 'node:readline';
import * as lotteryFacility from '../dist/cjs/index.js';

// === CONFIGURATION DURCIE (HARDCODED) ===
// Covering design of 2/TICKET_SIZE if 2/TOTAL_BALLS
const TOTAL_BALLS = 56;
const TICKET_SIZE = 10;
const BUDGET_TICKETS = 20;
const NB_SWAP = 200;
const STATUS_EVERY = 1000;
const PRIMARY_K = 2;
const SECONDARY_K = 3;
const ALPHABET = Array.from({ length: TOTAL_BALLS }, (_, index) => index + 1);

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

console.log(`--- Systeme Crescendo : Recherche Optimisee ---`);
console.log(`Configuration: ${TICKET_SIZE}/${TOTAL_BALLS}`);
console.log(`Budget: ${BUDGET_TICKETS} tickets`);
console.log(`Reference: ${referenceSystem.length} tickets`);
console.log(`Score: paires puis triplets`);

const box = new lotteryFacility.DrawBox(TOTAL_BALLS);
let bestTickets = [];
let statusActive = false;

const getEvaluatedSystem = (system, reference = []) => {
    return reference.length > 0 ? [...reference, ...system] : system;
};

const getKStats = (system, k) => {
    return lotteryFacility.TupleHelper.getSystemKFrequencyStats(system, ALPHABET, k);
};

const getSystemScore = (system, reference = []) => {
    const evaluatedSystem = getEvaluatedSystem(system, reference);
    return {
        pairs: getKStats(evaluatedSystem, PRIMARY_K),
        triplets: getKStats(evaluatedSystem, SECONDARY_K),
    };
};

const formatKStats = (label, stats) => {
    return `${label}:${stats.uniqueCovered}/${stats.totalPossible} Dup:${stats.duplicatePlacements} Max:${stats.maxFrequency}`;
};

const formatScore = (system, reference = []) => {
    const score = getSystemScore(system, reference);
    return `${formatKStats('P', score.pairs)} | ${formatKStats('T', score.triplets)}`;
};

const isBetterScore = (leftSystem, rightSystem, reference = []) => {
    if (!rightSystem || rightSystem.length === 0) return true;

    const left = getSystemScore(leftSystem, reference);
    const right = getSystemScore(rightSystem, reference);

    if (left.pairs.uniqueCovered !== right.pairs.uniqueCovered) {
        return left.pairs.uniqueCovered > right.pairs.uniqueCovered;
    }
    if (left.triplets.uniqueCovered !== right.triplets.uniqueCovered) {
        return left.triplets.uniqueCovered > right.triplets.uniqueCovered;
    }
    if (left.pairs.duplicatePlacements !== right.pairs.duplicatePlacements) {
        return left.pairs.duplicatePlacements < right.pairs.duplicatePlacements;
    }
    if (left.triplets.duplicatePlacements !== right.triplets.duplicatePlacements) {
        return left.triplets.duplicatePlacements < right.triplets.duplicatePlacements;
    }
    if (left.pairs.maxFrequency !== right.pairs.maxFrequency) {
        return left.pairs.maxFrequency < right.pairs.maxFrequency;
    }
    if (left.triplets.maxFrequency !== right.triplets.maxFrequency) {
        return left.triplets.maxFrequency < right.triplets.maxFrequency;
    }

    return false;
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

    const currentTickets = box.drawMaximizePairCoveringTickets(BUDGET_TICKETS, TICKET_SIZE, 1, null, NB_SWAP);
    if (iter % STATUS_EVERY === 0) {
        writeStatusLine(`Test en cours (iter. ${iter}) ->   ${formatScore(currentTickets, referenceSystem)}`);
    }

    if (isBetterScore(currentTickets, bestTickets, referenceSystem)) {
        bestTickets = currentTickets;
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
            `Record trouve (iter. ${iter}) (${new Date().toISOString()}) ->   ${formatScore(bestTickets, referenceSystem)}\n`
        );

        console.log();
        console.log();
    }
}
