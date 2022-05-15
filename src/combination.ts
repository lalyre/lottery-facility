'use strict';


export class Combination {
	/**
	 * Get lottery combination string
	 * @param numbers    array of balls number.
	 * @param sep        separator (default SPACE).
	 * @return           combination in string form.
	 */
	public static toString(numbers:number[], sep:string = ' '): string {
		if (!numbers) return '';
		const display = numbers.map(x => x.toString().padStart(2, '0')).join(sep);
		return display;
	}


	/**
	 * Get canonical (ordered) lottery combination string
	 * @param numbers    array of balls number.
	 * @param sep        separator (default SPACE).
	 * @return           combination in string form.
	 */
	public static toCanonicalString(numbers:number[], sep:string = ' '): string {
		if (!numbers) return '';
		const arr = numbers.filter((element, index, array) => array.indexOf(element) === index).sort((a, b) => {return a - b;});
		const display = arr.map(x => x.toString().padStart(2, '0')).join(sep);
		return display;
	}


	/**
	 * Compute the number of collisions between 2 lottery combinations
	 * @param arr1     array of balls number.
	 * @param arr2     array of balls number.
	 * @return         number of balls both inside arr1 and arr2.
	 */
	public static collisionsCount(arr1:number[], arr2:number[]): number {
		const merge = Combination.intersection(arr1, arr2);
		return merge.length;
	}


	/**
	 * Give the union between 2 lottery combinations
	 * @param arr1        array of balls number.
	 * @param arr2        array of balls number.
	 * @param duplicate   if true then duplicate balls number are kept. Otherwise only unique numbers are returned.
	 * @return            array containing all balls inside arr1 and arr2.
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
	 * @param arr1       array of balls number.
	 * @param arr2       array of balls number.
	 * @return           array containing balls both inside arr1 and arr2.
	 */
	public static intersection(arr1:number[], arr2:number[]): number[] {
		if (!arr1 || !arr2) return [];
		const intersec = arr1.filter((item, pos) => arr1.indexOf(item) === pos && arr2.indexOf(item) !== -1);
		return intersec;
	}


	/**
	 * Give the difference between 2 lottery combinations
	 * It gives the elements of "arr1" minus the elements of "arr2"
	 * @param arr1       array of balls number.
	 * @param arr2       array of balls number.
	 * @return           array containing balls of arr1 that are not inside arr2.
	 */
	 public static difference(arr1:number[], arr2:number[]): number[] {
		if (!arr1) return [];
		if (!arr2) return arr1;
		const diff = arr1.filter((item, pos) => arr1.indexOf(item) === pos && arr2.indexOf(item) === -1);
		return diff;
	}


	/**
	 * Compute the complement combination of a lottery combination relatively to maximum number value
	 * @param max        the maximum possible number value used in balls numbers.
	 * @param numbers    array of balls number.
	 * @return           array containing balls numbers of the complement combination.
	 */
	public static complement(max:number, numbers:number[]): number[] {
		if (!numbers) return [];
		const complement:number[] = [];
		complement.length = numbers.length;
		for (let j = 0; j < numbers.length; j++) { complement[j] = (max+1 - numbers[j]); }
		return complement;
	}
}

