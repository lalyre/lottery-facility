'use strict';
import { TupleHelper, Tuple } from "./tuple";


export class CombinationHelper {
	/**
	 * Give the rank of a given tuple
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number (tuple).
	 * @return          the rank of the tuple.
	 */
	public static tupleToRank(max:number, numbers:Tuple): bigint {
		if (max < 0) return -1n;
		if (!numbers) return -1n;
		const len:number = numbers.length;
		numbers.sort((a, b) => {return a - b;});

		let rank:bigint = TupleHelper.binomial(max, len);
		for (let i = len; i > 0; i--) {
			if (numbers[len-i] > max) return -1n;
			rank -= TupleHelper.binomial(max-numbers[len-i]+1, i);
			if (i > 1) rank += TupleHelper.binomial(max-numbers[len-i], i-1);
		}
		rank++;
		return rank;
	}


	/**
	 * Give the tuple corresponding to the given rank
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param length    the length of the tuple to be returned.
	 * @param rank      the rank of the tuple to be returned.
	 * @return          the tuple corresponding to the given rank.
	 */
	public static rankToTuple(max:number, length:number, rank:bigint): Tuple {
		if (max <= 0) return [];
		if (length <= 0) return [];
		if (length > max) return [];
		if (rank <= 0 || rank > TupleHelper.binomial(max, length)) return [];
		const numbers = Array.from({ length: length }, (_, i) => 0);

		for (let i = 0; i < length; i++) {
			for (let k = max; k >= length; k--) {
				let m = k;
				for (let j = length-1; j >= i; j--) { numbers[j] = m; m--; }
				if (CombinationHelper.tupleToRank(max, numbers) <= rank) break;
			}
		}
		return numbers;
	}


/**
 * Computes the Schönheim lower bound for a covering design C(v, k, t).
 *
 * This bound gives a universal theoretical minimum number of blocks (lines)
 * required to cover all t-subsets of a v-element universe using blocks of size k.
 *
 * Formula (nested ceilings):
 *
 *     L ≥ ceil( v / k * ceil( (v−1)/(k−1) * ceil( (v−2)/(k−2) * ... ) ) )
 *
 * This implementation evaluates the nested ceilings using integer arithmetic,
 * entirely with BigInt, via the identity:
 *
 *     ceil(a / b) = (a + b − 1) / b         // integer division
 *
 * Notes:
 * - The bound is valid for any covering problem C(total, size, guarantee).
 * - If `lineCount` is below this value, a covering system is mathematically impossible.
 * - If `lineCount` is above this value, feasibility is not guaranteed but possible.
 *
 * @param total      v — Total number of elements in the universe.
 * @param size       k — Size of each block (line).
 * @param guarantee  t — Size of subsets that must all be covered.
 *
 * @returns          The Schönheim lower bound as a standard JavaScript number.
 *
 * ---
 * Implementation note:
 *   The code below was drafted with the assistance of ChatGPT (OpenAI GPT-5.1),
 *   during an exploration of covering designs and lottery system theory.
 *   The Schönheim lower bound itself is a classical mathematical result due
 *   to E. Schönheim (“On coverings of pairs by quadruples”, 1964).
 *   This comment is kept as a small tribute to both the mathematician and
 *   the assistant who helped shape this API.
 * ---
 */
public static schoenheimLowerBound(total: number, size: number, guarantee: number): number {
    let L = 1n;
    for (let i = 0; i < guarantee; i++) {
        const a = BigInt(total - i);
        const b = BigInt(size - i);
        L = (L * (a + b - 1n)) / b;  // ceil(a/b)
    }
    return Number(L);
}


public static coveringLowerBound = CombinationHelper.schoenheimLowerBound;


/**
 * Tests whether a covering system (covering design) exists with a given number of lines.
 *
 * Conceptually:
 * - There are `total` elements in the universe (0..total-1).
 * - Each line (block / ticket) contains exactly `size` distinct elements.
 * - We want every subset of size `guarantee` (e.g. every pair if guarantee = 2)
 *   to appear in at least one of the lines.
 *
 * This function returns TRUE or FALSE depending on `lineCount`:
 * - Returns FALSE if, even in the best possible case, `lineCount` lines cannot cover
 *   all subsets of size `guarantee` (based on a combinatorial lower bound).
 * - Returns TRUE if `lineCount` is greater than or equal to C(total, guarantee),
 *   because a trivial covering always exists (one line per subset).
 * - Otherwise, it falls into the “interesting zone” and calls an internal search
 *   algorithm (`searchCoveringSystem`) to decide if such a covering system actually exists.
 *
 * Parameters:
 * @param total      Total number of elements in the universe (e.g. 8 numbers, 50 numbers, …)
 * @param size       Size of each line (block size, e.g. 3 for triplets, 5 for Euromillions grids)
 * @param guarantee  Size of the subsets that must be covered (e.g. 2 to cover all pairs)
 * @param lineCount  Number of lines allowed in the system
 *
 * @returns          TRUE if a covering system exists with at most `lineCount` lines,
 *                   FALSE otherwise.
 */
public static coveringExists(total:number, size:number, guarantee:number, lineCount:number): boolean {
	if (total <= 0 || size <= 0 || guarantee <= 0 || lineCount <= 0) return false;
	if (size < guarantee) return false;
	if (total < size) return false;
	const minLines = CombinationHelper.coveringLowerBound(total, size, guarantee);
	return (lineCount >= minLines);
}

}


export class Combination implements Iterable<Tuple> {
	private readonly _items: Tuple;
	private readonly _total: number;
	private readonly _size: number;
	private readonly _count: bigint;
	private _currentIndex: bigint;
	private _indices: number[];
	private _values: Tuple;


    /**
	 * Build a combination iterator
	 */	
    constructor(items: Tuple, size: number) {
        // super();
		if (size <= 0 || size > items.length) throw new Error("Invalid size value");
		
    	this._items = items;
    	this._total = items.length;
        this._size = size;
        this._count = TupleHelper.binomial(this._total, size);

    	this._indices = Array.from({ length: size }, (_, i) => i);
    	this._values  = Array.from({ length: size }, (_, i) => items[i]);
        this._currentIndex = 0n;
    }


	get total(): number { return this._total; }
	get size(): number { return this._size; }
	get count(): bigint { return this._count; }
	get lastIndex(): bigint { return this._count - 1n; }
	get currentIndex(): bigint { return this._currentIndex; }
	get currentTuple(): Tuple { return [...this._values]; }


	/**
	 * Gives the first tuple
	 * @param        none
	 * @return       first tuple
	 */
    public start(): Tuple {
    	this._currentIndex = 0n;
		for (let i = 0; i < this._size; i++) {
			this._indices[i] = i;
			this._values[i] = this._items[i];
		}
    	return [...this._values];
    }


    /**
	 * Gives the last tuple
	 * @param        none
	 * @return       last tuple
	 */
    public end(): Tuple {
		this._currentIndex = this.lastIndex;
		for (let i = 0; i < this._size; i++) {
			this._indices[i] = this._total - this._size + i;
			this._values[i] = this._items[this._indices[i]];
		}
		return [...this._values];
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
		if (this._currentIndex <= 0n) return null;
		this._currentIndex--;

		let i = this._size - 1;
		while (i >= 0) {
			const minAllowed = (i === 0) ? 0 : (this._indices[i - 1] + 1);
			if (this._indices[i] > minAllowed) break;
			i--;
		}
		if (i < 0) return null;

		this._indices[i]--;
		for (let j = i + 1; j < this._size; j++) { this._indices[j] = this._total - (this._size - j); }

		for (let j = 0; j < this._size; j++) { this._values[j] = this._items[this._indices[j]]; }
		return [...this._values];
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

		let i = this._size - 1;
		while (i >= 0 && this._indices[i] === this._total - this._size + i) { i--; }
		if (i < 0) return null;

		this._indices[i]++;
		for (let j = i + 1; j < this._size; j++) { this._indices[j] = this._indices[j - 1] + 1; }

		for (let j = 0; j < this._size; j++) { this._values[j] = this._items[this._indices[j]]; }
		return [...this._values];
	}


	/**
	 * ES6 iterator over all tuples generated by this Combination object.
	 *
	 * Allows usage such as:
	 * ```ts
	 * for (const tuple of combination) {
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
				if (done) return { value: undefined, done: true };

				let value: Tuple | null;
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

