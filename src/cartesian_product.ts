'use strict';
import { TupleHelper, Tuple } from "./tuple";


export class CartesianProduct implements Iterable<Tuple> {
	private readonly _parts: Array<Tuple>;
	private readonly _nbParts: number;
	private readonly _count: bigint;
	private _currentIndex: bigint;
	private _partsIndex: number[];
	private _partsValue: Tuple;


	/**
	 * Build a cartesian product iterator
	 */	
	public constructor(...parts: Array<Tuple>) {
		// super();
		if (parts.some(p => p.length === 0)) throw new Error("CartesianProduct parts cannot contain empty arrays.");
		
		this._parts = parts;
		this._nbParts = parts.length;
		this._partsIndex = new Array(this._nbParts).fill(0);
		this._partsValue = new Array(this._nbParts).fill(0);
		this._count = BigInt(this._parts.reduce((acc, part) => acc * part.length, 1));
		this._currentIndex = 0n;
		for (let i = 0; i < this._nbParts; i++) { this._partsValue[i] = this._parts[i][0]; }
	}


	get nbParts(): number { return this._nbParts; }
	get count(): bigint { return this._count; }
	get lastIndex(): bigint { return this._count-1n; }
	get currentIndex(): bigint { return this._currentIndex; }
	get currentTuple(): Tuple { return [...this._partsValue]; }


	/**
	 * Gives the first tuple
	 * @param        none
	 * @return       first tuple
	 */
	public start(): Tuple {
		this._currentIndex = 0n;
		for (let i = 0; i < this._nbParts; i++) {
			this._partsIndex[i] = 0;
			this._partsValue[i] = this._parts[i][0];
		}
		return [...this._partsValue];
	}


	/**
	 * Gives the last tuple
	 * @param        none
	 * @return       last tuple
	 */
	public end(): Tuple {
		this._currentIndex = this.lastIndex;
		for (let i = 0; i < this._nbParts; i++) {
			this._partsIndex[i] = this._parts[i].length - 1;
			this._partsValue[i] = this._parts[i][this._partsIndex[i]];
		}
		return [...this._partsValue];
	}


	/**
	 * Resets the iterator to the first tuple and returns it.
	 */
	public reset(): Tuple {
		return this.start();
	}


	/**
	 * Gives the previous tuple or null if
	 * there is no more previous tuple
	 * @param        none
	 * @return       previous tuple
	 */
	public previous(): Tuple|null {
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
	 * Gives the next tuple or null if
	 * there is no more next tuple
	 * @param        none
	 * @return       next tuple
	 */
	public next(): Tuple|null {
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
	 * ES6 iterator over all tuples of the Cartesian product.
	 *
	 * Allows usage such as:
	 * ```ts
	 * for (const tuple of cartesianProduct) {
	 *     // ...
	 * }
	 * ```
	 *
	 * The iteration starts at the first tuple (equivalent to calling {@link start})
	 * and continues until the last tuple (when {@link next} returns `null`).
	 */
	public [Symbol.iterator](): IterableIterator<Tuple> {
		let started = false;
		let done = false;
		const self = this;

		return {
			next(): IteratorResult<Tuple> {
				if (done) { return { value: undefined, done: true }; }

				let value: Tuple|null;
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

			[Symbol.iterator](): IterableIterator<Tuple> {
				return this;
			}
		} as IterableIterator<Tuple>;
	}
}

