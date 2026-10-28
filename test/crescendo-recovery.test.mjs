import test from 'node:test';
import assert from 'node:assert/strict';
import { payout, popcount, ticketMask, randomGenerator, makeScenarios, balancedSystem,
    totalsFor, recoveryScore, optimize, summarize, parsePayouts, PAYOUT_BY_HITS,
    hitStatistics, isBetterScore, main, maskKey, maskCount, DEFAULT_GAME, redundancyScore } from '../bin/crescendo-recovery.mjs';

test('only no-letter payouts count; jackpots have an explicit conservative floor', () => {
    assert.deepEqual(Array.from({ length: 10 }, (_, hits) => payout(hits)), [0, 0, 0, 0, 0, 0, 1, 7, 50, 500]);
    assert.equal(payout(10), 1000);
    assert.throws(() => payout(11));
});

test('balanced 120-ticket system contains distinct legal tickets and 48 of each number', () => {
    const system = balancedSystem(120, randomGenerator(20261028));
    assert.equal(new Set(system.map(ticket => maskKey(ticketMask(ticket)))).size, 120);
    const counts = Array(25).fill(0);
    for (const ticket of system) {
        assert.equal(ticket.length, 10);
        assert.equal(maskCount(ticketMask(ticket)), 10);
        for (const number of ticket) { assert.ok(number >= 1 && number <= 25); counts[number - 1]++; }
    }
    assert.deepEqual(counts, Array(25).fill(48));
});

test('known mixed portfolio reaches target from cumulative small gains', () => {
    const scenarios = { draws: Uint32Array.of(ticketMask([1,2,3,4,5,6,7,8,9,10]).low), letters: [Uint8Array.of(0), Uint8Array.of(1)] };
    const system = [[1,2,3,4,5,6,7,8,20,21], [1,2,3,4,5,6,7,9,22,23]];
    // Even a supplied legacy letter array must have no effect.
    assert.deepEqual([...totalsFor(system, scenarios)], [100]);
    assert.deepEqual(recoveryScore(Uint32Array.of(0,60,89,90,100), 90), { successes: 2, deficit: 121 });
});

test('optimization keeps unique legal tickets, balance and correctly updated totals', () => {
    const initial = balancedSystem(120, randomGenerator(42));
    const scenarios = makeScenarios(300, randomGenerator(99));
    const result = optimize(initial, scenarios, 90, 200, randomGenerator(17));
    const exact = recoveryScore(totalsFor(result.system, scenarios), 90);
    assert.equal(result.score.successes, exact.successes);
    assert.equal(result.score.deficit, exact.deficit);
    assert.ok(result.score.successes >= recoveryScore(totalsFor(initial, scenarios), 90).successes);
    assert.equal(new Set(result.system.map(ticket => maskKey(ticketMask(ticket)))).size, 120);
    assert.equal(result.system.length, 120);
    const counts = Array(25).fill(0);
    for (const ticket of result.system) {
        assert.equal(maskCount(ticketMask(ticket)), 10);
        for (const number of ticket) counts[number - 1]++;
    }
    assert.deepEqual(counts, Array(25).fill(48));
});

test('scenarios are reproducible, independent seeds differ, report confidence interval covers estimate', () => {
    const first = makeScenarios(30, randomGenerator(1));
    assert.deepEqual(first, makeScenarios(30, randomGenerator(1)));
    assert.notDeepEqual(first.draws, makeScenarios(30, randomGenerator(2)).draws);
    assert.ok([...first.draws].every((mask) => popcount(mask) === 10));
    const report = summarize(Uint32Array.of(0,60,89,90,100), 90);
    assert.equal(report.probabilities[90].probability, 0.4);
    assert.ok(report.probabilities[90].interval95[0] < 0.4 && report.probabilities[90].interval95[1] > 0.4);
    assert.equal(report.meanShortfallToTarget, 24.2);
    assert.equal(report.meanShortfallWhenBelowTarget, 121 / 3);
});

test('configurable payout table is used for cumulative gains and rejects ambiguity', () => {
    const table = parsePayouts('6=2,7=10,8=80,9=600');
    assert.deepEqual(PAYOUT_BY_HITS, [0,0,0,0,0,0,1,7,50,500,1000]);
    assert.equal(payout(7, table), 10);
    const scenarios = { draws: Uint32Array.of(ticketMask([1,2,3,4,5,6,7,8,9,10]).low) };
    assert.deepEqual([...totalsFor([[1,2,3,4,5,6,7,20,21,22]], scenarios, table)], [10]);
    for (const invalid of ['', '7=-1', '7=1.5', '11=100000', '7=10,7=11', '8=x']) {
        assert.throws(() => parsePayouts(invalid));
    }
});

test('hit statistics distinguish grids and draws, and separate jackpots', () => {
    const system = [[1,2,3,4,5,6,7,8,9,10], [1,2,3,4,5,6,7,20,21,22]];
    const scenarios = { draws: Uint32Array.of(ticketMask(system[0]).low, ticketMask(system[0]).low) };
    const stats = hitStatistics(system, scenarios);
    assert.equal(stats[10].grids, 2);
    assert.equal(stats[10].drawsWithAtLeastOne, 2);
    assert.equal(stats[7].meanGridsPerDraw, 1);
    assert.equal(stats[8].grids, 0);
});

test('record comparison prioritizes threshold frequency over deficit and redundancy', () => {
    assert.ok(isBetterScore({ successes: 10, deficit: 999 }, { successes: 9, deficit: 0 }));
    assert.ok(isBetterScore({ successes: 10, deficit: 90 }, { successes: 10, deficit: 100 }));
    const a = { successes: 10, deficit: 90, redundancy: [{ uniqueCovered: 20, collisions: 5, maxFrequency: 2 }] };
    const b = { successes: 10, deficit: 90, redundancy: [{ uniqueCovered: 19, collisions: 1, maxFrequency: 1 }] };
    assert.ok(isBetterScore(a, b));
    assert.equal(isBetterScore(a, a), false);
});

test('continuous search responds to Ctrl+C and keeps its evaluated record', async () => {
    const originalLog = console.log;
    const output = [];
    console.log = (...args) => {
        output.push(args.join(' '));
        if (String(args[0]).includes('RECORD 1')) process.emit('SIGINT');
    };
    try {
        const report = await main(['--tickets','5','--target','90','--train','50','--validation','60','--iterations','10','--rounds','0']);
        assert.equal(report.round, 1);
        assert.equal(report.system.length, 5);
        assert.equal(report.modelVersion, 'two-uint32-without-letters-v3');
        assert.equal(report.validation.optimized.scenarios, 60);
        assert.equal(report.training.optimized.scenarios, 50);
        assert.ok(output.some((line) => line.includes('Recherche arrêtée')));
    } finally {
        console.log = originalLog;
    }
});

test('two UInt32 words distinguish balls 1, 32, 33 and 64 without aliasing', () => {
    const mask = ticketMask([1, 32, 33, 64]);
    assert.deepEqual(mask, { low: 0x80000001, high: 0x80000001 });
    assert.equal(maskCount(mask), 4);
    assert.notEqual(maskKey(ticketMask([1, 2])), maskKey(ticketMask([33, 34])));
    const stats = redundancyScore([[1,2], [33,34]]);
    assert.equal(stats[0].uniqueCovered, 2);
    assert.equal(stats[0].collisions, 0);
    assert.throws(() => ticketMask([65]));
});

test('56-ball game and eight-number tickets agree with direct Set matching after optimization', () => {
    const game = { totalBalls: 56, drawSize: 23, ticketSize: 8, jackpotHits: null, jackpotFloor: 1000 };
    const payouts = parsePayouts('0=2,6=3,7=20,8=2000', [], 8);
    assert.equal(payout(8, payouts, game), 2000);
    const initial = balancedSystem(28, randomGenerator(56), game);
    const scenarios = makeScenarios(100, randomGenerator(23), game);
    for (let index = 0; index < scenarios.draws.length; index++) {
        assert.equal(maskCount({ low: scenarios.draws[index], high: scenarios.highDraws[index] }), 23);
    }
    const result = optimize(initial, scenarios, 90, 60, randomGenerator(8), () => {}, payouts, game);
    const totals = totalsFor(result.system, scenarios, payouts, game);
    const counts = Array(56).fill(0);
    for (const ticket of result.system) {
        assert.equal(maskCount(ticketMask(ticket)), 8);
        for (const number of ticket) counts[number - 1]++;
    }
    assert.deepEqual(counts, Array(56).fill(4));
    assert.equal(new Set(result.system.map((ticket) => maskKey(ticketMask(ticket)))).size, 28);
    for (let index = 0; index < scenarios.draws.length; index++) {
        const winning = new Set();
        for (let number = 1; number <= 56; number++) {
            const word = number <= 32 ? scenarios.draws[index] : scenarios.highDraws[index];
            if (word & 1 << ((number - 1) % 32)) winning.add(number);
        }
        const expected = result.system.reduce((sum, ticket) => sum + payouts[ticket.filter((number) => winning.has(number)).length], 0);
        assert.equal(totals[index], expected);
    }
    assert.equal(hitStatistics(result.system, scenarios, game).length, 9);
    assert.deepEqual(recoveryScore(totals, 90), { successes: result.score.successes, deficit: result.score.deficit });
});

test('64-ball Monte Carlo draws retain their high word', () => {
    const game = { ...DEFAULT_GAME, totalBalls: 64, drawSize: 23, jackpotHits: null };
    const scenarios = makeScenarios(100, randomGenerator(64), game);
    assert.ok([...scenarios.highDraws].some((high) => high & 0x80000000));
    for (let index = 0; index < scenarios.draws.length; index++) {
        assert.equal(maskCount({ low: scenarios.draws[index], high: scenarios.highDraws[index] }), 23);
    }
});

test('CLI accepts a KENO-shaped game and preserves the full fixed payout rank', async () => {
    const originalLog = console.log;
    const output = [];
    console.log = (...args) => output.push(args.join(' '));
    try {
        const report = await main(['--total-balls','56','--draw-size','23','--ticket-size','8',
            '--payouts','0=1,6=3,7=20,8=2000','--tickets','10','--train','50','--validation','60','--iterations','10','--rounds','1']);
        assert.equal(report.config.game.jackpotHits, null);
        assert.equal(report.config.payouts[8], 2000);
        assert.equal(report.validation.optimized.hits.length, 9);
        assert.ok(output.some((line) => line.includes('8/8=2000')));
        assert.ok(report.system.flat().some((number) => number > 32));
        await assert.rejects(main(['--total-balls','65','--rounds','1']));
        await assert.rejects(main(['--total-balls','56','--rounds','1']), /payouts/);
    } finally { console.log = originalLog; }
});
