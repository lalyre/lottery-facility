#!/usr/bin/env node --max-old-space-size=8192
'use strict';
import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';
import meow from 'meow';
import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';
const FILE_LIMIT = 500000;


// export NODE_OPTIONS="--max-old-space-size=8192"
// export NODE_OPTIONS="--max-old-space-size=16384"
const cli = meow(`
	Usage
	  $ cartesian_product

	Parameters
	  --verbose, -v   Verbose mode (default true).
	  --outfile       Output filename (optional).
	  --file, -f      A file containing one item of combination per line.
	  --numbers, -n   Items of combinations separated by '|'.
	  --sep           Separator of items (optional).

	Description
	This script generates cartesian product of items taken in <file> or <numbers>.
	Each item of <file> or <numbers> is combined with others <file> or <numbers> items.
	You can put as many <file> or <numbers> as you want.
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
		file: {
			type: 'string',
			shortFlag: 'f',
			isRequired: false,
			isMultiple: true,
		},
		numbers: {
			type: 'string',
			shortFlag: 'n',
			isRequired: false,
			isMultiple: true,
		},
		sep: {
			type: 'string',
			default: ' | ',
			isRequired: false,
			isMultiple: false,
		},
	}
});


const totalArgs = process.argv.length - 2;
if (totalArgs === 0) {
    cli.showHelp();
}
if (!cli.flags.verbose && !cli.flags.outfile) {
	console.error("Enable verbose mode or file output mode !");
	process.exit(1);
}
if ((!cli.flags.numbers || cli.flags.numbers.length === 0) && (!cli.flags.file || cli.flags.file.length === 0)) {
    console.error("You must provide at least one parameter --numbers or --file.");
	process.exit(1);
}


let outfile = (cli.flags.outfile) ? cli.flags.outfile.trim() : null;
let extension = (outfile) ? path.extname(outfile) : null;
if (outfile && outfile.startsWith('.')) {
	console.error(`Wrong output filename !`);
	process.exit(1);
}
let basename = null;
switch (true) {
	case (outfile != null && extension != null):
		basename = path.basename(outfile, extension);
		break;

	case (outfile != null):
		basename = path.basename(outfile);
		break;

	default:
		break;
}


let verboseMode = cli.flags.verbose;
let SEP = cli.flags.sep;
let parts = [];

for (let i = 0; i < cli.flags.numbers.length; i++) {
	let nums = cli.flags.numbers[i];
	parts.push(nums.trim().split(/[\|]/));
}

for (let i = 0; i < cli.flags.file.length; i++) {
	if (!fs.existsSync(cli.flags.file[i])) {
		console.error(`File ${cli.flags.file[i]} does not exist`);
		process.exit(1);
	}
	let nums = fs.readFileSync(cli.flags.file[i]).toString().trim().split(/\r?\n/);
	parts.push(nums.trim().split(/[\|]/));
}


//let global_alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
let cartesianProduct = new lotteryFacility.CartesianProduct(...parts);
let bar = null;
let outfd = null;
let file = null;
let fileNum = 0;
let lineNum = 0;
do {
	// Progress bar
	if (fileNum == 0 || lineNum >= FILE_LIMIT) {
		fileNum++; lineNum = 0;
		if (basename) {
			file = basename + '_' + fileNum; if (extension) file += extension;
			if (!verboseMode) {
				//console.log(file);
				if (bar) { bar.stop(); }
				bar = new cliProgress.SingleBar({
					format: file + ' |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} combinations',
					barCompleteChar: '\u2588',
					barIncompleteChar: '\u2591',
					hideCursor: true
				});

				var totalValue = FILE_LIMIT;
				var startValue = 0
				bar.start(totalValue, startValue);
			}

			if (outfd) { fs.closeSync(outfd); outfd = null; }
			outfd = fs.openSync(file, 'w');
		}
	}
	lineNum++;


	// Get combination
	let result_line = lotteryFacility.CombinationHelper.toCanonicalString (cartesianProduct.currentCombination, SEP);


	// Output
	if (verboseMode) {
		console.log(result_line);
	}
	if (outfd) {
		fs.writeSync(outfd, result_line);
		fs.writeSync(outfd, '\n');
	}
	if (bar) {
		bar.increment();
	}


	// Next
	var ret = cartesianProduct.next();
} while (ret != null);


if (outfd) { fs.closeSync(outfd); outfd = null; }
if (bar) { bar.stop(); }

