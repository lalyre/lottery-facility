#!/usr/bin/env node --max-old-space-size=8192
'use strict'
import JSZip from 'jszip';
import meow from 'meow';
import bent from 'bent';
const getJSON = bent('json')
const getBuffer = bent('buffer')
//import * as lotteryFacility from '../dist/lotteryfacility-nodebundle.umd.js';


const cli = meow(`
	Usage
	  $ kenoFR

	Parameters
	  --num, -n     It retrieves the last <num> draws of Keno FR lottery in ascending order
	  --date        Displays date and time
	  --head        Gives only the first <head> lines instead of the whole required draws in ascending order
	  
	Description
	This script gives last draws of Keno FR lottery in ascending order.
`, {
	importMeta: import.meta,
	flags: {
		num: {
			type: 'string',
			shortFlag: 'n',
			isRequired: true,
			isMultiple: false,
		},
		date: {
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


// powerball		https://data.ny.gov/api/views/d6yy-54nr/rows.csv?accessType=DOWNLOAD
// megamillions		https://data.ny.gov/api/views/5xaw-6ayf/rows.csv?accessType=DOWNLOAD
// SuperEnalotto	http://lottoscar.altervista.org/ArchivioSuper.zip


// https://www.fdj.fr/jeux-de-tirage/loto/statistiques
// https://media.fdj.fr/static-draws/csv/loto/loto_201911.zip
// https://media.fdj.fr/static-draws/csv/loto/loto_201902.zip
// https://media.fdj.fr/static-draws/csv/loto/loto_201703.zip
// https://media.fdj.fr/static-draws/csv/loto/loto_200810.zip
// https://media.fdj.fr/static-draws/csv/loto/loto_197605.zip


// https://www.fdj.fr/jeux-de-tirage/keno-gagnant-a-vie/resultats
// https://www.fdj.fr/jeux-de-tirage/keno/statistiques
// https://www.fdj.fr/jeux-de-tirage/keno/historique
// https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66aft6		keno_202010
// https://media.fdj.fr/static-draws/csv/keno/keno_202010.zip
// https://media.fdj.fr/static-draws/csv/keno/keno_201811.zip
// https://media.fdj.fr/static-draws/csv/keno/keno_201302.zip
// https://media.fdj.fr/static-draws/csv/keno/keno_199309.zip



const kenoArchive = 'https://www.sto.api.fdj.fr/anonymous/service-draw-info/v3/documentations/1a2b3c4d-9876-4562-b3fc-2c963f66aft6';
getBuffer(kenoArchive)
.then((buffer) => {
	return JSZip.loadAsync(buffer)
})
.then((zipContent) => {
	return zipContent.file("keno_202010.csv").async("string");
})
.then((text) => {
	var lines = text.split(/\r?\n/);
	
	//annee_numero_de_tirage0, date_de_tirage1, heure_de_tirage2, date_de_forclusion3, boule1 4,boule2 5,boule3 6,boule4 7,boule5 8,boule6 9,boule7 10,
	//boule8 11,boule9 12,boule10 13,boule11 14,boule12 15,boule13 16,boule14 17,boule15 18,boule16 19,boule17 20,boule18 21,boule19 22,boule20 23,
	//multiplicateur 94,numero_jokerplus 95,devise 96,
	
	if (num > lines.length-1) {
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
		var date = values[1];
		var hour = values[2];
		var balls = values.slice(4, 24);
		var multiplicator = values[94];
		
		if (displayDate) {
			console.log(date + "; " + hour + "; " + balls.map (x => x.toString().padStart(2, 0)).join(" "));
		} else {
			console.log(balls.map (x => x.toString().padStart(2, 0)).join(" "));
		}
	}
})
.catch((err) => {
	console.log("error:");
	console.log(err);
});

