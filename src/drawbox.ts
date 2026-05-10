'use strict';
import { RandomHelper } from './random';
import { Tuple, TupleHelper } from './tuple';


export class DrawBox {
	private readonly _count: number;
	private readonly _balls: Tuple;


	/**
	 * Build a draw box of lottery balls from 1 to len (1 <= len)
	 */
	public constructor(count: number) {
		// super();

		if (count === undefined) throw new Error('Need to pass a count parameter');
		if (count < 1) throw new Error('Invalid count parameter');
		this._count = count;
		this._balls = Array.from({ length: count }, (_, i) => i+1);
	}


	get count(): number { return this._count; }
	get balls(): Tuple { return this._balls; }


	/**
	 * Draw the balls from the draw box.
	 *
	 * @param size      size of the random selection of numbers.
	 * @param nbSwap    number of shuffle operations (optional parameter). Default value is 50.
	 * @returns         a random selection of numbers picked in the draw box.
	 */
	public draw(size:number, nbSwap:number = 50): Tuple {
		if (size > this._count) throw new Error('Invalid size parameter');
		this.shuffle(nbSwap);
		return this._balls.slice(0, size);
	}


	/**
	 * Generates a set of tickets using pure randomness.
	 * Each ticket is drawn independently.
	 *
	 * @param nbTickets   Total number of tickets to generate.
	 * @param size        Number of balls per ticket.
	 * @param nbSwap      Shuffle intensity for each draw (default 50).
	 * @returns           An array of random valid tickets.
	 */
	public drawRandomTickets(nbTickets: number, size: number, nbSwap: number = 50): Tuple[] {
		if (size > this._count) throw new Error('Invalid size parameter');
		const results: Tuple[] = [];
		for (let i = 0; i < nbTickets; i++) results.push(this.draw(size, nbSwap));
		return results;
	}


	/**
	 * Generates a globally balanced set of tickets using the Harmonic Reservoir method.
	 * Each number appears across the full output as evenly as possible, with a maximum
	 * frequency difference of 1 between any two numbers.
	 *
	 * @param nbTickets   Total number of tickets to generate.
	 * @param size        Number of balls per ticket.
	 * @param nbSwap      Shuffle intensity for each cycle (default 50).
	 * @returns           An array of individually balanced tickets.
	 */
	public drawIndividualBalancedTickets(nbTickets: number, size: number, nbSwap: number = 50): Tuple[] {
		if (size > this._count) throw new Error('Invalid size parameter');
		const results: Tuple[] = [];
		let currentCycle: Tuple = [];

		for (let i = 0; i < nbTickets; i++) {
			if (currentCycle.length < size) {
				const remaining = currentCycle;
				this.shuffle(nbSwap);
				const nextCycle = this._buildBoundarySafeCycle(remaining, size);
				currentCycle = remaining.concat(nextCycle);
			}
			const ticket = currentCycle.splice(0, size);
			results.push(ticket);
		}
		return results;
	}


	/**
	 * Generates tickets by maximizing the number of pairs coverage.
	 * The goal of this method is to maximize pairs diversity across the generated system (related to the Covering Design problem).
	 *
	 * @param nbTickets - Total number of tickets to generate.
	 * @param size - Number of balls per ticket.
	 * @param nbAttempts - Number of iterations to find the best candidate (default 500).
	 * @param startingSystem - An optional existing system to build upon.
	 * @param nbSwap - Shuffle intensity used during generation (default 50).
	 * @returns An array of tickets optimized for pairs diversity.
	 */
	public drawMaximizePairCoveringTickets(
		nbTickets: number,
		size: number, 
		nbAttempts: number = 500,
		startingSystem: Tuple[]|null = null,
		nbSwap: number = 50,
	): Tuple[] {
		if (size > this._count) throw new Error('Invalid size parameter');
		let bestSystem = startingSystem ? [...startingSystem] : this.drawIndividualBalancedTickets(nbTickets, size, nbSwap);
		let bestStats = TupleHelper.getSystemNeighborhoodDegrees(bestSystem, this._balls);
		let bestCount = bestStats.reduce((acc, item) => acc + item.degree, 0) / 2;							// pairs are counted twice

		// Find a better system
		for (let i = 0; i < nbAttempts; i++) {
			let currentSystem = this.drawIndividualBalancedTickets(nbTickets, size, nbSwap);
			let currentStats = TupleHelper.getSystemNeighborhoodDegrees(currentSystem, this._balls);
			let currentCount = currentStats.reduce((acc, item) => acc + item.degree, 0) / 2;				// pairs are counted twice

			if (currentCount > bestCount) {
				bestSystem = currentSystem;
				bestStats = currentStats;
				bestCount = currentCount;
			}
		}
		return bestSystem;
	}


	/**
	 * Generates tickets by maximizing hitting pairs ability.
	 * The goal of this method is to maximize hitting pairs capability across the generated system (related to the Hitting Set problem).
	 *
	 * @param nbTickets - Total number of tickets to generate.
	 * @param size - Number of balls per ticket.
	 * @param nbAttempts - Number of iterations to find the best candidate (default 500).
	 * @param startingSystem - An optional existing system to build upon.
	 * @param nbSwap - Shuffle intensity used during generation (default 50).
	 * @returns An array of tickets optimized for unique pair distribution.
	 */
	public drawMaximizePairHittingTickets(
		nbTickets: number,
		size: number, 
		nbAttempts: number = 500,
		startingSystem: Tuple[]|null = null,
		nbSwap: number = 50,
	): Tuple[] {
		
		
		
		
		
		
		// Implementation...
		
		
		
		
		
		
		return [];
	}


	/**
	 * Shuffle the balls in the draw box.
	 *
	 * @param nbSwap    number of shuffle operations.
	 * @returns         none.
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


	private _buildBoundarySafeCycle (remaining: Tuple, size: number): Tuple {
		if (remaining.length === 0) return [...this._balls];

		const needed = size - remaining.length;
		const remainingSet = new Set(remaining);
		const head: Tuple = [];
		const tail: Tuple = [];

		for (const ball of this._balls) {
			if (head.length < needed && !remainingSet.has(ball)) head.push(ball);
			else tail.push(ball);
		}
		return head.concat(tail);
	}
}

