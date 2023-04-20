'use strict';
import { RandomHelper } from './random';


export class DrawBox {
	private readonly _count: number;
	private readonly _balls: number[];


	/**
	 * Build a draw box of lottery balls from 1 to len
	 * 1 <= len
	 *
	 * PS:
	 * do not consider the item at index 0.
	 */
	public constructor (count: number) {
		// super();

		if (count === undefined) throw new Error('Need to pass a count parameter');
		if (count < 1) throw new Error('Invalid count parameter');
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
	 * Draw the balls from the draw box.
	 * @param size      size of the random selection of numbers.
	 * @param nbSwap    number of shuffle operations (optional parameter). Default value is 50.
	 * @return          a random selection of numbers picked in the draw box.
	 */
	public draw (size:number, nbSwap:number = 50): number[] {
		if (size > this._count) throw new Error('Invalid size parameter');
		this.shuffle(nbSwap);
		return this._balls.slice(1, size+1);
	}


	/**
	 * Shuffle the balls in the draw box.
	 * @param nbSwap    number of shuffle operations.
	 * @return          none.
	 */
	private shuffle (nbSwap:number): void {
		for (let i = 0; i < nbSwap; i++) {
			const a = RandomHelper.randomNumberRange(1, this._count);
			this.swapBalls(1+i%this._count, a);
		}
	}


	private swapBalls (a:number, b:number): void {
		if (a === b) return;
		const aux = this._balls[a];
		this._balls[a] = this._balls[b];
		this._balls[b] = aux;
	}
}

