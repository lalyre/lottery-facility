#!/usr/bin/env node
'use strict';
const fs = require('fs');
const readline = require('readline');
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');


const cli = meow(`
	Usage
	  $ balancer

	Parameters
	  --infile, -in   An input file containing one combination per line, where some combinations will be selected.
	  --filter, -f    A filter file containing one combination per line, and those combinations will be used to select input combinations.
	  --level, -l     Defining the <level> of collisions with the current filter.
	  --hits, -h      Defining the number of <hits>, i.e. the number of filter lines that match the request.

	Description
	This script selects combinations from input file according to filter <level> and <hits> restrictions.
	The selected combinations are printed and also added to the current filter combinations, increasing the difficulty of next selections.

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
			isRequired: false,
			isMultiple: false,
		},
		level: {
			type: 'string',
			alias: 'l',
			isRequired: true,
			isMultiple: true,
			//default: 1,
		},
		hits: {
			type: 'string',
			alias: 'h',
			isRequired: true,
			isMultiple: true,
			//default: 1,
		},
	}
});


let infile = cli.flags.infile.trim();
let levelSelection = cli.flags.level;
let hitsSelection = cli.flags.hits;
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}
if (levelSelection.length !== hitsSelection.length) {
	console.error("Missing <level> or <hits> parameter !");
	process.exit(1);
}


let level = [];
let hits = [];
let filter_numbers = [];


let regexp = /^(<|<=|=|>=|>)?(\d*)$/;
for (let i = 0; i < levelSelection.length; i++) {
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


// Loading initial filter
if (cli.flags.filter) {
	let filterfile = cli.flags.filter.trim();

	/*if (!fs.existsSync(filterfile)) {
		fs.writeFileSync(filterfile, '', { flag: 'a+'});
	}*/
	
	let filter_lines = fs.readFileSync(filterfile).toString().split(/\r?\n/);
	for (let filter_line of filter_lines) {
		let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
		if (numbers[0] == 0) continue;
		if (numbers.join("") == '') continue;
		filter_numbers.push(numbers);
	}
}


// Test all combinations of input file
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


	for (let i = 0; i < levelSelection.length; i++)
	{
		let selectCombination = true;
		let hitsCount = 0;
		for (let j = 0; j < filter_numbers.length; j++) {
			let nb_collisions = lotteryFacility.collisionsCount(input_line_numbers, filter_numbers[j]);
			
			switch (true) {
				case /^<\d*$/.test(levelSelection[i]):
					if (nb_collisions < level[i]) {
						hitsCount++;
					}
					break;
		
				case /^<=\d*$/.test(levelSelection[i]):
					if (nb_collisions <= level[i]) {
						hitsCount++;
					}
					break;
		
				case /^(=)?\d*$/.test(levelSelection[i]):
					if (nb_collisions == level[i]) {
						hitsCount++;
					}
					break;
		
				case /^>=\d*$/.test(levelSelection[i]):
					if (nb_collisions >= level[i]) {
						hitsCount++;
					}
					break;
		
				case /^>\d*$/.test(levelSelection[i]):
					if (nb_collisions > level[i]) {
						hitsCount++;
					}
					break;
		
				default:
					break;
			}
		}

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
				if (!(hitsCount == filter_numbers.length)) {
					selectCombination = false;
				}
				break;
	
			default:
				break;
		}
	
		if (!selectCombination) return;
	}


	if (filter_numbers.length >= 500000) {
		console.error("Limit of filter is reached !");
		process.exit(1);
	}

	filter_numbers.push(input_line_numbers.sort());
	console.log(lotteryFacility.combinationString(input_line_numbers.sort()));
})
.on('close', () => {
	//console.log("inputLinesCount "  + inputLinesCount);


	fileStream.close();
});

