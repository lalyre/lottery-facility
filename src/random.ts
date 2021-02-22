'use strict';
import * as crypto from 'crypto';


/**
 * Returns a random number between an intervall range of integers.
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
	const randomBytes1:Buffer = crypto.randomBytes(length);
	const randomBytes2:Buffer = crypto.randomBytes(length);
	let rand1:number = 0;
	let rand2:number = 0;
	for (let i = 0; i < length; i++) {
		if (i > 0) {
			rand1 <<= 8;
			rand2 <<= 8;
		}
		const r1:number = randomBytes1.readInt8(i);
		const r2:number = randomBytes2.readInt8(i)
		rand1 |= r1;
		rand2 |= r2;
	}
	return rand1 * rand2;
}

