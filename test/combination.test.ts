import { CombinationHelper } from '../src/combination';
import { TupleHelper } from '../src/tuple';

describe('CombinationHelper lexicographic ranks', () => {
	test('matches independent enumeration of all nonempty combinations through 12 balls', () => {
		let checked = 0;
		for (let max = 1; max <= 12; max++) {
			for (let length = 1; length <= max; length++) {
				let rank = 0n;
				const visit = (prefix: number[], minimum: number): void => {
					if (prefix.length === length) {
						expect(CombinationHelper.tupleToRank(max, [...prefix])).toBe(rank);
						expect(CombinationHelper.rankToTuple(max, length, rank)).toEqual(prefix);
						rank++;
						checked++;
						return;
					}
					for (let ball = minimum; ball <= max - (length - prefix.length) + 1; ball++) {
						visit([...prefix, ball], ball + 1);
					}
				};
				visit([], 1);
			}
		}
		expect(checked).toBe(8178);
	});

	test('preserves exact ranks beyond Number.MAX_SAFE_INTEGER', () => {
		const total = TupleHelper.binomial(70, 35);
		const last = Array.from({ length: 35 }, (_, i) => i + 36);
		expect(total).toBeGreaterThan(BigInt(Number.MAX_SAFE_INTEGER));
		expect(CombinationHelper.tupleToRank(70, [...last])).toBe(total - 1n);
		expect(CombinationHelper.rankToTuple(70, 35, total - 1n)).toEqual(last);
		const rank = BigInt(Number.MAX_SAFE_INTEGER) + 1234567n;
		expect(CombinationHelper.tupleToRank(70, CombinationHelper.rankToTuple(70, 35, rank))).toBe(rank);
	});

	test('uses zero-based boundaries and preserves sorting', () => {
		const tuple = [5, 1, 2];
		expect(CombinationHelper.tupleToRank(5, tuple)).toBe(2n);
		expect(tuple).toEqual([1, 2, 5]);
		expect(CombinationHelper.tupleToRank(5, [])).toBe(-1n);
		expect(CombinationHelper.tupleToRank(-1, [1])).toBe(-1n);
		expect(CombinationHelper.tupleToRank(5, [6])).toBe(-1n);
		for (const [max, length, rank] of [[0, 1, 1n], [5, 0, 1n], [5, 6, 1n], [5, 3, -1n], [5, 3, 10n]] as const) {
			expect(CombinationHelper.rankToTuple(max, length, rank)).toEqual([]);
		}
	});
});

describe('CombinationHelper existing examples', () => {
	test('CombinationHelper.tupleToRank test', () => {
		expect(CombinationHelper.tupleToRank(5, [1])).toBe(0n);
		expect(CombinationHelper.tupleToRank(5, [2])).toBe(1n);
		expect(CombinationHelper.tupleToRank(5, [3])).toBe(2n);
		expect(CombinationHelper.tupleToRank(5, [4])).toBe(3n);
		expect(CombinationHelper.tupleToRank(5, [5])).toBe(4n);

		expect(CombinationHelper.tupleToRank(5, [1, 2, 3])).toBe(0n);
		expect(CombinationHelper.tupleToRank(5, [1, 2, 4])).toBe(1n);
		expect(CombinationHelper.tupleToRank(5, [1, 2, 5])).toBe(2n);
		expect(CombinationHelper.tupleToRank(5, [1, 3, 4])).toBe(3n);
		expect(CombinationHelper.tupleToRank(5, [1, 3, 5])).toBe(4n);
		expect(CombinationHelper.tupleToRank(5, [1, 4, 5])).toBe(5n);
		expect(CombinationHelper.tupleToRank(5, [2, 3, 4])).toBe(6n);
		expect(CombinationHelper.tupleToRank(5, [2, 3, 5])).toBe(7n);
		expect(CombinationHelper.tupleToRank(5, [2, 4, 5])).toBe(8n);
		expect(CombinationHelper.tupleToRank(5, [3, 4, 5])).toBe(9n);

		expect(CombinationHelper.tupleToRank(5, [1, 2, 3, 4])).toBe(0n);
		expect(CombinationHelper.tupleToRank(5, [1, 2, 3, 5])).toBe(1n);
		expect(CombinationHelper.tupleToRank(5, [1, 2, 4, 5])).toBe(2n);
		expect(CombinationHelper.tupleToRank(5, [1, 3, 4, 5])).toBe(3n);
		expect(CombinationHelper.tupleToRank(5, [2, 3, 4, 5])).toBe(4n);

		expect(CombinationHelper.tupleToRank(6, [1, 2, 3, 4])).toBe(0n);
		expect(CombinationHelper.tupleToRank(6, [1, 2, 3, 5])).toBe(1n);
		expect(CombinationHelper.tupleToRank(6, [1, 2, 3, 6])).toBe(2n);
		expect(CombinationHelper.tupleToRank(6, [1, 2, 4, 5])).toBe(3n);
		expect(CombinationHelper.tupleToRank(6, [1, 2, 4, 6])).toBe(4n);
		expect(CombinationHelper.tupleToRank(6, [1, 2, 5, 6])).toBe(5n);
		expect(CombinationHelper.tupleToRank(6, [1, 3, 4, 5])).toBe(6n);
		expect(CombinationHelper.tupleToRank(6, [1, 3, 4, 6])).toBe(7n);
		expect(CombinationHelper.tupleToRank(6, [1, 3, 5, 6])).toBe(8n);
		expect(CombinationHelper.tupleToRank(6, [1, 4, 5, 6])).toBe(9n);
		expect(CombinationHelper.tupleToRank(6, [2, 3, 4, 5])).toBe(10n);
		expect(CombinationHelper.tupleToRank(6, [2, 3, 4, 6])).toBe(11n);
		expect(CombinationHelper.tupleToRank(6, [2, 3, 5, 6])).toBe(12n);
		expect(CombinationHelper.tupleToRank(6, [2, 4, 5, 6])).toBe(13n);
		expect(CombinationHelper.tupleToRank(6, [3, 4, 5, 6])).toBe(14n);
	});


	test('CombinationHelper.rankToTuple test', () => {
		expect(CombinationHelper.rankToTuple(5, 1, 0n)).toStrictEqual([1]);
		expect(CombinationHelper.rankToTuple(5, 1, 1n)).toStrictEqual([2]);
		expect(CombinationHelper.rankToTuple(5, 1, 2n)).toStrictEqual([3]);
		expect(CombinationHelper.rankToTuple(5, 1, 3n)).toStrictEqual([4]);
		expect(CombinationHelper.rankToTuple(5, 1, 4n)).toStrictEqual([5]);

		expect(CombinationHelper.rankToTuple(5, 2, 0n)).toStrictEqual([1, 2]);
		expect(CombinationHelper.rankToTuple(5, 2, 1n)).toStrictEqual([1, 3]);
		expect(CombinationHelper.rankToTuple(5, 2, 2n)).toStrictEqual([1, 4]);
		expect(CombinationHelper.rankToTuple(5, 2, 3n)).toStrictEqual([1, 5]);
		expect(CombinationHelper.rankToTuple(5, 2, 4n)).toStrictEqual([2, 3]);
		expect(CombinationHelper.rankToTuple(5, 2, 5n)).toStrictEqual([2, 4]);
		expect(CombinationHelper.rankToTuple(5, 2, 6n)).toStrictEqual([2, 5]);
		expect(CombinationHelper.rankToTuple(5, 2, 7n)).toStrictEqual([3, 4]);
		expect(CombinationHelper.rankToTuple(5, 2, 8n)).toStrictEqual([3, 5]);
		expect(CombinationHelper.rankToTuple(5, 2, 9n)).toStrictEqual([4, 5]);

		expect(CombinationHelper.rankToTuple(5, 3, 0n)).toStrictEqual([1, 2, 3]);
		expect(CombinationHelper.rankToTuple(5, 3, 1n)).toStrictEqual([1, 2, 4]);
		expect(CombinationHelper.rankToTuple(5, 3, 2n)).toStrictEqual([1, 2, 5]);
		expect(CombinationHelper.rankToTuple(5, 3, 3n)).toStrictEqual([1, 3, 4]);
		expect(CombinationHelper.rankToTuple(5, 3, 4n)).toStrictEqual([1, 3, 5]);
		expect(CombinationHelper.rankToTuple(5, 3, 5n)).toStrictEqual([1, 4, 5]);
		expect(CombinationHelper.rankToTuple(5, 3, 6n)).toStrictEqual([2, 3, 4]);
		expect(CombinationHelper.rankToTuple(5, 3, 7n)).toStrictEqual([2, 3, 5]);
		expect(CombinationHelper.rankToTuple(5, 3, 8n)).toStrictEqual([2, 4, 5]);
		expect(CombinationHelper.rankToTuple(5, 3, 9n)).toStrictEqual([3, 4, 5]);
	});


});
