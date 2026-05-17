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
	 * Generates a globally balanced set of tickets while maximizing pair diversity.
	 * (powered by ChatGPT AI)
	 *
	 * This method builds a perfectly balanced global pool where each number appears
	 * as evenly as possible across the full generated system. Tickets are then
	 * constructed greedily by selecting candidates that minimize already existing
	 * pair repetitions.
	 *
	 * Main properties:
	 * - Global number occurrences remain balanced.
	 * - Duplicate numbers inside a ticket are forbidden.
	 * - Pair co-occurrences are minimized whenever possible.
	 * - Neighbor diversity is strongly improved compared to cyclic generation.
	 * - Produces systems closer to Covering Design heuristics.
	 *
	 * The algorithm works as follows:
	 * 1. Build a balanced global pool of numbers.
	 * 2. Shuffle the pool to remove structural ordering biases.
	 * 3. Construct tickets one by one.
	 * 4. For each slot, evaluate candidate numbers using a pair repetition score.
	 * 5. Select the candidate producing the lowest pair collision score.
	 * 6. Update pair frequency statistics dynamically.
	 *
	 * This approach greatly improves:
	 * - pair coverage,
	 * - graph connectivity,
	 * - neighborhood degrees,
	 * - combinatorial dispersion.
	 *
	 * Compared to simple cyclic balancing, this method avoids hidden partitions
	 * and repetitive number grouping patterns.
	 *
	 * @param nbTickets   Total number of tickets to generate.
	 * @param size        Number of balls per ticket.
	 * @param nbSwap      Shuffle intensity parameter (reserved for compatibility) (default 50).
	 * @returns           An array of balanced tickets optimized for pair diversity.
	 */
	public drawIndividualBalancedTickets(
		nbTickets: number,
		size: number,
		nbSwap: number = 50
	): Tuple[] {
		if (size > this._count) throw new Error('Invalid size parameter');

		// ---------------------------------------------------
		// 1. Build perfectly balanced global pool
		// ---------------------------------------------------

		const totalSlots = nbTickets * size;
		const globalPool: number[] = [];

		for (let i = 0; i < totalSlots; i++) {
			globalPool.push(this._balls[i % this._count]);
		}

		// TRUE shuffle of the pool
		for (let i = globalPool.length - 1; i > 0; i--) {
			const j = RandomHelper.randomNumberInRange(0, i);
			const tmp = globalPool[i];
			globalPool[i] = globalPool[j];
			globalPool[j] = tmp;
		}

		// ---------------------------------------------------
		// 2. Pair frequency tracking
		// ---------------------------------------------------

		const pairCount = new Map<string, number>();

		const getPairKey = (a:number, b:number): string => {
			return a < b ? `${a}-${b}` : `${b}-${a}`;
		};

		// ---------------------------------------------------
		// 3. Build tickets greedily
		// ---------------------------------------------------

		const results: Tuple[] = [];

		for (let t = 0; t < nbTickets; t++) {

			const ticket: Tuple = [];

			while (ticket.length < size) {

				let bestIndex = -1;
				let bestScore = Number.MAX_SAFE_INTEGER;

				// test several candidates
				for (let i = 0; i < globalPool.length; i++) {

					const candidate = globalPool[i];

					// avoid duplicates in same ticket
					if (ticket.includes(candidate)) continue;

					// compute pair repetition score
					let score = 0;

					for (const existing of ticket) {
						const key = getPairKey(candidate, existing);
						score += pairCount.get(key) || 0;
					}

					// keep best candidate
					if (score < bestScore) {
						bestScore = score;
						bestIndex = i;
					}
				}

				// fallback safety
				if (bestIndex === -1) break;

				const chosen = globalPool.splice(bestIndex, 1)[0];

				// update pair frequencies
				for (const existing of ticket) {
					const key = getPairKey(chosen, existing);
					pairCount.set(key, (pairCount.get(key) || 0) + 1);
				}

				ticket.push(chosen);
			}

			results.push(ticket.sort((a, b) => a - b));
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
}

