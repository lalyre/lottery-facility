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
	public constructor(count: number) {
		// super();

		if (count === undefined) throw new Error('Need to pass a count parameter');
		if (count < 1) throw new Error('Invalid count parameter');
		this._count = count;
		this._balls = Array.from({ length: count }, (_, i) => i+1);
	}


	get count(): number { return this._count; }
	get balls(): number[] { return this._balls; }


	/**
	 * Draw the balls from the draw box.
	 *
	 * @param size      size of the random selection of numbers.
	 * @param nbSwap    number of shuffle operations (optional parameter). Default value is 50.
	 * @return          a random selection of numbers picked in the draw box.
	 */
	public draw(size:number, nbSwap:number = 50): number[] {
		if (size > this._count) throw new Error('Invalid size parameter');
		this.shuffle(nbSwap);
		return this._balls.slice(0, size);
	}


	/**
	 * Generates a system of tickets using pure randomness.
	 * Each ticket is independently drawn and contains no duplicate number.
	 *
	 * @param nbTickets - Total number of tickets to generate.
	 * @param size      - Number of balls per ticket.
	 * @param nbSwap    - Shuffle intensity for each draw (default: 50).
	 * @return          - An array of random valid combinations (number[][]).
	 */
	public drawRandomSystem(nbTickets: number, size: number, nbSwap: number = 50): number[][] {
		if (size > this._balls.length) throw new Error("Ticket size cannot exceed number of balls");
		const results: number[][] = [];
		for (let i = 0; i < nbTickets; i++) results.push(this.draw(size, nbSwap));
		return results;
	}


	/**
	 * Generates a balanced set of tickets using the Harmonic Reservoir technique.
	 * Ensures each number appears an equal number of times across all tickets (±1).
	 *
	 * @param nbTickets - Total number of tickets to generate.
	 * @param size      - Number of balls per ticket.
	 * @param nbSwap    - Shuffle intensity for each cycle (default: 50).
	 * @return          - An array of balanced combinations (number[][]).
	 */
	public drawSingleBalanced(nbTickets: number, size: number, nbSwap: number = 50): number[][] {
		if (size > this._balls.length) throw new Error("Ticket size cannot exceed number of balls");
		const results: number[][] = [];
		let currentCycle: number[] = [];

		for (let i = 0; i < nbTickets; i++) {
			if (currentCycle.length < size) {
				const remaining = currentCycle;
				const remainingSet = new Set(remaining);

				this.shuffle(nbSwap);
				const newCycle = [...this._balls];

				const filtered = newCycle.filter(n => !remainingSet.has(n));
				currentCycle = remaining.concat(filtered);
			}

			const ticket = currentCycle.splice(0, size);
			results.push(ticket);
		}

		return results;
	}






	public drawPairBalanced(nbTickets: number, size: number, nbSwap: number = 50): number[][] {
		const results: number[][] = [];
		return results;
	}







	/**
	 * Shuffle the balls in the draw box.
	 *
	 * @param nbSwap    number of shuffle operations.
	 * @return          none.
	 */
	public shuffle (nbSwap:number): void {
		for (let i = 0; i < nbSwap; i++) {
			const a = RandomHelper.randomNumberInRange(0, this._count-1);
			this._swapBalls(i%this._count, a);
		}
	}


	private _swapBalls (a:number, b:number): void {
		if (a === b) return;
		const aux = this._balls[a];
		this._balls[a] = this._balls[b];
		this._balls[b] = aux;
	}
}

