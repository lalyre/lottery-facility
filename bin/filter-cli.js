#!/usr/bin/env node
'use strict';
const fs = require('fs');
const readline = require('readline');
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');
const FILTER_LIMIT = 500000;


const cli = meow(`
	Usage
	  $ filter

	Parameters
	  --infile, -in   An input file containing one input combination per line, where some combinations will be selected.
	  --filter, -f    A filter file containing one combination per line, and those combinations will be used to select (with collisions count) input combinations.
	  --level, -l     Defining the <level> of collisions with the tested <filter> file.
	  --hits, -h      Defining the number of <hits>, i.e. the number of tested <filter> file lines that match the request.
	  --length        Defining the maximum number of additions into the selection of input combinations. Default value is -1 (unlimited).
	  --exclusive     If true the selected combinations are added on the fly to the running selection. Default value is true.
	  --printhits     Display the hit counts for each (filter, level, hits) trio in their declarative order.

	Description
	This script selects combinations from input file according to filter file <filter>, and <level> and <hits> restrictions.
	The selected combinations are printed and also added to the current selection of input combinations, increasing the difficulty of next selections.
	You can use "_self" or "_empty" values for <filter> file if you want to filter against the current selected input line or against an empty filter.

	With --level "<x", only filter lines with less than x collisions with the current input combination are considered.
	With --level "<=x", only filter lines with less than or equal x collisions with the current input combination are considered.
	With --level "=x" or --level x, only filter lines with x collisions with the current input combination are considered.
	With --level ">=x", only filter lines with more than or equal x collisions with the current input combination are considered.
	With --level ">x", only filter lines with more than x collisions with the current input combination are considered.

	With --hits "<x", if the current input combination matches with less than x filter lines then it is selected and printed to the ouput.
	With --hits "<=x", if the current input combination matches with less than or equal x filter lines then it is selected and printed to the ouput.
	With --hits "=x" or --hits x, if the current input combination matches with x filter lines then it is selected and printed to the ouput.
	With --hits ">=x", if the current input combination matches with more than or equal x filter lines then it is selected and printed to the ouput.
	With --hits ">x", if the current input combination matches with more than x filter lines then it is selected and printed to the ouput.
	With --hits "*", if the current input combination matches with all filter lines then it is selected and printed to the ouput.
`, {
	flags: {
		infile: {
			type: 'string',
			alias: 'in',
			isRequired: true,
			isMultiple: false,
		},
		filter: {
			type: 'string',
			alias: 'f',
			isRequired: true,
			isMultiple: true,
		},
		level: {
			type: 'string',
			alias: 'l',
			isRequired: true,
			isMultiple: true,
		},
		hits: {
			type: 'string',
			alias: 'h',
			isRequired: true,
			isMultiple: true,
		},
		length: {
			type: 'number',
			isRequired: false,
			isMultiple: false,
			default: -1,
		},
		exclusive: {
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
	}
});


let exclusiveMode = cli.flags.exclusive;
let filterAdditions = cli.flags.length;
let filterSelection = cli.flags.filter;
let levelSelection = cli.flags.level;
let hitsSelection = cli.flags.hits;
let infile = cli.flags.infile.trim();
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}
if (filterSelection.length != levelSelection.length || levelSelection.length !== hitsSelection.length) {
	console.error("Missing <filter> or <level> or <hits> parameter !");
	process.exit(1);
}


let level = [];
let hits = [];


let regexp = /^(<|<=|=|>=|>)?(\d*)$/;
for (let i = 0; i < levelSelection.length; i++) {
	switch (true) {
		case /^_empty$/.test(filterSelection[i].trim()):
			break;

		case /^_self$/.test(filterSelection[i].trim()):
			break;
		
		default:
			if (!fs.existsSync(filterSelection[i].trim())) {
				console.error(`File ${filterSelection[i]} does not exist`);
				process.exit(1);
			}
			break;
	}

	switch (true) {
		case regexp.test(levelSelection[i]):
			let match = regexp.exec(levelSelection[i]);
			level.push(match[2]);
			break;
		
		default:
			console.error(`Wrong <level> (#${i+1}) value.`);
			process.exit(1);
			break;
	}

	switch (true) {
		case regexp.test(hitsSelection[i]):
			let match = regexp.exec(hitsSelection[i]);
			hits.push(match[2]);
			break;
	
		case /^\*$/.test(hitsSelection[i]):
			break;
	
		default:
			console.error(`Wrong <hits> (#${i+1}) value.`);
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

	
	if (selected_numbers.length >= FILTER_LIMIT) {
		console.error("Limit of filter is reached !");
		process.exit(1);
	}


	let hits_count_string = '';
	let hits_filters_string = '';
	for (let i = 0; i < levelSelection.length; i++)
	{
		let filter_tested_numbers = [];
		switch (true) {
			case /^_empty$/.test(filterSelection[i].trim()):
				break;
	
			case /^_self$/.test(filterSelection[i].trim()):
				filter_tested_numbers = selected_numbers;
				break;
			
			default:
				let filter_lines = fs.readFileSync(filterSelection[i].trim()).toString().split(/\r?\n/);
				for (let filter_line of filter_lines) {
					let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
					if (numbers[0] == 0) continue;
					if (numbers.join("") == '') continue;
					filter_tested_numbers.push(numbers);
				}
				break;
		}

		
		let selectCombination = true;
		let hitsCount = 0;
		for (let j = 0; j < filter_tested_numbers.length; j++) {
			let nb_collisions = lotteryFacility.collisionsCount(input_line_numbers, filter_tested_numbers[j]);
			
			switch (true) {
				case /^<\d*$/.test(levelSelection[i]):
					if (nb_collisions < level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.combinationString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]` + '\n';
					}
					break;
		
				case /^<=\d*$/.test(levelSelection[i]):
					if (nb_collisions <= level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.combinationString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;
		
				case /^(=)?\d*$/.test(levelSelection[i]):
					if (nb_collisions == level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.combinationString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;
		
				case /^>=\d*$/.test(levelSelection[i]):
					if (nb_collisions >= level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.combinationString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;
		
				case /^>\d*$/.test(levelSelection[i]):
					if (nb_collisions > level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.combinationString(filter_tested_numbers[j]) + ` - [nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;
		
				default:
					break;
			}
		}
		hits_filters_string += '\n';

		switch (true) {
			case /^<\d*$/.test(hitsSelection[i]):
				if (!(hitsCount < hits[i])) {
					selectCombination = false;
				}
				break;
	
			case /^<=\d*$/.test(hitsSelection[i]):
				if (!(hitsCount <= hits[i])) {
					selectCombination = false;
				}
				break;
	
			case /^(=)?\d*$/.test(hitsSelection[i]):
				if (!(hitsCount == hits[i])) {
					selectCombination = false;
				}
				break;
	
			case /^>=\d*$/.test(hitsSelection[i]):
				if (!(hitsCount >= hits[i])) {
					selectCombination = false;
				}
				break;
	
			case /^>\d*$/.test(hitsSelection[i]):
				if (!(hitsCount > hits[i])) {
					selectCombination = false;
				}
				break;
	
			case /^\*$/.test(hitsSelection[i]):
				if (!(hitsCount == filter_tested_numbers.length)) {
					selectCombination = false;
				}
				break;
	
			default:
				break;
		}
	
		if (!selectCombination) return;
		hits_count_string += ` - [hits: ${hitsCount} ]`;
	}


	if (cli.flags.printhits) {
		console.log("combi" + inputLinesCount.toString().padStart(10, 0) + ": " + lotteryFacility.combinationString(input_line_numbers.sort()) + hits_count_string);
		console.log(hits_filters_string);
	} else {
		console.log(lotteryFacility.combinationString(input_line_numbers.sort()));
	}


	if (exclusiveMode) {
		selected_numbers.push(input_line_numbers.sort()); additions++;
		if (filterAdditions != -1 && additions >= filterAdditions) {
			process.exit(1);
		}
	}
})
.on('close', () => {
	//console.log("inputLinesCount "  + inputLinesCount);
	fileStream.close();
});
