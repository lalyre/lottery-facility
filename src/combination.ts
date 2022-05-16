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
		if (!arr1) return arr2;
		if (!arr2) return arr1;
		const union1 = [...arr1, ...arr2];
		if (duplicate) {
			return union1;
		}
		const union2 = union1.filter((item, pos) => union1.indexOf(item) === pos);
		return union2;
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
	 * Compute the complement combination of a lottery combination relatively to maximum number value
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number.
	 * @return          array containing balls numbers of the complement combination.
	 */
	public static complement(max:number, numbers:number[]): number[] {
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
		if (!numbers) return -1;
		const len:number = numbers.length;
		let rank = Combination.binomial(max, len);
		numbers.sort((a, b) => {return a - b;});
		for (let i = len; i > 0; i--) {
			rank -= Combination.binomial(max-numbers[len-i]+1, i);
			rank += Combination.binomial(max-numbers[len-i], i-1);
		}
		return rank;
	}


/**
 * @param
 * @return 
 */
/*
public static void rankToCombination (Long total, Long combination[], BigInteger rank) {
for (Long v : combination) v = 0L;
if (rank.compareTo (BigInteger.valueOf(0)) <= 0
|| rank.compareTo (combin(total,(long)combination.length)) > 0) return;
int len = combination.length;
for (int i = 0; i < len; i++) {
for (Long k = total; k >= len; k--) {
Long m = k;
for (int j = len-1; j >= i; j--) {combination[j] = m; m--;}
if (combinationToRank(total,combination).compareTo(rank) <= 0) break;
}
}
}
*/


	/**
	 * Factorial function
 	 * @param n         integer value
	 * @return          factorial value of n
	 */
	 public static factorial(n:number): number {
		if (n < 0) return -1;
		let ret:number = 1;
		for (let i = 1; i <= n; i++) { ret = ret*i; }
		return ret;
	}


	/**
	 * Binomial coefficient function
	 * @param max       the maximum possible number value used in balls numbers.
 	 * @param n         integer value
	 * @return          binomial coefficient value of (max, n)
	 */
	 public static binomial(max:number, n:number): number {
		if (n > max) return 0;
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
		let r:number = a%b; if (r != 0) return Combination.gcd(b,r);
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

