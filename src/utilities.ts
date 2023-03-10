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
