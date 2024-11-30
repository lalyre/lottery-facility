'use strict';


export type Combination = number[];


export class CombinationHelper {
	/**
	 * Get lottery combination string
	 * @param numbers   array of balls number.
	 * @param sep       separator (default SPACE).
	 * @return          combination in string form.
	 */
	public static toString (numbers:Combination|null, sep:string = ' '): string {
		if (!numbers) return '';
		const display = numbers.map(x => x.toString().padStart(2, '0')).join(sep);
		return display;
	}


	/**
	 * Get canonical (ordered) lottery combination string
	 * @param numbers   array of balls number.
	 * @param sep       separator (default SPACE).
	 * @return          combination in string form.
	 */
	public static toCanonicalString (numbers:Combination|null, sep:string = ' '): string {
		if (!numbers) return '';
		const arr = numbers.filter((element, index, array) => array.indexOf(element) === index).sort((a, b) => {return a - b;});
		const display = arr.map(x => x.toString().padStart(2, '0')).join(sep);
		return display;
	}


	/**
	 * Compute the number of collisions between 2 lottery combinations
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          number of balls both inside arr1 and arr2.
	 */
	public static collisionsCount (arr1:Combination, arr2:Combination): number {
		const set2 = new Set(arr2);
		return arr1.filter(item => set2.has(item)).length;
	}


	/**
	 * Split an array in nbParts
	 * @param numbers      array of balls number.
	 * @param nbParts      count of returned arrays.
	 * @return             array of parts of entry array.
	 */
	public static split (numbers:Combination, nbParts:number): Array<Combination> {
		if (nbParts < 0) throw new Error('Invalid nbParts parameter');
		if (nbParts === 0) return [];
		if (nbParts === 1) return [numbers];
		if (!numbers) return [];
		if (numbers.length < nbParts) return [];

		const [chunkSize, remainder] = [Math.floor(numbers.length / nbParts), numbers.length % nbParts];
		const result: Array<number[]> = [];
		const partsSize = new Array(nbParts).fill(chunkSize);
		for (let i = 0; i < remainder; i++) { partsSize[i] += 1; }
		
		let startIndex = 0;
		for (let i = 0; i < nbParts; i++) {
			const endIndex = startIndex + partsSize[i];
			const chunk = numbers.slice(startIndex, endIndex);
			result.push(chunk);
			startIndex = endIndex;
		}
		return result;
	}


	/**
	 * Concatenate several arrays of balls number into one single array of balls number
	 * @param parts       array of arrays of balls number.
	 * @return            concatenation of all input arrays.
	 */
	public static concat (...parts: Array<Combination>): Combination {
		return ([] as Combination).concat(...parts);
	}


	/**
	 * All possible extractions of nbParts of input array minus one
	 * @param numbers     array of balls number.
	 * @param nbParts     count of parts to split input array.
	 * @return            all possible concatenations of nbParts of input array excluding one.
	 */
	public static splitAndExtract_Nminus1 (numbers:Combination, nbParts:number): Array<Combination> {
		if (nbParts < 0) throw new Error('Invalid nbParts parameter');
		if (nbParts <= 1) return [];
		if (!numbers) return [];
		if (numbers.length < nbParts) return [];
		const parts: Array<Combination> = CombinationHelper.split (numbers, nbParts);
		return CombinationHelper.extract_Nminus1 (...parts);
	}


	/**
	 * All possible extractions of parts minus one
	 * @param parts       array of arrays of balls number.
	 * @return            all possible concatenations of input arrays excluding one.
	 */
	public static extract_Nminus1 (...parts: Array<Combination>): Array<Combination> {
		if (!parts) return [];
		if (parts.length <= 1) return [];
		const result: Array<Combination> = [];
		for (let i = parts.length-1; i >= 0; i--) {
			const remainingParts: Array<Combination> = parts.filter((_, index) => index !== i);
			const mergedArray = CombinationHelper.concat(...remainingParts);
			result.push(mergedArray);
		}
		return result;
	}


	/**
	 * Give the union between 2 lottery combinations
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @param duplicate if true then duplicate balls number are kept (default false). Otherwise only unique numbers are returned.
	 * @return          array containing all balls inside arr1 and arr2.
	 */
	public static union (arr1:Combination, arr2:Combination, duplicate:boolean = false): Combination {
		if (!arr1) return duplicate ? arr2 : Array.from(new Set(arr2));
		if (!arr2) return duplicate ? arr1 : Array.from(new Set(arr1));

		if (duplicate) return [...arr1, ...arr2];

		return Array.from(new Set([...arr1, ...arr2]));
	}


	/**
	 * Give the intersection between 2 lottery combinations
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          array containing balls both inside arr1 and arr2.
	 */
	public static intersection (arr1:Combination, arr2:Combination): Combination {
		if (!arr1 || !arr2) return [];
		const set2 = new Set(arr2);
		return arr1.filter(item => set2.has(item));
	}


	/**
	 * Give the difference between 2 lottery combinations
	 * It gives the elements of "arr1" minus the elements of "arr2"
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          array containing balls of arr1 that are not inside arr2.
	 */
	public static difference (arr1:Combination, arr2:Combination): Combination {
		if (!arr1) return [];
		if (!arr2) return arr1;
		const set2 = new Set(arr2);
		return arr1.filter(item => !set2.has(item));
	}


	/**
	 * Give the distance of a lottery combination relatively to a global alphabet
	 * The distance is the difference between the two furthest items of the input combination.
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              minimum gap.
	 */
	public static distance (alphabet:Combination, combination:Combination): number {
		if (!alphabet) return -1;
		if (!combination) return -1;
		if (combination.length <= 1) return 0;
		combination.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(combination[0]) === -1) return -1;						// Item not in alphabet
		if (alphabet.indexOf(combination[combination.length-1]) === -1) return -1;	// Item not in alphabet
		const distance = alphabet.indexOf(combination[combination.length-1]) - alphabet.indexOf(combination[0]);
		return distance;
	}


	/**
	 * Give the minimum gap of a lottery combination relatively to a global alphabet
	 * The minimum gap is the smallest distance between two consecutive items of the input combination.
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              minimum gap.
	 */
	public static minimum_gap (alphabet:Combination, combination:Combination): number {
		if (!alphabet) return -1;
		if (!combination) return -1;
		if (combination.length <= 1) return 0;
		combination.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(combination[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(combination[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(combination[1]) - alphabet.indexOf(combination[0]);
		let minGap = gap;

		for (let j = 1; j < combination.length-1; j++) {
			if (alphabet.indexOf(combination[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(combination[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(combination[j+1]) - alphabet.indexOf(combination[j]);
			if (gap < minGap) minGap = gap;
		}

		gap = alphabet.length + alphabet.indexOf(combination[0]) - alphabet.indexOf(combination[combination.length-1]);
		if (gap < minGap) minGap = gap;

		return minGap;
	}


	/**
	 * Give the minimum right gap of a lottery combination relatively to a global alphabet
	 * The minimum right gap is the smallest distance between two consecutive items on the right of the input combination.
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              minimum gap.
	 */
	public static minimum_right_gap (alphabet:Combination, combination:Combination): number {
		if (!alphabet) return -1;
		if (!combination) return -1;
		if (combination.length <= 1) return 0;
		combination.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(combination[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(combination[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(combination[1]) - alphabet.indexOf(combination[0]);
		let minGap = gap;

		for (let j = 1; j < combination.length-1; j++) {
			if (alphabet.indexOf(combination[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(combination[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(combination[j+1]) - alphabet.indexOf(combination[j]);
			if (gap < minGap) minGap = gap;
		}

		return minGap;
	}


	/**
	 * Give the maximum gap of a lottery combination relatively to a global alphabet
	 * The maximum gap is the biggest distance between consecutives items of the input combination (great-circle distance or spherical distance).
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              maximum gap.
	 */
	public static maximum_gap (alphabet:Combination, combination:Combination): number {
		if (!alphabet) return -1;
		if (!combination) return -1;
		if (combination.length <= 1) return 0;
		combination.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(combination[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(combination[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(combination[1]) - alphabet.indexOf(combination[0]);
		let maxGap = gap;
		let previousGap = 0;

		for (let j = 1; j < combination.length-1; j++) {
			if (alphabet.indexOf(combination[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(combination[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(combination[j+1]) - alphabet.indexOf(combination[j]);
			if (gap > maxGap) { previousGap = maxGap; maxGap = gap; }
			else if (gap > previousGap) { previousGap = gap; }
		}

		gap = alphabet.length + alphabet.indexOf(combination[0]) - alphabet.indexOf(combination[combination.length-1]);
		if (gap > maxGap) { previousGap = maxGap; maxGap = gap; }
		else if (gap > previousGap) { previousGap = gap; }

		return previousGap;
	}


	/**
	 * Give the maximum right gap of a lottery combination relatively to a global alphabet
	 * The maximum right gap is the biggest distance between consecutives items on the right of the input combination.
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              maximum gap.
	 */
	public static maximum_right_gap (alphabet:Combination, combination:Combination): number {
		if (!alphabet) return -1;
		if (!combination) return -1;
		if (combination.length <= 1) return 0;
		combination.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(combination[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(combination[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(combination[1]) - alphabet.indexOf(combination[0]);
		let maxGap = gap;

		for (let j = 1; j < combination.length-1; j++) {
			if (alphabet.indexOf(combination[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(combination[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(combination[j+1]) - alphabet.indexOf(combination[j]);
			if (gap > maxGap) {
				maxGap = gap;
			}
		}

		return maxGap;
	}


	/**
	 * Compute the complement combination of a lottery combination relatively to a global alphabet
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              array containing balls numbers of the complement combination.
	 */
	public static complement (alphabet:Combination, combination:Combination): Combination|null {
		if (!alphabet) return null;
		if (!combination) return null;

		const complement:number[] = [];
		complement.length = combination.length;

		for (let j = 0; j < combination.length; j++) {
			if (alphabet.indexOf(combination[j]) === -1) return null;		// Item not in alphabet

			const pos:number = alphabet.indexOf(combination[j]);
			complement[j] = alphabet[alphabet.length-1 - pos];
		}
		return complement;
	}


	/**
	 * Give the rank of a given combination
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number (combination).
	 * @return          the rank of the combination.
	 */
	public static combinationToRank (max:number, numbers:Combination): number {
		if (max < 0) return -1;
		if (!numbers) return -1;
		const len:number = numbers.length;
		numbers.sort((a, b) => {return a - b;});

		let rank:number = CombinationHelper.binomial(max, len);
		for (let i = len; i > 0; i--) {
			if (numbers[len-i] > max) return -1;
			rank -= CombinationHelper.binomial(max-numbers[len-i]+1, i);
			if (i > 1) rank += CombinationHelper.binomial(max-numbers[len-i], i-1);
		}
		rank++;
		return rank;
	}


	/**
	 * Give the combination corresponding to the given rank
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param length    the length of the combination to be returned.
	 * @param rank      the rank of the combination to be returned.
	 * @return          the combination corresponding to the given rank.
	 */
	public static rankToCombination (max:number, length:number, rank:number): Combination {
		if (max <= 0) return [];
		if (length <= 0) return [];
		if (length > max) return [];
		if (rank <= 0 || rank > CombinationHelper.binomial(max, length)) return [];
		/* eslint-disable-next-line */
		const numbers = Array.from({ length: length }, (_, i) => 0);

		for (let i = 0; i < length; i++) {
			for (let k = max; k >= length; k--) {
				let m = k;
				for (let j = length-1; j >= i; j--) { numbers[j] = m; m--; }
				if (CombinationHelper.combinationToRank(max, numbers) <= rank) break;
			}
		}
		return numbers;
	}


	/**
	 * Factorial function
	 * @param n         integer value
	 * @return          factorial value of n
	 */
	public static factorial (n:number): number {
		if (n < 0) return -1;
		let ret:number = 1;
		for (let i = 1; i <= n; i++) { ret *= i; }
		return ret;
	}


	/**
	 * Binomial coefficient function
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param n         integer value
	 * @return          binomial coefficient value of (max, n)
	 */
	public static binomial (max:number, n:number): number {
		if (max < 0) return 0;
		if (n < 0 || n > max) return 0;
		if (n === 0 || n === max) return 1;
		let ret:number = CombinationHelper.factorial(max);
		ret /= CombinationHelper.factorial(n);
		ret /= CombinationHelper.factorial(max-n);
		return ret;
	}


	/**
	 * Great common divisor
	 * @param a         integer value
	 * @param b         integer value
	 * @return          great common divisor value of "a" and "b"
	 */
	public static gcd (a:number, b:number): number {
		if (a < b) return CombinationHelper.gcd(b,a);
		const r:number = a%b; if (r !== 0) return CombinationHelper.gcd(b,r);
		return b;
	}


	/**
	 * Least common multiplier
	 * @param a         integer value
	 * @param b         integer value
	 * @return          least common multiplier value of "a" and "b"
	 */
	public static lcm (a:number, b:number): number {
		return a*b/CombinationHelper.gcd(a,b);
	}
}


export class CartesianProduct {
	private readonly _parts: Array<Combination>;
	private readonly _nbParts: number;
	private readonly _count: number;
	private _partsIndex: Combination;
	private _partsValue: Combination;
	private _currentIndex: number;


	/**
	 * Build a cartesian product calculator
	 */	
	public constructor (...parts: Array<Combination>) {
		// super();
		this._parts = parts;
		this._nbParts = parts.length;
		this._partsIndex = new Array(this._nbParts).fill(0);
		this._partsValue = new Array(this._nbParts).fill(0);
		this._count = this._parts.reduce((acc, part) => acc * part.length, 1);
		this._currentIndex = 0;
		for (let i = 0; i < this._nbParts; i++) { this._partsValue[i] = this._parts[i][0]; }
	}


	get nbParts(): number {
		return this._nbParts;
	}


	get count(): number {
		return this._count;
	}


	get lastIndex(): number {
		return this._count-1;
	}


	get currentIndex(): number {
		return this._currentIndex;
	}


	get currentCombination(): Combination {
		return this._partsValue;
	}


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
		return this._partsValue;
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
		return this._partsValue;
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
		return this._partsValue;
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
		return this._partsValue;
	}







	/**
	 * Give the rank of a given combination
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number (combination).
	 * @return          the rank of the combination.
	 */
	/*public static combinationToRank (max:number, numbers:number[]): number {
		if (max < 0) return -1;
		if (!numbers) return -1;
		const len:number = numbers.length;
		numbers.sort((a, b) => {return a - b;});

		let rank:number = CombinationHelper.binomial(max, len);
		for (let i = len; i > 0; i--) {
			if (numbers[len-i] > max) return -1;
			rank -= CombinationHelper.binomial(max-numbers[len-i]+1, i);
			if (i > 1) rank += CombinationHelper.binomial(max-numbers[len-i], i-1);
		}
		rank++;
		return rank;
	}*/


	/**
	 * Give the combination corresponding to the given rank
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param length    the length of the combination to be returned.
	 * @param rank      the rank of the combination to be returned.
	 * @return          the combination corresponding to the given rank.
	 */
	/*public static rankToCombination (max:number, length:number, rank:number): number[] {
		if (max <= 0) return [];
		if (length <= 0) return [];
		if (length > max) return [];
		if (rank <= 0 || rank > CombinationHelper.binomial(max, length)) return [];
		// eslint-disable-next-line
		const numbers = Array.from({ length: length }, (_, i) => 0);

		for (let i = 0; i < length; i++) {
			for (let k = max; k >= length; k--) {
				let m = k;
				for (let j = length-1; j >= i; j--) { numbers[j] = m; m--; }
				if (CombinationHelper.combinationToRank(max, numbers) <= rank) break;
			}
		}
		return numbers;
	}*/
	

	/*

const lotteryFacility = require('./dist/lotteryfacility-nodebundle.umd.js');

var a1 = lotteryFacility.CombinationHelper.splitAndExtract_Nminus1([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 2);

var a1 = lotteryFacility.CombinationHelper.splitAndExtract_Nminus1([1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
41, 42, 43, 44, 45, 46, 47, 48, 49, 50], 3);
for (let i = 0; i < a1.length; i++) { console.log(a1[i]); }

var a2 = [];
for (let i = 0; i < a1.length; i++) {
	var a = lotteryFacility.CombinationHelper.splitAndExtract_Nminus1(a1[i], 2);
	a2 = lotteryFacility.CombinationHelper.concat(a2, a);
}
//for (let i = 0; i < a2.length; i++) { console.log(a2[i]); }

var a3 = [];
for (let i = 0; i < a2.length; i++) {
	var a = lotteryFacility.CombinationHelper.splitAndExtract_Nminus1(a2[i], 3);
	a3 = lotteryFacility.CombinationHelper.concat(a3, a);
}
//for (let i = 0; i < a3.length; i++) { console.log(a3[i]); }

	*/


}


export class Selection {

}


export class Permutation {

}









//TODO CL
//import fs from 'fs';
//import fs from 'fs-extra';
//import readline from 'readline';
//import path from 'path';



export const comparisonOperators = {
	 "<": (a: number, b: number) => a  < b,
	"<=": (a: number, b: number) => a <= b,
	"==": (a: number, b: number) => a == b,
	">=": (a: number, b: number) => a >= b,
	 ">": (a: number, b: number) => a  > b,
};


export interface CombinationFilter {
	setCombination (combination: Combination): void;		// set the current tested combination
	select(): boolean;										// true if the combination is accepted by the filter, false otherwise
}


export class CombinationFilterPipeline {
	private _filters: CombinationFilter[] = [];


	/**
	 * Add a filter to the pipeline
	 * @param filter      a combination filter
	 * @return            none
	 */
	addFilter (filter: CombinationFilter): void {
		this._filters.push(filter);
	}


	/**
	 * Test a combination through all filters in the pipeline
	 * @param combination      combination to be tested
	 * @return                 true if the combination passes all filters, false otherwise
	 */
	select (combination: Combination): boolean {
		return this._filters.every(filter => {
			filter.setCombination(combination);
			return filter.select();
		});
	}
}


export class LengthFilter implements CombinationFilter {
	private _combination: Combination | null = null;
	private _lengthComparator: (a: number, b: number) => boolean;


	/**
	 * Creates a filter for length-based comparisons to a specific length reference.
	 * @param _lengthReference      the reference length
	 * @param _lengthOperator       a length comparison operator
	 */
	constructor (
		private _lengthReference: number,
		private _lengthOperator: keyof typeof comparisonOperators,
	) {
		// super();
		if (_lengthReference < 0 || !Number.isFinite(_lengthReference)) throw new Error('Invalid parameter');
		this._lengthComparator = comparisonOperators[_lengthOperator];
	}


	/**
	 * Set the current combination to be tested.
	 * @param combination      the combination to set
	 * @return                 none
	 */
	setCombination(combination: Combination): void {
		if (!combination) throw new Error("No engaged combination");
		this._combination = combination;
	}


	/**
	 * Allow combinations lower than (or equal)/upper than (or equal) a specific length.
	 * @return                 true if the combination matches the comparison criteria, false otherwise
	 */
	select(): boolean {
		if (!this._combination) throw new Error("No combination has been set");
		return this._lengthComparator(this._combination.length, this._lengthReference);
	}
}


export class InMemoryScoreFilter implements CombinationFilter {
	private _scoreComparator: (a: number, b: number) => boolean;
	private _levelComparator: (a: number, b: number) => boolean;
	private _combination: Combination | null = null;
	private _score: number = 0;


	get currentScore(): number {
		return this._score;
	}


	/**
	 * Creates a filter for score-based comparisons to a specific score reference.
	 * @param _combinations         an array of the filter combinations stored in memory
	 * @param _levelReference       the reference level of collisions
	 * @param _levelOperator        a level comparison operator
	 * @param _scoreReference       the reference score
	 * @param _scoreOperator        a score comparison operator
	 * @param _weight               the weight of matching lines of filter, used to compute the score (default value is 1)
	 */
	constructor(
		private _combinations: Combination[],
		private _levelReference: number,
		private _levelOperator: keyof typeof comparisonOperators,
		private _scoreReference: number,
		private _scoreOperator: keyof typeof comparisonOperators,
		private _weight: number = 1,
	) {
		// super();
		if (!Array.isArray(_combinations) || _combinations.length === 0) throw new Error("Wrong combinations array.");
		if (_levelReference < 0 || !Number.isFinite(_levelReference)) throw new Error("Invalid level reference.");
		if (_scoreReference < 0 || !Number.isFinite(_scoreReference)) throw new Error("Invalid score reference.");
		this._scoreComparator = comparisonOperators[this._scoreOperator];
		this._levelComparator = comparisonOperators[this._levelOperator];
	}


	/**
	 * Set the current combination to be tested.
	 * @param combination      the combination to set, and computes its score
	 * @return                 none
	 */
	setCombination(combination: Combination): void {
		if (!combination) throw new Error("No engaged combination");
		this._combination = combination;

		let nbHits: number = 0;
		for (const filterCombination of this._combinations) {
			const collisionsCount = CombinationHelper.collisionsCount(this._combination, filterCombination);
			if (this._levelComparator(collisionsCount, this._levelReference)) nbHits++;
		}
		this._score = nbHits * this._weight;
	}


	/**
	 * Allow combinations with score lower than (or equal)/upper than (or equal) a specific score reference.
	 * @return                 true if the combination matches the score criteria, false otherwise
	 */
	select(): boolean {
		return !!this._combination && this._scoreComparator(this._score, this._scoreReference);
	}
}


/*class InMemoryRepetitionFilter implements CombinationFilter {
	private _repetitionComparator: (a: number, b: number) => boolean;
	private _levelComparator: (a: number, b: number) => boolean;
	private _covering: number[];
	private _combination: Combination | null = null;
	private _nbRepetitions: number = 0;


	get currentRepetitions(): number {
		return this._nbRepetitions;
	}


	/**
	 * Creates a filter for repetition-based comparisons to a specific repetition reference.
	 * @param _combinations         an array of the filter combinations stored in memory
	 * @param _levelReference       the reference level of collisions
	 * @param _levelOperator        a level comparison operator
	 * @param _repetitionReference  the reference repetition
	 * @param _repetitionOperator   a repetition comparison operator
	 */
	/*constructor(
		private _combinations: Combination[],
		private _levelReference: number,
		private _levelOperator: keyof typeof comparisonOperators,
		private _repetitionReference: number,
		private _repetitionOperator: keyof typeof comparisonOperators,
	) {
		// super();
		if (!Array.isArray(_combinations) || _combinations.length === 0) throw new Error("Wrong combinations array.");
		if (_levelReference < 0 || !Number.isFinite(_levelReference)) throw new Error("Invalid level reference.");
		if (_repetitionReference < 0 || !Number.isFinite(_repetitionReference)) throw new Error("Invalid repetition reference.");
		this._repetitionComparator = comparisonOperators[this._repetitionOperator];
		this._levelComparator = comparisonOperators[this._levelOperator];
		this._covering = new Array(this._combinations.length).fill(0);
	}*/


	/**
	 * Set the current combination to be tested.
	 * @param combination      the combination to set, and computes its score
	 * @return                 none
	 */
	/*setCombination(combination: Combination): void {
		if (!combination) throw new Error("No engaged combination");
		this._combination = combination;

		this._nbRepetitions = 0;
		for (let i = 0; i < this._combinations.length; i++) {
			const filterCombination = this._combinations[i];
			const collisionsCount = CombinationHelper.collisionsCount(this._combination, filterCombination);
			if (this._levelComparator(collisionsCount, this._levelReference)) {
				this._covering[i]++;
				if (this._covering[i] > 1) this._nbRepetitions++;
			}
		}
	}*/


	/**
	 * Allow combinations with score lower than (or equal)/upper than (or equal) a specific score reference.
	 * @return                 true if the combination matches the score criteria, false otherwise
	 */
	/*select(): boolean {
		return !!this._combination && this._repetitionComparator(this._nbRepetitions, this._repetitionReference);
	}
}*/









/*
// Filtre de collision basé sur un fichier de combinaisons
class FileBasedCollisionFilter implements CombinationFilter {
    private combinationSet: Set<string> = new Set();

    constructor(filePath: string) {
        this.loadCombinationsFromFile(filePath);
    }

    private loadCombinationsFromFile(filePath: string): void {
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split(/\r?\n/);
        for (const line of lines) {
            const combination = line.trim().split(/\s+/).map(Number);
            if (combination.length > 0) {
                this.combinationSet.add(combination.join(','));
            }
        }
    }

    select(combination: Combination): boolean {
        return this.combinationSet.has(combination.join(','));
    }
}
*/

/*
// Fonction pour traiter le flux de combinaisons depuis un fichier
async function processCombinationFile(filePath: string, pipeline: CombinationFilterPipeline, onAccept: (combination: Combination) => void): Promise<void> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        const combination = line.trim().split(/\s+/).map(Number);
        if (pipeline.select(combination)) {
            onAccept(combination);  // Gestion de la combinaison acceptée
        }
    }
}
*/



// Exemple d'utilisation
/*(async () => {
    const pipeline = new CombinationFilterPipeline();

    // Ajouter des filtres au pipeline
    pipeline.addFilter(new NumberCountFilter(3, 6));  // Combinaisons de 3 à 6 numéros
    pipeline.addFilter(new AverageFilter(10, 50));    // Moyenne entre 10 et 50

    // Ajouter un filtre de collision avec des combinaisons en mémoire
    const memoryCombinations: Combination[] = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];
    pipeline.addFilter(new CollisionFilter(memoryCombinations));

    // Ajouter un filtre de collision basé sur un fichier
    const collisionFilePath = 'path/to/collision_combinations.txt';
    pipeline.addFilter(new FileBasedCollisionFilter(collisionFilePath));

    // Gestionnaire pour les combinaisons acceptées
    const acceptedCombinations: Combination[] = [];
    function handleAcceptedCombination(combination: Combination) {
        acceptedCombinations.push(combination);
    }

    // Traitement du fichier contenant les combinaisons d'entrée
    const inputFilePath = 'path/to/input_combinations.txt';
    await processCombinationFile(inputFilePath, pipeline, handleAcceptedCombination);

    console.log('Combinaisons acceptées:', acceptedCombinations);
})();*/



