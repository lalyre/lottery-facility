import { Tuple, TupleHelper } from '../src/tuple';

const solve = TupleHelper.maximumIndependentSet;
const admissible = (result: Tuple, system: Tuple[], threshold: number): boolean =>
    system.every(row => new Set(row.filter(number => result.includes(number))).size < threshold);

describe('maximumIndependentSet', () => {
    test('does not infer triple co-occurrence from pairs', () => {
        expect(solve([[1, 2], [2, 3]], [1, 2, 3], 3, 100)).toEqual([1, 2, 3]);
        expect(solve([[1, 2, 3]], [1, 2, 3], 3, 100)).toHaveLength(2);
    });

    test('normalizes duplicates, ignores outside numbers and preserves inputs and order', () => {
        const system = [[3, 3, 1, 99], [1, 3]];
        const alphabet = [3, 2, 1, 2];
        const before = JSON.stringify({ system, alphabet });
        expect(solve(system, alphabet, 3, 100)).toEqual([3, 2, 1]);
        expect(JSON.stringify({ system, alphabet })).toBe(before);
    });

    test('handles empty inputs, threshold one and unconstrained numbers', () => {
        expect(solve([], [3, 1, 2], 1, 1)).toEqual([3, 1, 2]);
        expect(solve([[1, 2]], [], 2, 1)).toEqual([]);
        expect(solve([[1, 2]], [1, 2, 3], 1, 1)).toEqual([3]);
    });

    test('handles 50 numbers and 200 grids with a one-node budget', () => {
        const alphabet = Array.from({ length: 50 }, (_, i) => i + 1);
        const system = Array.from({ length: 200 }, (_, i) =>
            Array.from({ length: 10 }, (_, j) => (i * 7 + j * (1 + Math.floor(i / 50))) % 50 + 1));
        const result = solve(system, alphabet, 4, 1);
        expect(result.length).toBeGreaterThan(0);
        expect(admissible(result, system, 4)).toBe(true);
    });

    test('matches exhaustive optima on deterministic small systems and respects budget prefixes', () => {
        let state = 17;
        const random = (): number => {
            state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
            return state / 4294967296;
        };
        const alphabet = Array.from({ length: 8 }, (_, i) => i + 1);
        for (let sample = 0; sample < 100; sample++) {
            const system = Array.from({ length: 12 }, () => alphabet.filter(() => random() < 0.45));
            const threshold = 1 + sample % 5;
            let optimum = 0;
            for (let mask = 0; mask < 256; mask++) {
                const subset = alphabet.filter((_, i) => (mask & (1 << i)) !== 0);
                if (admissible(subset, system, threshold)) optimum = Math.max(optimum, subset.length);
            }
            let previousSize = 0;
            for (const budget of [1, 2, 5, 20, 1000]) {
                const result = solve(system, alphabet, threshold, budget);
                expect(admissible(result, system, threshold)).toBe(true);
                expect(result.length).toBeGreaterThanOrEqual(previousSize);
                previousSize = result.length;
            }
            expect(previousSize).toBe(optimum);
        }
    });

    test('rejects invalid thresholds, budgets and number arrays', () => {
        for (const value of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
            expect(() => solve([], [], value, 10)).toThrow('Invalid threshold');
            expect(() => solve([], [], 2, value)).toThrow('Invalid maxIterations');
        }
        expect(() => solve([[NaN]], [1], 2, 10)).toThrow('Invalid system or alphabet');
        expect(() => solve([], [Infinity], 2, 10)).toThrow('Invalid system or alphabet');
    });
});
