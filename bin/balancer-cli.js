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
	
	With --level <=x, only filter lines with less than or equal x collisions with the current input combination are considered.
	With --level <x, only filter lines with less than x collisions with the current input combination are considered.
	With --level =x or --level x, only filter lines with x collisions with the current input combination are considered.
	With --level >=x, only filter lines with more than or equal x collisions with the current input combination are considered.
	With --level >x, only filter lines with more than x collisions with the current input combination are considered.
	
	With --hits <=x, if the current combination matches with less than or equal x filter lines then it is selected and printed to the ouput.
	With --hits <x, if the current combination matches with less than x filter lines then it is selected and printed to the ouput.
	With --hits =x or --hits x, if the current combination matches with x filter lines then it is selected and printed to the ouput.
	With --hits >=x, if the current combination matches with more than or equal x filter lines then it is selected and printed to the ouput.
	With --hits >x, if the current combination matches with more than x filter lines then it is selected and printed to the ouput.
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
			isMultiple: false,
		},
		level: {
			type: 'number',
			alias: 'l',
			isRequired: true,
			isMultiple: false,
			//default: 1,
		},
		hits: {
			type: 'number',
			alias: 'h',
			isRequired: true,
			isMultiple: false,
			//default: 1,
		},
	}
});


if (!cli.flags.level) {
	console.error("Wrong <level> value.");
	process.exit(1);
}
if (!cli.flags.hits) {
	console.error("Wrong <hits> value.");
	process.exit(1);
}
if (!cli.flags.infile) {
	console.error("Missing <infile> parameter.");
	process.exit(1);
}


let level = cli.flags.level;
let hits = cli.flags.hits;
let infile = cli.flags.infile.trim();
let filterfile = cli.flags.filter.trim();
let filter_numbers = [];

/*
let total = cli.flags.total;
let separator = false;
let SEP = (separator) ? '|' : ' ';
*/



if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}
if (!fs.existsSync(filterfile)) {
	fs.writeFileSync(filterfile, '', { flag: 'a+'});
}



/*
do {
	var temp_array = iterators.map(x => numbers[x-1]);
	var result_line = temp_array.join(SEP);
	console.log(result_line);
	var ret = nextCombination(iterators);
} while (ret != null);
*/



let filter_lines = fs.readFileSync(outfile).toString().split(/\r?\n/);
for (let filter_line of filter_lines) {
	let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i).sort();
	if (numbers[0] == 0) continue;
	filter_numbers.push(numbers);
}



