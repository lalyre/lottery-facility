#!/usr/bin/env node
'use strict'
const fs = require('fs');
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle');


const cli = meow(`
	Usage
	  $ translate

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
		originfile: {
			type: 'string',
			isRequired: (input, flags) => {
				if (flags.originnum) {
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
				if (flags.targetnum) {
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
			alias: 'f',
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
	origin_alphabet = cli.flags.originnum.trim().split(/\|/);
} else {
	if (!fs.existsSync(cli.flags.originfile)) {
		console.error(`File ${cli.flags.originfile} does not exist`);
		process.exit(1);
	}
	origin_alphabet = fs.readFileSync(cli.flags.originfile).toString().trim().split(/\r?\n/);
}


let target_alphabet = null;
if (cli.flags.targetnum) {
	target_alphabet = cli.flags.targetnum.trim().split(/\|/);
} else {
	if (!fs.existsSync(cli.flags.targetfile)) {
		console.error(`File ${cli.flags.targetfile} does not exist`);
		process.exit(1);
	}
	target_alphabet = fs.readFileSync(cli.flags.targetfile).toString().trim().split(/\r?\n/);
}


if (origin_alphabet.length > target_alphabet.length) {
	console.error("The target alphabet does not contain enough items");
	process.exit(1);
}



/*

var fileStream = fs.createReadStream(filename);
var rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});

rl.on('line', (line) => {
	if (!line) {
		return;
	}
	var res1 = line.trim().split(/\s+/);
	//console.log("res1 " + res1);
	
	var res2 = res1.map(o => {
		var id = from_numbers.findIndex(obj => obj == o);
		if (id == -1) {
			return `>>>${o}<<<`;
		}
		return to_numbers[id];
	});
	//console.log("res2 " + res2);
	
	var result_line = res2.join(" ");
	console.log(result_line);
})
.on('close', () => {
	//console.log('Have a great day!');
	//process.exit(0);
});


*/


