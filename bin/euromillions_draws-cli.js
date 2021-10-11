#!/usr/bin/env node
'use strict'
const request = require('request');
const rp = require('request-promise');
const JSZip = require("jszip");
const meow = require('meow');
const lotteryFacility = require('../dist/lotteryfacility-nodebundle');


const cli = meow(`
	Usage
	  $ euromillions_draws

	Parameters
	  --num, -n     It retrieves the last <num> draws of Euromillions lottery in ascending order
	  --date		Displays the date
	  --stars		Displays the stars
	  --head		Gives only the first <head> lines instead of the whole required draws in ascending order
	  
	Description
	This script gives last draws of Euromillions lottery.
`, {
	flags: {
		num: {
			type: 'string',
			alias: 'n',
			isRequired: true,
			isMultiple: false,
		},
		date: {
			type: 'boolean',
			default: false,
			isRequired: false,
			isMultiple: false,
		},
		stars: {
			type: 'boolean',
			default: false,
			isRequired: false,
			isMultiple: false,
		},
		head: {
			type: 'number',
			isRequired: false,
			isMultiple: false,
		},
	}
});


let num = cli.flags.num;
let head = cli.flags.head;
let displayDate = cli.flags.date;
let displayStars = cli.flags.stars;

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
		if (displayStars) {
			display += " / " + stars.map (x => x.toString().padStart(2, 0)).join(" ");
		}
		if (displayDate) {
			display = date + "; " + display;
		}
		console.log(display);
	}
})
.catch((err) => {
	console.log("error:");
	console.log(err);
});
