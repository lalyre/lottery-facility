'use strict';
import { Random } from './random';


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
	public constructor(count: number) {
		// super();

		if (count === undefined) throw new Error('Need to pass a count parameter');
		if (count < 1 || count > 99) throw new Error('Invalid count parameter');
		this._count = count;
		this._balls = Array.from({ length: count+1 }, (_, i) => i);
	}


	/*get Count(): number {
		return this._count;
	}


	get Balls(): number[] {
		return this._balls;
	}*/


	/**
	 * Draws the balls from the draw box.
	 * @param size      Size of the random selection of numbers
	 * @param nbSwap    Optional parameter. Number of shuffle operations. Default value is 50.
	 * @return          none
	 */
	public draw(size:number, nbSwap:number = 50): number[] {
		if (size > this._count) throw new Error('Invalid size parameter');
		this.shuffle(nbSwap);
		return this._balls.slice(1, size+1);
	}


	/**
	 * Shuffles the balls in the draw box.
	 * @param nbSwap    number of shuffle operations
	 * @return          none
	 */
	private shuffle(nbSwap:number): void {
		for (let i = 0; i < nbSwap; i++) {
			const a = Random.randomNumberRange(1, this._count);
			this.swapBalls(1+i%this._count, a);
		}
	}


	private swapBalls(a:number, b:number): void {
		if (a === b) return;
		const aux = this._balls[a];
		this._balls[a] = this._balls[b];
		this._balls[b] = aux;
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

