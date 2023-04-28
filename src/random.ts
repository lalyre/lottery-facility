'use strict';
import { sha256 } from 'js-sha256';


export class RandomHelper {
	/**
	 * Return a random number within a range of integers
	 * @param a          integer value.
	 * @param b          integer value.
	 * @return           random number between a and b, both included.
	 */
	public static randomNumberInRange (a: number, b: number): number {
		const min = (a < b) ? a : b;
		const max = (a >= b) ? a : b;
		const spread = max - min + 1;
		const rand = RandomHelper.randomNumber() % spread;
		return min + Math.abs(rand);
	}


	/**
	 * Return a random number
	 * @param            none.
	 * @return           random integer number.
	 */
	public static randomNumber(): number {
		const length = 8;
		const randomBytes1:Int8Array = RandomHelper.randomBytes(length);
		let rand1:number = 0;
		for (let i = 0; i < length; i++) {
			rand1 <<= 8;
			rand1 |= randomBytes1[i];
		}
		return rand1;
	}


	/**
	 * Return a random HEX string
	 * @param len        length of random generated bytes. The final string length will be 2*len.
	 * @return           random HEX string.
	 */
	public static randomHEXString (len:number): string {
		const randomBytes:Int8Array = RandomHelper.randomBytes(len);
		const buffer = Buffer.from(randomBytes);
		return buffer.toString('hex');
	}


	/**
	 * Return a random array of bytes
	 * @param len        length of random generated array of bytes.
	 * @return           random array of bytes.
	 */
	public static randomBytes (len:number): Int8Array {
		if (len < 1 || len > 32) throw new Error('Invalid len parameter');
		// const rand = Date.now().toString(2) + Math.random().toString(2);
		const rand = Date.now().toString() + Math.random().toString().substring(2);
		const hash = sha256.array(rand);
		const arr:Int8Array = new Int8Array(hash.slice(0, len));
		return arr;
	}
}


/**
 * number is in a range from (-2^53 + 1) i.e -9007199254740991 to (2^53 - 1) i.e 9007199254740991.
 */

