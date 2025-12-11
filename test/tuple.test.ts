'use strict';
import { copyFile } from 'fs';
import {
	TupleHelper,
	CartesianProduct,
} from '../src/main';


describe('TupleHelper module', () => {
	beforeEach(() => {
	});


	test('TupleHelper.toString test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let s = TupleHelper.toString(a, " ");
		expect(s).toBe("08 03 01 07 06 05");
	});


	test('TupleHelper.toCanonicalString test', () => {
		let a = [8, 3, 1, 7, 6, 3, 7, 6, 5];
		let s = TupleHelper.toCanonicalString(a, " ");
		expect(s).toBe("01 03 05 06 07 08");
	});


	test('TupleHelper.collisionsCount test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let b = [4, 3, 1, 2, 6, 9];
		let c = TupleHelper.collisionsCount(a, b);
		expect(c).toBe(3);
	});


	test('TupleHelper.union test', () => {
		let a = [8, 3, 1, 7, 6, 5];
		let b = [4, 3, 1, 2, 6, 9];
		let c = TupleHelper.union(a, b);
		let s = TupleHelper.toCanonicalString(c, " ");
		expect(s).toBe("01 02 03 04 05 06 07 08 09");
		
		let d = TupleHelper.union(a, b, true);
		let ss = TupleHelper.toString(d, " ");
		expect(ss).toBe("08 03 01 07 06 05 04 03 01 02 06 09");
	});


	test('TupleHelper.intersection test', () => {
		let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
		let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
		let c = TupleHelper.intersection(a, b);
		let s1 = TupleHelper.toCanonicalString(c, " ");
		expect(s1).toBe("01 03 06");

		let d = TupleHelper.intersection(b, a);
		let s2 = TupleHelper.toCanonicalString(d, " ");
		expect(s2).toBe("01 03 06");

		let e = TupleHelper.intersection([1, 2], [3, 4]);
		expect(e.length).toBe(0);
	});


	test('TupleHelper.difference test', () => {
		let a = [8, 3, 7, 8, 6, 5, 3, 1];
		let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
		let c = TupleHelper.difference(a, b);
		let s1 = TupleHelper.toCanonicalString(c, " ");
		expect(s1).toBe("05 07 08");

		let d = TupleHelper.difference(b, a);
		let s2 = TupleHelper.toCanonicalString(d, " ");
		expect(s2).toBe("02 04 09");

		let e = TupleHelper.difference([1, 2], [3, 4]);
		let s3 = TupleHelper.toCanonicalString(e, " ");
		expect(s3).toBe("01 02");
	});


	test('TupleHelper.minimum_gap test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		let c1 = [3, 4, 8, 12];
		let g1 = TupleHelper.minimum_gap(alphabet, c1);
		expect(g1).toBe(1);

		let c2 = [3, 8, 11, 16];
		let g2 = TupleHelper.minimum_gap(alphabet, c2);
		expect(g2).toBe(3);

		let c3 = [2, 7, 12, 19];
		let g3 = TupleHelper.minimum_gap(alphabet, c3);
		expect(g3).toBe(3);


		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [2, 21, 40];
		let g4 = TupleHelper.minimum_gap(alphabet2, c4);
		expect(g4).toBe(12);

		let c5 = [2, 20, 32];
		let g5 = TupleHelper.minimum_gap(alphabet2, c5);
		expect(g5).toBe(12);
		
		let c6 = [32];
		let g6 = TupleHelper.minimum_gap(alphabet2, c6);
		expect(g6).toBe(0);
	});


	test('TupleHelper.minimum_right_gap test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		let c1 = [3, 6, 10, 12];
		let g1 = TupleHelper.minimum_right_gap(alphabet, c1);
		expect(g1).toBe(2);

		let c2 = [3, 8, 11, 16];
		let g2 = TupleHelper.minimum_right_gap(alphabet, c2);
		expect(g2).toBe(3);

		let c3 = [2, 10, 12, 19];
		let g3 = TupleHelper.minimum_right_gap(alphabet, c3);
		expect(g3).toBe(2);


		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [2, 21, 50];
		let g4 = TupleHelper.minimum_right_gap(alphabet2, c4);
		expect(g4).toBe(19);

		let c5 = [2, 20, 32];
		let g5 = TupleHelper.minimum_right_gap(alphabet2, c5);
		expect(g5).toBe(12);
		
		let c6 = [32];
		let g6 = TupleHelper.minimum_right_gap(alphabet2, c6);
		expect(g6).toBe(0);
	});


	test('TupleHelper.maximum_gap test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		let c1 = [1, 4, 8, 11];
		let g1 = TupleHelper.maximum_gap(alphabet, c1);
		expect(g1).toBe(4);

		let c2 = [8, 11, 14, 16];
		let g2 = TupleHelper.maximum_gap(alphabet, c2);
		expect(g2).toBe(3);

		let c3 = [18, 3, 5, 6];
		let g3 = TupleHelper.maximum_gap(alphabet, c3);
		expect(g3).toBe(5);


		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [1, 2, 20, 21, 40];
		let g4 = TupleHelper.maximum_gap(alphabet2, c4);
		expect(g4).toBe(18);

		let c5 = [1, 2, 20, 31, 32];
		let g5 = TupleHelper.maximum_gap(alphabet2, c5);
		expect(g5).toBe(18);

		let c6 = [1, 2, 3, 34, 44];
		let g6 = TupleHelper.maximum_gap(alphabet2, c6);
		expect(g6).toBe(10);

		let c7 = [50, 3];
		let g7 = TupleHelper.maximum_gap(alphabet2, c7);
		expect(g7).toBe(3);

		let c8 = [1, 20, 24, 28, 47]
		let g8 = TupleHelper.maximum_gap(alphabet2, c8);
		expect(g8).toBe(19);
		
		let c9 = [24]
		let g9 = TupleHelper.maximum_gap(alphabet2, c9);
		expect(g9).toBe(0);
	});


	test('TupleHelper.maximum_right_gap test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		let c1 = [1, 4, 8, 11];
		let g1 = TupleHelper.maximum_right_gap(alphabet, c1);
		expect(g1).toBe(4);

		let c2 = [8, 11, 14, 16];
		let g2 = TupleHelper.maximum_right_gap(alphabet, c2);
		expect(g2).toBe(3);

		let c3 = [18, 3, 5, 6];
		let g3 = TupleHelper.maximum_right_gap(alphabet, c3);
		expect(g3).toBe(12);


		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [1, 2, 20, 21, 40];
		let g4 = TupleHelper.maximum_right_gap(alphabet2, c4);
		expect(g4).toBe(19);

		let c5 = [1, 2, 20, 31, 32];
		let g5 = TupleHelper.maximum_right_gap(alphabet2, c5);
		expect(g5).toBe(18);

		let c6 = [1, 2, 3, 34, 44];
		let g6 = TupleHelper.maximum_right_gap(alphabet2, c6);
		expect(g6).toBe(31);

		let c7 = [50, 3];
		let g7 = TupleHelper.maximum_right_gap(alphabet2, c7);
		expect(g7).toBe(47);

		let c8 = [1, 20, 24, 30, 47]
		let g8 = TupleHelper.maximum_right_gap(alphabet2, c8);
		expect(g8).toBe(19);
		
		let c9 = [24]
		let g9 = TupleHelper.maximum_right_gap(alphabet2, c9);
		expect(g9).toBe(0);
		
		let c10 = [1, 2, 3, 15, 18]
		let g10 = TupleHelper.maximum_right_gap(alphabet2, c10);
		expect(g10).toBe(12);
	});


	test('TupleHelper.distance test', () => {
		let alphabet2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
		let c4 = [1, 2, 20, 21, 40];
		let g4 = TupleHelper.distance(alphabet2, c4);
		expect(g4).toBe(39);

		let c5 = [1, 2, 20, 31, 32];
		let g5 = TupleHelper.distance(alphabet2, c5);
		expect(g5).toBe(31);

		let c6 = [34, 44];
		let g6 = TupleHelper.distance(alphabet2, c6);
		expect(g6).toBe(10);

		let c7 = [50, 3];
		let g7 = TupleHelper.distance(alphabet2, c7);
		expect(g7).toBe(47);
		
		let c9 = [24]
		let g9 = TupleHelper.distance(alphabet2, c9);
		expect(g9).toBe(0);
	});


	test('TupleHelper.complement test', () => {
		let alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		let a1 = [8, 3, 1];
		let a2 = [10, 2, 4, 5];
		let c1 = TupleHelper.complement(alphabet, a1);
		let c2 = TupleHelper.complement(alphabet, a2);
		let s1 = TupleHelper.toString(c1, " ");
		let s2 = TupleHelper.toString(c2, " ");
		expect(s1).toBe("03 08 10");
		expect(s2).toBe("01 09 07 06");
	});


	test('TupleHelper.tupleToRank test', () => {
		expect(TupleHelper.tupleToRank(5, [1])).toBe(1n);
		expect(TupleHelper.tupleToRank(5, [2])).toBe(2n);
		expect(TupleHelper.tupleToRank(5, [3])).toBe(3n);
		expect(TupleHelper.tupleToRank(5, [4])).toBe(4n);
		expect(TupleHelper.tupleToRank(5, [5])).toBe(5n);

		expect(TupleHelper.tupleToRank(5, [1, 2, 3])).toBe(1n);
		expect(TupleHelper.tupleToRank(5, [1, 2, 4])).toBe(2n);
		expect(TupleHelper.tupleToRank(5, [1, 2, 5])).toBe(3n);
		expect(TupleHelper.tupleToRank(5, [1, 3, 4])).toBe(4n);
		expect(TupleHelper.tupleToRank(5, [1, 3, 5])).toBe(5n);
		expect(TupleHelper.tupleToRank(5, [1, 4, 5])).toBe(6n);
		expect(TupleHelper.tupleToRank(5, [2, 3, 4])).toBe(7n);
		expect(TupleHelper.tupleToRank(5, [2, 3, 5])).toBe(8n);
		expect(TupleHelper.tupleToRank(5, [2, 4, 5])).toBe(9n);
		expect(TupleHelper.tupleToRank(5, [3, 4, 5])).toBe(10n);

		expect(TupleHelper.tupleToRank(5, [1, 2, 3, 4])).toBe(1n);
		expect(TupleHelper.tupleToRank(5, [1, 2, 3, 5])).toBe(2n);
		expect(TupleHelper.tupleToRank(5, [1, 2, 4, 5])).toBe(3n);
		expect(TupleHelper.tupleToRank(5, [1, 3, 4, 5])).toBe(4n);
		expect(TupleHelper.tupleToRank(5, [2, 3, 4, 5])).toBe(5n);

		expect(TupleHelper.tupleToRank(6, [1, 2, 3, 4])).toBe(1n);
		expect(TupleHelper.tupleToRank(6, [1, 2, 3, 5])).toBe(2n);
		expect(TupleHelper.tupleToRank(6, [1, 2, 3, 6])).toBe(3n);
		expect(TupleHelper.tupleToRank(6, [1, 2, 4, 5])).toBe(4n);
		expect(TupleHelper.tupleToRank(6, [1, 2, 4, 6])).toBe(5n);
		expect(TupleHelper.tupleToRank(6, [1, 2, 5, 6])).toBe(6n);
		expect(TupleHelper.tupleToRank(6, [1, 3, 4, 5])).toBe(7n);
		expect(TupleHelper.tupleToRank(6, [1, 3, 4, 6])).toBe(8n);
		expect(TupleHelper.tupleToRank(6, [1, 3, 5, 6])).toBe(9n);
		expect(TupleHelper.tupleToRank(6, [1, 4, 5, 6])).toBe(10n);
		expect(TupleHelper.tupleToRank(6, [2, 3, 4, 5])).toBe(11n);
		expect(TupleHelper.tupleToRank(6, [2, 3, 4, 6])).toBe(12n);
		expect(TupleHelper.tupleToRank(6, [2, 3, 5, 6])).toBe(13n);
		expect(TupleHelper.tupleToRank(6, [2, 4, 5, 6])).toBe(14n);
		expect(TupleHelper.tupleToRank(6, [3, 4, 5, 6])).toBe(15n);
	});


	test('TupleHelper.rankToTuple test', () => {
		expect(TupleHelper.rankToTuple(5, 1, 1n)).toStrictEqual([1]);
		expect(TupleHelper.rankToTuple(5, 1, 2n)).toStrictEqual([2]);
		expect(TupleHelper.rankToTuple(5, 1, 3n)).toStrictEqual([3]);
		expect(TupleHelper.rankToTuple(5, 1, 4n)).toStrictEqual([4]);
		expect(TupleHelper.rankToTuple(5, 1, 5n)).toStrictEqual([5]);

		expect(TupleHelper.rankToTuple(5, 2, 1n)).toStrictEqual([1, 2]);
		expect(TupleHelper.rankToTuple(5, 2, 2n)).toStrictEqual([1, 3]);
		expect(TupleHelper.rankToTuple(5, 2, 3n)).toStrictEqual([1, 4]);
		expect(TupleHelper.rankToTuple(5, 2, 4n)).toStrictEqual([1, 5]);
		expect(TupleHelper.rankToTuple(5, 2, 5n)).toStrictEqual([2, 3]);
		expect(TupleHelper.rankToTuple(5, 2, 6n)).toStrictEqual([2, 4]);
		expect(TupleHelper.rankToTuple(5, 2, 7n)).toStrictEqual([2, 5]);
		expect(TupleHelper.rankToTuple(5, 2, 8n)).toStrictEqual([3, 4]);
		expect(TupleHelper.rankToTuple(5, 2, 9n)).toStrictEqual([3, 5]);
		expect(TupleHelper.rankToTuple(5, 2, 10n)).toStrictEqual([4, 5]);

		expect(TupleHelper.rankToTuple(5, 3, 1n)).toStrictEqual([1, 2, 3]);
		expect(TupleHelper.rankToTuple(5, 3, 2n)).toStrictEqual([1, 2, 4]);
		expect(TupleHelper.rankToTuple(5, 3, 3n)).toStrictEqual([1, 2, 5]);
		expect(TupleHelper.rankToTuple(5, 3, 4n)).toStrictEqual([1, 3, 4]);
		expect(TupleHelper.rankToTuple(5, 3, 5n)).toStrictEqual([1, 3, 5]);
		expect(TupleHelper.rankToTuple(5, 3, 6n)).toStrictEqual([1, 4, 5]);
		expect(TupleHelper.rankToTuple(5, 3, 7n)).toStrictEqual([2, 3, 4]);
		expect(TupleHelper.rankToTuple(5, 3, 8n)).toStrictEqual([2, 3, 5]);
		expect(TupleHelper.rankToTuple(5, 3, 9n)).toStrictEqual([2, 4, 5]);
		expect(TupleHelper.rankToTuple(5, 3, 10n)).toStrictEqual([3, 4, 5]);
	});


	test('TupleHelper.split test', () => {
		expect(() => { TupleHelper.split([5], -1); }).toThrow(Error);
		expect(TupleHelper.split([1, 2, 3, 4, 5, 6, 7, 8, 9], 15)).toStrictEqual([]);
		expect(TupleHelper.split([1, 2, 3, 4, 5, 6, 7, 8, 9], 1)).toStrictEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9]]);
		expect(TupleHelper.split([1, 2, 3, 4, 5, 6, 7, 8, 9], 2)).toStrictEqual([[1, 2, 3, 4, 5], [6, 7, 8, 9]]);
		expect(TupleHelper.split([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toStrictEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
		expect(TupleHelper.split([1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toStrictEqual([[1, 2, 3], [4, 5], [6, 7], [8, 9]]);
		expect(TupleHelper.split([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)).toStrictEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
	});


	test('TupleHelper.extract_Nminus1 test', () => {
		expect(TupleHelper.extract_Nminus1([])).toEqual([]);
		expect(TupleHelper.extract_Nminus1([1, 2, 3])).toEqual([]);
		expect(TupleHelper.extract_Nminus1([1], [2], [3], [4])).toEqual([
			[1, 2, 3],
			[1, 2, 4],
			[1, 3, 4],
			[2, 3, 4],
		  ]);
		  expect(TupleHelper.extract_Nminus1([1, 2, 3], [4, 5, 6], [7, 8, 9])).toEqual([
			[1, 2, 3, 4, 5, 6],
			[1, 2, 3, 7, 8, 9],
			[4, 5, 6, 7, 8, 9],
		  ]);
	});
});


describe('CartesianProduct module', () => {
	beforeEach(() => {
	});


	test('CartesianProduct.constructor test', () => {
		const arr1: Array<number[]> = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
		const prod1 = new CartesianProduct(...arr1);
		console.log("prod1.count " + prod1.count);
		expect(prod1.count).toBe(27);

		const prod2 = new CartesianProduct([1, 2, 3], [4, 5, 6]);
		console.log("prod2.count " + prod2.count);
		expect(prod2.count).toBe(9);

		const arr3: number[][] = [[1, 2, 3], [4, 5, 6]];
		const prod3 = new CartesianProduct(...arr3);
		console.log("prod3.count " + prod3.count);
		expect(prod3.count).toBe(9);
	});


	test('CartesianProduct.start test', () => {
		const arr1: Array<number[]> = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
		const prod1 = new CartesianProduct(...arr1);
		console.log(prod1.start());
		expect(prod1.start()).toStrictEqual([1, 4, 7]);
		expect(prod1.previous()).toStrictEqual(null);
		
		expect(prod1.next()).toStrictEqual([1, 4, 8]);
		expect(prod1.next()).toStrictEqual([1, 4, 9]);
		expect(prod1.next()).toStrictEqual([1, 5, 7]);
		expect(prod1.next()).toStrictEqual([1, 5, 8]);
		expect(prod1.next()).toStrictEqual([1, 5, 9]);
		expect(prod1.next()).toStrictEqual([1, 6, 7]);
		expect(prod1.next()).toStrictEqual([1, 6, 8]);
		expect(prod1.next()).toStrictEqual([1, 6, 9]);
		expect(prod1.next()).toStrictEqual([2, 4, 7]);
	});


	test('CartesianProduct.end test', () => {
		const arr1: Array<number[]> = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
		const prod1 = new CartesianProduct(...arr1);
		console.log(prod1.end());
		expect(prod1.end()).toStrictEqual([3, 6, 9]);
		expect(prod1.next()).toStrictEqual(null);
		
		expect(prod1.previous()).toStrictEqual([3, 6, 8]);
		expect(prod1.previous()).toStrictEqual([3, 6, 7]);
		expect(prod1.previous()).toStrictEqual([3, 5, 9]);
		expect(prod1.previous()).toStrictEqual([3, 5, 8]);
		expect(prod1.previous()).toStrictEqual([3, 5, 7]);
		expect(prod1.previous()).toStrictEqual([3, 4, 9]);
		expect(prod1.previous()).toStrictEqual([3, 4, 8]);
		expect(prod1.previous()).toStrictEqual([3, 4, 7]);
		expect(prod1.previous()).toStrictEqual([2, 6, 9]);
	});
});

