'use strict';


/**
 * Get GMT date YYYY-MM-DD hh:mm:ss.NNNZ from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYY-MM-DD hh:mm:ss.NNNZ'
 */
export function displayUTCDateTime (date: Date): string {
	if (!date) throw new Error('Invalid parameter');
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	const hour = date.getUTCHours().toString().padStart(2, '0');
	const minute = date.getUTCMinutes().toString().padStart(2, '0');
	const second = date.getUTCSeconds().toString().padStart(2, '0');
	const millis = date.getUTCMilliseconds().toString().padStart(3, '0');
	const display = `${year}-${month}-${day} ${hour}:${minute}:${second}.${millis}Z`;
	return display;
}


/**
 * Get GMT date YYYYMMDDhhmmssNNN from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDDhhmmssNNN'
 */
export function displayUTCDateTimeYYYYMMDDhhmmssNNN (date: Date): string {
	if (!date) throw new Error('Invalid parameter');
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	const hour = date.getUTCHours().toString().padStart(2, '0');
	const minute = date.getUTCMinutes().toString().padStart(2, '0');
	const second = date.getUTCSeconds().toString().padStart(2, '0');
	const millis = date.getUTCMilliseconds().toString().padStart(3, '0');
	const display = `${year}${month}${day}${hour}${minute}${second}${millis}`;
	return display;
}


/**
 * Get GMT date YYYYMMDDhhmmss from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDDhhmmss'
 */
export function displayUTCDateTimeYYYYMMDDhhmmss (date: Date): string {
	const display = displayUTCDateTimeYYYYMMDDhhmmssNNN(date);
	return display.substring(0, display.length-3);
}


/**
 * Get GMT date YYYYMMDDhhmm from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDDhhmm'
 */
export function displayUTCDateTimeYYYYMMDDhhmm (date: Date): string {
	const display = displayUTCDateTimeYYYYMMDDhhmmssNNN(date);
	return display.substring(0, display.length-5);
}


/**
 * Get GMT date YYYYMMDD from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDD'
 */
export function displayUTCDateTimeYYYYMMDD (date: Date): string {
	const display = displayUTCDateTimeYYYYMMDDhhmmssNNN(date);
	return display.substring(0, display.length-9);
}


/**
 * Computes the minimum circular distance between two values in Z_modulo.
 * d(x,y) = min(|x-y|, modulo - |x-y|)
 */
export function circularDistance(x: number, y: number, modulo: number): number {
	const d = Math.abs(x - y) % modulo;
	return Math.min(d, modulo - d);
}





/*

const grosNombre = 9007199254740991n + 100n;

// Conversion en chaîne
const chaine = grosNombre.toString(); 
console.log(chaine); // "9007199254741091"

// Conversion inverse
const retourAuBigInt = BigInt(chaine);
console.log(retourAuBigInt === grosNombre); // true


const data = {
  id: 1,
  score: 123456789012345678901234567890n
};

// On transforme le BigInt en String pour le JSON
const jsonSante = JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);

// Vous pouvez maintenant écrire 'jsonSante' dans un fichier (.json)


const objetLu = JSON.parse(jsonSante, (key, value) => {
  // Si la valeur ressemble à un très grand nombre, on peut la repasser en BigInt
  // (C'est à adapter selon la structure de vos données)
  if (key === 'score') return BigInt(value);
  return value;
});


*/





