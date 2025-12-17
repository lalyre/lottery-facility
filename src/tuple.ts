'use strict';
export type Tuple = number[];		//export type Tuple<T> = T[];


export class TupleHelper {
	/**
	 * Get lottery tuple string
	 * @param numbers   array of balls number.
	 * @param sep       separator (default SPACE).
	 * @return          tuple in string form.
	 */
	public static toString(numbers:Tuple|null, sep:string = ' '): string {
		if (!numbers) return '';
		const display = numbers.map(x => x.toString().padStart(2, '0')).join(sep);
		return display;
	}


	/**
	 * Get canonical (ordered) lottery tuple string
	 * @param numbers   array of balls number.
	 * @param sep       separator (default SPACE).
	 * @return          tuple in string form.
	 */
	public static toCanonicalString(numbers:Tuple|null, sep:string = ' '): string {
		if (!numbers) return '';
		const arr = numbers.filter((element, index, array) => array.indexOf(element) === index).sort((a, b) => {return a - b;});
		const display = arr.map(x => x.toString().padStart(2, '0')).join(sep);
		return display;
	}


	/**
	 * Compute the number of collisions between 2 lottery tuples
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          number of balls both inside arr1 and arr2.
	 */
	public static collisionsCount(arr1:Tuple, arr2:Tuple): number {
		const set2 = new Set(arr2);
		return arr1.filter(item => set2.has(item)).length;
	}


	/**
	 * Split an array in nbParts
	 * @param numbers      array of balls number.
	 * @param nbParts      count of returned arrays.
	 * @return             array of parts of entry array.
	 */
	public static split(numbers:Tuple, nbParts:number): Array<Tuple> {
		if (nbParts < 0) throw new Error('Invalid nbParts parameter');
		if (nbParts === 0) return [];
		if (nbParts === 1) return [numbers];
		if (!numbers) return [];
		if (numbers.length < nbParts) return [];

		const [chunkSize, remainder] = [Math.floor(numbers.length / nbParts), numbers.length % nbParts];
		const result: Array<Tuple> = [];
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
	public static concat(...parts: Array<Tuple>): Tuple {
		return ([] as Tuple).concat(...parts);
	}


	/**
	 * Rotates the elements of an array by a given offset.
	 * Elements shifted off the end are wrapped around to the beginning.
	 * 
	 * @param array   The array of numbers to rotate.
	 * @param offset  The number of positions to rotate the array by.
	 * @returns       A new array with elements rotated by the given offset.
	 *
	 * Example:
	 * rotate([1, 2, 3, 4], 1) => [4, 1, 2, 3]
	 */
	public static rotate(array: number[], offset: number): number[] {
		return array.slice(-offset).concat(array.slice(0, -offset));
	}


	/**
	 * Rotates the elements of an array in a round-robin tournament style.
	 * The first element stays fixed, and the rest of the array is rotated by the given offset.
	 * 
	 * @param array   The array of numbers to rotate.
	 * @param offset  The number of positions to rotate the elements (excluding the first one).
	 *                Positive values rotate to the right, negative to the left.
	 * @returns       A new array with the first element fixed and the rest rotated by the given offset.
	 *
	 * Example:
	 * rotate_roundrobin_tournament([1, 2, 3, 4, 5], 2) => [1, 4, 5, 2, 3]
	 */
	public static rotate_roundrobin_tournament(array: number[], offset: number): number[] {
		if (array.length <= 1) return [...array]; // Nothing to rotate

		const fixed: number = array[0];
		const rest: number[] = array.slice(1);
		const len = rest.length;
		offset = offset % len;
		const rotated_rest: number[] = TupleHelper.rotate(rest, offset);
		return [fixed, ...rotated_rest];
	}




	/**
	 * Reverses the order of elements in an array.
	 * 
	 * @param arr  The array of numbers to reverse.
	 * @returns    A new array with elements in reversed order.
	 *
	 * Example:
	 * reverse([1, 2, 3]) => [3, 2, 1]
	 */
	public static reverse(arr: number[]): number[] {
		return [...arr].reverse();
	}


	/**
	 * Transposes an array of arrays (lines to columns and vice versa).
	 * Converts rows into columns and columns into rows.
	 * All inner arrays must have the same length.
	 * 
	 * @param array  An array of arrays of numbers (e.g., tuple).
	 * @returns      A new array where each column of the input becomes a row in the output.
	 *
	 * Example:
	 * transposition([
	 *   [1, 2, 3],
	 *   [4, 5, 6],
	 *   [7, 8, 9]
	 * ]) => [
	 *   [1, 4, 7],
	 *   [2, 5, 8],
	 *   [3, 6, 9]
	 * ]
	 *
	 * @throws Error if inner arrays do not all have the same length.
	 */
	public static transposition(array: Tuple[]): Tuple[] {
		if (array.length === 0) return [];

		const rowCount = array.length;
		const colCount = array[0].length;

		// Validate all rows have the same length
		for (let i = 1; i < rowCount; i++) {
			if (array[i].length !== colCount) {
				throw new Error("All sub-arrays must have the same length for transposition.");
			}
		}

		let transposed: number[][] = Array.from({ length: colCount }, () => []);

		for (let i = 0; i < rowCount; i++)
			for (let j = 0; j < colCount; j++)
				transposed[j].push(array[i][j]);

		return transposed;
	}



	public static generateGapSeries(max: number, gap: number): Tuple[] {
		const covered = new Set<number>();
		const result: Tuple[] = [];

		while (covered.size < max) {
			// Trouver le plus petit numéro non couvert
			let start = 1;
			for (let i = 1; i <= max; i++) {
				if (!covered.has(i)) {
					start = i;
					break;
				}
			}

			const serie: number[] = [];
			let current = start;

			while (!covered.has(current)) {
				serie.push(current);
				covered.add(current);
				current = (current + gap - 1) % max + 1;
			}

			// Ajouter le premier élément à la fin pour boucler la série
			serie.push(start);

			result.push(serie);
		}

		return result;
	}


	/**
	 * Merge multiple arrays of balls number in an interleaved way
	 * @param arrays     array of Tuple arrays.
	 * @return           merged array.
	 */
	public static interleaved_merge(arrays: Array<Tuple>): Tuple {
		let mergedArray: Tuple = [];
		let maxLength = Math.max(...arrays.map(arr => arr.length));

		for (let i = 0; i < maxLength; i++)
			for (let arr of arrays)
				if (i < arr.length) mergedArray.push(arr[i]);
		return mergedArray;
	}



	/**
	 * Splits an array into multiple lines, each containing a fixed number of elements
	 * @param array      The array to split.
	 * @param size       The number of elements per line.
	 * @return           A 2D array where each sub-array represents a line.
	 */
	public static split_into_lines(array: Tuple, size: number): Tuple[] {
		let result: Tuple[] = [];
		for (let i = 0; i < array.length; i += size) {
			if (i + size <= array.length) {
				result.push(array.slice(i, i + size));
			} else {
				result.push(array.slice(i));
			}
		}
		return result;
	}



	/**
	 * All possible extractions of nbParts of input array minus one
	 * @param numbers     array of balls number.
	 * @param nbParts     count of parts to split input array.
	 * @return            all possible concatenations of nbParts of input array excluding one.
	 */
	public static splitAndExtract_Nminus1(numbers:Tuple, nbParts:number): Array<Tuple> {
		if (nbParts < 0) throw new Error('Invalid nbParts parameter');
		if (nbParts <= 1) return [];
		if (!numbers) return [];
		if (numbers.length < nbParts) return [];
		const parts: Array<Tuple> = TupleHelper.split (numbers, nbParts);
		return TupleHelper.extract_Nminus1 (...parts);
	}


	/**
	 * All possible extractions of parts minus one
	 * @param parts       array of arrays of balls number.
	 * @return            all possible concatenations of input arrays excluding one.
	 */
	public static extract_Nminus1(...parts: Array<Tuple>): Array<Tuple> {
		if (!parts) return [];
		if (parts.length <= 1) return [];
		const result: Array<Tuple> = [];
		for (let i = parts.length-1; i >= 0; i--) {
			const remainingParts: Array<Tuple> = parts.filter((_, index) => index !== i);
			const mergedArray = TupleHelper.concat(...remainingParts);
			result.push(mergedArray);
		}
		return result;
	}



	/**
	 * Merges consecutive pairs of arrays into a single array
	 * @param parts       array of arrays of balls number.
	 * @return            an array that is half the length of the input array, with consecutive pairs of elements merged.
	 */
	public static pairwise_merge(...parts: Array<Tuple>): Array<Tuple> {
		if (!parts) return [];
		if (parts.length <= 1) return [];
		const result: Array<Tuple> = [];
		for (let i = 0; i < parts.length; i += 2) {
			if (i + 1 < parts.length) {
				result.push([...parts[i], ...parts[i+1]]);
			} else {
				result.push([...parts[i]]);
			}
		}
		return result;
	}


	/**
	 * Translates a lottery tuple from one alphabet to another.
	 * The translation is based on the positional correspondence between the origin and target alphabets.
	 *
	 * @param tuple              The tuple of numbers to translate.
	 * @param originAlphabet     The alphabet of numbers from which the translation is performed.
	 * @param targetAlphabet     The alphabet of numbers to which the translation is performed.
	 * @returns                  The translated tuple.
	 *
	 * @throws Error if the origin or target alphabet is invalid.
	 * @throws Error if the tuple contains numbers not present in the origin alphabet.
	 *
	 * Example:
	 * translate([1, 2, 3], [1, 2, 3, 4], [10, 20, 30, 40]) => [10, 20, 30]
	 */
	public static translate(tuple: Tuple, originAlphabet: Tuple, targetAlphabet: Tuple): Tuple {
		if (!originAlphabet || !targetAlphabet) throw new Error('Invalid origin or target alphabet.');
		const translatedTuple: Tuple = [];
		const originMap = new Map<number, number>();

		// Build a map for quick lookups from origin to target numbers
		for (let i = 0; i < originAlphabet.length; i++) {
			originMap.set(originAlphabet[i], targetAlphabet[i]);
		}

		for (const num of tuple) {
			if (!originMap.has(num)) throw new Error(`Number ${num} not found in the origin alphabet.`);
			translatedTuple.push(originMap.get(num)!);
		}
		return translatedTuple;
	}


	/**
	 * Translates an array of lottery tuples from one alphabet to another.
	 * This method iterates over each tuple in the input array and applies the
	 * `translate` function to it, returning an array of the translated tuples.
	 *
	 * @param tuples             The array of tuples to translate.
	 * @param originAlphabet     The alphabet of numbers from which the translation is performed.
	 * @param targetAlphabet     The alphabet of numbers to which the translation is performed.
	 * @returns                  An array containing all the translated tuples.
	 *
	 * @throws Error if the origin or target alphabet is invalid.
	 * @throws Error if any Tuple in the array contains numbers not in the origin alphabet.
	 */
	public static translateAll(tuples: Tuple[], originAlphabet: Tuple, targetAlphabet: Tuple): Tuple[] {
		return tuples.map(Tuple =>
			TupleHelper.translate(Tuple, originAlphabet, targetAlphabet)
		);
	}


	/**
	 * Generates a flat sequence of lottery numbers that increment from 1 up to a given maximum,
	 * then cycle back to 1.
	 *
	 * @param totalBalls       The total number of balls in the lottery (e.g., 56 for Keno, 50 for Euromillions).
	 * @param tuplesToProduce  The number of tuples to generate.
	 * @param tupleSize        The number of numbers per tuple.
	 * @returns                A flat sequence of numbers (Tuple).
	 *
	 * Example:
	 * generateLotteryNumbers(10, 3, 5) =>
	 *   [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5]
	 */
	public static generateLotteryNumbers(
		totalBalls: number,
		tuplesToProduce: number,
		tupleSize: number
	): number[] {
		const totalNumbers: number = tuplesToProduce * tupleSize;
		const numbers: number[] = [];

		for (let i = 0; i < totalNumbers; i++) {
			const number: number = (i % totalBalls) + 1;
			numbers.push(number);
		}
		return numbers;
	}




	/**
	 * Give the union between 2 lottery tuples
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @param duplicate if true then duplicate balls number are kept (default false). Otherwise only unique numbers are returned.
	 * @return          array containing all balls inside arr1 and arr2.
	 */
	public static union(arr1:Tuple, arr2:Tuple, duplicate:boolean = false): Tuple {
		if (!arr1) return duplicate ? arr2 : Array.from(new Set(arr2));
		if (!arr2) return duplicate ? arr1 : Array.from(new Set(arr1));

		if (duplicate) return [...arr1, ...arr2];
		return Array.from(new Set([...arr1, ...arr2]));
	}


	/**
	 * Give the intersection between 2 lottery tuples
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          array containing balls both inside arr1 and arr2.
	 */
	public static intersection(arr1:Tuple, arr2:Tuple): Tuple {
		if (!arr1 || !arr2) return [];
		const set2 = new Set(arr2);
		return arr1.filter(item => set2.has(item));
	}


	/**
	 * Give the difference between 2 lottery tuples
	 * It gives the elements of "arr1" minus the elements of "arr2"
	 * @param arr1      array of balls number.
	 * @param arr2      array of balls number.
	 * @return          array containing balls of arr1 that are not inside arr2.
	 */
	public static difference(arr1:Tuple, arr2:Tuple): Tuple {
		if (!arr1) return [];
		if (!arr2) return arr1;
		const set2 = new Set(arr2);
		return arr1.filter(item => !set2.has(item));
	}


	/**
	 * Give the distance of a lottery tuple relatively to a global alphabet
	 * The distance is the difference between the two furthest items of the input tuple.
	 * @param alphabet      array of balls number.
	 * @param tuple         array of balls number.
	 * @return              minimum gap.
	 */
	public static distance(alphabet:Tuple, tuple:Tuple): number {
		if (!alphabet) return -1;
		if (!tuple) return -1;
		if (tuple.length <= 1) return 0;
		tuple.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(tuple[0]) === -1) return -1;				// Item not in alphabet
		if (alphabet.indexOf(tuple[tuple.length-1]) === -1) return -1;	// Item not in alphabet
		const distance = alphabet.indexOf(tuple[tuple.length-1]) - alphabet.indexOf(tuple[0]);
		return distance;
	}


	/**
	 * Give the minimum gap of a lottery tuple relatively to a global alphabet
	 * The minimum gap is the smallest distance between two consecutive items of the input tuple.
	 * @param alphabet      array of balls number.
	 * @param tuple         array of balls number.
	 * @return              minimum gap.
	 */
	public static minimum_gap(alphabet:Tuple, tuple:Tuple): number {
		if (!alphabet) return -1;
		if (!tuple) return -1;
		if (tuple.length <= 1) return 0;
		tuple.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(tuple[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(tuple[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(tuple[1]) - alphabet.indexOf(tuple[0]);
		let minGap = gap;

		for (let j = 1; j < tuple.length-1; j++) {
			if (alphabet.indexOf(tuple[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(tuple[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(tuple[j+1]) - alphabet.indexOf(tuple[j]);
			if (gap < minGap) minGap = gap;
		}

		gap = alphabet.length + alphabet.indexOf(tuple[0]) - alphabet.indexOf(tuple[tuple.length-1]);
		if (gap < minGap) minGap = gap;

		return minGap;
	}


	/**
	 * Give the minimum right gap of a lottery tuple relatively to a global alphabet
	 * The minimum right gap is the smallest distance between two consecutive items on the right of the input tuple.
	 * @param alphabet      array of balls number.
	 * @param tuple         array of balls number.
	 * @return              minimum gap.
	 */
	public static minimum_right_gap(alphabet:Tuple, tuple:Tuple): number {
		if (!alphabet) return -1;
		if (!tuple) return -1;
		if (tuple.length <= 1) return 0;
		tuple.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(tuple[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(tuple[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(tuple[1]) - alphabet.indexOf(tuple[0]);
		let minGap = gap;

		for (let j = 1; j < tuple.length-1; j++) {
			if (alphabet.indexOf(tuple[j]) === -1) return -1;	// Item not in alphabet
			if (alphabet.indexOf(tuple[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(tuple[j+1]) - alphabet.indexOf(tuple[j]);
			if (gap < minGap) minGap = gap;
		}

		return minGap;
	}


	/**
	 * Give the maximum gap of a lottery tuple relatively to a global alphabet
	 * The maximum gap is the biggest distance between consecutives items of the input tuple (great-circle distance or spherical distance).
	 * @param alphabet      array of balls number.
	 * @param tuple         array of balls number.
	 * @return              maximum gap.
	 */
	public static maximum_gap(alphabet:Tuple, tuple:Tuple): number {
		if (!alphabet) return -1;
		if (!tuple) return -1;
		if (tuple.length <= 1) return 0;
		tuple.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(tuple[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(tuple[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(tuple[1]) - alphabet.indexOf(tuple[0]);
		let maxGap = gap;
		let previousGap = 0;

		for (let j = 1; j < tuple.length-1; j++) {
			if (alphabet.indexOf(tuple[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(tuple[j+1]) === -1) return -1;	// Item not in alphabet
			gap = alphabet.indexOf(tuple[j+1]) - alphabet.indexOf(tuple[j]);
			if (gap > maxGap) { previousGap = maxGap; maxGap = gap; }
			else if (gap > previousGap) { previousGap = gap; }
		}

		gap = alphabet.length + alphabet.indexOf(tuple[0]) - alphabet.indexOf(tuple[tuple.length-1]);
		if (gap > maxGap) { previousGap = maxGap; maxGap = gap; }
		else if (gap > previousGap) { previousGap = gap; }

		return previousGap;
	}


	/**
	 * Give the maximum right gap of a lottery tuple relatively to a global alphabet
	 * The maximum right gap is the biggest distance between consecutives items on the right of the input tuple.
	 * @param alphabet      array of balls number.
	 * @param tuple         array of balls number.
	 * @return              maximum gap.
	 */
	public static maximum_right_gap(alphabet:Tuple, tuple:Tuple): number {
		if (!alphabet) return -1;
		if (!tuple) return -1;
		if (tuple.length <= 1) return 0;
		tuple.sort((a, b) => {
			return alphabet.indexOf(a) - alphabet.indexOf(b);
		});

		if (alphabet.indexOf(tuple[0]) === -1) return -1;		// Item not in alphabet
		if (alphabet.indexOf(tuple[1]) === -1) return -1;		// Item not in alphabet
		let gap = alphabet.indexOf(tuple[1]) - alphabet.indexOf(tuple[0]);
		let maxGap = gap;

		for (let j = 1; j < tuple.length-1; j++) {
			if (alphabet.indexOf(tuple[j]) === -1) return -1;		// Item not in alphabet
			if (alphabet.indexOf(tuple[j+1]) === -1) return -1;		// Item not in alphabet
			gap = alphabet.indexOf(tuple[j+1]) - alphabet.indexOf(tuple[j]);
			if (gap > maxGap) {
				maxGap = gap;
			}
		}

		return maxGap;
	}


	/**
	 * Compute the complement tuple of a lottery tuple relatively to a global alphabet
	 * @param alphabet      array of balls number.
	 * @param tuple         array of balls number.
	 * @return              array containing balls numbers of the complement tuple.
	 */
	public static complement(alphabet:Tuple, tuple:Tuple): Tuple|null {
		if (!alphabet) return null;
		if (!tuple) return null;

		const complement:number[] = [];
		complement.length = tuple.length;

		for (let j = 0; j < tuple.length; j++) {
			if (alphabet.indexOf(tuple[j]) === -1) return null;		// Item not in alphabet

			const pos:number = alphabet.indexOf(tuple[j]);
			complement[j] = alphabet[alphabet.length-1 - pos];
		}
		return complement;
	}





/**
 * Structural diversity (internal signature) score for a tuple:
 * - guarantee = 2 : number of distinct internal differences
 * - guarantee > 2 : number of distinct internal signatures of size `guarantee`
 *
 * @param tuple       input tuple
 * @param guarantee   size of internal subsets
 * @param modulo      size of the universe
 * @returns           number of distinct signatures
 */
public static diversityScore(
	tuple: Tuple,
	guarantee: number,
	modulo: number
): number {
	if (!tuple || tuple.length < guarantee || modulo < guarantee) return 0;
	if (guarantee < 2) return 0;
	
	
	
	// Fast path: guarantee = 2 → distinct differences
	if (guarantee === 2) {
		const diffs = new Set<number>();
		const n = tuple.length;

		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = Math.abs(tuple[j] - tuple[i]);

				if (modulo) {
					d %= modulo;
					d = Math.min(d, modulo - d);
				}

				if (d > 0) diffs.add(d);
			}
		}
		return diffs.size;
	}

	// Generic path: guarantee > 2 → distinct signatures
	const signatures = new Set<string>();

	// local helper: iterate k-subsets without allocating all of them
	const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);
	const n = tuple.length;

	const addSignature = (indices: number[]) => {
		const values = indices.map(i => tuple[i]).slice().sort((a, b) => a - b);
		const base = values[0];
		const normalized = values.map(x => x - base);

		// signature = sorted list of internal pairwise diffs (optionally modulo-reduced)
		const diffs: number[] = [];
		for (let i = 0; i < normalized.length; i++) {
			for (let j = i + 1; j < normalized.length; j++) {
				let d = Math.abs(normalized[j] - normalized[i]);
				if (modulo) {
					d %= modulo;
					d = Math.min(d, modulo - d);
				}
				diffs.push(d);
			}
		}
		diffs.sort((a, b) => a - b);
		signatures.add(diffs.join(','));
	};

	// iterate combinations of indices (0..n-1 choose guarantee)
	while (true) {
		addSignature(idx);

		// next combination
		let i = guarantee - 1;
		while (i >= 0 && idx[i] === i + n - guarantee) i--;
		if (i < 0) break;

		idx[i]++;
		for (let j = i + 1; j < guarantee; j++) {
			idx[j] = idx[j - 1] + 1;
		}
	}

	return signatures.size;
	
	
	
	
if (guarantee === 2) {
	const diffs = new Set<number>();
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			let d = values[j] - values[i];
			d = d % modulo;
			d = Math.min(d, modulo - d);
			if (d > 0) diffs.add(d);
		}
	}
	return diffs.size;
}

	
	
	
	
	// Normalize input to 0..modulo-1 if you use 1..modulo in your library.
	// If your tuples are already 0-based, remove this mapping.
	const values = tuple.map(x => ((x - 1) % modulo + modulo) % modulo).sort((a, b) => a - b);
	const values = tuple.map(x => ((x % modulo) + modulo) % modulo).sort((a,b)=>a-b);


	const sigs = new Set<string>();
	const n = values.length;

	// Iterate k-combinations of indices without allocating all subsets
	const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);

	const pushSignature = () => {
		const subset: number[] = new Array(guarantee);
		for (let i = 0; i < guarantee; i++) subset[i] = values[idx[i]];
		subset.sort((a, b) => a - b);

		// Translation normalization (make min = 0)
		const base = subset[0];
		for (let i = 0; i < guarantee; i++) subset[i] = subset[i] - base; // no wrap needed for sorted lottery-style values

		// For guarantee=2, subset is [0, d]; this naturally counts distinct differences
		sigs.add(subset.join(','));
	};

	while (true) {
		pushSignature();

		// next combination of indices
		let i = guarantee - 1;
		while (i >= 0 && idx[i] === i + n - guarantee) i--;
		if (i < 0) break;

		idx[i]++;
		for (let j = i + 1; j < guarantee; j++) idx[j] = idx[j - 1] + 1;
	}

	return sigs.size;
	
	
	
	
	// 1) Canonical form
	const values = [...tuple].sort((a, b) => a - b);

	const signatures = new Set<string>();
	const n = values.length;

	// 2–4) Sliding window
	for (let i = 0; i <= n - guarantee; i++) {
		const base = values[i];
		const sig: number[] = new Array(guarantee);

		for (let j = 0; j < guarantee; j++) {
			sig[j] = values[i + j] - base;
		}

		// signature as canonical string
		signatures.add(sig.join(','));
	}

	return signatures.size;
	
	
	
	
	
	
	// 1) Canonicalize input
	const values = [...tuple].sort((a, b) => a - b);
	const n = values.length;

	const signatures = new Set<string>();

	// 2) Iterate all k-subsets of indices without storing them
	const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);

	const addSignature = () => {
		// build sorted subset (already sorted because values sorted + idx increasing)
		// compute consecutive gaps
		let prev = values[idx[0]];
		const gaps: number[] = new Array(guarantee - 1);

		for (let i = 1; i < guarantee; i++) {
			const cur = values[idx[i]];
			gaps[i - 1] = cur - prev;
			prev = cur;
		}

		// canonical key
		signatures.add(gaps.join(','));
	};

	while (true) {
		addSignature();

		// next combination (lexicographic)
		let i = guarantee - 1;
		while (i >= 0 && idx[i] === i + n - guarantee) i--;
		if (i < 0) break;

		idx[i]++;
		for (let j = i + 1; j < guarantee; j++) {
			idx[j] = idx[j - 1] + 1;
		}
	}

	return signatures.size;	
	
	
const bitsPerGap = Math.ceil(Math.log2(modulo + 1));

	

	
	

	
	
}


private static packGapsBigInt(gaps: number[], bitsPerGap: number): bigint {
	let key = 0n;
	const shift = BigInt(bitsPerGap);
	for (let i = 0; i < gaps.length; i++) {
		key = (key << shift) | BigInt(gaps[i]);
	}
	return key;
}
//Et tu stockes dans Set<bigint>



public static diversityScore2(tuple: Tuple, modulo: number): number {
	const a = [...tuple].sort((x,y)=>x-y);
	const maxD = Math.floor(modulo / 2);
	// bitset sur maxD+1 bits
	const bits = new Uint32Array(Math.ceil((maxD + 1) / 32));

	let count = 0;
	for (let i = 0; i < a.length; i++) {
		for (let j = i + 1; j < a.length; j++) {
			let d = a[j] - a[i];
			d %= modulo;
			d = Math.min(d, modulo - d);
			if (d === 0) continue;
			const w = d >>> 5;
			const m = 1 << (d & 31);
			if ((bits[w] & m) === 0) { bits[w] |= m; count++; }
		}
	}
	return count;
}






	/**
	 * Factorial function
	 * @param n         integer value
	 * @return          factorial value of n as bigint
	 */
	public static factorial(n: number): bigint {
		if (n < 0) return -1n;
		let result = 1n;
		for (let i = 1n; i <= BigInt(n); i++) { result *= i; }
		return result;
	}


	/**
	 * Binomial coefficient function
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param n         integer value
	 * @return          binomial coefficient value of (max, n)
	 */
	public static binomial(max:number, n:number): bigint {
		if (n < 0 || n > max) return 0n;
		if (n === 0 || n === max) return 1n;
		
		n = Math.min(n, max - n);		// C(max, n) = C(max, max-n)
		let result = 1n;
		const maxBig = BigInt(max);
		
		for (let i = 1n; i <= BigInt(n); i++) { result = result * (maxBig - i + 1n) / i; }
		return result;
	}







	/**
	 * Great common divisor
	 * @param a         integer value
	 * @param b         integer value
	 * @return          great common divisor value of "a" and "b"
	 */
	public static gcd(a:number, b:number): number {
		if (a < b) return TupleHelper.gcd(b,a);
		const r:number = a%b; if (r !== 0) return TupleHelper.gcd(b,r);
		return b;
	}


	/**
	 * Least common multiplier
	 * @param a         integer value
	 * @param b         integer value
	 * @return          least common multiplier value of "a" and "b"
	 */
	public static lcm(a:number, b:number): number {
		return a*b/TupleHelper.gcd(a,b);
	}
}





	/**
	 * Give the rank of a given tuple
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param numbers   array of balls number (Tuple).
	 * @return          the rank of the tuple.
	 */
	/*public static TupleToRank (max:number, numbers:number[]): number {
		if (max < 0) return -1;
		if (!numbers) return -1;
		const len:number = numbers.length;
		numbers.sort((a, b) => {return a - b;});

		let rank:number = TupleHelper.binomial(max, len);
		for (let i = len; i > 0; i--) {
			if (numbers[len-i] > max) return -1;
			rank -= TupleHelper.binomial(max-numbers[len-i]+1, i);
			if (i > 1) rank += TupleHelper.binomial(max-numbers[len-i], i-1);
		}
		rank++;
		return rank;
	}*/


	/**
	 * Give the tuple corresponding to the given rank
	 * @param max       the maximum possible number value used in balls numbers.
	 * @param length    the length of the tuple to be returned.
	 * @param rank      the rank of the tuple to be returned.
	 * @return          the tuple corresponding to the given rank.
	 */
	/*public static rankToTuple (max:number, length:number, rank:number): number[] {
		if (max <= 0) return [];
		if (length <= 0) return [];
		if (length > max) return [];
		if (rank <= 0 || rank > TupleHelper.binomial(max, length)) return [];
		// eslint-disable-next-line
		const numbers = Array.from({ length: length }, (_, i) => 0);

		for (let i = 0; i < length; i++) {
			for (let k = max; k >= length; k--) {
				let m = k;
				for (let j = length-1; j >= i; j--) { numbers[j] = m; m--; }
				if (TupleHelper.TupleToRank(max, numbers) <= rank) break;
			}
		}
		return numbers;
	}*/
	

	/*

const lotteryFacility = require('./dist/lotteryfacility-nodebundle.umd.js');

var a1 = lotteryFacility.TupleHelper.splitAndExtract_Nminus1([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 2);

var a1 = lotteryFacility.TupleHelper.splitAndExtract_Nminus1([1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
41, 42, 43, 44, 45, 46, 47, 48, 49, 50], 3);
for (let i = 0; i < a1.length; i++) { console.log(a1[i]); }

var a2 = [];
for (let i = 0; i < a1.length; i++) {
	var a = lotteryFacility.TupleHelper.splitAndExtract_Nminus1(a1[i], 2);
	a2 = lotteryFacility.TupleHelper.concat(a2, a);
}
//for (let i = 0; i < a2.length; i++) { console.log(a2[i]); }

var a3 = [];
for (let i = 0; i < a2.length; i++) {
	var a = lotteryFacility.TupleHelper.splitAndExtract_Nminus1(a2[i], 3);
	a3 = lotteryFacility.TupleHelper.concat(a3, a);
}
//for (let i = 0; i < a3.length; i++) { console.log(a3[i]); }

	*/



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
	"!=": (a: number, b: number) => a !== b,
	">=": (a: number, b: number) => a >= b,
	 ">": (a: number, b: number) => a  > b,
	 "*": (hits: number, total: number) => hits === total
};


export interface TupleFilter {
	setTuple (tuple: Tuple): void;		// set the current tested tuple
	isSelected(): boolean;				// true if the tuple is accepted by the filter, false otherwise
	select(): void;						// the tuple is selected by the filter
}


export class TupleFilterPipeline {
	private _filters: TupleFilter[] = [];


	/**
	 * Add a filter to the pipeline
	 * @param filter      a tuple filter
	 * @return            none
	 */
	addFilter(filter: TupleFilter): void {
		this._filters.push(filter);
	}


	/**
	 * Test a tuple through all filters in the pipeline
	 * @param tuple      tuple to be tested
	 * @return           true if the Tuple passes all filters, false otherwise
	 */
	isSelected(tuple: Tuple): boolean {
		return this._filters.every(filter => {
			filter.setTuple(tuple);
			return filter.isSelected();
		});
	}


	/**
	 */
	select(tuple: Tuple): void {
		for (const filter of this._filters) {
			filter.setTuple(tuple);
			if (!filter.isSelected()) {
				return;
			}
		}

		for (const filter of this._filters) {
			filter.select();
		}
	};
}


export class LengthFilter implements TupleFilter {
	private _tuple: Tuple | null = null;
	private _lengthComparator: (a: number, b: number) => boolean;


	/**
	 * Creates a filter for length-based comparisons to a specific length reference.
	 * @param _lengthReference      the reference length
	 * @param _lengthOperator       a length comparison operator
	 */
	constructor(
		private _lengthReference: number,
		private _lengthOperator: keyof typeof comparisonOperators,
	) {
		// super();
		if (_lengthReference < 0 || !Number.isFinite(_lengthReference)) throw new Error('Invalid parameter');
		this._lengthComparator = comparisonOperators[_lengthOperator];
	}


	/**
	 * Set the current tuple to be tested.
	 * @param tuple      the tuple to set
	 * @return           none
	 */
	setTuple(tuple: Tuple): void {
		if (!tuple) throw new Error("No engaged Tuple");
		this._tuple = tuple;
	}


	/**
	 * Allow tuples lower than (or equal)/upper than (or equal) a specific length.
	 * @return    true if the tuple matches the comparison criteria, false otherwise
	 */
	isSelected(): boolean {
		if (!this._tuple) return false;
		return this._lengthComparator(this._tuple.length, this._lengthReference);
	}


	/**
	 */
	select(): void {};
}


export class InMemoryCollisionFilter implements TupleFilter {
	private _tuple: Tuple | null = null;
	
	private _levelComparator: (a: number, b: number) => boolean;
	private _scoreComparator: (a: number, b: number) => boolean;
	private _score: number = 0;


	get currentScore(): number {
		return this._score;
	}


	/**
	 * Creates a filter for collision-based comparisons to a specific collision level reference.
	 * @param _filterTuples         an array of the filter Tuples stored in memory
	 * @param _levelReference             the reference level of collisions
	 * @param _levelOperator              a collisions level comparison operator
	 * @param _scoreReference             the reference score
	 * @param _scoreOperator              a score comparison operator
	 * @param _weight                     the weight of matching lines of filter, used to compute the score (default value is 1)
	 */
	constructor(
		private _filterTuples: Tuple[],
		private _levelReference: number,
		private _levelOperator: keyof typeof comparisonOperators,
		private _scoreReference: number,
		private _scoreOperator: keyof typeof comparisonOperators,
		private _weight: number = 1,
	) {
		// super();
		if (!Array.isArray(_filterTuples) || _filterTuples.length === 0) throw new Error("Wrong Tuples array.");
		if (_levelReference < 0 || !Number.isFinite(_levelReference)) throw new Error("Invalid level reference.");
		if (_scoreReference < 0 || !Number.isFinite(_scoreReference)) throw new Error("Invalid score reference.");
		this._scoreComparator = comparisonOperators[this._scoreOperator];
		this._levelComparator = comparisonOperators[this._levelOperator];
	}


	/**
	 * Set the current Tuple to be tested.
	 * @param tuple      the Tuple to set, and computes its score
	 * @return           none
	 */
	setTuple(tuple: Tuple): void {
		if (!tuple) throw new Error("No engaged Tuple");
		this._tuple = tuple;

		let nbHits: number = 0;
		for (const filterTuple of this._filterTuples) {
			const collisionsCount = TupleHelper.collisionsCount(this._tuple, filterTuple);
			if (this._levelComparator(collisionsCount, this._levelReference)) nbHits++;
		}
		this._score = nbHits * this._weight;
	}


	/**
	 * Allow tuples with score lower than (or equal)/upper than (or equal) a specific score reference.
	 * @return     true if the tuple matches the score criteria, false otherwise.
	 */
	isSelected(): boolean {
		if (!this._tuple) return false;
		return this._scoreComparator(this._score, this._scoreReference);
	}


	/**
	 */
	select(): void {};
}


/*export class InMemoryMaxCollisionFilter implements TupleFilter {
}*/


class InMemoryCoverageFilter implements TupleFilter {
	private _filterCoverage: number[];
	private _tuple: Tuple | null = null;
	
	private _levelComparator: (a: number, b: number) => boolean;
	private _scoreComparator: (a: number, b: number) => boolean;
	private _score: number = 0;


	get currentScore(): number {
		return this._score;
	}


	/**
	 * Creates a filter for coverage-based comparisons to a specific coverage level reference.
	 * @param _filterTuples         an array of the filter Tuples stored in memory
	 * @param _levelReference             the reference level of coverage
	 * @param _levelOperator              a coverage level comparison operator
	 * @param _scoreReference             the reference score
	 * @param _scoreOperator              a score comparison operator
	 * @param _weight                     the weight of matching lines of filter, used to compute the score (default value is 1)
	 */
	constructor(
		private _filterTuples: Tuple[],
		private _levelReference: number,
		private _levelOperator: keyof typeof comparisonOperators,
		private _scoreReference: number,
		private _scoreOperator: keyof typeof comparisonOperators,
		private _weight: number = 1,
	) {
		// super();
		if (!Array.isArray(_filterTuples) || _filterTuples.length === 0) throw new Error("Wrong Tuples array.");
		if (_levelReference < 0 || !Number.isFinite(_levelReference)) throw new Error("Invalid level reference.");
		if (_scoreReference < 0 || !Number.isFinite(_scoreReference)) throw new Error("Invalid score reference.");
		this._scoreComparator = comparisonOperators[this._scoreOperator];
		this._levelComparator = comparisonOperators[this._levelOperator];
		
		this._filterCoverage = new Array(this._filterTuples.length).fill(0);
	}


	/**
	 * Set the current tuple to be tested.
	 * @param tuple      the tuple to set, and computes its score
	 * @return           none
	 */
	setTuple(tuple: Tuple): void {
		if (!tuple) throw new Error("No engaged Tuple");
		this._tuple = tuple;

		let nbHits: number = 0;
		for (let i = 0; i < this._filterTuples.length; i++) {
			const filterTuple = this._filterTuples[i];
			const collisionsCount = TupleHelper.collisionsCount(this._tuple, filterTuple);
			if (collisionsCount != filterTuple.length && collisionsCount != this._tuple.length) continue;
			if (this._levelComparator(this._filterCoverage[i], this._levelReference)) nbHits++;
		}
		this._score = nbHits * this._weight;
	}


	/**
	 * Allow tuples with score lower than (or equal)/upper than (or equal) a specific score reference.
	 * @return   true if the tuple matches the score criteria, false otherwise
	 */
	isSelected(): boolean {
		if (!this._tuple) return false;
		return this._scoreComparator(this._score, this._scoreReference);
	}


	/**
	 */
	select(): void {
		if (!this._tuple) return;
		for (let i = 0; i < this._filterTuples.length; i++) {
			const filterTuple = this._filterTuples[i];
			const collisionsCount = TupleHelper.collisionsCount(this._tuple, filterTuple);
			if (collisionsCount != filterTuple.length && collisionsCount != this._tuple.length) continue;
			if (this._levelComparator(this._filterCoverage[i], this._levelReference)) this._filterCoverage[i]++;
		}
	};
}









/*
// Filtre de collision basé sur un fichier de combinaisons
class FileBasedCollisionFilter implements TupleFilter {
    private TupleSet: Set<string> = new Set();

    constructor(filePath: string) {
        this.loadTuplesFromFile(filePath);
    }

    private loadTuplesFromFile(filePath: string): void {
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split(/\r?\n/);
        for (const line of lines) {
            const Tuple = line.trim().split(/\s+/).map(Number);
            if (Tuple.length > 0) {
                this.TupleSet.add(Tuple.join(','));
            }
        }
    }

    select(Tuple: Tuple): boolean {
        return this.TupleSet.has(Tuple.join(','));
    }
}
*/

/*
// Fonction pour traiter le flux de combinaisons depuis un fichier
async function processTupleFile(filePath: string, pipeline: TupleFilterPipeline, onAccept: (Tuple: Tuple) => void): Promise<void> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        const Tuple = line.trim().split(/\s+/).map(Number);
        if (pipeline.select(Tuple)) {
            onAccept(Tuple);  // Gestion de la combinaison acceptée
        }
    }
}
*/



// Exemple d'utilisation
/*(async () => {
    const pipeline = new TupleFilterPipeline();

    // Ajouter des filtres au pipeline
    pipeline.addFilter(new NumberCountFilter(3, 6));  // Combinaisons de 3 à 6 numéros
    pipeline.addFilter(new AverageFilter(10, 50));    // Moyenne entre 10 et 50

    // Ajouter un filtre de collision avec des combinaisons en mémoire
    const memoryTuples: Tuple[] = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];
    pipeline.addFilter(new CollisionFilter(memoryTuples));

    // Ajouter un filtre de collision basé sur un fichier
    const collisionFilePath = 'path/to/collision_Tuples.txt';
    pipeline.addFilter(new FileBasedCollisionFilter(collisionFilePath));

    // Gestionnaire pour les combinaisons acceptées
    const acceptedTuples: Tuple[] = [];
    function handleAcceptedTuple(Tuple: Tuple) {
        acceptedTuples.push(Tuple);
    }

    // Traitement du fichier contenant les combinaisons d'entrée
    const inputFilePath = 'path/to/input_Tuples.txt';
    await processTupleFile(inputFilePath, pipeline, handleAcceptedTuple);

    console.log('Combinaisons acceptées:', acceptedTuples);
})();*/




