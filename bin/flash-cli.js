#!/usr/bin/env node
'use strict'
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');


const cli = meow(`
	Usage
	  $ flash

	Parameters
	  --total, -t  Total number of lottery balls.
	  --size, -s   Size of generated combinations
	  --sort       Display ordered combinations
	  --nb         Number of generated combinations
	  --nbSwap     Number of shuffle operations
	  
	Description
	This script generates a random selection of lottery balls, taken from 1 to <total> balls.
	The optional parameter 'sort' sorts combinations items in ascending order.

	You can put <total> and <size> multiple times for selection into multiple draw boxes.
`, {
	flags: {
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


if (!cli.flags.total || !cli.flags.size) {
	console.error("Missing <total> or <size> parameter !");
	process.exit(1);
}


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


for (let i = 0; i < nb; i++) {
	let str = "";
	let ballsSet = [];
	for (let j = 0; j < totals.length; j++) {
		ballsSet[j] = boxes[j].draw(sizes[j], nbSwap);
		if (j > 0) str += " | ";
		str += (cli.flags.sort) ? lotteryFacility.canonicalCombinationString(ballsSet[j], " ") : lotteryFacility.combinationString(ballsSet[j], " ");
	}	
	console.log(str);
}
