#!/usr/bin/env node
'use strict';
const fs = require('fs');
const readline = require('readline');
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle.umd');
const SELECTION_LIMIT = 500000;


const cli = meow(`
	Usage
	  $ filter
	
	Parameters
	  --infile, -in      An input file containing one input combination per line, where some combinations will be selected according to filters restrictions.
	  --globalScore      Define the global score obtained after passing through all filters to select a combination.
	  --globalFailure    Define the global number of filters that are not passed to select a combination.
	  --filter, -f       A filter command used to select input combinations (of form "filename(<filename>)weight(a)level(b)combi_score(c)combi_failure(d)filter_score(e)filter_failure(f)").
	  --limit            Defining the maximum number of additions into the selection of input combinations. Default value is -1 (unlimited).
	  --addition         If true the selected combinations are added on the fly to the running selection. Otherwise they are simply printed. Default value is true.
	  --printhits        Display the hit counts/scores/failures for each filter in their declarative order.
	  --printfullhits    Display the hit counts/scores/failures for each filter in their declarative order, and the filter lines that are collided.
	
	Description
	This script selects combinations from an input file according to filters restrictions.
	The selected combinations are printed, and also added to the current ongoing selection of input combinations if the <addition> mode is enabled.
	
	The filter command is in that form "filename(<filename>)weight(a)level(b)combi_score(c)combi_failure(d)filter_score(e)filter_failure(f)".
	You can put as many <filter> commands as you need on the command line.
	
	* filename
	The filter instruction contains a filename to read combinations from, with the form "filename(XXX)", that will be confronted against the current tested combination of the input file.
	You can use "_selection" value for filename value if you want to perform filtering against the current ongoing selection of input combinations.
	
	* weight
	With "weight(x)", the filter score is computed as the multiplication of the number of collisions (hit count) by the weight value.
	If not specified, the default value is 1.

	* level
	With "level(<x)",  only filter lines with less than x collisions with the current input combination are considered.
	With "level(<=x)", only filter lines with less than or equal x collisions with the current input combination are considered.
	With "level(=x)" or "level(x)", only filter lines with x collisions with the current input combination are considered.
	With "level(!=x)", only filter lines with not x collisions with the current input combination are considered.
	With "level(>=x)", only filter lines with more than or equal x collisions with the current input combination are considered.
	With "level(>x)",  only filter lines with more than x collisions with the current input combination are considered.

	* combi_score
	With "combi_score(<x)",  only input combinations with score less than x are considered.
	With "combi_score(<=x)", only input combinations with score less than or equal x are considered.
	With "combi_score(=x)" or "combi_score(x)", only input combinations with score equal to x are considered.
	With "combi_score(!=x)", only input combinations with score different from x are considered.
	With "combi_score(>=x)", only input combinations with score greater than or equal to x considered.
	With "combi_score(>x)",  only input combinations with score greater than x are considered.
	//With "combi_score(*)",   only input combinations that matches with all filter lines are selected and printed to the ouput.

	* filter_score
	With "filter_score(<x)",  only input combinations with score less than x are considered.
	With "filter_score(<=x)", only input combinations with score less than or equal x are considered.
	With "filter_score(=x)" or "filter_score(x)", only input combinations with score equal to x are considered.
	With "filter_score(!=x)", only input combinations with score different from x are considered.
	With "filter_score(>=x)", only input combinations with score greater than or equal to x considered.
	With "filter_score(>x)",  only input combinations with score greater than x are considered.
	//With "filter_score(*)",   only input combinations that matches with all filter lines are selected and printed to the ouput.

	* globalScore
	With --globalScore    "<x",  only combinations with global score less than x are selected.
	With --globalScore    "<=x", only combinations with global score less than or equal x are selected..
	With --globalScore    "=x",  only combinations with global score equal to x are selected.
	With --globalScore    "!=x", only combinations with global score not equal to x are selected.
	With --globalScore    ">=x", only combinations with global score greater than or equal to x are selected.
	With --globalScore    ">x",  only combinations with global score greater than x are selected.
	
	* globalFailure
	With --globalFailure  "<x",  only combinations with less than x failed filters are selected.
	With --globalFailure  "<=x", only combinations with less than or equal x failed filters are selected..
	With --globalFailure  "=x",  only combinations with x failed filters are selected.
	With --globalFailure  "!=x", only combinations with not x failed filters are selected.
	With --globalFailure  ">=x", only combinations with more than or equal x failed filters are selected.
	With --globalFailure  ">x",  only combinations with more than x failed filters are selected.
`, {
	flags: {
		infile: {
			type: 'string',
			alias: 'in',
			isRequired: true,
			isMultiple: false,
		},
		globalScore: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		globalFailure: {
			type: 'string',
			isRequired: false,
			isMultiple: false,
		},
		filter: {
			type: 'string',
			alias: 'f',
			isRequired: true,
			isMultiple: true,
		},
		limit: {
			type: 'number',
			isRequired: false,
			isMultiple: false,
			default: -1,
		},
		addition: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: true,
		},
		printhits: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: false,
		},
		printfullhits: {
			type: 'boolean',
			isRequired: false,
			isMultiple: false,
			default: false,
		},
	}
});


let additionMode = cli.flags.addition;
let additionsLimit = cli.flags.limit;
let infile = cli.flags.infile.trim();
if (!fs.existsSync(infile)) {
	console.error(`File ${infile} does not exist`);
	process.exit(1);
}


let combiGlobalScoreSelection = null;
let combiGlobalScore = -1;
let regexp1 = /^(<|=<|<=|=|!=|>=|=>|>)?(\d*)$/;
switch (true) {
	case cli.flags.globalScore === null:
	case cli.flags.globalScore === undefined:
		break;

	case regexp1.test(cli.flags.globalScore):
		let match = regexp1.exec(cli.flags.globalScore);
		combiGlobalScoreSelection = match[1];
		combiGlobalScore = match[2];
		break;

	default:
		console.error(`Wrong <globalScore> value.`);
		process.exit(1);
		break;
}


let combiGlobalFailureSelection = null;
let combiGlobalFailure = -1;
let regexp2 = /^(<|=<|<=|=|!=|>=|=>|>)?(\d*)$/;
switch (true) {
	case cli.flags.globalFailure === null:
	case cli.flags.globalFailure === undefined:
		break;

	case regexp2.test(cli.flags.globalFailure):
		let match = regexp2.exec(cli.flags.globalFailure);
		combiGlobalFailureSelection = match[1];
		combiGlobalFailure = match[2];
		break;

	default:
		console.error(`Wrong <globalFailure> value.`);
		process.exit(1);
		break;
}


// filename(<filename>)weight(a)level(b)combi_score(c)combi_failure(d)filter_score(e)filter_failure(f)
let filterSelection = cli.flags.filter;
let filename = [];
let weight = [];
let levelSelection = [];
let level = [];
let combiScoreSelection = [];
let combiScore = [];
let combiScoreFailure = [];
let combiFailure = [];
let filterScoreSelection = [];
let filterScore = [];
let filterScoreFailure = [];
let filterFailure = [];


for (let i = 0; i < filterSelection.length; i++) {
	switch (true) {
		case /filename\(_selection\)*/.test(filterSelection[i].trim()):
			if (!additionMode) {
				console.error(`You must enable <addition> mode in conjonction with "_selection" filter.`);
				process.exit(1);
			}
			filename.push('_selection')
			break;
		
		case /filename\(([\w|\.]*)\)*/.test(filterSelection[i].trim()):
			let match = /filename\(([\w|\.]*)\)*/.exec(filterSelection[i]);
			filename.push(match[1]);
			if (!fs.existsSync(filename[i].trim())) {
				console.error(`File ${filename[i]} does not exist.`);
				process.exit(1);
			}
			break;
			
		default:
			console.error(`No <filename> (#${i+1}) value.`);
			process.exit(1);
			break;
	}


	switch (true) {
		case /weight\((\d*)\)*/.test(filterSelection[i].trim()):
			let match = /weight\((\d*)\)*/.exec(filterSelection[i]);
			weight.push(match[1]);
			break;

		default:
			weight.push(1);		// Default value is -1.
			//console.error(`No <weight> (#${i+1}) value.`);
			//process.exit(1);
			break;
	}


	switch (true) {
		case /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.test(filterSelection[i].trim()):
			let match = /level\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.exec(filterSelection[i]);
			levelSelection.push(match[1])
			level.push(match[2]);
			break;
		
		default:
			console.error(`No <level> (#${i+1}) value.`);
			process.exit(1);
			break;
	}


	switch (true) {
		case /combi_score\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.test(filterSelection[i].trim()):
			let match = /combi_score\((<|=<|<=|=|!=|>=|=>|>)?(\d*)\)*/.exec(filterSelection[i]);
			combiScoreSelection.push(match[1])
			combiScore.push(match[2]);
			break;

		/*case /score\(\*\)/.test(filterSelection[i].trim()):
			scoreSelection.push('*')
			score.push('*');
			break;*/

		default:
			console.error(`No <combi_score> (#${i+1}) value.`);
			process.exit(1);
			break;
	}
}


// Test all combinations of input file
let selected_numbers = [];
let additions = 0;
let inputLinesCount = 0;
let fileStream = fs.createReadStream(infile);
let rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity,
})
.on('line', async (line) => {
	if (!line) {
		return;
	}
	let input_line_numbers = line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
	if (input_line_numbers[0] == 0) return;
	if (input_line_numbers.join("") == '') return;
	inputLinesCount++;
	//console.log(input_line_numbers);


	if (selected_numbers.length >= SELECTION_LIMIT) {
		console.error("Limit of selection is reached !");
		process.exit(1);
	}


	let hits_count_string = '';
	let hits_filters_string = '';
	let combiGlobalScore2 = -1;
	let combiGlobalFailure2 = -1;
	for (let i = 0; i < filterSelection.length; i++)
	{
		let filter_tested_numbers = [];
		switch (true) {
			case /^_selection$/.test(filename[i].trim()):
				filter_tested_numbers = selected_numbers;
				break;
			
			default:
				let filter_lines = fs.readFileSync(filename[i].trim()).toString().split(/\r?\n/);
				for (let filter_line of filter_lines) {
					let numbers = filter_line.trim().split(/\s+/).filter((v, i, a) => a.indexOf(v) === i);
					if (numbers[0] == 0) continue;
					if (numbers.join("") == '') continue;
					filter_tested_numbers.push(numbers);
				}
				break;
		}


		let localScore2 = -1;
		let hitsCount = 0;
		let limitHitsCount = 0;
		for (let j = 0; j < filter_tested_numbers.length; j++) {
			let nb_collisions = lotteryFacility.Combination.collisionsCount(input_line_numbers, filter_tested_numbers[j]);


			switch (true) {
				case /^<$/.test(levelSelection[i]):
					if (nb_collisions < level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]-1) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]` + '\n';
					}
					break;

				case /^=<$/.test(levelSelection[i]):
				case /^<=$/.test(levelSelection[i]):
					if (nb_collisions <= level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^=$/.test(levelSelection[i]):
				case (!levelSelection[i]):
					if (nb_collisions == level[i]) {
						hitsCount++;
						limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^!=$/.test(levelSelection[i]):
					if (nb_collisions != level[i]) {
						hitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^=>$/.test(levelSelection[i]):
				case /^>=$/.test(levelSelection[i]):
					if (nb_collisions >= level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [ nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				case /^>$/.test(levelSelection[i]):
					if (nb_collisions > level[i]) {
						hitsCount++;
						if (nb_collisions == level[i]+1) limitHitsCount++;
						hits_filters_string += lotteryFacility.Combination.toString(filter_tested_numbers[j]) + ` - [nb_collisions: ${nb_collisions} ]`  + '\n';
					}
					break;

				default:
					break;
			}
		}
		hits_filters_string += '\n';


		let combiScore2 = -1;
		if (hitsCount > 0) combiScore2 = hitsCount * weight[i];

		let selectCombination = false;
		switch (true) {
			case (combiScore2 == -1):
				selectCombination = false;
				break;

			case /^<$/.test(combiScoreSelection[i]):
				if (combiScore2 < score[i]) {
					selectCombination = true;
				}
				break;

			case /^=<$/.test(combiScoreSelection[i]):
			case /^<=$/.test(combiScoreSelection[i]):
				if (combiScore2 <= score[i]) {
					selectCombination = true;
				}
				break;

			case /^=$/.test(combiScoreSelection[i]):
			case (!combiScoreSelection[i]):
				if (combiScore2 == combiScore[i]) {
					selectCombination = true;
				}
				break;

			case /^!=$/.test(combiScoreSelection[i]):
				if (combiScore2 != combiScore[i]) {
					selectCombination = true;
				}
				break;

			case /^=>$/.test(combiScoreSelection[i]):
			case /^>=$/.test(combiScoreSelection[i]):
				if (combiScore2 >= combiScore[i]) {
					selectCombination = true;
				}
				break;

			case /^>$/.test(combiScoreSelection[i]):
				if (combiScore2 > combiScore[i]) {
					selectCombination = true;
				}
				break;

			/*case /^\*$/.test(scoreSelection[i]):
				if (hitsCount == filter_tested_numbers.length) {
					selectCombination = true;
				}
				break;*/

			default:
				selectCombination = false;
				break;
		}


		hits_count_string += ` - [hits: ${hitsCount} - combi_score: ${combiScore2}]`;
		if (selectCombination) combiGlobalScore2 = (combiGlobalScore2 == -1) ? combiScore2 : combiGlobalScore2 + combiScore2;
		if (combiScore2 < 0) combiGlobalFailure2 = (combiGlobalFailure2 == -1) ? 1 : combiGlobalFailure2 + 1;
	}


	switch (true) {
		case (combiGlobalScore == -1):
			break; // No rule

		case /^<$/.test(combiGlobalScoreSelection):
			if (!(combiGlobalScore2 < combiGlobalScore)) return; // reject this combination
			break;

		case /^=<$/.test(combiGlobalScoreSelection):
		case /^<=$/.test(combiGlobalScoreSelection):
			if (!(combiGlobalScore2 <= combiGlobalScore)) return; // reject this combination
			break;

		case /^=$/.test(combiGlobalScoreSelection):
		case (!combiGlobalScoreSelection):
			if (!(combiGlobalScore2 == combiGlobalScore)) return; // reject this combination
			break;

		case /^!=$/.test(combiGlobalScoreSelection):
			if (!(combiGlobalScore2 != combiGlobalScore)) return; // reject this combination
			break;

		case /^=>$/.test(combiGlobalScoreSelection):
		case /^>=$/.test(combiGlobalScoreSelection):
			if (!(combiGlobalScore2 >= combiGlobalScore)) return; // reject this combination
			break;

		case /^>$/.test(combiGlobalScoreSelection):
			if (!(combiGlobalScore2 > combiGlobalScore)) return; // reject this combination
			break;
	
		default:
			return; // reject this combination
			break;
	}


	switch (true) {
		case (combiGlobalFailure == -1):
			break; // No rule

		case /^<$/.test(combiGlobalFailureSelection):
			if (!(combiGlobalFailure2 < combiGlobalFailure)) return; // reject this combination
			break;

		case /^=<$/.test(combiGlobalFailureSelection):
		case /^<=$/.test(combiGlobalFailureSelection):
			if (!(combiGlobalFailure2 <= combiGlobalFailure)) return; // reject this combination
			break;

		case /^=$/.test(combiGlobalFailureSelection):
		case (!combiGlobalFailureSelection):
			if (!(combiGlobalFailure2 == combiGlobalFailure)) return; // reject this combination
			break;

		case /^!=$/.test(combiGlobalFailureSelection):
			if (!(combiGlobalFailure2 != combiGlobalFailure)) return; // reject this combination
			break;

		case /^=>$/.test(combiGlobalFailureSelection):
		case /^>=$/.test(combiGlobalFailureSelection):
			if (!(combiGlobalFailure2 >= combiGlobalFailure)) return; // reject this combination
			break;

		case /^>$/.test(combiGlobalFailureSelection):
			if (!(combiGlobalFailure2 > combiGlobalFailure)) return; // reject this combination
			break;

		default:
			return; // reject this combination
			break;
	}


	if (cli.flags.printhits || cli.flags.printfullhits) {
		console.log("combi" + inputLinesCount.toString().padStart(10, 0) + ": " + lotteryFacility.Combination.toString(input_line_numbers.sort()) + " - global score: " + combiGlobalScore2 + " - global failure: " + combiGlobalFailure2);
		console.log(hits_count_string);
		if (cli.flags.printfullhits) console.log(hits_filters_string);
	} else {
		console.log(lotteryFacility.Combination.toString(input_line_numbers.sort()));
	}


	if (additionMode) {
		selected_numbers.push(input_line_numbers.sort()); additions++;
		if (additionsLimit != -1 && additions >= additionsLimit) {
			process.exit(1);
		}
	}
})
.on('close', () => {
	//console.log("inputLinesCount "  + inputLinesCount);
	fileStream.close();
});
