'use strict';
import * as crypto from 'crypto';


function randomNumber(): number {
	const length = 4;
	const randomBytes1 = crypto.randomBytes(length);
	const randomBytes2 = crypto.randomBytes(length);
	let rand1 = 0;
	let rand2 = 0;
	for (let i = 0; i < length; i++) {
		if (i > 0) {
			rand1 <<= 8;
			rand2 <<= 8;
		}
		rand1 |= randomBytes1.readInt8(i);
		rand2 |= randomBytes2.readInt8(i);
	}
	return rand1 * rand2;
}


export function randomNumberRange(a: number, b: number): number {
	const min = (a < b) ? a : b;
	const max = (a >= b) ? a : b;
	const spread = max - min + 1;
	const rand = randomNumber() % spread;
	return min + Math.abs(rand);
}

/*
const swapBalls = function (balls, a, b) {
	if (!Array.isArray(balls)) return;
	if (typeof a != "number") return;
	if (typeof b != "number") return;
	
	var len = balls.length;
	if (a <= 0 || a > len) return;
	if (b <= 0 || b > len) return;
	if (a == b) return;

	var aux = balls[a-1];
	balls[a-1] = balls[b-1];
	balls[b-1] = aux;
}*/

/*
const shuffleBalls = function (balls, nb_swap) {
	if (!Array.isArray(balls)) return;
	if (typeof nb_swap != "number") return;
	if (nb_swap <= 0) return;
	
	var len = balls.length;
	for (var i = 0; i < nb_swap; i++) {
		var a = randomNumberRange(1, len);
		var b = randomNumberRange(1, len);
		swapBalls(balls, a, b);
	}
}*/


// Return an array of integers of len size
// containing numbers from 1 to len
// in random order
/*const flashBalls = function (len) {
	var balls = Array(len).fill().map((x,i)=>(i+1).toString().padStart(2, 0));
	shuffleBalls(balls, 3*balls.length);
	return balls;
}
*/
