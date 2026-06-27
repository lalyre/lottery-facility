'use strict';
export type Tuple = number[];		//export type Tuple<T> = T[];


export type SystemKFrequencyStats = {
	k: number;
	totalPossible: number;
	totalPlacements: number;
	uniqueCovered: number;
	holes: number;
	minFrequency: number;
	maxFrequency: number;
	repeatedCombinations: number;
	duplicatePlacements: number;
	mask: Uint32Array;
};


export type SystemPairFrequencyStats = {
	totalPairs: number;
	coveredPairs: number;
	uncoveredPairs: number;
	totalPlacements: number;
	minFrequency: number;
	maxFrequency: number;
	repeatedPairs: number;
	duplicatePlacements: number;
	mask: Uint32Array;
};


export type SystemTrioFrequencyStats = {
	totalTrios: number;
	coveredTrios: number;
	uncoveredTrios: number;
	totalPlacements: number;
	minFrequency: number;
	maxFrequency: number;
	repeatedTrios: number;
	duplicatePlacements: number;
	mask: Uint32Array;
};


export type NumberNeighborhoodCount = {
	neighbor: number;
	count: number;
};


export type NumberNeighborhoodCounts = {
	ball: number;
	neighbors: NumberNeighborhoodCount[];
	occurencesMin: number;
	occurencesMax: number;
	occurencesRange: number;
	occurencesSum: number;
	occurencesAverage: number;
	degree: number;
};


export const comparisonOperators = {
	 "<": (a: number, b: number) => a  < b,
	"<=": (a: number, b: number) => a <= b,
	"==": (a: number, b: number) => a == b,
	"!=": (a: number, b: number) => a !== b,
	">=": (a: number, b: number) => a >= b,
	 ">": (a: number, b: number) => a  > b,
};


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
		for (let i = 1; i < rowCount; i++)
			if (array[i].length !== colCount)
				throw new Error("All sub-arrays must have the same length for transposition.");

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
		for (let i = 0; i < originAlphabet.length; i++)
			originMap.set(originAlphabet[i], targetAlphabet[i]);

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
	 * Computes the symmetric complement of a tuple relative to an alphabet ordering.
	 * Each element is replaced by the element at the mirrored position in the alphabet.
	 *
	 * Example with alphabet [1, 2, 3, 4, 5]:
	 * symmetricComplement([1,2,3,4,5], [1,3,5]) => [5,3,1]
	 *
	 * @param alphabet      Array of balls number used as the reference ordering.
	 * @param tuple         Array of balls number to mirror inside the alphabet.
	 * @return              Array containing mirrored values, or null if a value is outside the alphabet.
	 */
	public static symmetricComplement(alphabet:Tuple, tuple:Tuple): Tuple|null {
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
	 * Computes the set complement of a tuple relative to a reference alphabet.
	 * It returns all alphabet values that are not present in the tuple.
	 *
	 * Example with alphabet [1, 2, 3, 4, 5]:
	 * setComplement([1,2,3,4,5], [2,4]) => [1,3,5]
	 *
	 * @param alphabet      Reference alphabet.
	 * @param tuple         Tuple to subtract from the alphabet.
	 * @return              The relative complement alphabet \ tuple, or null if tuple contains values outside alphabet.
	 */
	public static setComplement(alphabet:Tuple, tuple:Tuple): Tuple|null {
		if (!alphabet) return null;
		if (!tuple) return null;

		const alphabetSet = new Set(alphabet);
		for (let i = 0; i < tuple.length; i++) {
			if (!alphabetSet.has(tuple[i])) return null;
		}
		return TupleHelper.difference(alphabet, tuple);
	}


	/**
	 * Computes the set complement of every tuple in a system relative to a reference alphabet.
	 *
	 * For each input tuple, this method returns the values from `alphabet` that are not present
	 * in that tuple. In set notation, each returned tuple is:
	 *
	 *     alphabet \ tuple
	 *
	 * This is a pure set-based operation applied line by line. It does not depend on co-occurrence
	 * analysis across the whole system, so it is different from non-adjacency methods such as
	 * `getNumberNonAdjacent(...)` or `getSystemNonAdjacentTuples(...)`.
	 *
	 * Example:
	 * ```ts
	 * const alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	 * const system = [
	 *   [1, 2, 3],
	 *   [4, 5, 6]
	 * ];
	 *
	 * TupleHelper.getSystemSetComplements(system, alphabet);
	 * // => [
	 * //   [4, 5, 6, 7, 8, 9, 10],
	 * //   [1, 2, 3, 7, 8, 9, 10]
	 * // ]
	 * ```
	 *
	 * Validation:
	 * - If `alphabet` is null, returns an empty array.
	 * - If one tuple contains a value outside `alphabet`, that tuple result is `null`.
	 *
	 * @param system    The array of tuples for which set complements must be computed.
	 * @param alphabet  The reference alphabet used as the universal set.
	 * @return          An array of tuples where each entry is the set complement of the
	 *                  corresponding input tuple relative to `alphabet`.
	 */
	public static getSystemSetComplements(system: Tuple[], alphabet: Tuple): Array<Tuple|null> {
		if (!alphabet) return [];
		if (!system) return [];
		return system.map(tuple => TupleHelper.setComplement(alphabet, tuple));
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
	 * Gets the neighborhood of a specific number in a system.
	 * The neighborhood is the set of all unique numbers that appear in the same tuples as the ball.
	 *
	 * @param ball      The reference ball number.
	 * @param system    The array of tuples (the lottery system).
	 * @return          A Tuple containing all unique neighbor numbers.
	 */
	public static getNumberNeighborhood(ball: number, system: Tuple[]): Tuple {
		const neighbors = new Set<number>();
		for (let i = 0; i < system.length; i++) {
			const tuple = system[i];
			if (tuple.includes(ball)) {
				for (let j = 0; j < tuple.length; j++) {
					const num = tuple[j];
					if (num !== ball) neighbors.add(num);
				}
			}
		}
		return Array.from(neighbors);
	}


	/**
	 * Computes the real degree of a number within the system.
	 * The degree is defined as the cardinality of its unique neighborhood.
	 *
	 * @param ball      The ball number.
	 * @param system    The array of tuples.
	 * @return          The number of unique neighbors (distinct connections).
	 */
	public static getNumberNeighborhoodDegree(ball: number, system: Tuple[]): number {
		return TupleHelper.getNumberNeighborhood(ball, system).length;
	}


	/**
	 * Computes the neighborhood degree for every ball of the reference alphabet.
	 *
	 * @param system    The array of tuples (the lottery system).
	 * @param alphabet  The complete reference alphabet used by the system.
	 * @return          An array containing each ball, its neighborhood degree and its neighborhood set.
	 */
	public static getSystemNeighborhoodDegrees(
		system: Tuple[],
		alphabet: Tuple
	): Array<{ ball: number; degree: number; neighborhood: Tuple }> {
		if (!alphabet) return [];

		const uniqueAlphabet = Array.from(new Set(alphabet));
		return uniqueAlphabet.map(ball => {
			const neighborhood = TupleHelper.getNumberNeighborhood(ball, system);
			return {
				ball,
				degree: neighborhood.length,
				neighborhood,
			};
		});
	}









	/**
	 * Gets the non-adjacent numbers of a specific ball in a system.
	 * Non-adjacent numbers are the alphabet values that never appear in the same tuple as the ball.
	 *
	 * @param ball      The reference ball number.
	 * @param system    The array of tuples (the lottery system).
	 * @param alphabet  The complete reference alphabet used by the system.
	 * @return          A Tuple containing all non-adjacent numbers.
	 */
	public static getNumberNonAdjacent(ball: number, system: Tuple[], alphabet: Tuple): Tuple {
		if (!alphabet) return [];

		const neighbors = new Set<number>(TupleHelper.getNumberNeighborhood(ball, system));
		return alphabet
			.filter((num, index, array) => array.indexOf(num) === index)
			.filter(num => num !== ball && !neighbors.has(num));
	}


	/**
	 * Computes the non-adjacent degree of a specific ball in a system.
	 * This is the number of alphabet values that never appear with the ball.
	 *
	 * @param ball      The reference ball number.
	 * @param system    The array of tuples (the lottery system).
	 * @param alphabet  The complete reference alphabet used by the system.
	 * @return          The number of non-adjacent numbers.
	 */
	public static getNumberNonAdjacentDegree(ball: number, system: Tuple[], alphabet: Tuple): number {
		return TupleHelper.getNumberNonAdjacent(ball, system, alphabet).length;
	}


	/**
	 * Computes the non-adjacent degree for every ball of the reference alphabet.
	 *
	 * @param system    The array of tuples (the lottery system).
	 * @param alphabet  The complete reference alphabet used by the system.
	 * @return          An array containing each ball, its non-adjacent degree and its non-adjacent set.
	 */
	public static getSystemNonAdjacentDegrees(
		system: Tuple[],
		alphabet: Tuple
	): Array<{ ball: number; degree: number; nonAdjacent: Tuple }> {
		if (!alphabet) return [];

		const uniqueAlphabet = Array.from(new Set(alphabet));
		return uniqueAlphabet.map(ball => {
			const nonAdjacent = TupleHelper.getNumberNonAdjacent(ball, system, uniqueAlphabet);
			return {
				ball,
				degree: nonAdjacent.length,
				nonAdjacent,
			};
		});
	}








	/**
	 * Gets the neighborhood of a specific number filtered by a co-occurrence threshold.
	 * Only neighbors whose occurrence count with the tested ball satisfies the comparison operator
	 * against the given level are returned.
	 *
	 * @param {number} ball - The reference number to analyze.
	 * @param {number} level - The threshold value for the comparison.
	 * @param {keyof typeof comparisonOperators} comparisonsOperator - The operator to use (e.g., "==", ">=", "<").
	 * @param {Tuple[]} system - The collection of tuples (the dataset).
	 * @param {Tuple} alphabet - The complete set of possible numbers in the system.
	 * @returns {Tuple} A Tuple containing all numbers from the alphabet that satisfy the condition.
	 * @throws {Error} If the level is invalid or the operator is not supported.
	 */
	public static getNumberThresholdNeighborhood(
		ball: number,
		level: number,
		comparisonsOperator: keyof typeof comparisonOperators,
		system: Tuple[],
		alphabet: Tuple,
	): Tuple {
		if (!alphabet) return [];
		if (level < 0 || !Number.isFinite(level)) throw new Error("Invalid level parameter");
		const comparator = comparisonOperators[comparisonsOperator];
		if (!comparator) throw new Error("Invalid comparison operator");

		// Get counts for numbers that have at least 1 co-occurrence
		const neighborhoodStats = TupleHelper.getNumberNeighborhoodCounts(ball, system, alphabet);
		const existingNeighborsMap = new Map<number, number>();
		neighborhoodStats.neighbors.forEach(item => {
			existingNeighborsMap.set(item.neighbor, item.count);
		});

		// Iterate through the unique alphabet to include those with a count of 0
		const uniqueAlphabet = Array.from(new Set(alphabet));
		return uniqueAlphabet
			.filter(num => num !== ball)		// Do no count yourself as a neighbor
			.filter(num => {
				const count = existingNeighborsMap.get(num) ?? 0;
				return comparator(count, level);
			});
	}


	/**
	 * Computes the threshold degree of a number within the system.
	 * The threshold degree is the number of neighbors whose co-occurrence count with the tested ball
	 * satisfies the comparison operator against the given level.
	 *
	 * @param ball                  The ball number.
	 * @param level                 The threshold value to compare against.
	 * @param comparisonsOperator   The comparison operator applied to each co-occurrence count.
	 * @param system                The array of tuples.
	 * @param alphabet              The complete set of possible numbers in the system.
	 * @return                      The number of neighbors matching the threshold condition.
	 */
	public static getNumberThresholdNeighborhoodDegree(
		ball: number,
		level: number,
		comparisonsOperator: keyof typeof comparisonOperators,
		system: Tuple[],
		alphabet: Tuple,
	): number {
		return TupleHelper.getNumberThresholdNeighborhood(ball, level, comparisonsOperator, system, alphabet).length;
	}


	/**
	 * Computes the neighborhood degree for every ball of the reference alphabet filtered by a co-occurrence threshold.
	 * Only neighbors whose occurrence count with the tested ball satisfies the comparison operator
	 * against the given level are considered.
	 *
	 * @param system                The array of tuples (the lottery system).
	 * @param level                 The threshold value to compare against.
	 * @param comparisonsOperator   The comparison operator applied to each co-occurrence count.
	 * @param alphabet              The complete reference alphabet used by the system.
	 * @return                      An array containing each ball, its neighborhood degree and its neighborhood set.
	 */
	public static getSystemThresholdNeighborhoodDegrees(
		system: Tuple[],
		level: number,
		comparisonsOperator: keyof typeof comparisonOperators,
		alphabet: Tuple,
	): Array<{ ball: number; degree: number; neighborhood: Tuple }> {
		if (!alphabet) return [];
		if (level < 0 || !Number.isFinite(level)) throw new Error("Invalid level parameter");
		const comparator = comparisonOperators[comparisonsOperator];
		if (!comparator) throw new Error("Invalid comparison operator");

		const uniqueAlphabet = Array.from(new Set(alphabet));
		return uniqueAlphabet
			.map(ball => ({
				ball,
				neighborhood: TupleHelper.getNumberThresholdNeighborhood(ball, level, comparisonsOperator, system, alphabet),
			}))
			.filter(item => item.neighborhood.length > 0)
			.map(item => ({
				ball: item.ball,
				degree: item.neighborhood.length,
				neighborhood: item.neighborhood,
			}));
	}


	/**
	 * Computes neighborhood counts for a specific ball, including non-connected numbers from the alphabet.
	 *
	 * @param ball       The reference ball number.
	 * @param system     The array of tuples (the lottery system).
	 * @param alphabet   The full list of possible numbers to ensure count=0 are included.
	 * @returns          Comprehensive neighborhood statistics for the given ball.
	 */
	public static getNumberNeighborhoodCounts(
		ball: number,
		system: Tuple[],
		alphabet: Tuple,
	): NumberNeighborhoodCounts {
		if (!alphabet || alphabet.length === 0) throw new Error("Alphabet cannot be null or empty.");

		// 1. Initialize all alphabet numbers (except the ball itself) to 0
		const counts = new Map<number, number>();
		const uniqueAlphabet = Array.from(new Set(alphabet));
		uniqueAlphabet.forEach(num => {
			if (num !== ball) counts.set(num, 0);
		});

		// 2. Count existing co-occurrences
		system.forEach(tuple => {
			if (tuple.includes(ball)) {
				tuple.forEach(neighbor => {
					if (neighbor !== ball && counts.has(neighbor)) counts.set(neighbor, (counts.get(neighbor) || 0) + 1);
				});
			}
		});

		// 3. Convert map to list of neighbor objects
		const neighbors: NumberNeighborhoodCount[] = Array.from(counts.entries()).map(
			([neighbor, count]) => ({ neighbor, count })
		);

		// If alphabet is empty or only contains the ball, handle edge cases
		const occurrenceValues = neighbors.map(n => n.count);
		const min = occurrenceValues.length > 0 ? Math.min(...occurrenceValues) : 0;
		const max = occurrenceValues.length > 0 ? Math.max(...occurrenceValues) : 0;
		const total = occurrenceValues.reduce((a, b) => a + b, 0);
		const degree = neighbors.filter(n => n.count > 0).length;

		return {
			ball,
			neighbors,
			occurencesMin: min,
			occurencesMax: max,
			occurencesRange: max - min,
			occurencesSum: total,
			occurencesAverage: total / (neighbors.length || 1),
			degree: degree // The number of actual connections (count > 0)
		};
	}


	/**
	 * Computes neighborhood statistics for the entire system based on a reference alphabet.
	 * This method calculates co-occurrence counts and degrees for every ball in the alphabet,
	 * then aggregates these values to provide global system statistics.
	 *
	 * @param {Tuple[]} system - The collection of tuples (the dataset).
	 * @param {Tuple} alphabet - The complete reference alphabet.
	 * @returns {Object} Global statistics and detailed per-ball data.
	 */
	public static getSystemNeighborhoodCounts(
		system: Tuple[],
		alphabet: Tuple,
	): {
		occurencesMin: number;
		occurencesMax: number;
		occurencesRange: number;
		occurencesSum: number;
		occurencesAverage: number;
		degreesMin: number;
		degreesMax: number;
		degreesRange: number;
		degreesSum: number;
		degreesAverage: number;
		balls: Array<NumberNeighborhoodCounts>;
	} {
		if (!alphabet || alphabet.length === 0) throw new Error("Alphabet cannot be null or empty.");

		// 1. Compute individual statistics for each ball
		const uniqueAlphabet = Array.from(new Set(alphabet));
		const ballsStats = uniqueAlphabet.map(ball => {
			const stats = TupleHelper.getNumberNeighborhoodCounts(ball, system, alphabet);
			const min = stats.occurencesMin;
			const max = stats.occurencesMax;
			const total = stats.occurencesSum;
			const degree = stats.degree;

			return {
				ball,
				neighbors: stats.neighbors,
				occurencesMin: min,
				occurencesMax: max,
				occurencesRange: max - min,
				occurencesSum: total,
				occurencesAverage: total / (uniqueAlphabet.length - 1),
				degree: degree,
			};
		});

		// 2. Aggregate global Occurrence statistics
		// We look for the absolute min/max across all neighborhood records
		const allMinValues = ballsStats.map(b => b.occurencesMin);
		const allMaxValues = ballsStats.map(b => b.occurencesMax);
		const allAverages = ballsStats.map(b => b.occurencesAverage);

		const occMin = Math.min(...allMinValues);
		const occMax = Math.max(...allMaxValues);
		const occSum = ballsStats.reduce((acc, b) => acc + b.occurencesSum, 0);
		const globalOccAverage = allAverages.reduce((a, b) => a + b, 0) / allAverages.length;

		// 3. Aggregate global Degree statistics
		const allDegrees = ballsStats.map(b => b.degree);
		const degMin = Math.min(...allDegrees);
		const degMax = Math.max(...allDegrees);
		const degSum = allDegrees.reduce((acc, b) => acc + b, 0);

		return {
			occurencesMin: occMin,
			occurencesMax: occMax,
			occurencesRange: occMax - occMin,
			occurencesSum: occSum / 2,
			occurencesAverage: globalOccAverage,

			degreesMin: degMin,
			degreesMax: degMax,
			degreesRange: degMax - degMin,
			degreesSum: degSum,
			degreesAverage: degSum / (allDegrees.length || 1),

			balls: ballsStats
		};
	}


	/**
	 * Computes the unique lexicographical index of a combination (Combinadics).
	 * ASSUMES the input tuple is ALREADY SORTED in DESCENDING order to save CPU.
	 *
	 * @param {number[]} sortedTuple - The combination (must be sorted DESC).
	 * @param {number} k - The size of the combination.
	 * @returns {number} The unique index.
	 */
	public static getCombinationIndex(sortedTuple: number[], k: number): number {
		let index = 0;
		for (let i = 0; i < k; i++) {
			// Combinadics formula: sum of binom(n_i, k - i)
			// We use n_i - 1 because lottery numbers usually start at 1s
			index += Number(TupleHelper.binomial(sortedTuple[i] - 1, k - i));
		}
		return index;
	}


	private static buildKFrequencyMask(
		system: Tuple[],
		alphabetLength: number,
		k: number,
	): {
		mask: Uint32Array;
		totalPossible: number;
		totalPlacements: number;
		uniqueCovered: number;
		holes: number;
		minFrequency: number;
		maxFrequency: number;
	} {
		const totalPossible = Number(TupleHelper.binomial(alphabetLength, k));
		const mask = new Uint32Array(totalPossible);
		let uniqueCovered = 0;
		let totalPlacements = 0;
		const tempCombo = new Array<number>(k);

		const process = (ticket: number[], start: number, depth: number): void => {
			if (depth === k) {
				const idx = TupleHelper.getCombinationIndex(tempCombo, k);
				if (mask[idx] === 0) uniqueCovered++;
				mask[idx]++;
				totalPlacements++;
				return;
			}

			for (let i = start; i < ticket.length; i++) {
				tempCombo[depth] = ticket[i];
				process(ticket, i + 1, depth + 1);
			}
		};

		for (const ticket of system) {
			const uniqueTicket = Array.from(new Set(ticket));
			if (uniqueTicket.length < k) continue;
			const sortedTicket = uniqueTicket.sort((a, b) => b - a);
			process(sortedTicket, 0, 0);
		}

		let maxFrequency = 0;
		let minFrequency = Infinity;
		let holes = 0;

		for (const frequency of mask) {
			if (frequency === 0) holes++;
			if (frequency > maxFrequency) maxFrequency = frequency;
			if (frequency < minFrequency) minFrequency = frequency;
		}

		return {
			mask,
			totalPossible,
			totalPlacements,
			uniqueCovered,
			holes,
			minFrequency: holes > 0 ? 0 : (minFrequency === Infinity ? 0 : minFrequency),
			maxFrequency,
		};
	}


	private static normalizeSystemToAlphabet(
		system: Tuple[],
		alphabet: Tuple,
	): {
		normalizedSystem: Tuple[];
		uniqueAlphabet: Tuple;
	} {
		if (!alphabet || alphabet.length === 0) throw new Error("Alphabet cannot be null or empty.");
		const uniqueAlphabet = Array.from(new Set(alphabet)).sort((a, b) => a - b);
		const rankByValue = new Map<number, number>();
		for (let i = 0; i < uniqueAlphabet.length; i++) rankByValue.set(uniqueAlphabet[i], i + 1);

		const normalizedSystem = system.map((ticket) => {
			const uniqueTicket = Array.from(new Set(ticket)).sort((a, b) => a - b);
			return uniqueTicket.map((value) => {
				const rank = rankByValue.get(value);
				if (rank === undefined) throw new Error(`Ball ${value} is not part of the reference alphabet.`);
				return rank;
			});
		});
		return { normalizedSystem, uniqueAlphabet };
	}


	/**
	 * Computes the exact k-combination frequency field of a system over a reference alphabet.
	 *
	 * @param system    The array of tuples.
	 * @param alphabet  The reference alphabet used to evaluate the full k-combination universe.
	 * @param k         The size of the tracked sub-combinations.
	 * @returns         Frequency analytics for the chosen k level.
	 */
	public static getSystemKFrequencyStats(
		system: Tuple[],
		alphabet: Tuple,
		k: number,
	): SystemKFrequencyStats {
		if (!Number.isInteger(k) || k <= 0) throw new Error("k must be a positive integer.");

		const { normalizedSystem, uniqueAlphabet } = TupleHelper.normalizeSystemToAlphabet(system, alphabet);
		const baseStats = TupleHelper.buildKFrequencyMask(normalizedSystem, uniqueAlphabet.length, k);

		let repeatedCombinations = 0;
		let duplicatePlacements = 0;
		for (const frequency of baseStats.mask) {
			if (frequency > 1) {
				repeatedCombinations++;
				duplicatePlacements += frequency - 1;
			}
		}

		return {
			k,
			totalPossible: baseStats.totalPossible,
			totalPlacements: baseStats.totalPlacements,
			uniqueCovered: baseStats.uniqueCovered,
			holes: baseStats.holes,
			minFrequency: baseStats.minFrequency,
			maxFrequency: baseStats.maxFrequency,
			repeatedCombinations,
			duplicatePlacements,
			mask: baseStats.mask,
		};
	}


	/**
	 * Computes the exact pair frequency field of a system over a reference alphabet.
	 *
	 * @param system    The array of tuples.
	 * @param alphabet  The reference alphabet used to evaluate the full pair universe.
	 * @returns         Pair frequency analytics and the raw frequency mask.
	 */
	public static getSystemPairFrequencyStats(
		system: Tuple[],
		alphabet: Tuple,
	): SystemPairFrequencyStats {
		const stats = TupleHelper.getSystemKFrequencyStats(system, alphabet, 2);
		return {
			totalPairs: stats.totalPossible,
			coveredPairs: stats.uniqueCovered,
			uncoveredPairs: stats.holes,
			totalPlacements: stats.totalPlacements,
			minFrequency: stats.minFrequency,
			maxFrequency: stats.maxFrequency,
			repeatedPairs: stats.repeatedCombinations,
			duplicatePlacements: stats.duplicatePlacements,
			mask: stats.mask,
		};
	}


	/**
	 * Computes the exact trio frequency field of a system over a reference alphabet.
	 *
	 * @param system    The array of tuples.
	 * @param alphabet  The reference alphabet used to evaluate the full trio universe.
	 * @returns         Trio frequency analytics and the raw frequency mask.
	 */
	public static getSystemTrioFrequencyStats(
		system: Tuple[],
		alphabet: Tuple,
	): SystemTrioFrequencyStats {
		const stats = TupleHelper.getSystemKFrequencyStats(system, alphabet, 3);
		return {
			totalTrios: stats.totalPossible,
			coveredTrios: stats.uniqueCovered,
			uncoveredTrios: stats.holes,
			totalPlacements: stats.totalPlacements,
			minFrequency: stats.minFrequency,
			maxFrequency: stats.maxFrequency,
			repeatedTrios: stats.repeatedCombinations,
			duplicatePlacements: stats.duplicatePlacements,
			mask: stats.mask,
		};
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
	 * Generates all possible combinations of size k from a given array.
	 * Used to decompose a full ticket into its smaller constituent sets.
	 *
	 * @param arr        The source array of numbers (e.g., a ticket of 10 numbers).
	 * @param k          The size of the combinations to generate (e.g., 2 for pairs).
	 * @returns          An array of arrays, each containing a unique combination of size k.
	 */
	/*public static getCombinations(arr: number[], k: number): number[][] {
		const results: number[][] = [];
		function backtrack(start: number, path: number[]) {
			if (path.length === k) {
				results.push([...path]);
				return;
			}
			for (let i = start; i < arr.length; i++) {
				path.push(arr[i]);
				backtrack(i + 1, path);
				path.pop();
			}
		}
		backtrack(0, []);
		return results;
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





