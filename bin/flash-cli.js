#!/usr/bin/env node
'use strict'
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle');


const cli = meow(`
	Usage
	  $ flash

	Parameters
	  --total, -t  Total number of lottery balls
	  --size, -s   Size of generated combinations
	  --sort       Display ordered combinations
	  --nb         Number of generated combinations
	  --nbSwap     Number of shuffle operations
	  
	Description
	This script generates a random selection of lottery balls, taken from 1 to <total> balls.
	The optional parameter 'sort' sorts combinations items in ascending order.
`, {
	flags: {
		total: {
			type: 'number',
			alias: 't',
			isRequired: (input, flags) => true,
		},
		size: {
			type: 'number',
			alias: 's',
			isRequired: (input, flags) => true,
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


if (cli.flags.total < 1 || cli.flags.total > 99) {
	console.error("wrong value for <total> parameter !");
	process.exit(1);
}
if (cli.flags.total < cli.flags.size) {
	console.error("wrong value for <size> parameter !");
	process.exit(1);
}


let total = cli.flags.total;
let size = cli.flags.size;
let nb = cli.flags.nb;
let nbSwap = cli.flags.nbSwap;
let box = new lotteryFacility.DrawBox(total);
let cb = null;
let str = null;

for (let i = 0; i < nb; i++) {
	let balls = box.draw(size, nbSwap);
	str = (cli.flags.sort) ? lotteryFacility.canonicalCombinationString(balls, " ") : lotteryFacility.combinationString(balls, " ");
	console.log(str);
}
