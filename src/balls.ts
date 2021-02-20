'use strict';
import { randomNumberRange } from './random';


/**
 * Return an ordered array of integers
 * containing lottery balls from 1 to len.
 * 1 <= len <= 99
 * 
 * PS:
 * do not consider the item at index 0
 */
export function lotteryBalls(len:number): string[] {
	if (len < 1 || len > 99) throw new Error('Invalid len parameter');
	let balls = Array.from({ length: len+1 }, (_, i) => i.toString().padStart(2, "0"));
	return balls;
}


/**
 * Shuffle an array of lottery balls.
 */
export function shuffleBalls(balls:string[], nbSwap:number): void {
	let len = balls.length - 1;
	for (let i = 0; i < nbSwap; i++) {
		var a = randomNumberRange(1, len);
		var b = randomNumberRange(1, len);
		swapBalls(balls, a, b);
	}
}


function swapBalls(balls:string[], a:number, b:number): void {
	if (a == b) return;
	let aux = balls[a];
	balls[a] = balls[b];
	balls[b] = aux;
}

