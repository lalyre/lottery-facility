'use strict';


export function isBrowser() {
	return (typeof window !== 'undefined' && typeof window.document !== 'undefined');
}


export * from './version';
export * from './utilities';
export * from './random';
export * from './drawbox';
export * from './tuple';
export * from './cartesian_product';

