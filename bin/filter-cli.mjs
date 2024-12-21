#!/usr/bin/env node --max-old-space-size=8192
'use strict';
import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';
import meow from 'meow';
import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';
const SELECTION_LIMIT = 500000;


const cli = meow(`
	Usage
	  $ filter

	Parameters
	  --infile, -in      An input file containing one input combination per line, where some combinations will be selected according to filters restrictions.
	  --globalnum        All items that can be used in combinations, separated by '|' or ' '.
	  --globalfile       File containing one item per line that are used in combinations of <infile> file, and possibly others items.
	  --selection        An input file containing one combination per line, used for initiating the selection of combinations.
	  --selectionSkip    Defines the number of tested combinations to skip from being entered in the ongoing selection.
	  --globalScore      Defines the global score obtained after passing through all filters to select a combination.
	  --globalFailure    Defines the global number of filters that are not passed to select a combination.
	  --select, -s       A filter command used to select input combinations (of form "filename(<filename>)weight(a)level(b)score(c)length(d)slice(a,b,..,x)distance(x)min_gap(x)max_gap(x)").
	  --limit            Defines the maximum number of additions into the selection of input combinations. Default value is -1 (unlimited).
	  --addition         If true the selected combinations are added on the fly to the running selection. Otherwise they are simply printed. Default value is true.
	  --coverstats       If enabled it extracts covering statictics on filter files. The input file is fully scanned, and each line of that file increments a covering count on filter lines it matches with.
	  --printhits        Displays the hit counts/scores/failures for each filter in their declarative order.
	  --printfullhits    Displays the hit counts/scores/failures for each filter in their declarative order, and the filter lines that are collided.

	Description
	This script is a combinations filtering intelligence tool. It selects combinations from an input file according to filters restrictions.
	The selected combinations are printed, and also added to the current ongoing selection of input combinations if the <addition> mode is enabled.

	The input file <file> contains one combination per line. Those combinations are written with items of the <global> alphabet.
	The <global> alphabet can be declared either with <globalnum> or <globalfile> parameters.

	The filter command is in that form "filename(<filename>)weight(a)level(b)score(c)length(d)slice(a,b,..,x)min_gap(x)max_gap(x)".
	You can put as many <filter> commands as you need on the command line.

	* filename
	The filter instruction contains a filename to read combinations from, with the form "filename(XXX)", that will be confronted against the current tested combination of the input file.
	You can use "_selection" value for filename value if you want to perform filtering against the current ongoing selection of input combinations.

	* weight
	With "weight(x)", the filter score is computed as the multiplication of the number of filter lines that match the required level (hit count) by the weight value.
	If not specified, the default value is 1.

	* slice
	With "slice(a,b,..,x)", the numbers at index a,b,..., x of the input combination are selected from the input combination, and used for comparisons. If not specified the whole input combination is taken by default.

	* length
	With "length(<x)",   only input combinations with less than x numbers are considered.
	With "length(<=x)",  only input combinations with less than or equal x numbers are considered.
	With "length(=x)" or "level(x)", only input combinations with x numbers are considered.
	With "length(!=x)",  only input combinations with not x numbers are considered.
	With "length(>=x)",  only input combinations with more than or equal x numbers are considered.
	With "length(>x)",   only input combinations with more than x numbers are considered.

	* distance
	With "distance(<x)",   only input combinations with distance less than x are considered.
	With "distance(<=x)",  only input combinations with distance less than or equal x are considered.
	With "distance(=x)" or "level(x)", only input combinations with distance x are considered.
	With "distance(!=x)",  only input combinations with not distance x are considered.
	With "distance(>=x)",  only input combinations with more than or equal distance x are considered.
	With "distance(>x)",   only input combinations with more than distance x are considered.

	* min_gap
	With "min_gap(<x)",   only input combinations with minimum gap less than x are considered.
	With "min_gap(<=x)",  only input combinations with minimum gap less than or equal x are considered.
	With "min_gap(=x)" or "level(x)", only input combinations with minimum gap equal to x are considered.
	With "min_gap(!=x)",  only input combinations with minimum gap not equal to x are considered.
	With "min_gap(>=x)",  only input combinations with minimum gap  more than or equal x are considered.
	With "min_gap(>x)",   only input combinations with minimum gap  more than x are considered.

	* max_gap
	With "max_gap(<x)",   only input combinations with maximum gap less than x are considered.
	With "max_gap(<=x)",  only input combinations with maximum gap less than or equal x are considered.
	With "max_gap(=x)" or "level(x)", only input combinations with maximum gap equal to x are considered.
	With "max_gap(!=x)",  only input combinations with maximum gap not equal to x are considered.
	With "max_gap(>=x)",  only input combinations with maximum gap  more than or equal x are considered.
	With "max_gap(>x)",   only input combinations with maximum gap  more than x are considered.

	* level
	With "level(<x)",    only filter lines with less than x collisions with the current input combination are considered.
	With "level(<=x)",   only filter lines with less than or equal x collisions with the current input combination are considered.
	With "level(=x)" or "level(x)", only filter lines with x collisions with the current input combination are considered.
	With "level(!=x)",   only filter lines with not x collisions with the current input combination are considered.
	With "level(>=x)",   only filter lines with more than or equal x collisions with the current input combination are considered.
	With "level(>x)",    only filter lines with more than x collisions with the current input combination are considered.

	* min_val
	With "min_val(<x)",    only input combinations with min value less than x are considered.
	With "min_val(<=x)",   only input combinations with min value less than or equal x are considered.
	With "min_val(=x)" or "min_val(x)", only input combinations with min value equal to x are considered.
	With "min_val(!=x)",   only input combinations with min value different from x are considered.
	With "min_val(>=x)",   only input combinations with min value greater than or equal to x considered.
	With "min_val(>x)",    only input combinations with min value greater than x are considered.

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
	importMeta: import.meta,
	flags: {
		globalfile: {
			type: 'string',
			isRequired: (input, flags) => {
				if (input.globalnum) {
					return false;
				}
				return true;
			},
			isMultiple: false,
		},
		globalnum: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		infile: {
			type: 'string',
			shortFlag: 'in',
			isRequired: true,
			isMultiple: false,
		},
		selection: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		selectionSkip: {
			type: 'number',
			isRequired: false,
			isMultiple: false,
			default: -1,
		},
		globalScore: {
			type: 'string',
			isRequired: false,
			isMultiple: true,
		},
		globalFailure: {
			type: 'string',
			isRequired: false,
			isMultiple: true,
		},
		select: {
			type: 'string',
			shortFlag: 's',
			isRequired: true,
			isMultiple: true,
		},
		limit: {
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
		coverstats: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: false,
		},
		coverlines: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: false,
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
let selectionSkip = cli.flags.selectionSkip;
let coverStatsMode = cli.flags.coverstats;
let coverLinesMode = cli.flags.coverlines;
if (coverStatsMode && coverLinesMode) {
	console.error("Either choose <coverstats> or <coverlines>, but not both !");
	process.exit(1);
}
if (coverLinesMode && cli.flags.select.length > 1) {
	console.error("Only one select allowed with <coverlines> mode !");
	process.exit(1);
}


let infile = cli.flags.infile.trim();
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}


let global_alphabet = null;
if (cli.flags.globalnum) {
	global_alphabet = cli.flags.globalnum.trim().split(/[\| ]/);
} else {
	if (!fs.existsSync(cli.flags.globalfile)) {
		console.error(`File ${cli.flags.globalfile} does not exist`);
		process.exit(1);
	}
	global_alphabet = fs.readFileSync(cli.flags.globalfile).toString().trim().split(/\r?\n/);
}


let selectedCombinations = [];
let preSelectedCombinations = [];
if (cli.flags.selection) {
	let selectionFile = cli.flags.selection.trim();
	if (!fs.existsSync(selectionFile)) {
		console.error(`File ${selectionFile} does not exist`);
		process.exit(1);
	}
	let preselections = fs.readFileSync(selectionFile).toString().split(/\r?\n/);
	let lineNum = 0;
	for (var line of preselections) {
		var [x, y] = line.trim().split(/:/);
		var numbers = x.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
		if (numbers[0] == 0) continue;
		if (numbers.join("") == '') continue;
		var value = (!y) ? 0 : +y.trim();
		lineNum++;
		preSelectedCombinations.push({lineNum: lineNum, combination: numbers, covering: value, value: value, preselected: true, });
	}
}


//TODO CL
//console.log("preSelectedCombinations.length " + preSelectedCombinations.length);


let testGlobalScoreSelection = [];
let testGlobalScore = [];
let regexp1 = /^(<|=<|<=|=|!=|>=|=>|>)?(-?\d*)$/;
for (let i = 0; cli.flags.globalScore && i < cli.flags.globalScore.length; i++) {
	switch (true) {
		case cli.flags.globalScore[i] === null:
		case cli.flags.globalScore[i] === undefined:
			testGlobalScoreSelection.push(null);
			testGlobalScore.push(-1);
			break;

		case regexp1.test(cli.flags.globalScore[i].trim()):
			let match = regexp1.exec(cli.flags.globalScore[i]);
			if (match[1] == null) testGlobalScoreSelection.push('=');
			else testGlobalScoreSelection.push(match[1]);
			testGlobalScore.push(+match[2]);
			break;

		default:
			console.error(`Wrong <globalScore> (#${i+1}) value.`);
			process.exit(1);
			break;
	}
}


let testGlobalFailureSelection = [];
let testGlobalFailure = [];
let regexp2 = /^(<|=<|<=|=|!=|>=|=>|>)?(\d*)$/;
for (let i = 0; cli.flags.globalFailure && i < cli.flags.globalFailure.length; i++) {
	
	
	
	//TODO CL
	//console.log("cli.flags.globalFailure[i] " + cli.flags.globalFailure[i]);
	
	
	switch (true) {
		case cli.flags.globalFailure[i] === null:
		case cli.flags.globalFailure[i] === undefined:
			testGlobalFailureSelection.push(null);
			testGlobalFailure.push(-1);
			break;

		case regexp2.test(cli.flags.globalFailure[i].trim()):
			let match = regexp2.exec(cli.flags.globalFailure[i]);
			if (match[1] == null) testGlobalFailureSelection.push('=');
			else testGlobalFailureSelection.push(match[1]);
			testGlobalFailure.push(+match[2]);
			break;

		default:
			console.error(`Wrong <globalFailure> (#${i+1}) value.`);
			process.exit(1);
			break;
	}
}


// filename(<filename>)restrictions(<filename>)weight(a)level(b)score(c)min_val(c)length(d)distance(d)slice(a,b,...,y)min_gap(x)max_gap(x)
let filterCommand = cli.flags.select;
let filterCombinations = [];
let filename = [];
let filterRestrictions = [];
let restrictions = [];
let weight = [];
let slice = [];
let testLevelSelection = [];
let testLevel = [];
let testLengthSelection = [];
let testLength = [];
let testDistanceSelection = [];
let testDistance = [];
let testMingapSelection = [];
let testMingap = [];
let testMaxgapSelection = [];
let testMaxgap = [];
let testCombiFilterScoreSelection = [];
let testCombiFilterScore = [];
let testCombiFilterRepetitionSelection = [];
let testCombiFilterRepetition = [];
let testCombiFilterMinValSelection = [];
let testCombiFilterMinVal = [];
let testCombiFilterMaxValSelection = [];
let testCombiFilterMaxVal = [];
let testCombiFilterSumValSelection = [];
let testCombiFilterSumVal = [];
let globalScore = 0;
let globalFailure = 0;


for (let i = 0; i < filterCommand.length; i++) {
	// Parsing FILENAME
	switch (true) {
		case /filename\(_selection\)/.test(filterCommand[i].trim()):
			if (!additionMode) {
				console.error(`You must enable <addition> mode in conjonction with "_selection" filter.`);
				process.exit(1);
			}
			if (coverStatsMode) {
				console.error(`You cannot use <coverstats> mode in conjonction with "_selection" filter.`);
				process.exit(1);
			}
			filename.push('_selection');
			filterCombinations.push(null);
			break;

		case /filename\(([\w|\.]*)\)/.test(filterCommand[i].trim()):
			let match = /filename\(([\w|\.]*)\)/.exec(filterCommand[i]);
			filename.push(match[1]);
			if (!fs.existsSync(filename[i].trim())) {
				console.error(`File ${filename[i]} does not exist.`);
				process.exit(1);
			}

			filterCombinations.push([]);
			let filter_lines = fs.readFileSync(filename[i].trim()).toString().split(/\r?\n/);
			let line = 0;
			for (let filter_line of filter_lines) {
				var [x, y] = filter_line.trim().split(/:/);
				let numbers = x.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
				if (numbers[0] == 0) continue;				// next filter command
				if (numbers.join("") == '') continue;		// next filter command
				var value = (!y) ? 0 : +y.trim();
				line++;
				filterCombinations[i].push({lineNum: line, combination: numbers, covering: value, value: value, preselected: false, });
			}
			break;

		default:
			filename.push(null);
			filterCombinations.push(null);
			break;
	}


	// Parsing RESTRICTIONS
	switch (true) {
		case /restrictions\(_selection\)/.test(filterCommand[i].trim()):
			restrictions.push('_selection');
			filterRestrictions.push(null);
			break;

		case /restrictions\(([\w|\.]*)\)/.test(filterCommand[i].trim()):
			let match = /restrictions\(([\w|\.]*)\)/.exec(filterCommand[i]);
			restrictions.push(match[1]);
			if (!fs.existsSync(restrictions[i].trim())) {
				console.error(`File ${restrictions[i]} does not exist.`);
				process.exit(1);
			}

			filterRestrictions.push([]);
			let restriction_lines = fs.readFileSync(restrictions[i].trim()).toString().split(/\r?\n/);
			let line = 0;
			for (let restriction_line of restriction_lines) {
				var [x, y] = restriction_line.trim().split(/:/);
				let numbers = x.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
				if (numbers[0] == 0) continue;				// next filter command
				if (numbers.join("") == '') continue;		// next filter command
				var value = (!y) ? 0 : +y.trim();
				line++;
				filterRestrictions[i].push({lineNum: line, combination: numbers, covering: value, value: value, preselected: false, });
			}
			break;

		default:
			restrictions.push(null);
			filterRestrictions.push(null);
			break;
	}


	// Parsing WEIGHT
	switch (true) {
		case /weight\((-?\d*)\)/.test(filterCommand[i].trim()):
			let match = /weight\((-?\d*)\)/.exec(filterCommand[i]);
			weight.push(+match[1]);
			break;

		default:
			weight.push(1);		// Default value is 1.
			break;
	}


	// Parsing SLICE
	switch (true) {
		case /slice\((.+)\)/.test(filterCommand[i].trim()):
			let match = /slice\((.*)\)/.exec(filterCommand[i]);
			let exp = (match[1]).trim();
			if (! /^(?:,)*(?:\d+)(?:,+\d+)*(?:,)*$/.test(exp)) {
				console.error(`Wrong <slice> (#${i+1}) syntax.`);
				process.exit(1);
			}
			let indexes = exp.split(/,+/g).filter(Boolean).map( x => +x);
			slice.push(indexes);
			break;

		default:
			slice.push(null);
			break;
	}


	// Parsing LENGTH
	switch (true) {
		case /length\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterCommand[i].trim()):
			let match = /length\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testLengthSelection.push('='); else testLengthSelection.push(match[1]);
			testLength.push(+match[2]);
			break;

		default:
			testLengthSelection.push(null)
			testLength.push(-1);
			break;
	}


	// Parsing DISTANCE
	switch (true) {
		case /distance\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterCommand[i].trim()):
			let match = /distance\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testDistanceSelection.push('='); else testDistanceSelection.push(match[1]);
			testDistance.push(+match[2]);
			break;

		default:
			testDistanceSelection.push(null)
			testDistance.push(-1);
			break;
	}


	// Parsing MIN_GAP
	switch (true) {
		case /min_gap\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterCommand[i].trim()):
			let match = /min_gap\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testMingapSelection.push('='); else testMingapSelection.push(match[1]);
			testMingap.push(+match[2]);
			break;

		default:
			testMingapSelection.push(null)
			testMingap.push(-1);
			break;
	}


	// Parsing MAX_GAP
	switch (true) {
		case /max_gap\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterCommand[i].trim()):
			let match = /max_gap\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testMaxgapSelection.push('='); else testMaxgapSelection.push(match[1]);
			testMaxgap.push(+match[2]);
			break;

		default:
			testMaxgapSelection.push(null)
			testMaxgap.push(-1);
			break;
	}


	// Parsing LEVEL
	switch (true) {
		case /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterCommand[i].trim()):
			let match = /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterCommand[i]);
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

		case /score\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)/.test(filterCommand[i].trim()):
			let match = /score\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testCombiFilterScoreSelection.push('='); else testCombiFilterScoreSelection.push(match[1]);
			testCombiFilterScore.push(+match[2]);
			break;

		default:
			testCombiFilterScoreSelection.push(null);
			testCombiFilterScore.push(-1);
			break;
	}
	
	
	// Parsing REPETITION
	switch (true) {
		case /repetition\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)/.test(filterCommand[i].trim()):
			let match = /repetition\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testCombiFilterRepetitionSelection.push('='); else testCombiFilterRepetitionSelection.push(match[1]);
			testCombiFilterRepetition.push(+match[2]);
			break;

		default:
			testCombiFilterRepetitionSelection.push(null);
			testCombiFilterRepetition.push(-1);
			break;
	}


	// Parsing MIN_VAL
	switch (true) {
		case /min_val\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)/.test(filterCommand[i].trim()):
			let match = /min_val\((<|=<|<=|=|!=|>=|=>|>)?(-?\d*)\)/.exec(filterCommand[i]);
			if (match[1] == null) testCombiFilterMinValSelection.push('='); else testCombiFilterMinValSelection.push(match[1]);
			testCombiFilterMinVal.push(+match[2]);
			break;

		default:
			testCombiFilterMinValSelection.push(null);
			testCombiFilterMinVal.push(-1);
			break;
	}
}


const printOutput = function (inputLinesCount, testedCombination, combiGlobalScore, combiGlobalFailure, hits_count_string, hits_filters_string) {
	// Display output
	if (cli.flags.printhits || cli.flags.printfullhits) {
		console.log("combi" + inputLinesCount.toString().padStart(10, 0) + ": " + lotteryFacility.CombinationHelper.toString(testedCombination.sort()) + " - combi_global_score: " + combiGlobalScore + " - combi_global_failure: " + combiGlobalFailure);
		console.log(hits_count_string);
		if (cli.flags.printfullhits) console.log(hits_filters_string);
	} else {
		console.log(lotteryFacility.CombinationHelper.toString(testedCombination.sort()));
	}
}


// Test all combinations of input file
let globalRepetition = 0;
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

	//TODO CL
	//console.log("testedCombination " + testedCombination);
	
	
	// TODO CL
	/*if (inputLinesCount < 257400) {
		console.log("Line " + inputLinesCount);
		return;
	}*/



	// Init tested combination track records
	let combiGlobalScore = 0;
	let combiGlobalFailure = 0;
	let combiFilterScore = new Array(filterCommand.length).fill(0);
	let combiFilterFailure = new Array(filterCommand.length).fill(0);
	let combiFilterMinValue = new Array(filterCommand.length).fill(-1);
	let combiFilterMaxValue = new Array(filterCommand.length).fill(-1);
	let combiFilterSumValue = new Array(filterCommand.length).fill(-1);
	let slicedCombination = testedCombination;
	let coveredLines = "";
	let withOngoingSelection = false;


	// Loop on all filter commands
	let hits_count_string = '';
	let hits_filters_string = '';
	for (let i = 0; i < filterCommand.length; i++)
	{
		let hitsCount = 0;


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
			combiFilterMinValue[i] = -1;
			combiFilterMaxValue[i] = -1;
			combiFilterSumValue[i] = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 1; combiGlobalFailure++;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Combi distance scope
		let distance = lotteryFacility.CombinationHelper.distance(global_alphabet, testedCombination);
		let selectDistanceScope = true;
		switch (true) {
			case (testDistanceSelection[i] == null):
				break; // No rule

			case /^<$/.test(testDistanceSelection[i]):
				if (!(distance < testDistance[i])) selectDistanceScope = false; // reject this combination
				break;

			case /^=<$/.test(testDistanceSelection[i]):
			case /^<=$/.test(testDistanceSelection[i]):
				if (!(distance <= testDistance[i])) selectDistanceScope = false; // reject this combination
				break;

			case /^=$/.test(testDistanceSelection[i]):
				if (!(distance == testDistance[i])) selectDistanceScope = false; // reject this combination
				break;

			case /^!=$/.test(testDistanceSelection[i]):
				if (!(distance != testDistance[i])) selectDistanceScope = false; // reject this combination
				break;

			case /^=>$/.test(testDistanceSelection[i]):
			case /^>=$/.test(testDistanceSelection[i]):
				if (!(distance >= testDistance[i])) selectDistanceScope = false; // reject this combination
				break;

			case /^>$/.test(testDistanceSelection[i]):
				if (!(distance > testDistance[i])) selectDistanceScope = false; // reject this combination
				break;

			default:
				selectDistanceScope = false; // reject this combination
				break;
		}
		if (!selectDistanceScope) {
			hitsCount = -1;
			combiFilterMinValue[i] = -1;
			combiFilterMaxValue[i] = -1;
			combiFilterSumValue[i] = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 1; combiGlobalFailure++;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Combi min_gap scope
		let minGap = lotteryFacility.CombinationHelper.minimum_right_gap(global_alphabet, testedCombination);
		let selectMingapScope = true;
		switch (true) {
			case (testMingapSelection[i] == null):
				break; // No rule

			case (minGap < 0):
				selectMingapScope = false; // reject this combination
				break;

			case /^<$/.test(testMingapSelection[i]):
				if (!(minGap < testMingap[i])) selectMingapScope = false; // reject this combination
				break;

			case /^=<$/.test(testMingapSelection[i]):
			case /^<=$/.test(testMingapSelection[i]):
				if (!(minGap <= testMingap[i])) selectMingapScope = false; // reject this combination
				break;

			case /^=$/.test(testMingapSelection[i]):
				if (!(minGap == testMingap[i])) selectMingapScope = false; // reject this combination
				break;

			case /^!=$/.test(testMingapSelection[i]):
				if (!(minGap != testMingap[i])) selectMingapScope = false; // reject this combination
				break;

			case /^=>$/.test(testMingapSelection[i]):
			case /^>=$/.test(testMingapSelection[i]):
				if (!(minGap >= testMingap[i])) selectMingapScope = false; // reject this combination
				break;

			case /^>$/.test(testMingapSelection[i]):
				if (!(minGap > testMingap[i])) selectMingapScope = false; // reject this combination
				break;

			default:
				selectMingapScope = false; // reject this combination
				break;
		}
		if (!selectMingapScope) {
			hitsCount = -1;
			combiFilterMinValue[i] = -1;
			combiFilterMaxValue[i] = -1;
			combiFilterSumValue[i] = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 1; combiGlobalFailure++;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Combi max_gap scope
		let maxGap = lotteryFacility.CombinationHelper.maximum_right_gap(global_alphabet, testedCombination);
		let selectMaxgapScope = true;
		switch (true) {
			case (testMaxgapSelection[i] == null):
				break; // No rule

			case (maxGap < 0):
				selectMaxgapScope = false; // reject this combination
				break;

			case /^<$/.test(testMaxgapSelection[i]):
				if (!(maxGap < testMaxgap[i])) selectMaxgapScope = false; // reject this combination
				break;

			case /^=<$/.test(testMaxgapSelection[i]):
			case /^<=$/.test(testMaxgapSelection[i]):
				if (!(maxGap <= testMaxgap[i])) selectMaxgapScope = false; // reject this combination
				break;

			case /^=$/.test(testMaxgapSelection[i]):
				if (!(maxGap == testMaxgap[i])) selectMaxgapScope = false; // reject this combination
				break;

			case /^!=$/.test(testMaxgapSelection[i]):
				if (!(maxGap != testMaxgap[i])) selectMaxgapScope = false; // reject this combination
				break;

			case /^=>$/.test(testMaxgapSelection[i]):
			case /^>=$/.test(testMaxgapSelection[i]):
				if (!(maxGap >= testMaxgap[i])) selectMaxgapScope = false; // reject this combination
				break;

			case /^>$/.test(testMaxgapSelection[i]):
				if (!(maxGap > testMaxgap[i])) selectMaxgapScope = false; // reject this combination
				break;

			default:
				selectMaxgapScope = false; // reject this combination
				break;
		}
		if (!selectMaxgapScope) {
			hitsCount = -1;
			combiFilterMinValue[i] = -1;
			combiFilterMaxValue[i] = -1;
			combiFilterSumValue[i] = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 1; combiGlobalFailure++;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Check whether computing a score is relevant or not
		if (filename[i] === null || testLevelSelection[i] === null) {
			hitsCount = -1;
			combiFilterMinValue[i] = -1;
			combiFilterMaxValue[i] = -1;
			combiFilterSumValue[i] = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 0;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Get current sliced combination
		if (slice[i] != null) {
			let indexes = slice[i];
			slicedCombination = indexes.map(i => testedCombination[i]).filter(e => typeof e !== 'undefined');
		}


		// Init the ongoing selection in case of "_selection" logical file
		if (filename[i] === '_selection' && preSelectedCombinations.length === 0 && selectedCombinations.length === 0) {
			withOngoingSelection = true;
			hitsCount = -1;
			combiFilterMinValue[i] = -1;
			combiFilterMaxValue[i] = -1;
			combiFilterSumValue[i] = -1;
			combiFilterScore[i] = -1;
			combiFilterFailure[i] = 0;
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - `;
			continue;		// next filter command
		}


		// Get current filter combinations
		let currentFilterCombinations = [];
		currentFilterCombinations = [...currentFilterCombinations, ...preSelectedCombinations];
		switch (true) {
			case /^_selection$/.test(filename[i].trim()):
				withOngoingSelection = true;
				currentFilterCombinations = [...currentFilterCombinations, ...selectedCombinations];
				break;

			default:
				if (filterCombinations[i]) currentFilterCombinations = [...currentFilterCombinations, ...filterCombinations[i]];
				break;
		}


		// Get restrictions
		let matchingRestrictions = [];
		if (restrictions[i] != null && restrictions[i].trim() == "_selection") {
			filterRestrictions[i] = [...selectedCombinations];
		}

		if (filterRestrictions[i] == null || filterRestrictions[i].length == 0) {
			matchingRestrictions.push (slicedCombination);
		}
		else
		{
			for (let j = 0; j < filterRestrictions[i].length; j++) {
				let match = false;
				let nb_collisions = lotteryFacility.CombinationHelper.collisionsCount(slicedCombination, filterRestrictions[i][j].combination);
				switch (true) {
					case /^<$/.test(testLevelSelection[i]):
						if (nb_collisions < testLevel[i]) {
							match = true;
						}
						break;

					case /^=<$/.test(testLevelSelection[i]):
					case /^<=$/.test(testLevelSelection[i]):
						if (nb_collisions <= testLevel[i]) {
							match = true;
						}
						break;

					case /^=$/.test(testLevelSelection[i]):
						if (nb_collisions == testLevel[i]) {
							match = true;
						}
						break;

					case /^!=$/.test(testLevelSelection[i]):
						if (nb_collisions != testLevel[i]) {
							match = true;
						}
						break;

					case /^=>$/.test(testLevelSelection[i]):
					case /^>=$/.test(testLevelSelection[i]):
						if (nb_collisions >= testLevel[i]) {
							match = true;
						}
						break;

					case /^>$/.test(testLevelSelection[i]):
						if (nb_collisions > testLevel[i]) {
							match = true;
						}
						break;

					default:
						break;
				}

				if (match) {
					matchingRestrictions.push (filterRestrictions[i][j].combination);
				}
			}
		}


		// Get current tested combination's score
		let withValue = true;
		combiFilterSumValue[i] = 0;
		hitsCount = 0;


		let selectRepetitionScope = true;
		let selectScoreScope = true;
		for (let k = 0; k < matchingRestrictions.length; k++)
		{
			let nbHits = 0;
			let score = 0;
			
			
			//TODO CL
			//console.log("nbHits " + nbHits);
			

			let matchingCombinations = [];
			for (let j = 0; j < currentFilterCombinations.length; j++) {
				let match = false;
				let nb_collisions = lotteryFacility.CombinationHelper.collisionsCount(matchingRestrictions[k], currentFilterCombinations[j].combination);


				// TODO CL
				//console.log("matchingRestrictions[k] " + matchingRestrictions[k]);
				//console.log("currentFilterCombinations[j].combination " + currentFilterCombinations[j].combination);
				//console.log("nb_collisions " + nb_collisions);



				switch (true) {
					case /^<$/.test(testLevelSelection[i]):
						if (nb_collisions < testLevel[i]) {
							match = true;
						}
						break;

					case /^=<$/.test(testLevelSelection[i]):
					case /^<=$/.test(testLevelSelection[i]):
						if (nb_collisions <= testLevel[i]) {
							match = true;
						}
						break;

					case /^=$/.test(testLevelSelection[i]):
						if (nb_collisions == testLevel[i]) {
							match = true;
						}
						break;

					case /^!=$/.test(testLevelSelection[i]):
						if (nb_collisions != testLevel[i]) {
							match = true;
						}
						break;

					case /^=>$/.test(testLevelSelection[i]):
					case /^>=$/.test(testLevelSelection[i]):
						if (nb_collisions >= testLevel[i]) {
							match = true;
						}
						break;

					case /^>$/.test(testLevelSelection[i]):
						if (nb_collisions > testLevel[i]) {
							match = true;
						}
						break;

					default:
						break;
				}

				if (match) {
					matchingCombinations.push (currentFilterCombinations[j]);
				}
			}
			if (!withValue) {
				combiFilterMinValue[i] = -1;
				combiFilterMaxValue[i] = -1;
				combiFilterSumValue[i] = -1;
			}


			// TODO CL
			//console.log("matchingCombinations " + JSON.stringify(matchingCombinations));


			let combiRepetition = 0;
			hits_filters_string += lotteryFacility.CombinationHelper.toString(matchingRestrictions[k]) + '\n';
			for (let j = 0; j < matchingCombinations.length; j++) {
				combiRepetition += (matchingCombinations[j].covering == 0) ? 0 : matchingCombinations[j].covering;
				nbHits++;
				let nb_collisions = lotteryFacility.CombinationHelper.collisionsCount(matchingRestrictions[k], matchingCombinations[j].combination);
				hits_filters_string += lotteryFacility.CombinationHelper.toString(matchingCombinations[j].combination) + ` - [ nb_collisions: ${nb_collisions} ]` + '\n';
				coveredLines += matchingCombinations[j].lineNum;
				coveredLines += " ";
			}


			//TODO CL
			//console.log(`combiRepetition #${i}: ` + combiRepetition + "\t" + testedCombination);


			// Combi repetition scope
			switch (true) {
				case (testCombiFilterRepetitionSelection[i] == null):
					break; // No rule

				case /^<$/.test(testCombiFilterRepetitionSelection[i]):
					if (!(combiRepetition < testCombiFilterRepetition[i])) selectRepetitionScope = false; // reject this combination
					break;

				case /^=<$/.test(testCombiFilterRepetitionSelection[i]):
				case /^<=$/.test(testCombiFilterRepetitionSelection[i]):
					if (!(combiRepetition <= testCombiFilterRepetition[i])) selectRepetitionScope = false; // reject this combination
					break;

				case /^=$/.test(testCombiFilterRepetitionSelection[i]):
					if (!(combiRepetition == testCombiFilterRepetition[i])) selectRepetitionScope = false; // reject this combination
					break;

				case /^!=$/.test(testCombiFilterRepetitionSelection[i]):
					if (!(combiRepetition != testCombiFilterRepetition[i])) selectRepetitionScope = false; // reject this combination
					break;

				case /^=>$/.test(testCombiFilterRepetitionSelection[i]):
				case /^>=$/.test(testCombiFilterRepetitionSelection[i]):
					if (!(combiRepetition >= testCombiFilterRepetition[i])) selectRepetitionScope = false; // reject this combination
					break;

				case /^>$/.test(testCombiFilterRepetitionSelection[i]):
					if (!(combiRepetition > testCombiFilterRepetition[i])) selectRepetitionScope = false; // reject this combination
					break;

				default:
					selectRepetitionScope = false; // reject this combination
					break;
			}
			
			
			//TODO CL
			//console.log("selectRepetitionScope " + selectRepetitionScope);
			
			
			if (!selectRepetitionScope) {
				combiFilterFailure[i] = 1; combiGlobalFailure++;
				break;
			}





			score = nbHits * weight[i];
			hits_count_string += lotteryFacility.CombinationHelper.toString(matchingRestrictions[k]) + '\n';
			hits_count_string += `[hits: ${nbHits} - score: ${score} ] `;


			//TODO CL
			//console.log("nbHits " + nbHits);
			//console.log("score " + score);
			//console.log("testCombiFilterScoreSelection[i] " + testCombiFilterScoreSelection[i]);
			//console.log("testCombiFilterScore[i] " + testCombiFilterScore[i]);
			

			// Combi score scope
			switch (true) {
				case (coverStatsMode):
				case (coverLinesMode):
				case (testCombiFilterScoreSelection[i] == null):
					break; // No rule

				case /^<$/.test(testCombiFilterScoreSelection[i]):
					if (!(score < testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
					break;

				case /^=<$/.test(testCombiFilterScoreSelection[i]):
				case /^<=$/.test(testCombiFilterScoreSelection[i]):
					if (!(score <= testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
					break;

				case /^=$/.test(testCombiFilterScoreSelection[i]):
					if (!(score == testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
					break;

				case /^!=$/.test(testCombiFilterScoreSelection[i]):
					if (!(score != testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
					break;

				case /^=>$/.test(testCombiFilterScoreSelection[i]):
				case /^>=$/.test(testCombiFilterScoreSelection[i]):
					if (!(score >= testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
					//else testCombiFilterScore[i] = score;
					break;

				case /^>$/.test(testCombiFilterScoreSelection[i]):
					if (!(score > testCombiFilterScore[i])) selectScoreScope = false; // reject this combination
					//else testCombiFilterScore[i] = score;
					break;

				case /^\*$/.test(testCombiFilterScoreSelection[i]):
					if (!(nbHits == currentFilterCombinations.length)) selectScoreScope = false; // reject this combination
					break;

				default:
					selectScoreScope = false; // reject this combination
					break;
			}
			
			
			//TODO CL
			//console.log("selectScoreScope " + selectScoreScope);
			
			
			if (!selectScoreScope) {
				combiFilterFailure[i] = 1; combiGlobalFailure++;
				break;
			}
			
			
			
			for (let j = 0; j < matchingCombinations.length; j++) {
				matchingCombinations[j].covering++;
				//globalRepetition++;
				
				if (withValue)
				{
					if (combiFilterMinValue[i] == -1) { combiFilterMinValue[i] = matchingCombinations[j].value; }
					else if (combiFilterMinValue[i] > matchingCombinations[j].value) { combiFilterMinValue[i] = matchingCombinations[j].value; }

					if (combiFilterMaxValue[i] == -1) { combiFilterMaxValue[i] = matchingCombinations[j].value; }
					else if (combiFilterMaxValue[i] < matchingCombinations[j].value) { combiFilterMaxValue[i] = matchingCombinations[j].value; }

					combiFilterSumValue[i] += matchingCombinations[j].value;
				}
			}

			
			
			hitsCount += nbHits;
			combiFilterScore[i] = hitsCount * weight[i]; combiGlobalScore += combiFilterScore[i];
			hits_count_string += lotteryFacility.CombinationHelper.toString(slicedCombination) + '\n';
			hits_count_string += `[hits: ${hitsCount} - score: ${combiFilterScore[i]} - failure: ${combiFilterFailure[i]}] - min value: ${combiFilterMinValue[i]} - - max value: ${combiFilterMaxValue[i]} - - sum value: ${combiFilterSumValue[i]}`;
		}


	}


	// Combi global score scope
	let selectScoreScope = true;
	for (let i = 0; i < testGlobalScoreSelection.length; i++)
	{
		switch (true) {
			case (coverStatsMode):
			case (coverLinesMode):
			case (testGlobalScoreSelection[i] == null):
				break; // No rule

			case (withOngoingSelection && selectedCombinations.length === 0 && combiGlobalScore === 0):
				break;

			case /^<$/.test(testGlobalScoreSelection[i]):
				if (!(combiGlobalScore < testGlobalScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^=<$/.test(testGlobalScoreSelection[i]):
			case /^<=$/.test(testGlobalScoreSelection[i]):
				if (!(combiGlobalScore <= testGlobalScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^=$/.test(testGlobalScoreSelection[i]):
				if (!(combiGlobalScore === testGlobalScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^!=$/.test(testGlobalScoreSelection[i]):
				if (!(combiGlobalScore != testGlobalScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^=>$/.test(testGlobalScoreSelection[i]):
			case /^>=$/.test(testGlobalScoreSelection[i]):
				if (!(combiGlobalScore >= testGlobalScore[i])) selectScoreScope = false; // reject this combination
				break;

			case /^>$/.test(testGlobalScoreSelection[i]):
				if (!(combiGlobalScore > testGlobalScore[i])) selectScoreScope = false; // reject this combination
				break;

			default:
				selectScoreScope = false; // reject this combination
				break;
		}
		if (!selectScoreScope) {
			return;			// next tested combination
		}
	}
	
	
	// TODO CL
	//console.log("combiGlobalFailure " + combiGlobalFailure);
	//console.log("testGlobalFailureSelection.length " + testGlobalFailureSelection.length);


	// Combi global failure scope
	let selectFailureScope = true;
	for (let i = 0; i < testGlobalFailureSelection.length; i++)
	{
		switch (true) {
			case (coverStatsMode):
			case (coverLinesMode):
			case (testGlobalFailureSelection[i] == null):
				break; // No rule

			case /^<$/.test(testGlobalFailureSelection[i]):
				if (!(combiGlobalFailure < testGlobalFailure[i])) selectFailureScope = false; // reject this combination
				break;

			case /^=<$/.test(testGlobalFailureSelection[i]):
			case /^<=$/.test(testGlobalFailureSelection[i]):
				if (!(combiGlobalFailure <= testGlobalFailure[i])) selectFailureScope = false; // reject this combination
				break;

			case /^=$/.test(testGlobalFailureSelection[i]):
				if (!(combiGlobalFailure == testGlobalFailure[i])) selectFailureScope = false; // reject this combination
				break;

			case /^!=$/.test(testGlobalFailureSelection[i]):
				if (!(combiGlobalFailure != testGlobalFailure[i])) selectFailureScope = false; // reject this combination
				break;

			case /^=>$/.test(testGlobalFailureSelection[i]):
			case /^>=$/.test(testGlobalFailureSelection[i]):
				if (!(combiGlobalFailure >= testGlobalFailure[i])) selectFailureScope = false; // reject this combination
				break;

			case /^>$/.test(testGlobalFailureSelection[i]):
				if (!(combiGlobalFailure > testGlobalFailure[i])) selectFailureScope = false; // reject this combination
				break;

			default:
				selectFailureScope = false; // reject this combination
				break;
		}
		
		
		//TODO CL
		//console.log("selectFailureScope " + selectFailureScope);
		
		
		if (!selectFailureScope) {
			return;			// next tested combination
		}
	}


	// Skip some tested combinations
	while (selectionSkip > 0) {
		--selectionSkip;
		return;			// next tested combination
	}


	// Print covered lines
	if (coverLinesMode) {
		console.log(coveredLines)
	}


	// Select the tested combination and get global track records
	globalScore += combiGlobalScore;
	globalFailure += combiGlobalFailure;


	// Add the tested combination to the ongoing selection
	if (!coverStatsMode && !coverLinesMode) {
		printOutput(inputLinesCount, slicedCombination, combiGlobalScore, combiGlobalFailure, hits_count_string, hits_filters_string);
		if (additionMode) {
			let lineNum = preSelectedCombinations.length + selectedCombinations.length + 1;
			selectedCombinations.push({lineNum: lineNum, combination: slicedCombination, covering: 0, value: 0, preselected: false, }); additions++;
			if (additionsLimit != -1 && additions >= additionsLimit) {
				process.exit(1);
			}
		}
	}
})
.on('close', () => {
	if (coverStatsMode) {
		for (let i = 0; i < filterCommand.length; i++) {
			console.log(`Filter #${i+1} on file ${filename[i]}`);
			for (let j = 0; j < filterCombinations[i].length; j++) {
				console.log(`${lotteryFacility.CombinationHelper.toString(filterCombinations[i][j].combination)}: ${filterCombinations[i][j].covering}`);
			}
			console.log();
		}
		return;
	}

	console.warn("Nb selected:   "  + selectedCombinations.length);
	console.warn("Total score:   "  + globalScore);
	console.warn("Total failure: "  + globalFailure);

	//console.log("inputLinesCount "  + inputLinesCount);
	fileStream.close();
});
