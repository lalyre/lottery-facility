#!/usr/bin/env node
'use strict';
const fs = require('fs');
const readline = require('readline');
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');
const SELECTION_LIMIT = 500000;


const cli = meow(`
	Usage
	  $ filter
	
	Parameters
	  --infile, -in      An input file containing one input combination per line, where some combinations will be selected according to filters restrictions.
	  --selection        An input file containing one combination per line, used for initiating the selection of combinations.
	  --globalScore      Defines the global score obtained after passing through all filters to select a combination.
	  --globalFailure    Defines the global number of filters that are not passed to select a combination.
	  --filter, -f       A filter command used to select input combinations (of form "filename(<filename>)weight(a)level(b)score(c)length(d)").
	  --limit            Defines the maximum number of additions into the selection of input combinations. Default value is -1 (unlimited).
	  --slice            Defines the number of first elements of the tested combination that will be added to the ongoing selection. Default value is -1, and the whole tested combination is added.
	  --addition         If true the selected combinations are added on the fly to the running selection. Otherwise they are simply printed. Default value is true.
	  --printhits        Displays the hit counts/scores/failures for each filter in their declarative order.
	  --printfullhits    Displays the hit counts/scores/failures for each filter in their declarative order, and the filter lines that are collided.
	
	Description
	This script selects combinations from an input file according to filters restrictions.
	The selected combinations are printed, and also added to the current ongoing selection of input combinations if the <addition> mode is enabled.
	
	The filter command is in that form "filename(<filename>)weight(a)level(b)score(c)length(d)".
	You can put as many <filter> commands as you need on the command line.
	
	* filename
	The filter instruction contains a filename to read combinations from, with the form "filename(XXX)", that will be confronted against the current tested combination of the input file.
	You can use "_selection" value for filename value if you want to perform filtering against the current ongoing selection of input combinations.
	
	* weight
	With "weight(x)", the filter score is computed as the multiplication of the number of filter lines that match the required level (hit count) by the weight value.
	If not specified, the default value is 1.

	* length
	With "length(<x)",   only input combinations with less than x numbers are considered.
	With "length(<=x)",  only input combinations with less than or equal x numbers are considered.
	With "length(=x)" or "level(x)", only input combinations with x numbers are considered.
	With "length(!=x)",  only input combinations with not x numbers are considered.
	With "length(>=x)",  only input combinations with more than or equal x numbers are considered.
	With "length(>x)",   only input combinations with more than x numbers are considered.

	* level
	With "level(<x)",    only filter lines with less than x collisions with the current input combination are considered.
	With "level(<=x)",   only filter lines with less than or equal x collisions with the current input combination are considered.
	With "level(=x)" or "level(x)", only filter lines with x collisions with the current input combination are considered.
	With "level(!=x)",   only filter lines with not x collisions with the current input combination are considered.
	With "level(>=x)",   only filter lines with more than or equal x collisions with the current input combination are considered.
	With "level(>x)",    only filter lines with more than x collisions with the current input combination are considered.

	* score
	With "score(<x)",    only input combinations with score less than x are considered.
	With "score(<=x)",   only input combinations with score less than or equal x are considered.
	With "score(=x)" or "score(x)", only input combinations with score equal to x are considered.
	With "score(!=x)",   only input combinations with score different from x are considered.
	With "score(>=x)",   only input combinations with score greater than or equal to x considered.
	With "score(>x)",    only input combinations with score greater than x are considered.
	With "score(*)",     only input combinations that matches with all filter lines are considered.

	* globalScore
	With --globalScore   "<x",  only combinations with global score less than x are selected.
	With --globalScore   "<=x", only combinations with global score less than or equal x are selected..
	With --globalScore   "=x",  only combinations with global score equal to x are selected.
	With --globalScore   "!=x", only combinations with global score not equal to x are selected.
	With --globalScore   ">=x", only combinations with global score greater than or equal to x are selected.
	With --globalScore   ">x",  only combinations with global score greater than x are selected.
	
	* globalFailure
	With --globalFailure "<x",  only combinations with less than x failed filters are selected.
	With --globalFailure "<=x", only combinations with less than or equal x failed filters are selected..
	With --globalFailure "=x",  only combinations with x failed filters are selected.
	With --globalFailure "!=x", only combinations with not x failed filters are selected.
	With --globalFailure ">=x", only combinations with more than or equal x failed filters are selected.
	With --globalFailure ">x",  only combinations with more than x failed filters are selected.
`, {
	flags: {
		infile: {
			type: 'string',
			alias: 'in',
			isRequired: true,
			isMultiple: false,
		},
		selection: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		globalScore: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		globalFailure: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		filter: {
			type: 'string',
			alias: 'f',
			isRequired: true,
			isMultiple: true,
		},
		limit: {
			type: 'number',
			isRequired: false,
			isMultiple: false,
			default: -1,
		},
		slice: {
			type: 'number',
			isRequired: false,
			isMultiple: false,
			default: -1,
		},
		addition: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: true,
		},
		printhits: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: false,
		},
		printfullhits: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: false,
		},
	}
});


let additionMode = cli.flags.addition;
let additionsLimit = cli.flags.limit;
let additionsSlice = cli.flags.slice;


let infile = cli.flags.infile.trim();
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}


let selectedCombinations = [];
if (cli.flags.selection) {
	let selectionFile = cli.flags.selection.trim();
	if (!fs.existsSync(selectionFile)) {
		console.error(`File ${selectionFile} does not exist`);
		process.exit(1);
	}
	let preselections = fs.readFileSync(selectionFile).toString().split(/\r?\n/);
	for (var line of preselections) {
		var numbers = line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
		if (numbers[0] == 0) continue;
		selectedCombinations.push(numbers);
	}
}


let testGlobalScoreSelection = null;
let testGlobalScore = -1;
let regexp1 = /^(<|=<|<=|=|!=|>=|=>|>)?(-?\d*)$/;
switch (true) {
	case cli.flags.globalScore === null:
	case cli.flags.globalScore === undefined:
		break;

	case regexp1.test(cli.flags.globalScore):
		let match = regexp1.exec(cli.flags.globalScore);
		testGlobalScoreSelection = match[1];
		testGlobalScore = +match[2];
		if (testGlobalScoreSelection ==  null) testGlobalScoreSelection = '=';
		break;

	default:
		console.error(`Wrong <globalScore> value.`);
		process.exit(1);
		break;
}


let testGlobalFailureSelection = null;
let testGlobalFailure = -1;
let regexp2 = /^(<|=<|<=|=|!=|>=|=>|>)?(\d*)$/;
switch (true) {
	case cli.flags.globalFailure === null:
	case cli.flags.globalFailure === undefined:
		break;

	case regexp2.test(cli.flags.globalFailure):
		let match = regexp2.exec(cli.flags.globalFailure);
		testGlobalFailureSelection = match[1];
		testGlobalFailure = +match[2];
		if (testGlobalFailureSelection == null) testGlobalFailureSelection = '=';
		break;

	default:
		console.error(`Wrong <globalFailure> value.`);
		process.exit(1);
		break;
}


// filename(<filename>)weight(a)level(b)score(c)length(d)
let filterCommand= cli.flags.filter;
let filename = [];
let weight = [];
let testLevelSelection = [];
let testLevel = [];
let testLengthSelection = [];
let testLength = [];
let testCombiFilterScoreSelection = [];
let testCombiFilterScore = [];
let globalScore = 0;
let globalFailure = 0;


for (let i = 0; i < filterCommand.length; i++) {
	// Parsing FILENAME
	switch (true) {
		case /filename\(_selection\)*/.test(filterCommand[i].trim()):
			if (!additionMode) {
				console.error(`You must enable <addition> mode in conjonction with "_selection" filter.`);
				process.exit(1);
			}
			filename.push('_selection')
			break;
		
		case /filename\(([\w|\.]*)\)*/.test(filterCommand[i].trim()):
			let match = /filename\(([\w|\.]*)\)*/.exec(filterCommand[i]);
			filename.push(match[1]);
			if (!fs.existsSync(filename[i].trim())) {
				console.error(`File ${filename[i]} does not exist.`);
				process.exit(1);
			}
			break;
			
		default:
			console.error(`No <filename> (#${i+1}) value.`);
			process.exit(1);
			break;
	}


	// Parsing WEIGHT
	switch (true) {
		case /weight\((-?\d*)\)*/.test(filterCommand[i].trim()):
			let match = /weight\((-?\d*)\)*/.exec(filterCommand[i]);
			weight.push(+match[1]);
			break;

		default:
			weight.push(1);		// Default value is 1.
			break;
	}


	// Parsing LENGTH
	switch (true) {
		case /length\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.test(filterCommand[i].trim()):
			let match = /length\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.exec(filterCommand[i]);
			if (match[1] == null) testLengthSelection.push('='); else testLengthSelection.push(match[1]);
			testLength.push(+match[2]);
			break;
		
		default:
			testLengthSelection.push(null)
			testLength.push(-1);
			break;
	}


	// Parsing LEVEL
	switch (true) {
		case /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.test(filterCommand[i].trim()):
			let match = /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.exec(filterCommand[i]);
			if (match[1] == null) testLevelSelection.push('='); else testLevelSelection.push(match[1]);
			testLevel.push(+match[2]);
			break;
		
		default:
			testLevelSelection.push(null)
			testLevel.push(-1);
			break;
	}


	// Parsing SCORE
	switch (true) {
		case /score\(\*\)/.test(filterCommand[i].trim()):
			testCombiFilterScoreSelection.push('*');
			testCombiFilterScore.push(-1);
			break;

		case /score\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)*/.test(filterCommand[i].trim()):
			let match = /score\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)*/.exec(filterCommand[i]);
			if (match[1] == null) testCombiFilterScoreSelection.push('='); else testCombiFilterScoreSelection.push(match[1]);
			testCombiFilterScore.push(+match[2]);
			break;

		default:
			testCombiFilterScoreSelection.push(null);
			testCombiFilterScore.push(-1);
			break;
	}
}


const printOutput = function (inputLinesCount, testedCombination, combiGlobalScore, combiGlobalFailure, hits_count_string, hits_filters_string) {
	// Display output
	if (cli.flags.printhits || cli.flags.printfullhits) {
		console.log("combi" + inputLinesCount.toString().padStart(10, 0) + ": " + lotteryFacility.Combination.toString(testedCombination.sort()) + " - combi_global_score: " + combiGlobalScore + " - combi_global_failure: " + combiGlobalFailure);
		console.log(hits_count_string);
		if (cli.flags.printfullhits) console.log(hits_filters_string);
	} else {
		console.log(lotteryFacility.Combination.toString(testedCombination.sort()));
	}
}


// Test all combinations of input file
let additions = 0;
let inputLinesCount = 0;
let fileStream = fs.createReadStream(infile);
let rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
})
.on('line', async (line) => {
	// Test limit of selection
	if (selectedCombinations.length >= SELECTION_LIMIT) {
		console.error("Limit of selection is reached !");
		process.exit(1);
	}


	// Get a combination to be selected or not
	if (!line) {
		return;
	}
	let testedCombination = line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
	if (testedCombination[0] == 0) return;
	if (testedCombination.join("") == '') return;
	inputLinesCount++;
	//console.log(testedCombination);


	// Init tested combination track records
	let combiGlobalScore = 0;
	let combiGlobalFailure = 0;
	let combiFilterScore = new Array(filterCommand.length).fill(0);
	let combiFilterFailure = new Array(filterCommand.length).fill(0);


	// Loop on all filter commands
	let hits_count_string = '';
	let hits_filters_string = '';
	for (let i = 0; i < filterCommand.length; i++)
	{
		let hitsCount = 0;
		let limitHitsCount = 0;
		
		
		// Combi length scope
		let selectLengthScope = true;
		switch (true) {
			case (testLengthSelection[i] == null):
				break; // No rule

			case /^<$/.test(testLengthSelection[i]):
				if (!(testedCombination.length < testLength[i])) selectLengthScope = false; // reject this combination
				break;

			case /^=<$/.test(testLengthSelection[i]):
			case /^<=$/.test(testLengthSelection[i]):
				if (!(testedCombination.length <= testLength[i])) selectLengthScope = false; // reject this combination
				break;

			case /^=$/.test(testLengthSelection[i]):
				if (!(testedCombination.length == testLength[i])) selectLengthScope = false; // reject this combination
				break;

			case /^!=$/.test(testLengthSelection[i]):
				if (!(testedCombination.length != testLength[i])) selectLengthScope = false; // reject this combination
				break;

			case /^=>$/.test(testLengthSelection[i]):
			case /^>=$/.test(testLengthSelection[i]):
				if (!(testedCombination.length >= testLength[i])) selectLengthScope = false; // reject this combination
				break;

			case /^>$/.test(testLengthSelection[i]):
				if (!(testedCombination.length > testLength[i])) selectLengthScope = false; // reject this combination
				break;

			default:
				selectLengthScope = false; // reject this combination
				break;
		}
		if (!selectLengthScope) {
			hitsCount = -1;
			limitHitsCount = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 1; combiGlobalFailure++;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			
			continue;		// next filter command
		}


		// Check whether computing a score is relevant or not
		if (testLevelSelection[i] == null) {
			hitsCount = -1;
			limitHitsCount = -1;
			combiFilterScore[i] = -1;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Init the ongoing selection in case of "_selection" logical file
		if (filename[i] === '_selection' && selectedCombinations.length === 0) {		// Select the tested combination by default in that case
			hitsCount = -1;
			limitHitsCount = -1;
			combiFilterScore[i] = -1;

			let selectedComb = (additionsSlice > 0) ? testedCombination.sort().slice(0, additionsSlice) : testedCombination;
			printOutput(inputLinesCount, selectedComb, combiGlobalScore, combiGlobalFailure, hits_count_string, hits_filters_string);
			selectedCombinations.push(selectedComb.sort()); additions++;
			return;			// next tested combination
		}


		// Get current filter combinations
		let currentFilterCombinations = [];
		switch (true) {
			case /^_selection$/.test(filename[i].trim()):
				currentFilterCombinations = selectedCombinations;
				break;
			
			default:
				let filter_lines = fs.readFileSync(filename[i].trim()).toString().split(/\r?\n/);
				for (let filter_line of filter_lines) {
					let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
					if (numbers[0] == 0) continue;				// next filter command
					if (numbers.join("") == '') continue;		// next filter command
					currentFilterCombinations.push(numbers);
				}
				break;
		}


		// Get current tested combination's score
		for (let j = 0; j < currentFilterCombinations.length; j++) {
			let nb_collisions = lotteryFacility.Combination.collisionsCount(testedCombination, currentFilterCombinations[j]);

			switch (true) {
				case /^<$/.test(testLevelSelection[i]):
					if (nb_collisions < testLevel[i]) {
						hitsCount++;
						if (nb_collisions == testLevel[i]-1) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(currentFilterCombinations[j]) + ` - [ nb_collisions: ${nb_collisions} ]` + '\n';
					}
					break;

				case /^=<$/.test(testLevelSelection[i]):
				case /^<=$/.test(testLevelSelection[i]):
					if (nb_collisions <= testLevel[i]) {
						hitsCount++;
						if (nb_collisions == testLevel[i]) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(currentFilterCombinations[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^=$/.test(testLevelSelection[i]):
					if (nb_collisions == testLevel[i]) {
						hitsCount++;
						limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(currentFilterCombinations[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^!=$/.test(testLevelSelection[i]):
					if (nb_collisions != testLevel[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(currentFilterCombinations[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^=>$/.test(testLevelSelection[i]):
				case /^>=$/.test(testLevelSelection[i]):
					if (nb_collisions >= testLevel[i]) {
						hitsCount++;
						if (nb_collisions == testLevel[i]) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(currentFilterCombinations[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^>$/.test(testLevelSelection[i]):
					if (nb_collisions > testLevel[i]) {
						hitsCount++;
						if (nb_collisions == testLevel[i]+1) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(currentFilterCombinations[j]) + ` - [nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				default:
					break;
			}
		}
		combiFilterScore[i] = hitsCount * weight[i]; combiGlobalScore += combiFilterScore[i];


		// Combi score scope
		let selectScoreScope = true;
		switch (true) {
			case (testCombiFilterScoreSelection[i] == null):
				break; // No rule

			case /^<$/.test(testCombiFilterScoreSelection[i]):
				if (!(combiFilterScore[i] < testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^=<$/.test(testCombiFilterScoreSelection[i]):
			case /^<=$/.test(testCombiFilterScoreSelection[i]):
				if (!(combiFilterScore[i] <= testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^=$/.test(testCombiFilterScoreSelection[i]):
				if (!(combiFilterScore[i] == testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^!=$/.test(testCombiFilterScoreSelection[i]):
				if (!(combiFilterScore[i] != testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^=>$/.test(testCombiFilterScoreSelection[i]):
			case /^>=$/.test(testCombiFilterScoreSelection[i]):
				if (!(combiFilterScore[i] >= testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^>$/.test(testCombiFilterScoreSelection[i]):
				if (!(combiFilterScore[i] > testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^\*$/.test(testCombiFilterScoreSelection[i]):
				if (!(hitsCount == currentFilterCombinations.length)) selectScoreScope = false; // reject this combination
				break;

			default:
				selectScoreScope = false; // reject this combination
				break;
		}
		if (!selectScoreScope) {
			combiFilterFailure[i] = 1; combiGlobalFailure++;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			
			continue;		// next filter command
		}
	}


	// Combi global score scope
	let selectScoreScope = true;
	switch (true) {
		case (testGlobalScoreSelection == null):
			break; // No rule

		case /^<$/.test(testGlobalScoreSelection):
			if (!(combiGlobalScore < testGlobalScore)) selectScoreScope = false; // reject this combination
			break;

		case /^=<$/.test(testGlobalScoreSelection):
		case /^<=$/.test(testGlobalScoreSelection):
			if (!(combiGlobalScore <= testGlobalScore)) selectScoreScope = false; // reject this combination
			break;

		case /^=$/.test(testGlobalScoreSelection):
			if (!(combiGlobalScore == testGlobalScore)) selectScoreScope = false; // reject this combination
			break;

		case /^!=$/.test(testGlobalScoreSelection):
			if (!(combiGlobalScore != testGlobalScore)) selectScoreScope = false; // reject this combination
			break;

		case /^=>$/.test(testGlobalScoreSelection):
		case /^>=$/.test(testGlobalScoreSelection):
			if (!(combiGlobalScore >= testGlobalScore)) selectScoreScope = false; // reject this combination
			break;

		case /^>$/.test(testGlobalScoreSelection):
			if (!(combiGlobalScore > testGlobalScore)) selectScoreScope = false; // reject this combination
			break;
	
		default:
			selectScoreScope = false; // reject this combination
			break;
	}
	if (!selectScoreScope) {
		return;			// next tested combination
	}


	// Combi global failure scope
	let selectFailureScope = true;
	switch (true) {
		case (testGlobalFailureSelection == null):
			break; // No rule

		case /^<$/.test(testGlobalFailureSelection):
			if (!(combiGlobalFailure < testGlobalFailure)) selectFailureScope = false; // reject this combination
			break;

		case /^=<$/.test(testGlobalFailureSelection):
		case /^<=$/.test(testGlobalFailureSelection):
			if (!(combiGlobalFailure <= testGlobalFailure)) selectFailureScope = false; // reject this combination
			break;

		case /^=$/.test(testGlobalFailureSelection):
			if (!(combiGlobalFailure == testGlobalFailure)) selectFailureScope = false; // reject this combination
			break;

		case /^!=$/.test(testGlobalFailureSelection):
			if (!(combiGlobalFailure != testGlobalFailure)) selectFailureScope = false; // reject this combination
			break;

		case /^=>$/.test(testGlobalFailureSelection):
		case /^>=$/.test(testGlobalFailureSelection):
			if (!(combiGlobalFailure >= testGlobalFailure)) selectFailureScope = false; // reject this combination
			break;

		case /^>$/.test(testGlobalFailureSelection):
			if (!(combiGlobalFailure > testGlobalFailure)) selectFailureScope = false; // reject this combination
			break;

		default:
			selectFailureScope = false; // reject this combination
			break;
	}
	if (!selectFailureScope) {
		return;			// next tested combination
	}


	// Select the tested combination and get global track records
	globalScore += combiGlobalScore;
	globalFailure += combiGlobalFailure;


	// Add the tested combination to the ongoing selection
	let selectedComb = (additionsSlice > 0) ? testedCombination.sort().slice(0, additionsSlice) : testedCombination;
	printOutput(inputLinesCount, selectedComb, combiGlobalScore, combiGlobalFailure, hits_count_string, hits_filters_string);
	if (additionMode) {
		selectedCombinations.push(selectedComb); additions++;
		if (additionsLimit != -1 && additions >= additionsLimit) {
			process.exit(1);
		}
	}
})
.on('close', () => {
	console.log("Nb selected:   "  + selectedCombinations.length);
	console.log("Total score:   "  + globalScore);
	console.log("Total failure: "  + globalFailure);

	//console.log("inputLinesCount "  + inputLinesCount);
	fileStream.close();
});
