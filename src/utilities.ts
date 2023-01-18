'use strict';


/**
 * Get GMT date YYYYMMDDHHMMSS from Javascript date
 * @param date			a Javascript date object
 * @return				a string representing the date in format YYYYMMDDHHMMSS
 */
export function displayUTCDateTime(date: Date): string|null {
	if (!date) {
		return null;
	}
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
	const day = date.getUTCDate().toString().padStart(2, '0');
	const hour = date.getUTCHours().toString().padStart(2, '0');
	const minute = date.getUTCMinutes().toString().padStart(2, '0');
	const second = date.getUTCSeconds().toString().padStart(2, '0');
	const display = `${year}${month}${day}${hour}${minute}${second}`;
	return display;
}
