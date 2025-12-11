#!/usr/bin/env node
'use strict'
import fs from 'fs-extra';
import readline from 'readline';
import meow from 'meow';
import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';


const cli = meow(`
	Usage
	  $ complement

	Parameters
	  --file, -f    A file containing one combination per line to calculate the complement from.
	  --globalnum   All items that can be used in combinations, separated by '|' or ' '.
	  --globalfile  File containing one item per line that are used in combinations of <file> file, and possibly others items.
	  
	Description
	This script takes an input file <file> containing one combination per line, combinations written with items of
	the <global> alphabet, and returns the complement of each combination relatively to the global alphabet.

	The <global> alphabet can be declared either with <globalnum> or <globalfile> parameters.
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
		file: {
			type: 'string',
			shortFlag: 'f',
			isRequired: true,
			isMultiple: false,
		},
	}
});


if (!fs.existsSync(cli.flags.file)) {
	console.error(`File ${cli.flags.file} does not exist`);
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


let fileStream = fs.createReadStream(cli.flags.file);
let rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
})
.on('line', async (line) => {
	if (!line) {
		return;
	}
	let res1 = line.trim().split(/\s+/);
	//console.log("res1 " + res1);
	
	let res2 = lotteryFacility.TupleHelper.complement(global_alphabet, res1)
	//console.log("res2 " + res2);
	
	//let result_line = res2.join(" ").split(" ").filter((x, pos, a) => a.indexOf(x) === pos).map(x => x.toString().padStart(2, '0')).sort().join(" ");
	let result_line = res2.join(" ").split(" ").filter((x, pos, a) => a.indexOf(x) === pos).map(x => x.toString().padStart(2, '0')).join(" ");
	console.log(result_line);
})
.on('close', () => {
	fileStream.close();
});

