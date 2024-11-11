#!/usr/bin/env node --max-old-space-size=8192
'use strict';
import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';
import meow from 'meow';
import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';
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
let numbers = null;
let size = cli.flags.size;
let total = cli.flags.total;
//let step = cli.flags.step;
//let separator = false;
//let SEP = (separator) ? '|' : ' ';


if (cli.flags.numbers) {
	numbers = cli.flags.numbers.trim().split(/[\|]/);
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


//let global_alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

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
	
	// Computation
	//var temp_array = iterators.map(x => numbers.slice((x-1)*step, x*step).join(cli.flags.sep));
	var temp_array = iterators.map(x => numbers[x-1]).join(cli.flags.sep);
	//var result_line = temp_array.join(SEP).split(SEP).filter((x, pos, a) => a.indexOf(x) === pos).map(x => x.toString().padStart(2, '0')).sort().join(SEP);
	var result_line = temp_array;
	
	
	//var iterators2 = lotteryFacility.CombinationHelper.complement(global_alphabet, iterators);
	//var temp_array2 = iterators2.map(x => numbers[x-1]).join(cli.flags.sep);
	//var result_line2 = temp_array2;
	
	
	
	// Output
	if (verboseMode) {
		console.log(result_line);
		//console.log(result_line2);
	}
	if (outfd) {
		fs.writeSync(outfd, result_line);
		fs.writeSync(outfd, '\n');
	}
	if (bar) {
		bar.increment();
	}
	
	// Next
	var ret = nextCombination(iterators);
} while (ret != null);

if (outfd) { fs.closeSync(outfd); outfd = null; }
if (bar) { bar.stop(); }

