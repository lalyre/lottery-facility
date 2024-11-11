'use strict';


export function isNode() {
  return (typeof process !== 'undefined' && process.versions && process.versions.node);
}


export * from './browser';

