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
     * Compute the sum of all numbers in a lottery tuple.
     * @param numbers   array of balls number.
     * @return          the sum of all elements. Returns 0 if numbers is null or empty.
     * * Example:
     * sum([1, 2, 3, 4]) => 10
     */
    public static sum(numbers: Tuple | null): number {
        if (!numbers || numbers.length === 0) return 0;
        return numbers.reduce((acc, val) => acc + val, 0);
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
	 * Positive offsets rotate to the right, negative offsets rotate to the left.
	 * Elements shifted off the end are wrapped around to the beginning.
	 * 
	 * @param array   The array of numbers to rotate.
	 * @param offset  The number of positions to rotate the array by (right if > 0, left if < 0).
	 * @returns       A new array with elements rotated by the given offset.
	 *
	 * Example:
	 * rotate([1, 2, 3, 4], 1) => [4, 1, 2, 3]
	 * rotate([1, 2, 3, 4], -1) => [2, 3, 4, 1]
	 */
	public static rotate(array: number[], offset: number): number[] {
		return array.slice(-offset).concat(array.slice(0, -offset));
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
		return tuples.map(tuple => TupleHelper.translate(tuple, originAlphabet, targetAlphabet));
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
	 * Computes the minimum linear gap of a lottery tuple.
	 *
	 * The gap is defined as the difference between two consecutive
	 * elements of the tuple after sorting in ascending order.
	 *
	 * No circular wrap-around is applied.
	 *
	 * Example:
	 *  tuple = [3, 10, 40]
	 *  gaps  = [7, 30]
	 *  result = 7
	 *
	 * @param tuple   Array of selected lottery numbers.
	 * @return        The minimum linear gap, or:
	 *                - -1 if tuple is null
	 *                -  0 if tuple has 0 or 1 element
	 */
	public static linearMinimumGap(tuple: number[]): number {
	  if (!tuple) return -1;
	  if (tuple.length <= 1) return 0;
	  const sorted = [...tuple].sort((a, b) => a - b);
	  let minGap = Number.POSITIVE_INFINITY;

	  for (let i = 0; i < sorted.length - 1; i++) {
		const gap = sorted[i + 1] - sorted[i];
		if (gap < minGap) minGap = gap;
	  }

	  return minGap === Number.POSITIVE_INFINITY ? 0 : minGap;
	}


	/**
	 * Computes the minimum circular gap of a lottery tuple using a modular pool.
	 *
	 * The gap is defined as the clockwise distance between two consecutive
	 * elements of the tuple after sorting, including the circular wrap-around
	 * gap between the last and the first element.
	 *
	 * Example (poolSize = 50):
	 *  tuple = [3, 10, 40]
	 *  gaps  = [7, 30, 13]  // (10-3, 40-10, 50+3-40)
	 *  result = 7
	 *
	 * @param tuple     Array of selected lottery numbers.
	 * @param poolSize  Size of the circular pool.
	 * @return          The minimum circular gap, or:
	 *                  - -1 if parameters are invalid
	 *                  -  0 if tuple has 0 or 1 element
	 */
	public static modularMinimumGap(tuple: number[], poolSize: number): number {
	  if (!tuple) return -1;
	  if (!Number.isInteger(poolSize) || poolSize < 2) return -1;
	  if (tuple.length <= 1) return 0;
	  const sorted = [...tuple].sort((a, b) => a - b);

	  let minGap = Number.POSITIVE_INFINITY;
	  for (let i = 0; i < sorted.length - 1; i++) {
		const gap = sorted[i + 1] - sorted[i];
		if (gap < minGap) minGap = gap;
	  }

	  const wrapGap = poolSize + sorted[0] - sorted[sorted.length - 1];
	  if (wrapGap < minGap) minGap = wrapGap;

	  return minGap === Number.POSITIVE_INFINITY ? 0 : minGap;
	}


	/**
	 * Computes the maximum linear gap of a lottery tuple.
	 *
	 * The gap is defined as the difference between two consecutive
	 * elements of the tuple after sorting in ascending order.
	 *
	 * No circular wrap-around is applied.
	 *
	 * Example:
	 *  tuple = [3, 10, 40]
	 *  gaps  = [7, 30]
	 *  result = 30
	 *
	 * @param tuple   Array of selected lottery numbers.
	 * @return        The maximum linear gap, or:
	 *                - -1 if tuple is null
	 *                -  0 if tuple has 0 or 1 element
	 */
	public static linearMaximumGap(tuple: number[]): number {
	  if (!tuple) return -1;
	  if (tuple.length <= 1) return 0;

	  const sorted = [...tuple].sort((a, b) => a - b);
	  let maxGap = 0;

	  for (let i = 0; i < sorted.length - 1; i++) {
		const gap = sorted[i + 1] - sorted[i];
		if (gap > maxGap) maxGap = gap;
	  }

	  return maxGap;
	}


	/**
	 * Computes the maximum circular gap of a lottery tuple using a modular pool.
	 *
	 * The gap is defined as the clockwise distance between two consecutive
	 * elements of the tuple after sorting, including the circular wrap-around
	 * gap between the last and the first element.
	 *
	 * Example (poolSize = 50):
	 *  tuple = [3, 10, 40]
	 *  gaps  = [7, 30, 13]  // (10-3, 40-10, 50+3-40)
	 *  result = 30
	 *
	 * @param tuple     Array of selected lottery numbers.
	 * @param poolSize  Size of the circular pool.
	 * @return          The maximum circular gap, or:
	 *                  - -1 if parameters are invalid
	 *                  -  0 if tuple has 0 or 1 element
	 */
	public static modularMaximumGap(tuple: number[], poolSize: number): number {
	  if (!tuple) return -1;
	  if (!Number.isInteger(poolSize) || poolSize < 2) return -1;
	  if (tuple.length <= 1) return 0;

	  const sorted = [...tuple].sort((a, b) => a - b);
	  let maxGap = 0;

	  for (let i = 0; i < sorted.length - 1; i++) {
		const gap = sorted[i + 1] - sorted[i];
		if (gap > maxGap) maxGap = gap;
	  }

	  const wrapGap = poolSize + sorted[0] - sorted[sorted.length - 1];
	  if (wrapGap > maxGap) maxGap = wrapGap;
	  return maxGap;
	}


	/**
	 * Computes the cardinality of the gap spectrum of order `guarantee` for a tuple,
	 * using ALL pairwise linear differences inside each g-subset (not only consecutive gaps).
	 *
	 * The gap spectrum is the set of distinct signatures; this function returns its size.
	 *
	 *
	 * @param tuple      Tuple of numbers (values are sorted ascending internally).
	 * @param guarantee  Size of index subsets (g >= 2).
	 * @returns          Number of distinct gap signatures.
	 */
	public static linearGapSpectrumCardinality(tuple: Tuple, guarantee: number): number {
		if (!tuple || tuple.length < guarantee || guarantee < 2) return 0;

		const sorted = [...tuple].sort((a, b) => a - b);
		const n = sorted.length;
		const signatures = new Set<string>();
		const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);
	
		const addSignatureAllPairs = () => {
			const diffs: number[] = [];
			for (let i = 0; i < guarantee; i++) {
				for (let j = i + 1; j < guarantee; j++) {
					diffs.push(sorted[idx[j]] - sorted[idx[i]]);
				}
			}
			diffs.sort((a, b) => a - b);
			signatures.add(diffs.join(','));
		};

		while (true) {
			addSignatureAllPairs();

			let i = guarantee - 1;
			while (i >= 0 && idx[i] === i + n - guarantee) i--;
			if (i < 0) break;

			idx[i]++;
			for (let j = i + 1; j < guarantee; j++) {
				idx[j] = idx[j - 1] + 1;
			}
		}

		return signatures.size;
	}


	/**
	 * Computes the cardinality of the gap spectrum of order `guarantee`
	 * using ALL pairwise modular (circular) distances inside each g-subset.
	 *
	 * Distance for a pair (a,b) = min((b-a mod v), v-(b-a mod v)) with b>a in the subset.
	 * Signature = sorted list of all such distances.
	 * Distances are in [1, floor(v/2)] (0 is excluded).
	 * No validation is done to ensure tuple values are within [0, v-1].
	 *
	 * @param tuple      Tuple of numbers (values are sorted ascending internally).
	 * @param guarantee  Size of index subsets (g >= 2).
	 * @param poolSize   Size of the circular pool.
	 * @returns          Number of distinct gap signatures.
	 */
	public static modularGapSpectrumCardinality(tuple: number[], guarantee: number, poolSize: number): number {
		if (!tuple || tuple.length < guarantee || guarantee < 2) return 0;
		if (!Number.isFinite(poolSize) || poolSize <= 0) return 0;

		const sorted = [...tuple].sort((a, b) => a - b);
		const n = sorted.length;
		const signatures = new Set<string>();
		const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);
	
		const addSignatureAllPairsMod = () => {
			const diffs: number[] = [];
			for (let i = 0; i < guarantee; i++) {
				for (let j = i + 1; j < guarantee; j++) {
					const a = sorted[idx[i]];
					const b = sorted[idx[j]];
					const d = (b - a) % poolSize; // b>=a since sorted, so d in [0, poolSize)
					const circ = Math.min(d, poolSize - d);
					if (circ !== 0) diffs.push(circ);
				}
			}
			diffs.sort((x, y) => x - y);
			signatures.add(diffs.join(','));
		};

		while (true) {
			addSignatureAllPairsMod();

			let i = guarantee - 1;
			while (i >= 0 && idx[i] === i + n - guarantee) i--;
			if (i < 0) break;

			idx[i]++;
			for (let j = i + 1; j < guarantee; j++) {
				idx[j] = idx[j - 1] + 1;
			}
		}
		return signatures.size;
	}


	/**
	 * Computes the cardinality of the gap spectrum of order `guarantee`
	 * using ALL ordered modular (circular) differences inside each g-subset.
	 *
	 * Difference for a pair (a,b) = (b-a mod v) with a != b in the subset.
	 * This includes "inverse" differences because both orders are counted.
	 * Signature = sorted list of all such differences (excluding 0).
	 * No validation is done to ensure tuple values are within [0, v-1].
	 *
	 * @param tuple      Tuple of numbers (values are sorted ascending internally).
	 * @param guarantee  Size of index subsets (g >= 2).
	 * @param poolSize   Size of the circular pool.
	 * @returns          Number of distinct gap signatures.
	 */
	public static modularGapSpectrumCardinalityWithInverses(tuple: number[], guarantee: number, poolSize: number): number {
		if (!tuple || tuple.length < guarantee || guarantee < 2) return 0;
		if (!Number.isFinite(poolSize) || poolSize <= 0) return 0;

		const sorted = [...tuple].sort((a, b) => a - b);
		const n = sorted.length;
		const signatures = new Set<string>();
		const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);

		const addSignatureAllOrderedPairsMod = () => {
			const diffs: number[] = [];
			for (let i = 0; i < guarantee; i++) {
				for (let j = 0; j < guarantee; j++) {
					if (i === j) continue;
					const a = sorted[idx[i]];
					const b = sorted[idx[j]];
					const d = (b - a) % poolSize;
					if (d !== 0) diffs.push(d);
				}
			}
			diffs.sort((x, y) => x - y);
			signatures.add(diffs.join(','));
		};

		while (true) {
			addSignatureAllOrderedPairsMod();

			let i = guarantee - 1;
			while (i >= 0 && idx[i] === i + n - guarantee) i--;
			if (i < 0) break;

			idx[i]++;
			for (let j = i + 1; j < guarantee; j++) {
				idx[j] = idx[j - 1] + 1;
			}
		}
		return signatures.size;
	}


	/**
	 * Computes the total sum of ALL pairwise linear differences
	 * over all g-subsets of indices.
	 *
	 * @param tuple      Tuple of numbers (values are sorted ascending internally).
	 * @param guarantee  Size of index subsets (g >= 2).
	 * @returns          The total sum of all computed gaps.
	 */
	public static linearGapSpectrumSum(tuple: Tuple, guarantee: number): number {
		if (!tuple || tuple.length < guarantee || guarantee < 2) return 0;

		const sorted = [...tuple].sort((a, b) => a - b);
		const n = sorted.length;
		let totalSum = 0;
		const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);

		const addSubsetAllPairDiffs = () => {
			for (let i = 0; i < guarantee; i++) {
				for (let j = i + 1; j < guarantee; j++) {
					totalSum += (sorted[idx[j]] - sorted[idx[i]]);
				}
			}
		};

		while (true) {
			addSubsetAllPairDiffs();

			let i = guarantee - 1;
			while (i >= 0 && idx[i] === i + n - guarantee) i--;
			if (i < 0) break;

			idx[i]++;
			for (let j = i + 1; j < guarantee; j++) {
				idx[j] = idx[j - 1] + 1;
			}
		}
		return totalSum;
	}


	/**
	 * Computes the total sum of ALL pairwise modular (circular) distances
	 * over all g-subsets of indices.
	 * Distances are in [1, floor(v/2)] (0 is excluded).
	 * No validation is done to ensure tuple values are within [0, v-1].
	 *
	 * @param tuple      Tuple of numbers (values are sorted ascending internally).
	 * @param guarantee  Size of index subsets (g >= 2).
	 * @param poolSize   Size of the circular pool.
	 * @returns          The total sum of all computed circular gaps.
	 */
	public static modularGapSpectrumSum(tuple: number[], guarantee: number, poolSize: number): number {
		if (!tuple || tuple.length < guarantee || guarantee < 2) return 0;
		if (!Number.isFinite(poolSize) || poolSize <= 0) return 0;

		const sorted = [...tuple].sort((a, b) => a - b);
		const n = sorted.length;
		let totalSum = 0;
		const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);
		
		const addSubsetAllPairCircDiffs = () => {
			for (let i = 0; i < guarantee; i++) {
				for (let j = i + 1; j < guarantee; j++) {
					const a = sorted[idx[i]];
					const b = sorted[idx[j]];
					const d = (b - a) % poolSize;
					const circ = Math.min(d, poolSize - d);
					totalSum += circ;
				}
			}
		};

		while (true) {
			addSubsetAllPairCircDiffs();

			let i = guarantee - 1;
			while (i >= 0 && idx[i] === i + n - guarantee) i--;
			if (i < 0) break;

			idx[i]++;
			for (let j = i + 1; j < guarantee; j++) {
				idx[j] = idx[j - 1] + 1;
			}
		}
		return totalSum;
	}


	/**
	 * Computes the total sum of ALL ordered modular (circular) differences
	 * over all g-subsets of indices (includes inverse differences).
	 * Differences are in [1, v-1] (0 is excluded).
	 * No validation is done to ensure tuple values are within [0, v-1].
	 *
	 * @param tuple      Tuple of numbers (values are sorted ascending internally).
	 * @param guarantee  Size of index subsets (g >= 2).
	 * @param poolSize   Size of the circular pool.
	 * @returns          The total sum of all computed ordered modular differences.
	 */
	public static modularGapSpectrumSumWithInverses(tuple: number[], guarantee: number, poolSize: number): number {
		if (!tuple || tuple.length < guarantee || guarantee < 2) return 0;
		if (!Number.isFinite(poolSize) || poolSize <= 0) return 0;

		const sorted = [...tuple].sort((a, b) => a - b);
		const n = sorted.length;
		let totalSum = 0;
		const idx: number[] = Array.from({ length: guarantee }, (_, i) => i);

		const addSubsetAllOrderedPairDiffs = () => {
			for (let i = 0; i < guarantee; i++) {
				for (let j = 0; j < guarantee; j++) {
					if (i === j) continue;
					const a = sorted[idx[i]];
					const b = sorted[idx[j]];
					const d = (b - a) % poolSize;
					if (d !== 0) totalSum += d;
				}
			}
		};

		while (true) {
			addSubsetAllOrderedPairDiffs();

			let i = guarantee - 1;
			while (i >= 0 && idx[i] === i + n - guarantee) i--;
			if (i < 0) break;

			idx[i]++;
			for (let j = i + 1; j < guarantee; j++) {
				idx[j] = idx[j - 1] + 1;
			}
		}

		return totalSum;
	}


	/**
	 * Computes modular difference statistics for a tuple.
	 * By default counts ordered differences, so inverses are included.
	 * Differences are modulo poolSize; 0 is excluded.
	 * No validation is done to ensure tuple values are within [0, poolSize-1].
	 *
	 * @param tuple       Tuple of numbers.
	 * @param poolSize    Size of the circular pool.
	 * @param ordered     If true, count (a,b) and (b,a) separately. Default true.
	 * @returns           Differences list, sum, cardinality, and per-difference counts.
	 *                   `counts` length is poolSize (index 0 unused; valid diffs are 1..v-1).
	 */
	public static modularDifferenceStats(
		tuple: number[],
		poolSize: number,
		ordered: boolean = true,
	): {
		differences: number[];
		sum: number;
		cardinality: number;
		counts: number[];
	} {
		if (!tuple || tuple.length < 2) {
			return { differences: [], sum: 0, cardinality: 0, counts: [] };
		}
		if (!Number.isFinite(poolSize) || poolSize <= 0) {
			return { differences: [], sum: 0, cardinality: 0, counts: [] };
		}

		const sorted = [...tuple].sort((a, b) => a - b);
		const differences: number[] = [];
		const counts: number[] = new Array(poolSize).fill(0);
		let sum = 0;

		if (ordered) {
			for (let i = 0; i < sorted.length; i++) {
				for (let j = 0; j < sorted.length; j++) {
					if (i === j) continue;
					const d = (sorted[j] - sorted[i]) % poolSize;
					if (d === 0) continue;
					differences.push(d);
					counts[d]++;
					sum += d;
				}
			}
		} else {
			for (let i = 0; i < sorted.length; i++) {
				for (let j = i + 1; j < sorted.length; j++) {
					const d = (sorted[j] - sorted[i]) % poolSize;
					if (d === 0) continue;
					differences.push(d);
					counts[d]++;
					sum += d;
				}
			}
		}

		return {
			differences,
			sum,
			cardinality: new Set(differences).size,
			counts,
		};
	}






	/*public static generateGapSeries(max: number, gap: number): Tuple[] {
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
	}*/


	/**
	 * Merge multiple arrays of balls number in an interleaved way
	 * @param arrays     array of Tuple arrays.
	 * @return           merged array.
	 */
	/*public static interleaved_merge(arrays: Array<Tuple>): Tuple {
		let mergedArray: Tuple = [];
		let maxLength = Math.max(...arrays.map(arr => arr.length));

		for (let i = 0; i < maxLength; i++)
			for (let arr of arrays)
				if (i < arr.length) mergedArray.push(arr[i]);
		return mergedArray;
	}*/



	/**
	 * Splits an array into multiple lines, each containing a fixed number of elements
	 * @param array      The array to split.
	 * @param size       The number of elements per line.
	 * @return           A 2D array where each sub-array represents a line.
	 */
	/*public static split_into_lines(array: Tuple, size: number): Tuple[] {
		let result: Tuple[] = [];
		for (let i = 0; i < array.length; i += size) {
			if (i + size <= array.length) {
				result.push(array.slice(i, i + size));
			} else {
				result.push(array.slice(i));
			}
		}
		return result;
	}*/



	/**
	 * All possible extractions of nbParts of input array minus one
	 * @param numbers     array of balls number.
	 * @param nbParts     count of parts to split input array.
	 * @return            all possible concatenations of nbParts of input array excluding one.
	 */
	/*public static splitAndExtract_Nminus1(numbers:Tuple, nbParts:number): Array<Tuple> {
		if (nbParts < 0) throw new Error('Invalid nbParts parameter');
		if (nbParts <= 1) return [];
		if (!numbers) return [];
		if (numbers.length < nbParts) return [];
		const parts: Array<Tuple> = TupleHelper.split (numbers, nbParts);
		return TupleHelper.extract_Nminus1 (...parts);
	}*/


	/**
	 * All possible extractions of parts minus one
	 * @param parts       array of arrays of balls number.
	 * @return            all possible concatenations of input arrays excluding one.
	 */
	/*public static extract_Nminus1(...parts: Array<Tuple>): Array<Tuple> {
		if (!parts) return [];
		if (parts.length <= 1) return [];
		const result: Array<Tuple> = [];
		for (let i = parts.length-1; i >= 0; i--) {
			const remainingParts: Array<Tuple> = parts.filter((_, index) => index !== i);
			const mergedArray = TupleHelper.concat(...remainingParts);
			result.push(mergedArray);
		}
		return result;
	}*/



	/**
	 * Merges consecutive pairs of arrays into a single array
	 * @param parts       array of arrays of balls number.
	 * @return            an array that is half the length of the input array, with consecutive pairs of elements merged.
	 */
	/*public static pairwise_merge(...parts: Array<Tuple>): Array<Tuple> {
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
	}*/



/*
private static packGapsBigInt(gaps: number[], bitsPerGap: number): bigint {
	let key = 0n;
	const shift = BigInt(bitsPerGap);
	for (let i = 0; i < gaps.length; i++) {
		key = (key << shift) | BigInt(gaps[i]);
	}
	return key;
}


private static unpackGapsBigInt(key: bigint, bitsPerGap: number, gapCount: number): number[] {
	const gaps = new Array<number>(gapCount);
	const mask = (1n << BigInt(bitsPerGap)) - 1n;
	for (let i = gapCount - 1; i >= 0; i--) {
		gaps[i] = Number(key & mask);
		key >>= BigInt(bitsPerGap);
	}
	return gaps;
}
*/

// Example:
// const gaps = [2, 3, 5];
// const bits = 3; // enough for max gap <= 7
// const key = TupleHelper.packGapsBigInt(gaps, bits);
// const restored = TupleHelper.unpackGapsBigInt(key, bits, gaps.length);
//Et tu stockes dans Set<bigint>



















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




