'use strict';
import { randomNumberRange } from './random';


export class DrawBox {
	private readonly _count: number;
	private readonly _balls: number[];
	
	
	/**
	 * Builds a draw box of lottery balls from 1 to len
	 * 1 <= len <= 99
	 *
	 * PS:
	 * do not consider the item at index 0.
	 */
	constructor(count: number) {
		super();
		
		if (count < 1 || count > 99) throw new Error('Invalid count parameter');
		this._count = count;
		this._balls = Array.from({ length: count+1 }, (_, i) => i);
	}
	
	
	get Count(): number {
		return this._count;
	}
	
	
	get Balls(): number[] {
		return this._balls;
	}
	
	
	/**
	 * Shuffles the balls in the draw box.
	 * @param nbSwap    number of shuffle operations
	 * @return          none
	 */
	public shuffle(nbSwap:number): void {
		const len = _balls.length - 1;
		for (let i = 0; i < nbSwap; i++) {
			const a = randomNumberRange(1, len);
			swapBalls((i+1)%(len+1), a);
		}
	}
	
	
	private swapBalls(a:number, b:number): void {
		if (a === b) return;
		const aux = _balls[a];
		_balls[a] = _balls[b];
		_balls[b] = aux;
	}
}






/**
 * Get lottery combination string
 */
export function combinationString(numbers:number[], sep:string): string {
	if (!numbers) return '';
	const display = numbers.map(x => x.toString().padStart(2, '0')).join(sep);
	return display;
}


/**
 * Get canonical (ordered) lottery combination string
 */
export function canonicalCombinationString(numbers:number[], sep:string): string {
	if (!numbers) return '';
	const arr = numbers.sort((a, b) => {return a - b;});
	const display = arr.map(x => x.toString().padStart(2, '0')).join(sep);
	return display;
}


/**
 * Compute the number of collisions between 2 lottery combinations
 */
export function collisionsCount(arr1:number[], arr2:number[]): number {
	const merge = intersection(arr1, arr2);
	return merge.length;
}


/**
 * Give the union between 2 lottery combinations
 */
export function union(arr1:number[], arr2:number[]): number[] {
	if (!arr1 && !arr2) return [];
	if (!arr1) return arr2;
	if (!arr2) return arr1;
	const union1 = [...arr1, ...arr2];
	const union2 = union1.filter((item, pos) => union1.indexOf(item) === pos);
	return union2;
}


/**
 * Give the intersection between 2 lottery combinations
 */
export function intersection(arr1:number[], arr2:number[]): number[] {
	if (!arr1 || !arr2) return [];
	const intersec = arr1.filter((item, pos) => arr1.indexOf(item) === pos && arr2.indexOf(item) !== -1);
	return intersec;
}


/**
 * Compute the complement combination of a lottery combination relatively to maximum number value
 */
export function complementCombination(max:number, numbers:number[]): number[] {
	if (!numbers) return [];
	const complement:number[] = [];
	complement.length = numbers.length;
	for (let j = 0; j < numbers.length; j++) { complement[j] = (max+1 - numbers[j]); }
	return complement;
}

