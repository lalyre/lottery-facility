'use strict';


export class CombinationHelper {
	/**
	 * Get lottery combination string
	 * @param numbers   array of balls number.
	 * @param sep       separator (default SPACE).
	 * @return          combination in string form.
	 */
	public static toString (numbers:number[]|null, sep:string = ' '): string {
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
	public static toCanonicalString (numbers:number[]|null, sep:string = ' '): string {
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
	public static collisionsCount (arr1:number[], arr2:number[]): number {
		const merge = CombinationHelper.intersection(arr1, arr2);
		return merge.length;
	}


	/**
	 * Split an array in nbParts
	 * @param numbers      array of balls number.
	 * @param nbParts      count of returned arrays.
	 * @return             array of parts of entry array.
	 */
	public static split (numbers:number[], nbParts:number): Array<number[]> {
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
	public static concat (...parts: Array<number[]>): number[] {
		return ([] as number[]).concat(...parts);
	}


	/**
	 * All possible extractions of nbParts of input array minus one
	 * @param numbers     array of balls number.
	 * @param nbParts     count of parts to split input array.
	 * @return            all possible concatenations of nbParts of input array excluding one.
	 */
	public static splitAndExtract_Nminus1 (numbers:number[], nbParts:number): Array<number[]> {
		if (nbParts < 0) throw new Error('Invalid nbParts parameter');
		if (nbParts <= 1) return [];
		if (!numbers) return [];
		if (numbers.length <= nbParts) return [];
		const parts: Array<number[]> = CombinationHelper.split (numbers, nbParts);
		return CombinationHelper.extract_Nminus1 (...parts);
	}


	/**
	 * All possible extractions of parts minus one
	 * @param parts       array of arrays of balls number.
	 * @return            all possible concatenations of input arrays excluding one.
	 */
	public static extract_Nminus1 (...parts: Array<number[]>): Array<number[]> {
		if (!parts) return [];
		if (parts.length <= 1) return [];
		const result: Array<number[]> = [];
		for (let i = 0; i < parts.length; i++) {
			const remainingParts: Array<number[]> = parts.filter((_, index) => index !== i);
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
	public static union (arr1:number[], arr2:number[], duplicate:boolean = false): number[] {
		if (!arr1 && !arr2) return [];

		if (duplicate) {
			if (!arr1) return arr2;
			if (!arr2) return arr1;
		} else {
			if (!arr1) return arr2.filter((item, pos) => arr2.indexOf(item) === pos);
			if (!arr2) return arr1.filter((item, pos) => arr1.indexOf(item) === pos);
		}

		const union1 = [...arr1, ...arr2];
		if (duplicate) {
			return union1;
		} else {
			return union1.filter((item, pos) => union1.indexOf(item) === pos);
		}
	}


	/**
	 * Give the intersection between 2 lottery combinations
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          array containing balls both inside arr1 and arr2.
	 */
	public static intersection (arr1:number[], arr2:number[]): number[] {
		if (!arr1 || !arr2) return [];
		//arr1.sort((a, b) => a - b);
		//arr2.sort((a, b) => a - b);
		const intersec = arr1.filter((item, pos) => arr1.indexOf(item) === pos && arr2.indexOf(item) !== -1);
		return intersec;
	}


	/**
	 * Give the difference between 2 lottery combinations
	 * It gives the elements of "arr1" minus the elements of "arr2"
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          array containing balls of arr1 that are not inside arr2.
	 */
	public static difference (arr1:number[], arr2:number[]): number[] {
		if (!arr1) return [];
		if (!arr2) return arr1;
		const diff = arr1.filter((item, pos) => arr1.indexOf(item) === pos && arr2.indexOf(item) === -1);
		return diff;
	}


	/**
	 * Give the distance of a lottery combination relatively to a global alphabet
	 * The distance is the difference between the two furthest items of the input combination.
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              minimum gap.
	 */
	public static distance (alphabet:number[], combination:number[]): number {
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
	public static minimum_gap (alphabet:number[], combination:number[]): number {
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
	public static minimum_right_gap (alphabet:number[], combination:number[]): number {
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
	public static maximum_gap (alphabet:number[], combination:number[]): number {
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
	public static maximum_right_gap (alphabet:number[], combination:number[]): number {
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
	public static complement (alphabet:number[], combination:number[]): number[]|null {
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
	public static combinationToRank (max:number, numbers:number[]): number {
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
	public static rankToCombination (max:number, length:number, rank:number): number[] {
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
		if (max < 0) return -1;
		if (n > max) return -1;
		if (n === 0) return 1;
		if (n === max) return 1;
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
	private readonly _parts: Array<number[]>;
	private readonly _nbParts: number;
	private readonly _count: number;
	private _partsIndex: number[];
	private _partsValue: number[];
	private _currentIndex: number;


	/**
	 * Build a cartesian product calculator
	 */	
	public constructor (...parts: Array<number[]>) {
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


	get currentCombination(): number[] {
		return this._partsValue;
	}


	/**
	 * Gives the first combination
	 * @param        none
	 * @return       first combination
	 */
	public start(): number[] {
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
	public end(): number[] {
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
	public previous(): number[]|null {
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
	public next(): number[]|null {
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

