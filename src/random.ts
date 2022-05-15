'use strict';
import { sha256 } from 'js-sha256';


export class Random {
	/**
	 * Return a random number within a range of integers
	 * @param a          integer value.
	 * @param b          integer value.
	 * @return           random number between a and b.
	 */
	public static randomNumberRange(a: number, b: number): number {
		const min = (a < b) ? a : b;
		const max = (a >= b) ? a : b;
		const spread = max - min + 1;
		const rand = Random.randomNumber() % spread;
		return min + Math.abs(rand);
	}


	/**
	 * Return a random number
	 * @param            none.
	 * @return           random integer number.
	 */
	public static randomNumber(): number {
		const length = 8;
		const randomBytes1:Int8Array = Random.randomBytes(length);
		let rand1:number = 0;
		for (let i = 0; i < length; i++) {
			rand1 <<= 8;
			rand1 |= randomBytes1[i];
		}
		return rand1;
	}


	private static randomBytes(len:number): Int8Array {
		if (len < 1 || len > 32) throw new Error('Invalid len parameter');
		// const rand = Date.now().toString(2) + Math.random().toString(2);
		const rand = Date.now().toString() + Math.random().toString().substring(2);
		const hash = sha256.array(rand);
		const arr:Int8Array = new Int8Array(hash.slice(0, len));
		return arr;
	}
}

