import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cents, readProfile, recoveryScore, better, RecoveryIndex, RecoverySystem,
    verifyTotals, searchRecovery } from '../bin/target-recovery.mjs';
import { makeTargets, randomGenerator } from '../bin/target-covering.mjs';

const CONFIG = { totalBalls: 12, drawSize: 5, ticketSize: 4, tickets: 3, draws: 30,
    targetCents: 300, candidates: 8, replacementCandidates: 4, restartEvery: 5,
    iterations: 20, seconds: 0, seed: 123 };

test('euro amounts convert to exact integer cents; invalid and overly precise values fail', () => {
    assert.equal(cents('8'), 800);
    assert.equal(cents('8.50'), 850);
    assert.equal(cents(0.29), 29);
    assert.equal(cents('0'), 0);
    for (const value of [-1, 'NaN', '', null, '1.234', Infinity, 1e20]) assert.throws(() => cents(value));
});

test('profile rows, zero-match Keno gains and the explicit Crescendo jackpot model load correctly', () => {
    const keno = readProfile('profiles/keno.json', 10);
    assert.equal(keno.stake, 100);
    assert.equal(keno.payouts[0], 200);
    assert.equal(keno.payouts[5], 200);
    assert.equal(keno.payouts[6], 500);
    assert.equal(keno.payouts[10], 20000000);
    assert.throws(() => readProfile('profiles/keno.json', 3), /montants/);
    const crescendo = readProfile('profiles/crescendo.json', 10);
    assert.deepEqual(crescendo.payouts, [0, 0, 0, 0, 0, 0, 100, 700, 5000, 50000, 100000]);
});

test('EuroDreams simulation uses the agreed payouts and the full ticket stake without Dream', () => {
    const model = readProfile('profiles/eurodreams.json', 6);
    assert.equal(model.profile.totalBalls, 40);
    assert.equal(model.profile.drawSize, 6);
    assert.equal(model.stake, 250);
    assert.equal(model.profile.payoutModel, 'fixed_simulation');
    assert.equal(model.profile.simulationAssumptions.guaranteedMinimum, false);
    assert.deepEqual(model.payouts, [0, 0, 250, 400, 2000, 20000, 200000]);
    assert.deepEqual(verifyTotals([[1, 2, 7, 8, 9, 10], [1, 2, 3, 11, 12, 13]],
        [[1, 2, 3, 4, 5, 6]], model.payouts), [650]);
    assert.throws(() => readProfile('profiles/eurodreams.json', 5), /montants/);
});

test('all winning ranks are summed: two EUR at 5/10 plus five EUR at 6/10', () => {
    const { payouts } = readProfile('profiles/keno.json', 10);
    const draw = Array.from({ length: 16 }, (_, i) => i + 1);
    const a = [1, 2, 3, 4, 5, 17, 18, 19, 20, 21];
    const b = [6, 7, 8, 9, 10, 11, 22, 23, 24, 25];
    const zero = Array.from({ length: 10 }, (_, i) => i + 30);
    assert.deepEqual(verifyTotals([a, b], [draw], payouts), [700]);
    assert.deepEqual(verifyTotals([a, b, zero], [draw], payouts), [900]);
    assert.deepEqual(recoveryScore([700, 900], 800), { successes: 1, deficit: 100 });
});

test('ranking prioritizes recovery frequency, then shortfalls, without rewarding excess jackpots', () => {
    assert.ok(better({ successes: 2, deficit: 10000 }, { successes: 1, deficit: 1 }));
    assert.ok(better({ successes: 2, deficit: 100 }, { successes: 2, deficit: 101 }));
    assert.ok(!better({ successes: 2, deficit: 100 }, { successes: 2, deficit: 100 }));
    assert.deepEqual(recoveryScore([800, 10000000, 500], 800), recoveryScore([800, 800, 500], 800));
});

test('incremental cached money totals agree with ordinary set intersections after replacements', () => {
    const payouts = [100, 0, 150, 700, 5000];
    const targets = makeTargets(CONFIG), index = new RecoveryIndex(targets, CONFIG, payouts);
    const state = new RecoverySystem(index), random = randomGenerator(42);
    while (state.tickets.length < CONFIG.tickets) state.add(index.randomTicket(random, state.keys));
    for (let attempt = 0; attempt < 40; attempt++) {
        const slot = attempt % CONFIG.tickets, ticket = index.randomTicket(random, state.keys);
        const gains = index.gains(ticket), base = state.without(slot);
        const predicted = base.map((amount, d) => amount + gains[d]);
        state.replace(slot, { ticket, gains, key: ticket.join('-') });
        const independent = verifyTotals(state.tickets, targets, payouts);
        assert.deepEqual(Array.from(state.totals), independent);
        assert.deepEqual(Array.from(predicted), independent);
    }
});

test('mask scorer includes balls 32, 64 and 96', () => {
    const config = { ...CONFIG, totalBalls: 96, drawSize: 6, ticketSize: 6 };
    const targets = [[1, 32, 33, 64, 65, 96], [2, 31, 63, 64, 95, 96]];
    const payouts = [20, 30, 40, 50, 60, 70, 80];
    const index = new RecoveryIndex(targets, config, payouts), ticket = targets[0];
    assert.deepEqual(Array.from(index.gains(ticket)), verifyTotals([ticket], targets, payouts));
});

test('guided candidates can exploit a zero-match payout rather than a fixed hit threshold', () => {
    const config = { ...CONFIG, totalBalls: 6, drawSize: 3, ticketSize: 3, tickets: 1, targetCents: 100 };
    const index = new RecoveryIndex([[1, 2, 3]], config, [200, 0, 0, 0]);
    const candidate = index.candidate(new Float64Array([0]), new Set(), 8, randomGenerator(1));
    assert.deepEqual(candidate.ticket, [4, 5, 6]);
    assert.deepEqual(candidate.score, { successes: 1, deficit: 0 });
});

test('seeded search is reproducible, preserves champions and verifies every monetary record', async () => {
    const targets = makeTargets(CONFIG), index = new RecoveryIndex(targets, CONFIG, [100, 0, 150, 700, 5000]);
    const records = [];
    const result = await searchRecovery(index, CONFIG, { onRecord: record => {
        const score = recoveryScore(verifyTotals(record.tickets, targets, index.payouts), CONFIG.targetCents);
        assert.deepEqual(record.score, score);
        if (records.length) assert.ok(better(record.score, records.at(-1)));
        records.push(record.score);
    } });
    const second = await searchRecovery(index, CONFIG);
    assert.deepEqual(second.tickets, result.tickets);
    assert.deepEqual(second.score, result.score);
    assert.ok(!better(result.baselineScore, result.score));
    const resumed = await searchRecovery(index, CONFIG, { initial: result.tickets });
    assert.ok(!better(result.score, resumed.score));
});

test('a 90 percent monetary champion does not stop the search', async () => {
    const config = { ...CONFIG, totalBalls: 6, drawSize: 3, ticketSize: 3, tickets: 9, draws: 10,
        targetCents: 100, iterations: 5, restartEvery: 100 };
    const targets = makeTargets(config), index = new RecoveryIndex(targets, config, [0, 0, 0, 100]);
    const result = await searchRecovery(index, config, { initial: targets.slice(0, 9) });
    assert.equal(result.score.successes, 9);
    assert.equal(result.iterations, 5);
});

test('restarts handle a full ticket universe even when the monetary target is unreachable', async () => {
    const config = { ...CONFIG, totalBalls: 3, drawSize: 3, ticketSize: 3, tickets: 1, draws: 1,
        targetCents: 1000, iterations: 3, restartEvery: 1 };
    const index = new RecoveryIndex([[1, 2, 3]], config, [0, 0, 0, 500]);
    const result = await searchRecovery(index, config);
    assert.equal(result.iterations, 3);
    assert.equal(result.score.successes, 0);
    assert.equal(result.score.deficit, 500);
    assert.deepEqual(result.tickets, [[1, 2, 3]]);
});

test('CLI loads a profile and fixed file targets, exports both and resumes a champion', () => {
    const directory = mkdtempSync(join(tmpdir(), 'target-recovery-'));
    const script = fileURLToPath(new URL('../bin/target-recovery.mjs', import.meta.url));
    try {
        const profile = join(directory, 'profile.json'), targets = join(directory, 'draws.txt'), output = join(directory, 'run');
        const data = { schemaVersion: 1, currency: 'EUR', payoutModel: 'fixed_nominal', name: 'Test',
            totalBalls: 6, drawSize: 3, stakePerTicket: 1.25, payoutsByTicketSize: { 3: [0, 0, 1.50, 5] } };
        writeFileSync(profile, JSON.stringify(data));
        writeFileSync(targets, '1 2 3\n2 3 4\n');
        const args = [script, '--profile', profile, '--ticket-size', '3', '--tickets', '2', '--target', '1.50',
            '--combinations', targets, '--seed', '0', '--iterations', '5', '--output', output];
        const run = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 5000 });
        assert.equal(run.status, 0, run.stderr);
        const summary = JSON.parse(readFileSync(`${output}.summary.json`, 'utf8'));
        assert.equal(summary.config.targetCents, 150);
        assert.equal(summary.config.draws, 2);
        assert.equal(summary.totalStakeEUR, 2.50);
        assert.equal(summary.stakePerTicketEUR, 1.25);
        assert.equal(summary.config.seed, 0);
        assert.deepEqual(JSON.parse(readFileSync(summary.profileFile, 'utf8')), data);
        assert.deepEqual(loadJSON(summary.targetsFile).targets, [[1, 2, 3], [2, 3, 4]]);
        assert.equal(readFileSync(summary.targetsTextFile, 'utf8'), '01 02 03\n02 03 04\n');
        const verified = recoveryScore(verifyTotals(summary.tickets, [[1, 2, 3], [2, 3, 4]], [0, 0, 150, 500]), 150);
        assert.deepEqual(verified, summary.verifiedScore);
        assert.deepEqual(loadJSON(`${output}.record-000001.json`).profile, data);
        assert.equal(spawnSync(process.execPath, args, { encoding: 'utf8' }).status, 1);
        const resume = spawnSync(process.execPath, [script, '--profile', profile, '--ticket-size', '3', '--tickets', '2',
            '--target', '1.50', '--targets', summary.targetsTextFile, '--start', `${output}.summary.json`,
            '--iterations', '1', '--output', `${output}-next`], { encoding: 'utf8', timeout: 5000 });
        assert.equal(resume.status, 0, resume.stderr);
        assert.ok(!better(summary.score, loadJSON(`${output}-next.summary.json`).score));
        data.payoutsByTicketSize[3][3] = null;
        writeFileSync(profile, JSON.stringify(data));
        assert.throws(() => readProfile(profile, 3), /montants numériques/);
        data.payoutModel = 'estimated';
        writeFileSync(profile, JSON.stringify(data));
        assert.throws(() => readProfile(profile, 3), /Profil EUR/);
    } finally { rmSync(directory, { recursive: true, force: true }); }
});

function loadJSON(file) { return JSON.parse(readFileSync(file, 'utf8')); }

test('help and missing parameters never start a search or create results', () => {
    const directory = mkdtempSync(join(tmpdir(), 'target-recovery-help-'));
    const script = fileURLToPath(new URL('../bin/target-recovery.mjs', import.meta.url));
    try {
        for (const args of [[], ['--help'], ['-h'], ['--tickets', '10'], ['--tickets']]) {
            const result = spawnSync(process.execPath, [script, ...args], { cwd: directory, encoding: 'utf8' });
            assert.match(result.stdout, /Usage:/);
            assert.match(result.stdout, /--profile profiles\/keno.json/);
            assert.equal(result.status, args.length === 0 || args[0] === '--help' || args[0] === '-h' ? 0 : 1);
            assert.deepEqual(readdirSync(directory), []);
        }
    } finally { rmSync(directory, { recursive: true, force: true }); }
});
