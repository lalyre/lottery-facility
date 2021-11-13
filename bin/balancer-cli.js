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
	  --pass, -p       Total number of passes
	  --infile, -in    An input file containing one combination per line
	  --outfile, -out  An output file containing balanced combinations

	Description
	At each pass, this script selects combinations from input file that can be added to the output file
	keeping that output file well balanced. For each pass a blank line is first added to the ouput file.
`, {
	flags: {
		pass: {
			type: 'number',
			alias: 'p',
			isRequired: false,
			isMultiple: false,
			default: 1,
		},
		infile: {
			type: 'string',
			alias: 'in',
			isRequired: true,
			isMultiple: false,
		},
		outfile: {
			type: 'string',
			alias: 'out',
			isRequired: true,
			isMultiple: false,
		},
	}
});


let pass = cli.flags.pass;
let infile = cli.flags.infile;
let outfile = cli.flags.outfile;
/*
let total = cli.flags.total;
let separator = false;
let SEP = (separator) ? '|' : ' ';
*/


if (pass < 1) {
	console.error("Wrong <pass> value.");
	process.exit(1);
}
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}
if (!fs.existsSync(outfile)) {
	fs.writeFileSync(outfile, '', { flag: 'a+'});
}



/*
do {
	var temp_array = iterators.map(x => numbers[x-1]);
	var result_line = temp_array.join(SEP);
	console.log(result_line);
	var ret = nextCombination(iterators);
} while (ret != null);
*/


