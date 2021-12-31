#!/usr/bin/env node
'use strict';
const fs = require('fs');
const readline = require('readline');
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');


const cli = meow(`
	Usage
	  $ combination

	Parameters
	  --total, -t     Total number of lottery balls
	  --size, -s      Size of generated combinations
	  --file, -f      A file containing one item of combination per line
	  --numbers, -n   Items of combinations separated by '|', or ' '

	Description
	This script generates combinations of items taken in <file> or <numbers>, of size <size>
	implementing choice of <size> items among <total> items.
	Only the first <total> items of <file> or <numbers> are used to build combinations.
`, {
	flags: {
		total: {
			type: 'number',
			alias: 't',
			isRequired: true,
			isMultiple: false,
		},
		size: {
			type: 'number',
			alias: 's',
			isRequired: true,
			isMultiple: false,

		},
		file: {
			type: 'string',
			alias: 'f',
			isRequired: (input, flags) => {
				if (input.numbers) {
					return false;
				}
				return true;
			},
			isMultiple: false,
		},
		numbers: {
			type: 'string',
			alias: 'n',
			isRequired: false,
			isMultiple: false,
		},
	}
});


let numbers = null;
let size = cli.flags.size;
let total = cli.flags.total;
let separator = false;
let SEP = (separator) ? '|' : ' ';


if (cli.flags.numbers) {
	numbers = cli.flags.numbers.trim().split(/[\| ]/);
} else {
	if (!fs.existsSync(cli.flags.file)) {
		console.error(`File ${cli.flags.file} does not exist`);
		process.exit(1);
	}
	numbers = fs.readFileSync(cli.flags.file).toString().trim().split(/\r?\n/);
}
if (total < size) {
	console.error("Wrong <total> or <size> value.");
	process.exit(1);
}
if (numbers.length < total) {
	console.error("The numbers file is too short.");
	process.exit(1);
}


var iterators = [];
for (var i = 1; i <= size; i++) {
	iterators.push(i);
}


const nextCombination = function (tab) {
	var index = size-1;
	var val = total;
	
	while (index >= 0 && tab[index] >= val) {
		index--;
		val--;
	}
	if (index < 0) {
		return null;
	}

	val = tab[index] + 1;
	for (var j = index; j < size; j++) {
		tab[j] = val;
		val++;
	}
	return tab;
}


do {
	var temp_array = iterators.map(x => numbers[x-1]);
	var result_line = temp_array.join(SEP);
	console.log(result_line);
	var ret = nextCombination(iterators);
} while (ret != null);

