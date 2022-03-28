#!/usr/bin/env node
'use strict'
const fs = require('fs');
const path = require('path');
const meow = require('meow');
const colors = require('ansi-colors');
const cliProgress = require('cli-progress');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');
const FILE_LIMIT = 500000;


const cli = meow(`
	Usage
	  $ flash

	Parameters
	  --verbose, -v  Verbose mode (default true)
	  --outfile      Output filename (optional)
	  --total, -t    Total number of lottery balls
	  --size, -s     Size of generated combinations
	  --sort         Display ordered combinations
	  --nb           Number of generated combinations
	  --nbSwap       Number of shuffle operations

	Description
	This script generates a random selection of lottery balls, taken from 1 to <total> balls.
	The optional parameter 'sort' sorts combinations items in ascending order.

	You can put <total> and <size> multiple times for random selection into multiple draw boxes.
`, {
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
			alias: 't',
			isRequired: (input, flags) => true,
			isMultiple: true,
		},
		size: {
			type: 'number',
			alias: 's',
			isRequired: (input, flags) => true,
			isMultiple: true,
		},
		sort: {
			type: 'boolean',
			default: false,
		},
		nb: {
			type: 'number',
			default: 1,
		},
		nbSwap: {
			type: 'number',
			default: 200,
		},
	}
});


if (!cli.flags.verbose && !cli.flags.outfile) {
	console.error("Enable verbose mode or file output mode !");
	process.exit(1);
}
if (cli.flags.total.length !== cli.flags.size.length) {
	console.error("Missing <total> or <size> parameter !");
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
let totals = cli.flags.total;
let sizes = cli.flags.size;
let nb = cli.flags.nb;
let nbSwap = cli.flags.nbSwap;


let boxes = [];
for (let i = 0; i < totals.length; i++) {
	if (totals[i] < 1 || totals[i] > 99) {
		console.error(`wrong value for <total> (#${i+1}) parameter !`);
		process.exit(1);
	}
	if (totals[i] < sizes[i]) {
		console.error(`wrong value for <size> (#${i+1}) parameter !`);
		process.exit(1);
	}
	boxes[i] = new lotteryFacility.DrawBox(totals[i]);
}


let bar = null;
let outfd = null;
let file = null;
let fileNum = 0;
let lineNum = 0;
for (let i = 0; i < nb; i++) {
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
	let str = "";
	let ballsSet = [];
	for (let j = 0; j < totals.length; j++) {
		ballsSet[j] = boxes[j].draw(sizes[j], nbSwap);
		if (j > 0) str += " | ";
		str += (cli.flags.sort) ? lotteryFacility.canonicalCombinationString(ballsSet[j], " ") : lotteryFacility.combinationString(ballsSet[j], " ");
	}
	if (verboseMode) {
		console.log(str);
	}
	if (outfd) {
		fs.writeSync(outfd, str);
		fs.writeSync(outfd, '\n');
	}
	if (bar) {
		bar.increment();
	}
}

if (outfd) { fs.closeSync(outfd); outfd = null; }
if (bar) { bar.stop(); }

