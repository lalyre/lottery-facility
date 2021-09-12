'use strict';
import { randomNumberRange } from './random';


/**
 * Returns an ordered array of integers
 * containing lottery balls from 1 to len.
 * 1 <= len <= 99
 *
 * PS:
 * do not consider the item at index 0.
 */
export function lotteryBalls(len:number): number[] {
	if (len < 1 || len > 99) throw new Error('Invalid len parameter');
	const balls = Array.from({ length: len+1 }, (_, i) => i);
	return balls;
}


/**
 * Shuffles an array of lottery balls.
 */
export function shuffleBalls(balls:number[], nbSwap:number): void {
	const len = balls.length - 1;
	for (let i = 0; i < nbSwap; i++) {
		const a = randomNumberRange(1, len);
		const b = randomNumberRange(1, len);
		swapBalls(balls, a, b);
	}
}


function swapBalls(balls:number[], a:number, b:number): void {
	if (a === b) return;
	const aux = balls[a];
	balls[a] = balls[b];
	balls[b] = aux;
}


/**
 * Get lottery combination string
 */
export function combinationString(numbers:number[], sep:string): string {
	const display = numbers.map(x => x.toString().padStart(2, '0')).join(sep);
	return display;
}


/**
 * Get canonical (ordered) lottery combination string
 */
export function canonicalCombinationString(numbers:number[], sep:string): string {
	const arr = numbers.sort((a, b) => {return a - b;});
	const display = arr.map(x => x.toString().padStart(2, '0')).join(sep);
	return display;
}


/**
 * Compute the number of collisions between 2 lottery combinations
 */
export function collisionsCount(arr1:number[], arr2:number[]): number {
	const merge = collisions(arr1, arr2);
	const n1 = arr1.length + arr2.length;
	const n2 = merge.length;
	return (n1 - n2);
}


/**
 * Give the collisions between 2 lottery combinations
 */
export function collisions(arr1:number[], arr2:number[]): number[] {
	const union1 = [...arr1, ...arr2];
	const union2 = union1.filter((item, pos) => union1.indexOf(item) === pos);
	return union2;
}


/**
 * Compute the complement combination of a lottery combination relatively to maximum number value
 */
export function complementCombination(max:number, numbers:number[]): number[] {
	const complement:number[] = [];
	complement.length = numbers.length;
	for (let j = 0; j < numbers.length; j++) { complement[j] = (max+1 - numbers[j]); }
	return complement;
}

