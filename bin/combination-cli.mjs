#!/usr/bin/env node
'use strict';
import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';
import meow from 'meow';
import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';
import { cp } from 'fs';
const FILE_LIMIT = 500000;


// export NODE_OPTIONS="--max-old-space-size=8192"
// export NODE_OPTIONS="--max-old-space-size=16384"
const cli = meow(`
	Usage
	  $ combination

	Parameters
	  --verbose, -v   Verbose mode (default true).
	  --outfile       Output filename (optional).
	  --total, -t     Total number of items.
	  --size, -s      Number of assembled items.
	  --file, -f      A file containing one item of combination per line.
	  --numbers, -n   Items of combinations separated by '|'.
	  --sep           Separator of items (optional).

	Description
	This script generates combinations of items taken in <file> or <numbers>, of size <size> items,
	implementing choice of <size> items among <total> items.
	Only the first <total> items of <file> or <numbers> are used to build combinations.
`, {
	importMeta: import.meta,
	flags: {
		verbose: {
			type: 'boolean',
			default: true,
		},
		outfile: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		total: {
			type: 'number',
			shortFlag: 't',
			isRequired: true,
			isMultiple: false,
		},
		size: {
			type: 'number',
			shortFlag: 's',
			isRequired: true,
			isMultiple: false,
		},
		file: {
			type: 'string',
			shortFlag: 'f',
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
			shortFlag: 'n',
			isRequired: false,
			isMultiple: false,
		},
		sep: {
			type: 'string',
			default: ' | ',
			isRequired: false,
			isMultiple: false,
		},
	}
});


if (!cli.flags.verbose && !cli.flags.outfile) {
	console.error("Enable verbose mode or file output mode !");
	process.exit(1);
}

let outfile = (cli.flags.outfile) ? cli.flags.outfile.trim() : null;
let extension = (outfile) ? path.extname(outfile) : null;
let basename = outfile ? path.basename(outfile, extension || '') : null;
if (outfile && outfile.startsWith('.')) {
	console.error(`Wrong output filename !`);
	process.exit(1);
}


const verboseMode = cli.flags.verbose;
const size = cli.flags.size;
const total = cli.flags.total;
const SEP = cli.flags.sep;


// Read input items
let items = null;
if (cli.flags.numbers) {
	items = cli.flags.numbers.trim().split(/[\|]/);
} else {
	if (!fs.existsSync(cli.flags.file)) {
		console.error(`File ${cli.flags.file} does not exist`);
		process.exit(1);
	}
	items = fs.readFileSync(cli.flags.file, 'utf8').toString().trim().split(/\r?\n/);
}
if (total < size) {
	console.error("Wrong <total> or <size> value.");
	process.exit(1);
}
if (!items || items.length < total) {
	console.error("The numbers source is too short.");
	process.exit(1);
}
items = items.slice(0, total);											// Keep only first <total> items (as your help text says)
const combinationIterator = new lotteryFacility.Combination(items, size);


//let global_alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

let bar = null;
let outfd = null;
let file = null;
let fileNum = 0;
let lineNum = 0;


// TODO CL
let min = null;
let max = null;
let lastIndexSum = null;
const guarantee = 2;



for (const tuple of combinationIterator) {
	// Progress bar
	if (fileNum === 0 || lineNum >= FILE_LIMIT) {
		fileNum++; lineNum = 0;
		if (basename) {
			file = basename + '_' + fileNum + (extension || '');
			if (!verboseMode) {
				//console.log(file);
				if (bar) { bar.stop(); }
				bar = new cliProgress.SingleBar({
					format: file + ' |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} combinations',
					barCompleteChar: '\u2588',
					barIncompleteChar: '\u2591',
					hideCursor: true
				});

				bar.start(FILE_LIMIT, 0);
			}

			if (outfd) { fs.closeSync(outfd); outfd = null; }
			outfd = fs.openSync(file, 'w');
		}
	}
	lineNum++;


	// Output
	const combi = lotteryFacility.TupleHelper.toString(tuple, SEP);
	const indexSum = lotteryFacility.TupleHelper.sum(combinationIterator.indices);
	if (min === null || indexSum < min) min = indexSum;
	if (max === null || indexSum > max) max = indexSum;


	//TODO CL
	if (!(indexSum == 10 && (!lastIndexSum || lastIndexSum < 10 ))) {
		lastIndexSum = indexSum;
		continue;
	}


	//TODO CL
	lastIndexSum = indexSum;
	if (verboseMode) console.log(combi);
	if (outfd)  fs.writeSync(outfd, combi + '\n');
	//if (verboseMode) console.log(`${combi}\tmin=${min}\tmax=${max}\tsum=${indexSum}`);
	//if (outfd)  fs.writeSync(outfd, `${combi}\tmin=${min}\tmax=${max}\tsum=${indexSum}` + '\n');


	if (bar) bar.increment();
}

if (outfd) fs.closeSync(outfd);
if (bar) bar.stop();

