#!/usr/bin/env node
'use strict';
const _ = require('lodash');
const fs = require('fs');
const readline = require('readline');
const version = require('./version.json');


if (process.argv.length <= 2
|| (process.argv[2] == '-h' || process.argv[2] == '--help')) {
	console.log("filter.js [Version " + version.api_version + "]")
	console.log("(c) 2020 Claude Lalyre Corporation. Tous droits reserves.")
	console.log("Usage:");
	console.log("filter.js --help");
	console.log("filter.js --version");
	console.log("filter.js    --level <level> --filter <filter file> --file <file game> [--nb_hits <nb_hits>] [--printhits]");
	console.log("filter.js --minlevel <level> --filter <filter file> --file <file game> [--nb_hits <nb_hits>] [--printhits]");
	console.log("filter.js --maxlevel <level> --filter <filter file> --file <file game> [--nb_hits <nb_hits>] [--printhits]");
	console.log("");
	console.log("\tInstead of [--nb_hits <nb_hits>] option, you can use [--minnb_hits <nb_hits>]");
	console.log("\tInstead of [--nb_hits <nb_hits>] option, you can use [--maxnb_hits <nb_hits>]");
	console.log("");
	console.log("With    --level mode, this script gives the file game lines that have exact <level> collisions with the filter.");
	console.log("With --minlevel mode, this script gives the file game lines that have at least <level> collisions with the filter.");
	console.log("With --maxlevel mode, this script gives the file game lines that have at most <level> collisions with the filter.");
	console.log("");
	console.log("With --printhits option, this script also prints the number of times each line of file game has hit the filter file, according to the selected mode.");
	console.log("");
	console.log("With --nb_hits    option, this script only prints the file game lines that have exact <nb_hits> matches with the filter.");
	console.log("With --minnb_hits option, this script only prints the file game lines that have at least <nb_hits> matches with the filter.");
	console.log("With --maxnb_hits option, this script only prints the file game lines that have at most <nb_hits> matches with the filter.");
	console.log("");
	console.log("With --nb_limithits    option, this script only prints the file game lines that have exact <nb_limithits> matches with the filter focusing on <level> collisions.");
	console.log("With --minnb_limithits option, this script only prints the file game lines that have at least <nb_limithits> matches with the filter focusing on <level> collisions.");
	console.log("With --maxnb_limithits option, this script only prints the file game lines that have at most <nb_limithits> matches with the filter focusing on <level> collisions.");
	console.log("");
	console.log("You can also add optional parameter [--exclusive-maxlevel <level>] on command line, then the scripts will only prints file game lines that have at most <level> collisions between them.");
	console.log("You can also add optional parameter [--exclusive-minlevel <level>] on command line, then the scripts will only prints file game lines that have at least <level> collisions between them.");
	console.log("You can also add optional parameter [--exclusive-level <level>] on command line, then the scripts will only prints file game lines that have exactly <level> collisions between them.");
	console.log("You can also add optional parameter [--exclusive-favoritism-limit <level>] on command line, then the scripts will limit the favoritism of first combinations during the construction of exclusive filter. Numbers will be limited to at most <level> occurences in the exclusive filter.");
	console.log("You can also add optional parameter [--reduce-filter] on command line, then the script will remove lines in the filter as soon as they have been covered.");
	console.log("You can also add optional parameter [--display-score] on command line, then the script will display the score of each filter's line.");
	console.log("");
	process.exit(0);
}
if (process.argv[2] == '-v' || process.argv[2] == '-V' || process.argv[2] == '--version') {
	console.log(`v${version.api_version}`);
	process.exit(0);
}


const filterModes = {
	NONE: 0,
	LEVEL: 1,
	MINLEVEL: 2,
	MAXLEVEL: 3,
}

const hitModes = {
	NONE: 0,
	NB_HITS: 1,
	MIN_NB_HITS: 2,
	MAX_NB_HITS: 3,
}

const limitHitModes = {
	NONE: 0,
	NB_LIMIT_HITS: 1,
	MIN_NB_LIMIT_HITS: 2,
	MAX_NB_LIMIT_HITS: 3,
}


const exclusiveModes = {
	NONE: 0,
	LEVEL: 1,
	MINLEVEL: 2,
	MAXLEVEL: 3,
}

var filterMode = filterModes.NONE;
var level = undefined;
var exclusiveMode = exclusiveModes.NONE;
var exclusiveLevel = undefined;
var filter_file = undefined;
var filter_lines = undefined;
var filter_numbers = [];
var filter_score = [];
var total_score = 0;
var covered_score = 0;
var uncovered_score = 0;
var exclusive_numbers = [];
var filename = undefined;
var hitMode = hitModes.NONE;
var limitHitMode = limitHitModes.NONE;
var nb_hits = undefined;
var nb_limithits = undefined;
var favoritism_limit = 5000;
var last_scheme = undefined;
var current_scheme = undefined;
var current_scheme_count = 0;
var printhits = false;
var displayScore = false;

process.argv.forEach((val, index) => {
	if (val == '--level') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		level = parseInt(val1);
		filterMode = filterModes.LEVEL;
	}
	if (val == '--minlevel') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		level = parseInt(val1);
		filterMode = filterModes.MINLEVEL;
	}
	if (val == '--maxlevel') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		level = parseInt(val1);
		filterMode = filterModes.MAXLEVEL;
	}
	
	if (val == '--exclusive-level') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		exclusiveLevel = parseInt(val1);
		exclusiveMode = exclusiveModes.LEVEL;
	}
	
	if (val == '--exclusive-maxlevel') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		exclusiveLevel = parseInt(val1);
		exclusiveMode = exclusiveModes.MAXLEVEL;
	}
	
	if (val == '--exclusive-minlevel') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		exclusiveLevel = parseInt(val1);
		exclusiveMode = exclusiveModes.MINLEVEL;
	}
	
	if (val == '--filter') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		filter_file = process.argv[index+1].trim();
		if (!fs.existsSync(filter_file)) {
			console.error(`Filter file ${filter_file} does not exist`);
			process.exit(1);
		}
		filter_lines = fs.readFileSync(filter_file).toString().split(/\r?\n/);
		for (var filter_line of filter_lines) {
			var numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
			if (numbers[0] == 0) continue;
			filter_numbers.push(numbers);
			filter_score.push(0);
			//exclusive_numbers.push(numbers);
		}
	}
	if (val == '--file') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		filename = process.argv[index+1];
		if (!fs.existsSync(filename)) {
			console.error(`Game file ${filename} does not exist`);
			process.exit(1);
		}
	}
	if (val == '--nb_hits') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		nb_hits = parseInt(val1);
		if (nb_hits < 0) {
			console.error("Wrong value for <nb_hits> parameter");
			process.exit(1);
		}
		hitMode = hitModes.NB_HITS;
	}
	if (val == '--minnb_hits') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		nb_hits = parseInt(val1);
		if (nb_hits < 0) {
			console.error("Wrong value for <nb_hits> parameter");
			process.exit(1);
		}
		hitMode = hitModes.MIN_NB_HITS;
	}
	if (val == '--maxnb_hits') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		nb_hits = parseInt(val1);
		if (nb_hits < 0) {
			console.error("Wrong value for <nb_hits> parameter");
			process.exit(1);
		}
		hitMode = hitModes.MAX_NB_HITS;
	}
	if (val == '--nb_limithits') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		nb_limithits = parseInt(val1);
		if (nb_limithits < 0) {
			console.error("Wrong value for <nb_limithits> parameter");
			process.exit(1);
		}
		limitHitMode = limitHitModes.NB_LIMIT_HITS;
	}
	if (val == '--minnb_limithits') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		nb_limithits = parseInt(val1);
		if (nb_limithits < 0) {
			console.error("Wrong value for <minnb_limithits> parameter");
			process.exit(1);
		}
		limitHitMode = limitHitModes.MIN_NB_LIMIT_HITS;
	}
	if (val == '--maxnb_limithits') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		nb_limithits = parseInt(val1);
		if (nb_limithits < 0) {
			console.error("Wrong value for <maxnb_hits> parameter");
			process.exit(1);
		}
		limitHitMode = limitHitModes.MAX_NB_LIMIT_HITS;
	}
	if (val == '--exclusive-favoritism-limit') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		var val1 = process.argv[index+1].trim();
		favoritism_limit = parseInt(val1);
		if (favoritism_limit < 0) {
			console.error("Wrong value for <exclusive-favoritism-limit> parameter");
			process.exit(1);
		}
	}
	if (val == '--printhits') {
		printhits = true;
	}
	if (val == '--display-score') {
		displayScore = true;
	}
});
if (!filter_file || !filename || filterMode == filterModes.NONE) {
	console.error("Missing argument on command line");
	process.exit(1);
}
if (level < 0) {
	console.error("Wrong value for <level> parameter");
	process.exit(1);
}


var fileStream = fs.createReadStream(filename);
var rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity
});


var line_num = 0;
rl.on('line', (line) => {
	if (!line) {
		return;
	}
	line_num++;
	var line_numbers = line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
	
	total_score++;
	var hits_count = 0;
	var limit_hits_count = 0;
	for (var j = 0; j < filter_numbers.length; j++) {
		var numbers = filter_numbers[j];
		if (numbers.join("") == '') continue;
		var nb_collisions = collisionsCount(line_numbers, numbers);

		switch (filterMode) {
			case filterModes.LEVEL:
				if (nb_collisions == level) {
					hits_count++;
					limit_hits_count++;
					 filter_score[j]++;
				}
				break;
				
			case filterModes.MINLEVEL:
				if (nb_collisions > level) {
					hits_count++;
					filter_score[j]++;
				} else if (nb_collisions == level) {
					hits_count++;
					limit_hits_count++;
					filter_score[j]++;
				}
				break;
				
			case filterModes.MAXLEVEL:
				if (nb_collisions < level) {
					hits_count++;
					filter_score[j]++;
				} else if (nb_collisions == level) {
					hits_count++;
					limit_hits_count++;
					filter_score[j]++;
				}
				break;
		}
	}

	var displayLine1 = false;
	switch (hitMode) {
		case hitModes.NONE:
			if (hits_count == filter_numbers.length) {
				displayLine1 = true;
				covered_score++;
			} else uncovered_score++;
			break;
			
		case hitModes.NB_HITS:
			if (hits_count == nb_hits) {
				displayLine1 = true;
				covered_score++;
			} else uncovered_score++;
			break;
		
		case hitModes.MIN_NB_HITS:
			if (hits_count >= nb_hits) {
				displayLine1 = true;
				covered_score++;
			} else uncovered_score++;
			break;
			
		case hitModes.MAX_NB_HITS:
			if (hits_count <= nb_hits) {
				displayLine1 = true;
				covered_score++;
			} else uncovered_score++;
			break;
	}
	
	var displayLine2 = false;
	switch (limitHitMode) {
		case limitHitModes.NONE:
			displayLine2 = true;
			break;
			
		case limitHitModes.NB_LIMIT_HITS:
			if (limit_hits_count == nb_limithits) {
				displayLine2 = true;
			}
			break;
		
		case limitHitModes.MIN_NB_LIMIT_HITS:
			if (limit_hits_count >= nb_limithits) {
				displayLine2 = true;
			}
			break;
			
		case limitHitModes.MAX_NB_LIMIT_HITS:
			if (limit_hits_count <= nb_limithits) {
				displayLine2 = true;
			}
			break;
	}

	if (displayLine1 && displayLine2 && exclusiveMode != exclusiveModes.NONE)
	{
		displayLine1 = false;
		if (exclusive_numbers.length == 0)
		{
			current_scheme = line_numbers.slice(0, exclusiveLevel).join(""); current_scheme_count++;
			last_scheme = current_scheme;
			exclusive_numbers.push(line_numbers);
			displayLine1 = true;
		}
		else
		{
			var hits_count2 = 0;
			for (var j = 0; j < exclusive_numbers.length; j++) {
				var numbers2 = exclusive_numbers[j];
				if (numbers2.join("") == '') continue;
				var nb_collisions2 = collisionsCount(line_numbers, numbers2);
				
				switch (exclusiveMode) {
					case exclusiveModes.LEVEL:
						if (nb_collisions2 == exclusiveLevel) {
							hits_count2++;
						}
						break;
						
					case exclusiveModes.MINLEVEL:
						if (nb_collisions2 >= exclusiveLevel) {
							hits_count2++;
						}
						break;
						
					case exclusiveModes.MAXLEVEL:
						if (nb_collisions2 <= exclusiveLevel) {
							hits_count2++;
						}
						break;
				}
			}
			if (hits_count2 == exclusive_numbers.length)
			{
				current_scheme = line_numbers.slice(0, exclusiveLevel).join(""); current_scheme_count++;
				if (current_scheme != last_scheme) {
					last_scheme = current_scheme;
					current_scheme_count = 1;
				}
				
				if (current_scheme_count <= favoritism_limit) {
					exclusive_numbers.push(line_numbers);
					displayLine1 = true;				
				}				
			}
		}
	}
	
	if (exclusive_numbers.length == 5000) {
		console.error("Limit of exclusive collections is reached !");
		process.exit(1);
	}

	if (displayLine1 && displayLine2) {
		if (printhits) {
			console.log("combi" + line_num.toString().padStart(10, 0) + ": " + displayCombination(line_numbers) + " - Nb hits: " + hits_count + " - Nb limit hits: "  + limit_hits_count);
		} else {
			console.log(displayCombination(line_numbers));
		}
	}
})
.on('close', () => {
	if (printhits) {
		console.log("File lines : " + line_num);
		console.log("Filter lines : " + filter_numbers.length);
		console.log("");
		console.log("");
		
		console.log("Filter :");
		for (var j = 0; j < filter_numbers.length; j++) {
			var numbers = filter_numbers[j];
			if (numbers.join("") == '') continue;
			if (displayScore) {
				console.log(displayCombination(numbers) + " - score: " + filter_score[j]);
			} else {
				console.log(displayCombination(numbers));
			}
		}
		console.log("covered: " + covered_score + " - uncovered: " + uncovered_score + " - total: " + total_score);
		console.log("");
		console.log("");
		
		console.log("Reverse filter :");
		for (var j = filter_numbers.length-1; j >= 0; j--) {
			var numbers = filter_numbers[j];
			if (numbers.join("") == '') continue;
			if (displayScore) {
				console.log(displayCombination(numbers) + " - score: " + filter_score[j]);
			} else {
				console.log(displayCombination(numbers));
			}
		}
		console.log("covered: " + covered_score + " - uncovered: " + uncovered_score + " - total: " + total_score);
		console.log("");
		console.log("");
		
		if (exclusiveMode != exclusiveModes.NONE) {
			console.log("Exclusive filter :");
			for (var j = 0; j < exclusive_numbers.length; j++) {
				var numbers = exclusive_numbers[j];
				if (numbers.join("") == '') continue;
				if (displayScore) {
					console.log(displayCombination(numbers) + " - score: " + filter_score[j]);
				} else {
					console.log(displayCombination(numbers));
				}
			}
			console.log("covered: " + covered_score + " - uncovered: " + uncovered_score + " - total: " + total_score);
			console.log("");
			console.log("");
		}
	}

	//console.log('Have a great day!');
	//process.exit(0);
});


const collisionsCount = function (arr1, arr2) {
	var merge = _.union(arr1, arr2);
	var n1 = arr1.length + arr2.length;
	var n2 = merge.length;
	return (n1 - n2);
}


const complementCombination = function (total, numbers) {
	var complement = [];
	complement.length = numbers.length;

	for (var j = 0; j < numbers.length; j++) {
		complement[j] = (total+1 - numbers[j]).toString().padStart(2, 0);
	}
	return complement;
}


const displayCombination = function (numbers) {
	var arr = numbers.sort(function(a, b) {return a - b;});
	var display = arr.map (x => x.toString().padStart(2, 0)).join(" ");
	return display;
}


//rl.close();
