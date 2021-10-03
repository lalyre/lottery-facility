#!/usr/bin/env node
'use strict'
const request = require('request');
const rp = require('request-promise');
const JSZip = require("jszip");
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle');


const cli = meow(`
	Usage
	  $ translate

	Parameters
	  --file, -f    A file containing one combination per line
	  --originnum   Items of combinations separated by '|' that are used in combinations of <file> file
	  --originfile  File containing one item per line that are used in combinations of <file> file
	  --targetnum   Items of combinations used for the translation of <file> file
	  --targetfile  File containing one item per line used for the translation <file> file
	  
	Description
	This script takes an input file <file> containing one combination per line, combinations
	written with the <origin> alphabet and translated into <target> alphabet.
	Items of <origin> alphabet are translated to <target> alphabet relatively to
	their corresponding order of declaration.

	The <origin> alphabet can be declared either with <originnum> or <originfile> parameters.
	The <target> alphabet can be declared either with <targetnum> or <targetfile> parameters.
`, {
	flags: {
		originfile: {
			type: 'string',
			isRequired: (input, flags) => {
				if (input.originnum) {
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
				if (input.targetnum) {
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










if (process.argv.length <= 2
|| (process.argv[2] == '-h' || process.argv[2] == '--help')) {
	console.log("euromillions_lastdraws.js [Version " + version.api_version + "]")
	console.log("(c) 2020 Claude Lalyre Corporation. Tous droits reserves.")
	console.log("Usage:");
	console.log("euromillions_lastdraws.js --help");
	console.log("euromillions_lastdraws.js --version");
	console.log("euromillions_lastdraws.js -n <number of last draws> [-head <number of lines>] [-date] [-stars]");
	console.log("\t");
	console.log("");
	console.log("This script gives last draws of Euromillions lottery.");
	console.log("The -n <num> parameter gives the last <num> draws of Euromillions lottery.")
	console.log("The optional [-date] parameter also displays date.");
	console.log("The optional [-stars] parameter also displays the stars.");
	console.log("The optional [-head <num>] gives only the first <num> draws.")
	process.exit(0);
}
if (process.argv[2] == '-v' || process.argv[2] == '-V' || process.argv[2] == '--version') {
	console.log(`v${version.api_version}`);
	process.exit(0);
}


var num = undefined;
var head = undefined;
var display_date = false;
var display_stars = false;
process.argv.forEach((val, index) => {
	if (val == '-n') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		val = process.argv[index+1].trim();
		num = parseInt(val, 10);
	}
	if (val == '-date') {
		display_date = true;
	}
	if (val == '-stars') {
		display_stars = true;
	}
	if (val == '-head') {
		if (index + 1 == process.argv.length) {
			console.error("Missing argument on command line");
			process.exit(1);
		}
		val = process.argv[index+1].trim();
		head = parseInt(val, 10);
	}
});


/*
 * https://www.fdj.fr/jeux-de-tirage/euromillions-my-million/statistiques
 * https://media.fdj.fr/static/csv/euromillions/euromillions_202002.zip
 */
const euromillionsArchive = 'https://media.fdj.fr/static/csv/euromillions/euromillions_202002.zip';
rp({
	method: "GET",
	url: euromillionsArchive,
	encoding: null,		// <- this one is important !
})
.then((data) => {
	return JSZip.loadAsync(data);
})
.then((zipContent) => {
	return zipContent.file("euromillions_202002.csv").async("string");
})
.then((text) => {
	var lines = text.split(/\r?\n/);
	
	// 0annee_numero_de_tirage	1jour_de_tirage 2date_de_tirage	3numéro_de_tirage_dans_le_cycle	4date_de_forclusion
	// 5boule_1	6boule_2	7boule_3	8boule_4	9boule_5	10etoile_1	11etoile_2	12boules_gagnantes_en_ordre_croissant	13etoiles_gagnantes_en_ordre_croissant
	// 14nombre_de_gagnant_au_rang1_Euro_Millions_en_france	15nombre_de_gagnant_au_rang1_Euro_Millions_en_europe	16rapport_du_rang1_Euro_Millions
	// 17nombre_de_gagnant_au_rang2_Euro_Millions_en_france	18nombre_de_gagnant_au_rang2_Euro_Millions_en_europe	19rapport_du_rang2_Euro_Millions
	// 20nombre_de_gagnant_au_rang3_Euro_Millions_en_france	21nombre_de_gagnant_au_rang3_Euro_Millions_en_europe	22rapport_du_rang3_Euro_Millions
	// 23nombre_de_gagnant_au_rang4_Euro_Millions_en_france	24nombre_de_gagnant_au_rang4_Euro_Millions_en_europe	25rapport_du_rang4_Euro_Millions
	// 26nombre_de_gagnant_au_rang5_Euro_Millions_en_france	nombre_de_gagnant_au_rang5_Euro_Millions_en_europe	27rapport_du_rang5_Euro_Millions
	// 28nombre_de_gagnant_au_rang6_Euro_Millions_en_france	nombre_de_gagnant_au_rang6_Euro_Millions_en_europe	29rapport_du_rang6_Euro_Millions
	// 30nombre_de_gagnant_au_rang7_Euro_Millions_en_france	nombre_de_gagnant_au_rang7_Euro_Millions_en_europe	31rapport_du_rang7_Euro_Millions
	// 32nombre_de_gagnant_au_rang8_Euro_Millions_en_france	nombre_de_gagnant_au_rang8_Euro_Millions_en_europe	33rapport_du_rang8_Euro_Millions
	// 34nombre_de_gagnant_au_rang9_Euro_Millions_en_france	nombre_de_gagnant_au_rang9_Euro_Millions_en_europe	35rapport_du_rang9_Euro_Millions
	// 36nombre_de_gagnant_au_rang10_Euro_Millions_en_france	37nombre_de_gagnant_au_rang10_Euro_Millions_en_europe	38rapport_du_rang10_Euro_Millions
	// 39nombre_de_gagnant_au_rang11_Euro_Millions_en_france	40nombre_de_gagnant_au_rang11_Euro_Millions_en_europe	41rapport_du_rang11_Euro_Millions
	// 42nombre_de_gagnant_au_rang12_Euro_Millions_en_france	43nombre_de_gagnant_au_rang12_Euro_Millions_en_europe	44rapport_du_rang12_Euro_Millions
	// 45nombre_de_gagnant_au_rang13_Euro_Millions_en_france	46nombre_de_gagnant_au_rang13_Euro_Millions_en_europe	47rapport_du_rang13_Euro_Millions
	// 48nombre_de_gagnant_au_rang1_Etoile+	49rapport_du_rang1_Etoile+	50nombre_de_gagnant_au_rang2_Etoile+	51rapport_du_rang2_Etoile+
	// 52nombre_de_gagnant_au_rang3_Etoile+	53rapport_du_rang3_Etoile+	54nombre_de_gagnant_au_rang4_Etoile+	55rapport_du_rang4_Etoile+
	// 56nombre_de_gagnant_au_rang5_Etoile+	57rapport_du_rang5_Etoile+	58nombre_de_gagnant_au_rang6_Etoile+	59rapport_du_rang6_Etoile+
	// 60nombre_de_gagnant_au_rang7_Etoile+	61rapport_du_rang7_Etoile+	62nombre_de_gagnant_au_rang8_Etoile+	63rapport_du_rang8_Etoile+
	// 64nombre_de_gagnant_au_rang9_Etoile+	65rapport_du_rang9_Etoile+	66nombre_de_gagnant_au_rang10_Etoile+	67rapport_du_rang10_Etoile+
	// 68numero_My_Million	69numero_Tirage_Exceptionnel_Euro_Million

	if (num > lines.length) {
		console.error("Too many draws required !");
		process.exit(1);
	}

	var count = 0;
	for (let i = num; i > 0; i--) {
		if (head && count == head) {
			break;
		}
		var current_line = lines[i];
		if (!current_line) {
			continue;
		}
		
		++count;
		var values = current_line.split(';');
		var date = values[2];
		var balls = values.slice(5, 10);
		var stars = values.slice(10, 12);		

		var display = balls.map (x => x.toString().padStart(2, 0)).join(" ")
		if (display_stars) {
			display += " / " + stars.map (x => x.toString().padStart(2, 0)).join(" ");
		}
		if (display_date) {
			display = date + "; " + display;
		}
		console.log(display);
	}
})
.catch((err) => {
	console.log("error:");
	console.log(err);
});
