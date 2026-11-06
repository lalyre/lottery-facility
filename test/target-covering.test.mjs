import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DEFAULTS, validateConfig, validateRows, makeTargets, randomGenerator,
    TargetIndex, CoveringSystem, search, verifyCoverage, loadRows } from '../bin/target-covering.mjs';

function combinations(n, size) {
    const rows = [];
    const visit = (prefix, minimum) => {
        if (prefix.length === size) { rows.push(prefix); return; }
        for (let ball = minimum; ball <= n - size + prefix.length + 1; ball++) visit([...prefix, ball], ball + 1);
    };
    visit([], 1);
    return rows;
}

test('specialized 4/5 bitsets match ordinary intersections exhaustively', () => {
    const config = { ...DEFAULTS, totalBalls: 8, drawSize: 5, draws: 56, tickets: 3 };
    const targets = combinations(8, 5);
    const index = new TargetIndex(targets, config);
    for (const ticket of targets) {
        const mask = index.coverage(ticket);
        assert.equal(index.score(mask), verifyCoverage([ticket], targets, 4));
        for (let d = 0; d < targets.length; d++) {
            assert.equal((mask[d >>> 5] >>> (d & 31)) & 1,
                Number(ticket.filter(ball => targets[d].includes(ball)).length >= 4));
        }
        assert.equal(mask.at(-1) >>> 24, 0, 'padding bits stay clear');
    }
});

test('generic thresholds and ball positions across 32/64/96 work', () => {
    for (const hits of [1, 2, 3, 4, 5, 6]) {
        const config = { ...DEFAULTS, totalBalls: 96, drawSize: 6, ticketSize: 6, hits };
        const targets = [[1, 31, 32, 33, 64, 96], [2, 32, 63, 64, 65, 95], [1, 3, 4, 5, 6, 7]];
        const ticket = [1, 32, 33, 64, 65, 96];
        const index = new TargetIndex(targets, config);
        assert.equal(index.score(index.coverage(ticket)), verifyCoverage([ticket], targets, hits));
    }
});

test('incremental replacement scores and exclusive coverage agree with independent evaluation', () => {
    const config = { ...DEFAULTS, totalBalls: 10, drawSize: 5, ticketSize: 4, hits: 3, draws: 100, tickets: 6 };
    const targets = makeTargets(config), index = new TargetIndex(targets, config);
    const system = new CoveringSystem(index, combinations(10, 4).slice(0, 6));
    const candidates = combinations(10, 4).slice(6, 56);
    for (let i = 0; i < candidates.length; i++) {
        const slot = i % 6, ticket = candidates[i], mask = index.coverage(ticket);
        const missing = system.missingWithout(slot);
        const predicted = system.score + index.score(mask, missing) - index.score(system.masks[slot], missing);
        system.replace(slot, { ticket, mask, key: ticket.join('-') });
        assert.equal(system.score, predicted);
        assert.equal(system.score, verifyCoverage(system.tickets, targets, config.hits));
        assert.equal(index.score(system.covered), system.score);
        for (let d = 0; d < targets.length; d++) {
            assert.equal(system.counts[d], system.tickets.filter(t => t.filter(b => targets[d].includes(b)).length >= 3).length);
        }
    }
});

test('same seed produces the same unique targets; full small universes are supported', () => {
    assert.deepEqual(makeTargets(DEFAULTS), makeTargets(DEFAULTS));
    assert.notDeepEqual(makeTargets(DEFAULTS), makeTargets({ ...DEFAULTS, seed: 1 }));
    assert.equal(new Set(makeTargets(DEFAULTS).map(row => row.join('-'))).size, 2000);
    assert.equal(makeTargets({ ...DEFAULTS, totalBalls: 5, drawSize: 2, draws: 10 }).length, 10);
    assert.throws(() => makeTargets({ ...DEFAULTS, totalBalls: 5, drawSize: 2, draws: 11 }));
});

test('target count tracks four distinct 3/4 tickets and the exact missing quota', async () => {
    const config = { ...DEFAULTS, totalBalls: 8, drawSize: 4, ticketSize: 4,
        hits: 3, targetCount: 4, tickets: 5, draws: 20, candidates: 2, replacementCandidates: 2, iterations: 30 };
    const targets = makeTargets(config), index = new TargetIndex(targets, config);
    const system = new CoveringSystem(index, combinations(8, 4).slice(0, 5));
    for (const [i, ticket] of combinations(8, 4).slice(5, 35).entries()) {
        const slot = i % 5, mask = index.coverage(ticket);
        const missing = system.missingWithout(slot), critical = system.criticalWithout(slot);
        const predicted = system.score + index.score(mask, critical) - index.score(system.masks[slot], critical);
        const fulfilled = system.fulfilled + index.score(mask, missing) - index.score(system.masks[slot], missing);
        system.replace(slot, { ticket, mask, key: ticket.join('-') });
        assert.equal(system.score, predicted);
        assert.equal(system.fulfilled, fulfilled);
        assert.equal(system.score, verifyCoverage(system.tickets, targets, 3, 4));
        assert.equal(system.fulfilled, Array.from(system.counts).reduce((sum, count) => sum + Math.min(count, 4), 0));
    }
    const result = await search(index, config);
    assert.equal(result.covered, verifyCoverage(result.tickets, targets, 3, 4));
    assert.equal(result.deficit, 4 * targets.length - result.fulfilled);
    assert.throws(() => validateConfig({ ...config, targetCount: 6 }), /targetCount/);
});

test('four times 3/4 means at least four tickets, and 4/4 also qualifies', () => {
    const target = [[1, 2, 3, 4]];
    const tickets = [[1, 2, 3, 4], [1, 2, 3, 5], [1, 2, 4, 6], [1, 3, 4, 7]];
    assert.equal(verifyCoverage(tickets, target, 3, 4), 1);
    assert.equal(verifyCoverage(tickets.slice(0, 3), target, 3, 4), 0);
});

test('configuration and duplicate rows are rejected explicitly', () => {
    for (const change of [{ hits: 6 }, { totalBalls: 97 }, { draws: 0 }, { seed: -1 }, { seconds: 0.5 },
        { seed: 2 ** 32 }, { totalBalls: 5, drawSize: 5, tickets: 2 }]) {
        assert.throws(() => validateConfig({ ...DEFAULTS, ...change }));
    }
    assert.throws(() => validateRows([[1, 2], [2, 1]], 2, 5, 'Cibles'), /doublon/);
    assert.throws(() => validateRows([[1, 1]], 2, 5, 'Cibles'));
    assert.throws(() => validateRows([[1, 6]], 2, 5, 'Cibles'));
});

test('directed construction covers 50 known draws using 50 tickets at 8/10', async () => {
    const config = { ...DEFAULTS, drawSize: 16, ticketSize: 10, hits: 8,
        draws: 50, candidates: 1, iterations: 1 };
    const targets = makeTargets(config), index = new TargetIndex(targets, config);
    const result = await search(index, config);
    assert.equal(result.covered, 50);
    assert.equal(verifyCoverage(result.tickets, targets, 8), 50);
    assert.equal(new Set(result.tickets.map(t => t.join('-'))).size, 50);
});

test('bounded search keeps fixed targets and is reproducible', async () => {
    const config = { ...DEFAULTS, totalBalls: 10, drawSize: 5, ticketSize: 3, hits: 3,
        draws: 100, tickets: 3, candidates: 2, replacementCandidates: 2, iterations: 20, restartEvery: 5 };
    const index = new TargetIndex(makeTargets(config), config);
    const records = [];
    const first = await search(index, config, { onRecord: r => records.push(r.covered) });
    const second = await search(index, config);
    assert.deepEqual(first.tickets, second.tickets);
    assert.equal(first.iterations, 20);
    assert.equal(first.restarts, 3);
    assert.equal(first.covered, verifyCoverage(first.tickets, index.targets, config.hits));
    assert.ok(records.every((value, i) => i === 0 || value > records[i - 1]));
    // A saved champion can be used as the initial system and is never lost.
    const resumed = await search(index, config, { initial: first.tickets });
    assert.ok(resumed.covered >= first.covered);
    assert.equal(resumed.covered, verifyCoverage(resumed.tickets, index.targets, config.hits));
});

test('a 90 percent champion does not stop the Monte Carlo search', async () => {
    const config = { ...DEFAULTS, totalBalls: 6, drawSize: 4, ticketSize: 4, hits: 4,
        tickets: 9, draws: 10, iterations: 5, candidates: 1, replacementCandidates: 1 };
    const targets = makeTargets(config), index = new TargetIndex(targets, config);
    // With exact 4/4, each ticket can cover only one of these distinct targets.
    const result = await search(index, config, { initial: targets.slice(0, 9) });
    assert.equal(result.covered, 9);
    assert.equal(result.iterations, 5);
});

test('CLI accepts totalBalls and total-balls with identical results and rejects conflicting values', () => {
    const directory = mkdtempSync(join(tmpdir(), 'target-covering-alias-'));
    try {
        const summaries = [];
        for (const flag of ['--totalBalls', '--total-balls']) {
            const output = join(directory, flag.slice(2));
            const result = spawnSync(process.execPath, ['bin/target-covering.mjs', flag, '6',
                '--draw-size', '3', '--ticket-size', '3', '--hits', '2', '--draws', '10',
                '--tickets', '2', '--candidates', '1', '--iterations', '2', '--output', output], { encoding: 'utf8' });
            assert.equal(result.status, 0, result.stderr);
            const summary = JSON.parse(readFileSync(`${output}.summary.json`, 'utf8'));
            assert.equal(summary.config.totalBalls, 6);
            const stored = JSON.parse(readFileSync(summary.targetsFile, 'utf8'));
            assert.ok(stored.targets.flat().every(ball => ball >= 1 && ball <= 6));
            summaries.push({ tickets: summary.tickets, targets: stored.targets, covered: summary.covered });
        }
        assert.deepEqual(summaries[0], summaries[1]);
        const conflict = spawnSync(process.execPath, ['bin/target-covering.mjs', '--totalBalls', '25', '--total-balls', '56'], { encoding: 'utf8' });
        assert.equal(conflict.status, 1);
        assert.match(conflict.stderr, /Valeurs différentes/);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});

test('CLI exports targets and independently verified records, and refuses overwriting', () => {
    const directory = mkdtempSync(join(tmpdir(), 'target-covering-'));
    try {
        const targets = join(directory, 'input.txt'), output = join(directory, 'run');
        writeFileSync(targets, '# targets\n1 2 3 4 5\n1|2|3|4|6\n');
        assert.equal(loadRows(targets, 'targets').length, 2);
        const args = ['bin/target-covering.mjs', '--targets', targets, '--draw-size', '5',
            '--tickets', '2', '--candidates', '1', '--iterations', '2', '--output', output];
        const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
        assert.equal(result.status, 0, result.stderr);
        const summary = JSON.parse(readFileSync(`${output}.summary.json`, 'utf8'));
        assert.equal(summary.covered, 2);
        assert.equal(summary.verifiedCovered, 2);
        const stored = JSON.parse(readFileSync(summary.targetsFile, 'utf8'));
        assert.equal(verifyCoverage(summary.tickets, stored.targets, 4), 2);
        const aliasArgs = [...args];
        aliasArgs[1] = '--combinations';
        aliasArgs[aliasArgs.length - 1] = `${output}-alias`;
        const alias = spawnSync(process.execPath, aliasArgs, { encoding: 'utf8' });
        assert.equal(alias.status, 0, alias.stderr);
        const aliasSummary = JSON.parse(readFileSync(`${output}-alias.summary.json`, 'utf8'));
        assert.equal(aliasSummary.config.draws, 2, 'all file targets used instead of the default 2000');
        assert.deepEqual(aliasSummary.tickets, summary.tickets);
        assert.deepEqual(JSON.parse(readFileSync(aliasSummary.targetsFile, 'utf8')).targets, stored.targets);
        const conflict = spawnSync(process.execPath, [...aliasArgs, '--targets', targets], { encoding: 'utf8' });
        assert.equal(conflict.status, 1);
        assert.match(conflict.stderr, /pas les deux/);
        const empty = spawnSync(process.execPath, ['bin/target-covering.mjs', '--combinations', ''], { encoding: 'utf8' });
        assert.equal(empty.status, 1);
        assert.match(empty.stderr, /chemin non vide/);
        assert.equal(spawnSync(process.execPath, args, { encoding: 'utf8' }).status, 1);
        const resume = spawnSync(process.execPath, ['bin/target-covering.mjs', '--targets', summary.targetsFile,
            '--draw-size', '5', '--tickets', '2', '--start', `${output}.summary.json`, '--output', `${output}-resumed`, '--iterations', '1'], { encoding: 'utf8' });
        assert.equal(resume.status, 0, resume.stderr);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
