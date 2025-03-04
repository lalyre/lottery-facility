#!/usr/bin/env node --max-old-space-size=8192
'use strict'
import fs from 'fs-extra';
import path from 'path';
import meow from 'meow';
import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';
const FILE_LIMIT = 500000;


const cli = meow(`
	Usage
	  $ flash

	Parameters
	  --verbose, -v  Verbose mode (default true).
	  --outfile      Output filename (optional).
	  --total, -t    Total number of lottery balls.
	  --size, -s     Size of generated combinations.
	  --sort         Display ordered combinations (optional).
	  --nb           Number of generated combinations.
	  --nbSwap       Number of shuffle operations. Default value 200.
	  --sep          Separator of draw boxes random selection (optional).

	Description
	This script generates a random selection of lottery balls, taken from 1 to <total> balls.
	The optional parameter 'sort' sorts combinations items in ascending order.

	You can put <total> and <size> multiple times for random selection into multiple draw boxes.
`, {
	importMeta: import.meta,
	flags: {
		verbose: {
			type: 'boolean',
			default: true,
			isMultiple: false,
		},
		outfile: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		total: {
			type: 'number',
			shortFlag: 't',
			isRequired: (input, flags) => true,
			isMultiple: true,
		},
		size: {
			type: 'number',
			shortFlag: 's',
			isRequired: (input, flags) => true,
			isMultiple: true,
		},
		sort: {
			type: 'boolean',
			default: false,
			isMultiple: false,
		},
		nb: {
			type: 'number',
			default: 1,
			isMultiple: false,
		},
		nbSwap: {
			type: 'number',
			default: 200,
			isMultiple: false,
		},
		sep: {
			type: 'string',
			default: '|',
			isMultiple: false,
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
let sep = cli.flags.sep;


let boxes = [];
for (let i = 0; i < totals.length; i++) {
	if (totals[i] < 1) {
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
		if (j > 0) str += cli.flags.sep;
		str += (cli.flags.sort) ? lotteryFacility.CombinationHelper.toCanonicalString(ballsSet[j], sep) : lotteryFacility.CombinationHelper.toString(ballsSet[j], sep);
	}
	
	// Output
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

