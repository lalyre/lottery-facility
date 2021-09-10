'use strict';
import { lotteryBalls, shuffleBalls, } from '../src/node';


describe('Balls module', () => {


    beforeEach(() => {
    });


    test('lotteryBalls test', () => {
        const a = lotteryBalls(99);
        //console.log(JSON.stringify(a));
        expect(a.length).toBeGreaterThanOrEqual(99);
        expect(() => { lotteryBalls(200); }).toThrow(Error);
    });

    test('shuffleBalls test', () => {
        const a = lotteryBalls(99);
        shuffleBalls(a, 40);
        const b = (a[1] !== 1) && (a[2] !== 2) && (a[3] !== 3)
        expect(b).not.toBe(true);
        expect(() => { lotteryBalls(200); }).toThrow(Error);
    });

    test('displayCombination test', () => {
		  fail('need to write a test');
    });
	
    test('displayCanonicalCombination test', () => {
		  fail('need to write a test');
    });

    test('collisionsCount test', () => {
		  fail('need to write a test');
    });
	
    test('collisions test', () => {
		  fail('need to write a test');
    });

    test('complementCombination test', () => {
		  fail('need to write a test');
    });
});