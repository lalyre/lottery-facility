'use strict';


export class Combination {
	/**
	 * Get lottery combination string
	 * @param numbers   array of balls number.
	 * @param sep       separator (default SPACE).
	 * @return          combination in string form.
	 */
	public static toString(numbers:number[], sep:string = ' '): string {
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
	public static toCanonicalString(numbers:number[], sep:string = ' '): string {
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
	public static collisionsCount(arr1:number[], arr2:number[]): number {
		const merge = Combination.intersection(arr1, arr2);
		return merge.length;
	}


	/**
	 * Give the union between 2 lottery combinations
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @param duplicate if true then duplicate balls number are kept. Otherwise only unique numbers are returned.
	 * @return          array containing all balls inside arr1 and arr2.
	 */
	public static union(arr1:number[], arr2:number[], duplicate:boolean = false): number[] {
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
	public static intersection(arr1:number[], arr2:number[]): number[] {
		if (!arr1 || !arr2) return [];
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
	 public static difference(arr1:number[], arr2:number[]): number[] {
		if (!arr1) return [];
		if (!arr2) return arr1;
		const diff = arr1.filter((item, pos) => arr1.indexOf(item) === pos && arr2.indexOf(item) === -1);
		return diff;
	}


	/**
	 * Give the minimum gap of a lottery combination relatively to a global alphabet
	 * The minimum gap is the smallest distance between two consecutive items of the input combination.
	 * @param alphabet      array of balls number.
	 * @param combination   array of balls number.
	 * @return              minimum gap.
	 */
	 public static minimum_gap(alphabet:number[], combination:number[]): number {
		if (!alphabet) return -1;
		if (!combination) return -1;
		if (combination.length <= 0) return 0;
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
			let gap = alphabet.indexOf(combination[j+1]) - alphabet.indexOf(combination[j]);
			if (gap < minGap) minGap = gap;
		}
		
		gap = alphabet.length + alphabet.indexOf(combination[0]) - alphabet.indexOf(combination[combination.length-1]);
		if (gap < minGap) minGap = gap;
		
		return minGap;
	}


	/**
	 * Compute the complement combination of a lottery combination relatively to maximum number value
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number.
	 * @return          array containing balls numbers of the complement combination.
	 */
	public static complement(max:number, numbers:number[]): number[] {
		if (max <= 0) return [];
		if (!numbers) return [];
		const complement:number[] = [];
		complement.length = numbers.length;
		for (let j = 0; j < numbers.length; j++) { complement[j] = (max+1 - numbers[j]); }
		return complement;
	}


	/**
	 * Give the rank of a given combination
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number (combination).
	 * @return          the rank of the combination.
	 */
	public static combinationToRank(max:number, numbers:number[]): number {
		if (max < 0) return -1;
		if (!numbers) return -1;
		const len:number = numbers.length;
		numbers.sort((a, b) => {return a - b;});

		let rank:number = Combination.binomial(max, len);
		for (let i = len; i > 0; i--) {
			if (numbers[len-i] > max) return -1;
			rank -= Combination.binomial(max-numbers[len-i]+1, i);
			if (i > 1) rank += Combination.binomial(max-numbers[len-i], i-1);
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
	public static rankToCombination(max:number, length:number, rank:number): number[] {
		if (max <= 0) return [];
		if (length <= 0) return [];
		if (length > max) return [];
		if (rank <= 0 || rank > Combination.binomial(max, length)) return [];
		const numbers = Array.from({ length: length }, (_, i) => 0);

		for (let i = 0; i < length; i++) {
			for (let k = max; k >= length; k--) {
				let m = k;
				for (let j = length-1; j >= i; j--) { numbers[j] = m; m--; }
				if (Combination.combinationToRank(max, numbers) <= rank) break;
			}
		}
		return numbers;
	}


	/**
	 * Factorial function
	 * @param n         integer value
	 * @return          factorial value of n
	 */
	public static factorial(n:number): number {
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
	public static binomial(max:number, n:number): number {
		if (max < 0) return -1;
		if (n > max) return -1;
		if (n === 0) return 1;
		if (n === max) return 1;
		let ret:number = Combination.factorial(max);
		ret /= Combination.factorial(n);
		ret /= Combination.factorial(max-n);
		return ret;
	}


	/**
	 * Great common divisor
	 * @param a         integer value
	 * @param b         integer value
	 * @return          great common divisor value of "a" and "b"
	 */
	 public static gcd(a:number, b:number): number {
		if (a < b) return Combination.gcd(b,a);
		const r:number = a%b; if (r !== 0) return Combination.gcd(b,r);
		return b;
	}


	/**
	 * Least common multiplier
	 * @param a         integer value
	 * @param b         integer value
	 * @return          least common multiplier value of "a" and "b"
	 */
	 public static lcm(a:number, b:number): number {
		return a*b/Combination.gcd(a,b);
	}
}

