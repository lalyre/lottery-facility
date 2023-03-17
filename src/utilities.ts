'use strict';


/**
 * Get GMT date YYYY-MM-DD HH:MM:SS.NNNZ from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYY-MM-DD HH:MM:SS.NNNZ'
 */
export function displayUTCDateTime(date: Date): string|null {
	if (!date) return null;
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
 * Get GMT date YYYYMMDDHHMMSSNNN from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDDHHMMSSNNN'
 */
export function displayUTCDateTimeYYYYMMDDHHMMSSNNN(date: Date): string|null {
	if (!date) return null;
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
 * Get GMT date YYYYMMDDHHMMSS from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDDHHMMSS'
 */
export function displayUTCDateTimeYYYYMMDDHHMMSS(date: Date): string|null {
	if (!date) return null;
	const display = displayUTCDateTimeYYYYMMDDHHMMSSNNN(date);
	return display.substring(0, display.length-3);
}


/**
 * Get GMT date YYYYMMDDHHMM from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDDHHMM'
 */
export function displayUTCDateTimeYYYYMMDDHHMM(date: Date): string|null {
	if (!date) return null;
	const display = displayUTCDateTimeYYYYMMDDHHMMSSNNN(date);
	return display.substring(0, display.length-5);
}


/**
 * Get GMT date YYYYMMDD from Javascript date
 * @param date  a Javascript date object
 * @return      a string representing the date in format 'YYYYMMDD'
 */
export function displayUTCDateTimeYYYYMMDD(date: Date): string|null {
	if (!date) return null;
	const display = displayUTCDateTimeYYYYMMDDHHMMSSNNN(date);
	return display.substring(0, display.length-9);
}

