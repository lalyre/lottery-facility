'use strict';
import { copyFile } from 'fs';
import {
	TupleHelper,
	CartesianProduct,
} from '../src/main';


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
