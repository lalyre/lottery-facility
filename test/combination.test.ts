'use strict';
import { copyFile } from 'fs';
import {
     CombinationHelper,
} from '../src/main';


describe('CombinationHelper module', () => {
	beforeEach(() => {
	});


	test('CombinationHelper.toString test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let s = CombinationHelper.toString(a, " ");
		expect(s).toBe("08 03 01 07 06 05");
	});


	test('CombinationHelper.toCanonicalString test', () => {
		let a = [8, 3, 1, 7, 6, 3, 7, 6, 5];
		let s = CombinationHelper.toCanonicalString(a, " ");
		expect(s).toBe("01 03 05 06 07 08");
	});


	test('CombinationHelper.collisionsCount test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let b = [4, 3, 1, 2, 6, 9];
		let c = CombinationHelper.collisionsCount(a, b);
		expect(c).toBe(3);
	});


	test('CombinationHelper.union test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let b = [4, 3, 1, 2, 6, 9];
		let c = CombinationHelper.union(a, b);
		let s = CombinationHelper.toCanonicalString(c, " ");
		expect(s).toBe("01 02 03 04 05 06 07 08 09");
		
		let d = CombinationHelper.union(a, b, true);
		let ss = CombinationHelper.toString(d, " ");
		expect(ss).toBe("08 03 01 07 06 05 04 03 01 02 06 09");
	});


	test('CombinationHelper.intersection test', () => {
		let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
		let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
		let c = CombinationHelper.intersection(a, b);
		let s1 = CombinationHelper.toCanonicalString(c, " ");
		expect(s1).toBe("01 03 06");

		let d = CombinationHelper.intersection(b, a);
		let s2 = CombinationHelper.toCanonicalString(d, " ");
		expect(s2).toBe("01 03 06");

		let e = CombinationHelper.intersection([1, 2], [3, 4]);
		expect(e.length).toBe(0);
	});


	test('CombinationHelper.difference test', () => {
		let a = [8, 3, 7, 8, 6, 5, 3, 1];
		let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
		let c = CombinationHelper.difference(a, b);
		let s1 = CombinationHelper.toCanonicalString(c, " ");
		expect(s1).toBe("05 07 08");

		let d = CombinationHelper.difference(b, a);
		let s2 = CombinationHelper.toCanonicalString(d, " ");
		expect(s2).toBe("02 04 09");

		let e = CombinationHelper.difference([1, 2], [3, 4]);
		let s3 = CombinationHelper.toCanonicalString(e, " ");
		expect(s3).toBe("01 02");
	});


	test('CombinationHelper.minimum_gap test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		let c1 = [3, 4, 8, 12];
		let g1 = CombinationHelper.minimum_gap(alphabet, c1);
		expect(g1).toBe(1);

		let c2 = [3, 8, 11, 16];
		let g2 = CombinationHelper.minimum_gap(alphabet, c2);
		expect(g2).toBe(3);

		let c3 = [2, 7, 12, 19];
		let g3 = CombinationHelper.minimum_gap(alphabet, c3);
		expect(g3).toBe(3);


		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [2, 21, 40];
		let g4 = CombinationHelper.minimum_gap(alphabet2, c4);
		expect(g4).toBe(12);

		let c5 = [2, 20, 32];
		let g5 = CombinationHelper.minimum_gap(alphabet2, c5);
		expect(g5).toBe(12);
		
		let c6 = [32];
		let g6 = CombinationHelper.minimum_gap(alphabet2, c6);
		expect(g6).toBe(0);
	});


	test('CombinationHelper.maximum_gap test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		let c1 = [1, 4, 8, 11];
		let g1 = CombinationHelper.maximum_gap(alphabet, c1);
		expect(g1).toBe(4);

		let c2 = [8, 11, 14, 16];
		let g2 = CombinationHelper.maximum_gap(alphabet, c2);
		expect(g2).toBe(3);

		let c3 = [18, 3, 5, 6];
		let g3 = CombinationHelper.maximum_gap(alphabet, c3);
		expect(g3).toBe(5);


		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [1, 2, 20, 21, 40];
		let g4 = CombinationHelper.maximum_gap(alphabet2, c4);
		expect(g4).toBe(18);

		let c5 = [1, 2, 20, 31, 32];
		let g5 = CombinationHelper.maximum_gap(alphabet2, c5);
		expect(g5).toBe(18);

		let c6 = [1, 2, 3, 34, 44];
		let g6 = CombinationHelper.maximum_gap(alphabet2, c6);
		expect(g6).toBe(10);

		let c7 = [50, 3];
		let g7 = CombinationHelper.maximum_gap(alphabet2, c7);
		expect(g7).toBe(3);

		let c8 = [1, 20, 24, 28, 47]
		let g8 = CombinationHelper.maximum_gap(alphabet2, c8);
		expect(g8).toBe(19);
		
		let c9 = [24]
		let g9 = CombinationHelper.maximum_gap(alphabet2, c9);
		expect(g9).toBe(0);
	});


	test('CombinationHelper.complement test', () => {
		let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
		let c = CombinationHelper.complement(9, a);
		let s = CombinationHelper.toString(c, " ");
		expect(s).toBe("02 07 09 03 02 04 05 07 03 09");
	});


	test('CombinationHelper.combinationToRank test', () => {
		expect(CombinationHelper.combinationToRank(5, [1])).toBe(1);
		expect(CombinationHelper.combinationToRank(5, [2])).toBe(2);
		expect(CombinationHelper.combinationToRank(5, [3])).toBe(3);
		expect(CombinationHelper.combinationToRank(5, [4])).toBe(4);
		expect(CombinationHelper.combinationToRank(5, [5])).toBe(5);

		expect(CombinationHelper.combinationToRank(5, [1, 2, 3])).toBe(1);
		expect(CombinationHelper.combinationToRank(5, [1, 2, 4])).toBe(2);
		expect(CombinationHelper.combinationToRank(5, [1, 2, 5])).toBe(3);
		expect(CombinationHelper.combinationToRank(5, [1, 3, 4])).toBe(4);
		expect(CombinationHelper.combinationToRank(5, [1, 3, 5])).toBe(5);
		expect(CombinationHelper.combinationToRank(5, [1, 4, 5])).toBe(6);
		expect(CombinationHelper.combinationToRank(5, [2, 3, 4])).toBe(7);
		expect(CombinationHelper.combinationToRank(5, [2, 3, 5])).toBe(8);
		expect(CombinationHelper.combinationToRank(5, [2, 4, 5])).toBe(9);
		expect(CombinationHelper.combinationToRank(5, [3, 4, 5])).toBe(10);

		expect(CombinationHelper.combinationToRank(5, [1, 2, 3, 4])).toBe(1);
		expect(CombinationHelper.combinationToRank(5, [1, 2, 3, 5])).toBe(2);
		expect(CombinationHelper.combinationToRank(5, [1, 2, 4, 5])).toBe(3);
		expect(CombinationHelper.combinationToRank(5, [1, 3, 4, 5])).toBe(4);
		expect(CombinationHelper.combinationToRank(5, [2, 3, 4, 5])).toBe(5);

		expect(CombinationHelper.combinationToRank(6, [1, 2, 3, 4])).toBe(1);
		expect(CombinationHelper.combinationToRank(6, [1, 2, 3, 5])).toBe(2);
		expect(CombinationHelper.combinationToRank(6, [1, 2, 3, 6])).toBe(3);
		expect(CombinationHelper.combinationToRank(6, [1, 2, 4, 5])).toBe(4);
		expect(CombinationHelper.combinationToRank(6, [1, 2, 4, 6])).toBe(5);
		expect(CombinationHelper.combinationToRank(6, [1, 2, 5, 6])).toBe(6);
		expect(CombinationHelper.combinationToRank(6, [1, 3, 4, 5])).toBe(7);
		expect(CombinationHelper.combinationToRank(6, [1, 3, 4, 6])).toBe(8);
		expect(CombinationHelper.combinationToRank(6, [1, 3, 5, 6])).toBe(9);
		expect(CombinationHelper.combinationToRank(6, [1, 4, 5, 6])).toBe(10);
		expect(CombinationHelper.combinationToRank(6, [2, 3, 4, 5])).toBe(11);
		expect(CombinationHelper.combinationToRank(6, [2, 3, 4, 6])).toBe(12);
		expect(CombinationHelper.combinationToRank(6, [2, 3, 5, 6])).toBe(13);
		expect(CombinationHelper.combinationToRank(6, [2, 4, 5, 6])).toBe(14);
		expect(CombinationHelper.combinationToRank(6, [3, 4, 5, 6])).toBe(15);
	});


	test('CombinationHelper.rankToCombination test', () => {
		expect(CombinationHelper.rankToCombination(5, 1, 1)).toStrictEqual([1]);
		expect(CombinationHelper.rankToCombination(5, 1, 2)).toStrictEqual([2]);
		expect(CombinationHelper.rankToCombination(5, 1, 3)).toStrictEqual([3]);
		expect(CombinationHelper.rankToCombination(5, 1, 4)).toStrictEqual([4]);
		expect(CombinationHelper.rankToCombination(5, 1, 5)).toStrictEqual([5]);

		expect(CombinationHelper.rankToCombination(5, 2, 1)).toStrictEqual([1, 2]);
		expect(CombinationHelper.rankToCombination(5, 2, 2)).toStrictEqual([1, 3]);
		expect(CombinationHelper.rankToCombination(5, 2, 3)).toStrictEqual([1, 4]);
		expect(CombinationHelper.rankToCombination(5, 2, 4)).toStrictEqual([1, 5]);
		expect(CombinationHelper.rankToCombination(5, 2, 5)).toStrictEqual([2, 3]);
		expect(CombinationHelper.rankToCombination(5, 2, 6)).toStrictEqual([2, 4]);
		expect(CombinationHelper.rankToCombination(5, 2, 7)).toStrictEqual([2, 5]);
		expect(CombinationHelper.rankToCombination(5, 2, 8)).toStrictEqual([3, 4]);
		expect(CombinationHelper.rankToCombination(5, 2, 9)).toStrictEqual([3, 5]);
		expect(CombinationHelper.rankToCombination(5, 2, 10)).toStrictEqual([4, 5]);

		expect(CombinationHelper.rankToCombination(5, 3, 1)).toStrictEqual([1, 2, 3]);
		expect(CombinationHelper.rankToCombination(5, 3, 2)).toStrictEqual([1, 2, 4]);
		expect(CombinationHelper.rankToCombination(5, 3, 3)).toStrictEqual([1, 2, 5]);
		expect(CombinationHelper.rankToCombination(5, 3, 4)).toStrictEqual([1, 3, 4]);
		expect(CombinationHelper.rankToCombination(5, 3, 5)).toStrictEqual([1, 3, 5]);
		expect(CombinationHelper.rankToCombination(5, 3, 6)).toStrictEqual([1, 4, 5]);
		expect(CombinationHelper.rankToCombination(5, 3, 7)).toStrictEqual([2, 3, 4]);
		expect(CombinationHelper.rankToCombination(5, 3, 8)).toStrictEqual([2, 3, 5]);
		expect(CombinationHelper.rankToCombination(5, 3, 9)).toStrictEqual([2, 4, 5]);
		expect(CombinationHelper.rankToCombination(5, 3, 10)).toStrictEqual([3, 4, 5]);
	});
});

