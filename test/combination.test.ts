'use strict';
import {
     Combination,
} from '../src/main';


describe('Combination module', () => {
	beforeEach(() => {
	});


	test('Combination.toString test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let s = Combination.toString(a, " ");
		expect(s).toBe("08 03 01 07 06 05");
	});


	test('Combination.toCanonicalString test', () => {
		let a = [8, 3, 1, 7, 6, 3, 7, 6, 5];
		let s = Combination.toCanonicalString(a, " ");
		expect(s).toBe("01 03 05 06 07 08");
	});


	test('Combination.collisionsCount test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let b = [4, 3, 1, 2, 6, 9];
		let c = Combination.collisionsCount(a, b);
		expect(c).toBe(3);
	});


	test('Combination.union test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let b = [4, 3, 1, 2, 6, 9];
		let c = Combination.union(a, b);
		let s = Combination.toCanonicalString(c, " ");
		expect(s).toBe("01 02 03 04 05 06 07 08 09");
		
		let d = Combination.union(a, b, true);
		let ss = Combination.toString(d, " ");
		expect(ss).toBe("08 03 01 07 06 05 04 03 01 02 06 09");
	});


	test('Combination.intersection test', () => {
		let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
		let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
		let c = Combination.intersection(a, b);
		let s1 = Combination.toCanonicalString(c, " ");
		expect(s1).toBe("01 03 06");

		let d = Combination.intersection(b, a);
		let s2 = Combination.toCanonicalString(d, " ");
		expect(s2).toBe("01 03 06");

		let e = Combination.intersection([1, 2], [3, 4]);
		expect(e.length).toBe(0);
	});


	test('Combination.difference test', () => {
		let a = [8, 3, 7, 8, 6, 5, 3, 1];
		let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
		let c = Combination.difference(a, b);
		let s1 = Combination.toCanonicalString(c, " ");
		expect(s1).toBe("05 07 08");

		let d = Combination.difference(b, a);
		let s2 = Combination.toCanonicalString(d, " ");
		expect(s2).toBe("02 04 09");

		let e = Combination.difference([1, 2], [3, 4]);
		let s3 = Combination.toCanonicalString(e, " ");
		expect(s3).toBe("01 02");
	});


	test('Combination.complement test', () => {
		let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
		let c = Combination.complement(9, a);
		let s = Combination.toString(c, " ");
		expect(s).toBe("02 07 09 03 02 04 05 07 03 09");
	});


	test('Combination.combinationToRank test', () => {
		expect(Combination.combinationToRank(5, [1])).toBe(1);
		expect(Combination.combinationToRank(5, [2])).toBe(2);
		expect(Combination.combinationToRank(5, [3])).toBe(3);
		expect(Combination.combinationToRank(5, [4])).toBe(4);
		expect(Combination.combinationToRank(5, [5])).toBe(5);

		expect(Combination.combinationToRank(5, [1, 2, 3])).toBe(1);
		expect(Combination.combinationToRank(5, [1, 2, 4])).toBe(2);
		expect(Combination.combinationToRank(5, [1, 2, 5])).toBe(3);
		expect(Combination.combinationToRank(5, [1, 3, 4])).toBe(4);
		expect(Combination.combinationToRank(5, [1, 3, 5])).toBe(5);
		expect(Combination.combinationToRank(5, [1, 4, 5])).toBe(6);
		expect(Combination.combinationToRank(5, [2, 3, 4])).toBe(7);
		expect(Combination.combinationToRank(5, [2, 3, 5])).toBe(8);
		expect(Combination.combinationToRank(5, [2, 4, 5])).toBe(9);
		expect(Combination.combinationToRank(5, [3, 4, 5])).toBe(10);

		expect(Combination.combinationToRank(5, [1, 2, 3, 4])).toBe(1);
		expect(Combination.combinationToRank(5, [1, 2, 3, 5])).toBe(2);
		expect(Combination.combinationToRank(5, [1, 2, 4, 5])).toBe(3);
		expect(Combination.combinationToRank(5, [1, 3, 4, 5])).toBe(4);
		expect(Combination.combinationToRank(5, [2, 3, 4, 5])).toBe(5);

		expect(Combination.combinationToRank(6, [1, 2, 3, 4])).toBe(1);
		expect(Combination.combinationToRank(6, [1, 2, 3, 5])).toBe(2);
		expect(Combination.combinationToRank(6, [1, 2, 3, 6])).toBe(3);
		expect(Combination.combinationToRank(6, [1, 2, 4, 5])).toBe(4);
		expect(Combination.combinationToRank(6, [1, 2, 4, 6])).toBe(5);
		expect(Combination.combinationToRank(6, [1, 2, 5, 6])).toBe(6);
		expect(Combination.combinationToRank(6, [1, 3, 4, 5])).toBe(7);
		expect(Combination.combinationToRank(6, [1, 3, 4, 6])).toBe(8);
		expect(Combination.combinationToRank(6, [1, 3, 5, 6])).toBe(9);
		expect(Combination.combinationToRank(6, [1, 4, 5, 6])).toBe(10);
		expect(Combination.combinationToRank(6, [2, 3, 4, 5])).toBe(11);
		expect(Combination.combinationToRank(6, [2, 3, 4, 6])).toBe(12);
		expect(Combination.combinationToRank(6, [2, 3, 5, 6])).toBe(13);
		expect(Combination.combinationToRank(6, [2, 4, 5, 6])).toBe(14);
		expect(Combination.combinationToRank(6, [3, 4, 5, 6])).toBe(15);
	});
});

