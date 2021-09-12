#!/usr/bin/env node
'use strict'
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle');


const cli = meow(`
	Usage
	  $ flash

	Usage
	  --total, -t  Total number of lottery balls
	  --size, -s   Size of generated combinations
	  --sort       Display ordered combinations
	  --nb         Number of generated combinations
	  
	Description
	This script generates a random selection of lottery balls, taken from 1 to <total> balls.
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

//console.log("hello world");
//console.log("cli.flags" + JSON.stringify(cli.flags));
//console.log("cli.input" + JSON.stringify(cli.input));

let total = cli.flags.total;
let size = cli.flags.size;
let nb = cli.flags.nb;
let balls = lotteryFacility.lotteryBalls(total);
let cb = null;
let str = null;

for (let i = 0; i < nb; i++) {
	lotteryFacility.shuffleBalls(balls, 50);
	cb = balls.slice(1, size+1);
	str = (cli.flags.sort) ? lotteryFacility.canonicalCombinationString(cb, " ") : lotteryFacility.combinationString(cb, " ");
	console.log(str);
}
