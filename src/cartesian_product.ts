'use strict';
import { Combination } from "./combination";


export class CartesianProduct {
	private readonly _parts: Array<Combination>;
	private readonly _nbParts: number;
	private readonly _count: number;
	private _partsIndex: number[];
	private _partsValue: Combination;
	private _currentIndex: number;


	/**
	 * Build a cartesian product calculator
	 */	
	public constructor(...parts: Array<Combination>) {
		// super();
		if (parts.some(p => p.length === 0)) throw new Error("CartesianProduct parts cannot contain empty arrays.");
		
		this._parts = parts;
		this._nbParts = parts.length;
		this._partsIndex = new Array(this._nbParts).fill(0);
		this._partsValue = new Array(this._nbParts).fill(0);
		this._count = this._parts.reduce((acc, part) => acc * part.length, 1);
		this._currentIndex = 0;
		for (let i = 0; i < this._nbParts; i++) { this._partsValue[i] = this._parts[i][0]; }
	}


	get nbParts(): number { return this._nbParts; }
	get count(): number { return this._count; }
	get lastIndex(): number { return this._count-1; }
	get currentIndex(): number { return this._currentIndex; }
	get currentCombination(): Combination { return [...this._partsValue]; }


	/**
	 * Gives the first combination
	 * @param        none
	 * @return       first combination
	 */
	public start(): Combination {
		this._currentIndex = 0;
		for (let i = 0; i < this._nbParts; i++) {
			this._partsIndex[i] = 0;
			this._partsValue[i] = this._parts[i][0];
		}
		return [...this._partsValue];
	}


	/**
	 * Gives the last combination
	 * @param        none
	 * @return       last combination
	 */
	public end(): Combination {
		this._currentIndex = this.lastIndex;
		for (let i = 0; i < this._nbParts; i++) {
			this._partsIndex[i] = this._parts[i].length - 1;
			this._partsValue[i] = this._parts[i][this._partsIndex[i]];
		}
		return [...this._partsValue];
	}


	/**
	 * Resets the iterator to the first combination and returns it.
	 */
	public reset(): Combination {
		return this.start();
	}


	/**
	 * Gives the previous combination or null if
	 * there is no more previous combination
	 * @param        none
	 * @return       previous combination
	 */
	public previous(): Combination|null {
		if (this._currentIndex <= 0) return null;
		this._currentIndex--;
		
		for (let i = this._nbParts-1; i >= 0; i--) {
			if (this._partsIndex[i] === 0) {
				this._partsIndex[i] = this._parts[i].length - 1;
				this._partsValue[i] = this._parts[i][this._partsIndex[i]];
			} else {
				this._partsIndex[i] -= 1;
				this._partsValue[i] = this._parts[i][this._partsIndex[i]];
				break;
			}
		}
		return [...this._partsValue];
	}


	/**
	 * Gives the next combination or null if
	 * there is no more next combination
	 * @param        none
	 * @return       next combination
	 */
	public next(): Combination|null {
		if (this._currentIndex >= this.lastIndex) return null;
		this._currentIndex++;
		
		for (let i = this._nbParts-1; i >= 0; i--) {
			if (this._partsIndex[i] === this._parts[i].length - 1) {
				this._partsIndex[i] = 0;
				this._partsValue[i] = this._parts[i][0];
			} else {
				this._partsIndex[i] += 1;
				this._partsValue[i] = this._parts[i][this._partsIndex[i]];
				break;
			}
		}
		return [...this._partsValue];
	}


	/**
	 * ES6 iterator over all combinations of the Cartesian product.
	 *
	 * Allows usage such as:
	 * ```ts
	 * for (const combination of cartesianProduct) {
	 *     // ...
	 * }
	 * ```
	 *
	 * The iteration starts at the first combination (equivalent to calling {@link start})
	 * and continues until the last combination (when {@link next} returns `null`).
	 */
	public [Symbol.iterator](): IterableIterator<Combination> {
		let started = false;
		let done = false;
		const self = this;

		return {
			next(): IteratorResult<Combination> {
				if (done) {
					return { value: undefined, done: true };
				}

				let value: Combination | null;
				if (!started) {
					value = self.start();
					started = true;
				} else {
					value = self.next();
				}

				if (value === null) {
					done = true;
					return { value: undefined, done: true };
				}

				return { value, done: false };
			},

			[Symbol.iterator](): IterableIterator<Combination> {
				return this;
			}
		} as IterableIterator<Combination>;
	}
}

