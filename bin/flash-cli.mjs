#!/usr/bin/env node
'use strict'
import fs from 'fs-extra';
import path from 'path';
import meow from 'meow';
import colors from 'ansi-colors';
import cliProgress from 'cli-progress';
import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';
const FILE_LIMIT = 600000;


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
	  --sep          Separator of balls (optional).

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


const { nb, nbSwap, sort, sep, verbose: verboseMode } = cli.flags;
const totals = cli.flags.total;
const sizes = cli.flags.size;


// --- Initialisation des boîtes  ---
let boxes = [];
for (let i = 0; i < totals.length; i++) {
	boxes[i] = new lotteryFacility.DrawBox(totals[i]);
}


// --- Gestion des fichiers de sortie ---
let outfd = null;
let bar = null;
let fileNum = 0;
let lineNum = 0;
const outfile = cli.flags.outfile?.trim();
const extension = outfile ? path.extname(outfile) : null;
const basename = outfile ? path.basename(outfile, extension) : null;
if (outfile && outfile.startsWith('.')) {
	console.error(`Wrong output filename !`);
	process.exit(1);
}



for (let i = 0; i < nb; i++) {
	// Progress bar
	if (fileNum == 0 || lineNum >= FILE_LIMIT) {
		fileNum++; lineNum = 0;
		if (basename) {
			let file = basename + '_' + fileNum; if (extension) file += extension;
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

// Assemblage de la ligne (Combinaison principale + éventuelles étoiles)
	let ballsSet = [];
	for (let j = 0; j < totals.length; j++) {
		ballsSet[j] = boxes[j].draw(sizes[j], nbSwap);
	}

	let str = "";
	for (let j = 0; j < ballsSet.length; j++) {
		if (j > 0) str += " / ";
		str += sort 
			? lotteryFacility.TupleHelper.toCanonicalString(ballsSet[j], sep) 
			: lotteryFacility.TupleHelper.toString(ballsSet[j], sep);
	}

	// Sortie standard ou fichier
	if (verboseMode) console.log(str);
	if (outfd) fs.writeSync(outfd, str + '\n');
	if (bar) bar.increment();
}

if (outfd) { fs.closeSync(outfd); outfd = null; }
if (bar) { bar.stop(); }

