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
	  --infile, -in      An input file containing one input combination per line, where some combinations will be selected.
	  --selectionMode    Define the number of filters to be passed to select a combination. By default ALL filters are required to be passed.




// TODO
	  --filter, -f       A filter file containing one combination per line, and those combinations will be used to select (with collisions count) input combinations.
	  --level, -l        Defining the <level> of collisions with the tested <filter> file.
	  --hits, -h         Defining the number of <hits>, i.e. the number of tested <filter> file lines that match the request.





	  --limit            Defining the maximum number of additions into the selection of input combinations. Default value is -1 (unlimited).
	  --addition         If true the selected combinations are added on the fly to the running selection. Otherwise they are simply printed. Default value is true.
	  --printhits        Display the hit counts for each (filter, level, hits) trio in their declarative order.
	  --printfullhits    Display the hit counts for each (filter, level, hits) trio in their declarative order, and the filter lines that are collided.



// TODO
	Description
	This script selects combinations from input file according to filter file <filter>, and <level> and <hits> restrictions.
	The selected combinations are printed, and also added to the current selection of input combinations if the <addition> mode is enabled.
	You can use "_selection" value for <filter> file if you want to perform selection against the current selection of input combinations.





	Witch --selectionMode  "<x", only combinations with less than x passed filters are selected.
	Witch --selectionMode  "<=x", only combinations with less than or equal x passed filters are selected..
	Witch --selectionMode  "=x", only combinations with x passed filters are selected.
	Witch --selectionMode  "!=x", only combinations with not x passed filters are selected.
	Witch --selectionMode  ">=x", only combinations with more than or equal x passed filters are selected.
	Witch --selectionMode  ">x", only combinations with more than x passed filters are selected.
	Witch --selectionMode "*", only combinations with ALL filters passed are selected (Default case).



	With --level "<x", only filter lines with less than x collisions with the current input combination are considered.
	With --level "<=x", only filter lines with less than or equal x collisions with the current input combination are considered.
	With --level "=x" or --level x, only filter lines with x collisions with the current input combination are considered.
	With --level "!=x", only filter lines with not x collisions with the current input combination are considered.
	With --level ">=x", only filter lines with more than or equal x collisions with the current input combination are considered.
	With --level ">x", only filter lines with more than x collisions with the current input combination are considered.

	With --hits "<x", if the current input combination matches with less than x filter lines then it is selected and printed to the ouput.
	With --hits "<=x", if the current input combination matches with less than or equal x filter lines then it is selected and printed to the ouput.
	With --hits "=x" or --hits x, if the current input combination matches with x filter lines then it is selected and printed to the ouput.
	With --hits "!=x", if the current input combination does not match with x filter lines then it is selected and printed to the ouput.
	With --hits ">=x", if the current input combination matches with more than or equal x filter lines then it is selected and printed to the ouput.
	With --hits ">x", if the current input combination matches with more than x filter lines then it is selected and printed to the ouput.
	// With --hits "min", the combinations with the minimum hits count are selected and printed to the ouput.
	// With --hits "max", the combinations with the maximum hits count are selected and printed to the ouput.
	With --hits "*", if the current input combination matches with all filter lines then it is selected and printed to the ouput.



// TODO
--filter "filename(_selection)weight(1)level(>=2)score(0)"



`, {
	flags: {
		infile: {
			type: 'string',
			alias: 'in',
			isRequired: true,
			isMultiple: false,
		},
		selectionMode: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
			//default: '*',
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
let infile = cli.flags.infile.trim();
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}


let filterModeSelection = cli.flags.selectionMode;
let filterGlobalScore = 0;
let regexp = /^(<|=<|<=|=|!=|>=|=>|>)?(\d*)$/;
switch (true) {
	case regexp.test(filterModeSelection):
		let match = regexp.exec(filterModeSelection);
		filterGlobalScore = match[2];
		break;

	default:
		console.error(`Wrong <selectionMode> value.`);
		process.exit(1);
		break;
}


let filterSelection = cli.flags.filter;
let filename = [];
let levelSelection = [];
let level = [];
let weight = [];
let scoreSelection = [];
let score = [];


for (let i = 0; i < filterSelection.length; i++) {
	switch (true) {
		case /filename\(_selection\)/.test(filterSelection[i].trim()):
			if (!additionMode) {
				console.error(`You must enable <addition> mode in conjonction with "_selection" filter.`);
				process.exit(1);
			}
			filename.push('_selection')
			break;
		
		case /filename\((\s)\)/.test(filterSelection[i].trim()):
			let match = /filename\((\s)\)/.exec(filterSelection[i]);
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


	switch (true) {
		case /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterSelection[i]):
			let match = /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterSelection[i]);
			levelSelection.push(match[1])
			level.push(match[2]);
			break;
		
		default:
			console.error(`No <level> (#${i+1}) value.`);
			process.exit(1);
			break;
	}


	switch (true) {
		case /weight\((\d*)\)/.test(filterSelection[i]):
			let match = /weight\((\d*)\)/.exec(filterSelection[i]);
			weight.push(match[1])
			break;
		
		default:
			console.error(`No <weight> (#${i+1}) value.`);
			process.exit(1);
			break;
	}


	switch (true) {
		case /score\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.test(filterSelection[i]):
			let match = /score\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)/.exec(filterSelection[i]);
			scoreSelection.push(match[1])
			score.push(match[2]);
			break;
		
		default:
			console.error(`No <score> (#${i+1}) value.`);
			process.exit(1);
			break;
	}
}


// Test all combinations of input file
let selected_numbers = [];
let additions = 0;
let inputLinesCount = 0;
let fileStream = fs.createReadStream(infile);
let rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
})
.on('line', async (line) => {
	if (!line) {
		return;
	}
	let input_line_numbers = line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
	if (input_line_numbers[0] == 0) return;
	if (input_line_numbers.join("") == '') return;
	inputLinesCount++;
	//console.log(input_line_numbers);


	if (selected_numbers.length >= SELECTION_LIMIT) {
		console.error("Limit of selection is reached !");
		process.exit(1);
	}


	let hits_count_string = '';
	let hits_filters_string = '';
	let globalScore = 0;
	for (let i = 0; i < filterSelection.length; i++)
	{
		let filter_tested_numbers = [];
		switch (true) {
			case /^_selection$/.test(filename[i].trim()):
				filter_tested_numbers = selected_numbers;
				break;
			
			default:
				let filter_lines = fs.readFileSync(filename[i].trim()).toString().split(/\r?\n/);
				for (let filter_line of filter_lines) {
					let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
					if (numbers[0] == 0) continue;
					if (numbers.join("") == '') continue;
					filter_tested_numbers.push(numbers);
				}
				break;
		}

		let hitsCount = 0;
		let limitHitsCount = 0;
		for (let j = 0; j < filter_tested_numbers.length; j++) {
			let nb_collisions = lotteryFacility.Combination.collisionsCount(input_line_numbers, filter_tested_numbers[j]);


				if (/</.test(levelSelection[i])) {
					if (nb_collisions < level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]-1) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]` + '\n';
					}
				}

				if ((/=</.test(levelSelection[i]))
				|| (/<=/.test(levelSelection[i]))) {
					if (nb_collisions <= level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
				}

				if (/(=)?/.test(levelSelection[i])) {
					if (nb_collisions == level[i]) {
						hitsCount++;
						limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
				}

				if (/!=/.test(levelSelection[i])) {
					if (nb_collisions != level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
				}


				if ((/=>/.test(levelSelection[i]))
				|| (/>=/.test(levelSelection[i]))) {
					if (nb_collisions >= level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
				}

				if (/>/.test(levelSelection[i])) {
					if (nb_collisions > level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]+1) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [nb_collisions: ${nb_collisions} ]`  + '\n';
					}
				}
		}
		hits_filters_string += '\n';
		
		
		let score2 = hitsCount * weight[i];
		let selectCombination = false;
		switch (true) {
			case /</.test(scoreSelection[i]):
				if (score2 < score[i]) {
					selectCombination = true;
				}
				break;

			case /=</.test(scoreSelection[i]):
			case /<=/.test(scoreSelection[i]):
				if (score2 <= score[i]) {
					selectCombination = true;
				}
				break;

			case /(=)?/.test(scoreSelection[i]):
				if (score2 == score[i]) {
					selectCombination = true;
				}
				break;

			case /!=/.test(scoreSelection[i]):
				if (score2 != score[i]) {
					selectCombination = true;
				}
				break;

			case /=>/.test(scoreSelection[i]):
			case />=/.test(scoreSelection[i]):
				if (score2 >= score[i]) {
					selectCombination = true;
				}
				break;

			case />/.test(scoreSelection[i]):
				if (score2 > score[i]) {
					selectCombination = true;
				}
				break;

			default:
				break;
		}

		if (selectCombination) globalScore += score2;
		hits_count_string += ` - [hits: ${hitsCount} - score: ${score2}]`;
	}


	switch (true) {
		case /^<\d*$/.test(filterModeSelection):
			if (!(globalScore < filterGlobalScore)) return;					// reject this combination
			break;

		case /^=<\d*$/.test(filterModeSelection):
		case /^<=\d*$/.test(filterModeSelection):
			if (!(globalScore <= filterGlobalScore)) return;				// reject this combination
			break;

		case /^(=)?\d*$/.test(filterModeSelection):
			if (!(globalScore == filterGlobalScore)) return;				// reject this combination
			break;

		case /^!=\d*$/.test(filterModeSelection):
			if (!(globalScore != filterGlobalScore)) return;				// reject this combination
			break;

		case /^=>\d*$/.test(filterModeSelection):
		case /^>=\d*$/.test(filterModeSelection):
			if (!(globalScore >= filterGlobalScore)) return;				// reject this combination
			break;

		case /^>\d*$/.test(filterModeSelection):
			if (!(globalScore > filterGlobalScore)) return;					// reject this combination
			break;

		default:
			return;															// reject this combination
	}


	if (cli.flags.printhits || cli.flags.printfullhits) {
		console.log("combi" + inputLinesCount.toString().padStart(10, 0) + ": " + lotteryFacility.Combination.toString(input_line_numbers.sort()) + " - global score: " + globalScore);
		console.log(hits_count_string);
		if (cli.flags.printfullhits) console.log(hits_filters_string);
	} else {
		console.log(lotteryFacility.Combination.toString(input_line_numbers.sort()));
	}


	if (additionMode) {
		selected_numbers.push(input_line_numbers.sort()); additions++;
		if (additionsLimit != -1 && additions >= additionsLimit) {
			process.exit(1);
		}
	}
})
.on('close', () => {
	//console.log("inputLinesCount "  + inputLinesCount);
	fileStream.close();
});
