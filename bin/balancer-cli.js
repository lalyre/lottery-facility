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
			isMultiple: false,
			//default: 1,
		},
		hits: {
			type: 'string',
			alias: 'h',
			isRequired: true,
			isMultiple: false,
			//default: 1,
		},
	}
});


let levelSelection = cli.flags.level;
let hitsSelection = cli.flags.hits;
let level = null;
let hits = null;
let infile = cli.flags.infile.trim();
let filter_numbers = [];


let regexp1 = /^(<|<=|=|>=|>)?(\d*)$/;
switch (true) {
	case regexp1.test(levelSelection):
		let match = regexp1.exec(levelSelection);
		level = match[2];
		break;
	
	default:
		console.error("Wrong <level> value.");
		process.exit(1);
		break;
}


let regexp2 = /^(<|<=|=|>=|>)?(\d*)|\*$/;
switch (true) {
	case regexp2.test(hitsSelection):
		let match = regexp2.exec(hitsSelection);
		hits = match[2];
		break;

	default:
		console.error("Wrong <hits> value.");
		process.exit(1);
		break;
}
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}


// Loading initial filter
if (cli.flags.filter) {
	let filterfile = cli.flags.filter.trim();

	/*if (!fs.existsSync(filterfile)) {
		fs.writeFileSync(filterfile, '', { flag: 'a+'});
	}*/
	
	let filter_lines = fs.readFileSync(filterfile).toString().split(/\r?\n/);
	for (let filter_line of filter_lines) {
		let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i).sort();
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


	let hitsCount = 0;
	for (let j = 0; j < filter_numbers.length; j++) {
		let nb_collisions = lotteryFacility.collisionsCount(input_line_numbers, filter_numbers[j]);
		
		switch (true) {
			case /^<\d*$/.test(levelSelection):
				if (nb_collisions < level) {
					hitsCount++;
				}
				break;
	
			case /^<=\d*$/.test(levelSelection):
				if (nb_collisions <= level) {
					hitsCount++;
				}
				break;
	
			case /^(=)?\d*$/.test(levelSelection):
				if (nb_collisions == level) {
					hitsCount++;
				}
				break;
	
			case /^>=\d*$/.test(levelSelection):
				if (nb_collisions >= level) {
					hitsCount++;
				}
				break;
	
			case /^>\d*$/.test(levelSelection):
				if (nb_collisions > level) {
					hitsCount++;
				}
				break;
	
			default:
				break;
		}
	}


	switch (true) {
		case /^<\d*$/.test(hitsSelection):
			if (hitsCount < hits) {
				filter_numbers.push(input_line_numbers);
				console.log(lotteryFacility.combinationString(input_line_numbers));
			}
			break;

		case /^<=\d*$/.test(hitsSelection):
			if (hitsCount <= hits) {
				filter_numbers.push(input_line_numbers);
				console.log(lotteryFacility.combinationString(input_line_numbers));
			}
			break;

		case /^(=)?\d*$/.test(hitsSelection):
			if (hitsCount == hits) {
				filter_numbers.push(input_line_numbers);
				console.log(lotteryFacility.combinationString(input_line_numbers));
			}
			break;

		case /^>=\d*$/.test(hitsSelection):
			if (hitsCount >= hits) {
				filter_numbers.push(input_line_numbers);
				console.log(lotteryFacility.combinationString(input_line_numbers));
			}
			break;

		case /^>\d*$/.test(hitsSelection):
			if (hitsCount > hits) {
				filter_numbers.push(input_line_numbers);
				console.log(lotteryFacility.combinationString(input_line_numbers));
			}
			break;

		case /^\*$/.test(hitsSelection):
			if (hitsCount == filter_numbers.length) {
				filter_numbers.push(input_line_numbers);
				console.log(lotteryFacility.combinationString(input_line_numbers));
			}
			break;

		default:
			break;
	}


	/*if (filter_numbers.length >= 5000) {
		console.error("Limit of filter is reached !");
		process.exit(1);
	*/


})
.on('close', () => {
	//console.log("inputLinesCount "  + inputLinesCount);


	fileStream.close();
});



/*

combination --total 22 --size 5 --numbers "01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22" > 5_22.txt
node bin/balancer-cli.js --infile 5_22.txt --level 0 --hits "*" > filter.txt
echo. >> filter.txt
echo. >> filter.txt
node bin/balancer-cli.js --infile 5_22.txt --filter filter.txt --level ">1" --hits "0"


01 02 03 04 05
06 07 08 09 10
11 12 13 14 15
16 17 18 19 20

01 06 11 21 22


combination --total 22 --size 1 --numbers "01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22" > 1_22.txt
node bin/balancer-cli.js --infile 5_22.txt --filter 1_22.txt --level "0" --hits "5"



*/


