'use strict';
import { sha256 } from 'js-sha256';


/**
 * Returns a random number within a range of integers
 */
export function randomNumberRange(a: number, b: number): number {
	const min = (a < b) ? a : b;
	const max = (a >= b) ? a : b;
	const spread = max - min + 1;
	const rand = randomNumber() % spread;
	return min + Math.abs(rand);
}


function randomNumber(): number {
	const length = 4;
	const randomBytes1:Int8Array = randomBytes(length);
	const randomBytes2:Int8Array = randomBytes(length);
	let rand1:number = 0;
	let rand2:number = 0;
	for (let i = 0; i < length; i++) {
		if (i > 0) {
			rand1 <<= 8;
			rand2 <<= 8;
		}
		const r1:number = randomBytes1[i];
		const r2:number = randomBytes2[i];
		rand1 |= r1;
		rand2 |= r2;
	}
	return rand1 * rand2;
}


function randomBytes(len:number): Int8Array {
	if (len < 1 || len > 32) throw new Error('Invalid len parameter');
	const rand = Date.now() * Math.random();
	const hash = sha256.array(rand.toString());
	const arr:Int8Array = new Int8Array(len);
	for (let i = 0; i < len; i++) {
		arr[i] = hash[i];
	}
	return arr;
}

