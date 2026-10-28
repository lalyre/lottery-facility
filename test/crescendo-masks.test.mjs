import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the original script's actual scoring functions without starting its
// infinite search. No copy of the matching implementation lives in this test.
const source = readFileSync(new URL('../bin/crescendo.mjs', import.meta.url), 'utf8');
const masking = source.slice(source.indexOf('const toMask ='), source.indexOf('// Format :'));
const coverage = source.slice(source.indexOf('const getCoverageStats ='), source.indexOf('const getSystemScore ='));
function engine(evaluationDraws, targetHits = 1) {
    return runInNewContext(`${masking}\n${coverage}\n({ toMask, popcount32, createRandomDrawMask, getCoverageStats })`,
        { TOTAL_BALLS: 96, DRAW_SIZE: 23, TARGET_HITS: targetHits, TARGET_COUNT: 1, evaluationDraws });
}

test('original threshold script distinguishes the three words through ball 96', () => {
    const api = engine([]);
    const mask = api.toMask([1,32,33,64,65,96]);
    assert.equal(api.popcount32(mask.low), 2);
    assert.equal(api.popcount32(mask.high), 2);
    assert.equal(api.popcount32(mask.upper), 2);
    for (const number of [1,32,33,64,65,96]) {
        const scorer = engine([api.toMask([number])]);
        for (const ticket of [1,32,33,64,65,96]) {
            const result = scorer.getCoverageStats([[ticket]]);
            assert.equal(result.failures, ticket === number ? 0 : 1);
        }
    }
});

test('original Monte Carlo draws and multi-hit targets include the third word', () => {
    const api = engine([]);
    let saw96 = false;
    for (let index = 0; index < 200; index++) {
        const draw = api.createRandomDrawMask();
        assert.equal(api.popcount32(draw.low) + api.popcount32(draw.high) + api.popcount32(draw.upper), 23);
        saw96 ||= Boolean(draw.upper & 0x80000000);
    }
    assert.ok(saw96);
    const scorer = engine([api.toMask([32,64,96]), api.toMask([1,33,65])], 3);
    assert.equal(scorer.getCoverageStats([[32,64,96]]).failures, 1);
    assert.equal(scorer.getCoverageStats([[32,64,96], [1,33,65]]).failures, 0);
});
