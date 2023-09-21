#!/usr/bin/env node --max-old-space-size=8192
'use strict'
import fs from 'fs-extra';
import readline from 'readline';
import meow from 'meow';
import lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';


const cli = meow(`
	Usage
	  $ translate

	Parameters
	  --file, -f    A file containing one combination per line to be translated.
	  --originnum   Items of combinations separated by '|' or ' '.
	  --originfile  File containing one item per line that are used in combinations of <file> file.
	  --targetnum   Items of combinations separated by '|' or ' ', used for the translation of combinations.
	  --targetfile  File containing one item per line used for the translation of <file> file.
	  
	Description
	This script takes an input file <file> containing one combination per line, combinations
	written with the <origin> alphabet and to be translated into <target> alphabet.
	Items of <origin> alphabet are translated to <target> alphabet relatively to
	their corresponding order of declaration.

	The <origin> alphabet can be declared either with <originnum> or <originfile> parameters.
	The <target> alphabet can be declared either with <targetnum> or <targetfile> parameters.
`, {
	importMeta: import.meta,
	flags: {
		originfile: {
			type: 'string',
			isRequired: (input, flags) => {
				if (input.originnum) {
					return false;
				}
				return true;
			},
			isMultiple: false,
		},
		originnum: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		targetfile: {
			type: 'string',
			isRequired: (input, flags) => {
				if (input.targetnum) {
					return false;
				}
				return true;
			},
			isMultiple: false,
		},
		targetnum: {
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


let origin_alphabet = null;
if (cli.flags.originnum) {
	origin_alphabet = cli.flags.originnum.trim().split(/[\| ]/);
} else {
	if (!fs.existsSync(cli.flags.originfile)) {
		console.error(`File ${cli.flags.originfile} does not exist`);
		process.exit(1);
	}
	origin_alphabet = fs.readFileSync(cli.flags.originfile).toString().trim().split(/\r?\n/);
}


let target_alphabet = null;
if (cli.flags.targetnum) {
	target_alphabet = cli.flags.targetnum.trim().split(/[\| ]/);
} else {
	if (!fs.existsSync(cli.flags.targetfile)) {
		console.error(`File ${cli.flags.targetfile} does not exist`);
		process.exit(1);
	}
	target_alphabet = fs.readFileSync(cli.flags.targetfile).toString().trim().split(/\r?\n/);
}

/*
if (origin_alphabet.length > target_alphabet.length) {
	console.error("The target alphabet does not contain enough items");
	process.exit(1);
}*/


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
	
	let res2 = res1.map(o => {
		let id = origin_alphabet.findIndex(obj => obj == o);
		if (id == -1) {
			return `>>>${o}<<<`;
		}
		return target_alphabet[id];
	});
	//console.log("res2 " + res2);
	
	let result_line = res2.join(" ").split(" ").filter((x, pos, a) => a.indexOf(x) === pos).map(x => x.toString().padStart(2, '0')).sort().join(" ");
	console.log(result_line);
})
.on('close', () => {
	fileStream.close();
});

