'use strict';
import { RandomHelper } from '../src/random';


describe('RandomHelper module', () => {


    beforeEach(() => {
    });


    test('RandomHelper.randomNumberInRange test', () => {
        const a = RandomHelper.randomNumberInRange(1, 2000);
        const b = RandomHelper.randomNumberInRange(1, 2000);
        console.log("a: " + a);
        console.log("b: " + b);

        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThanOrEqual(2000);

        expect(b).toBeGreaterThanOrEqual(1);
        expect(b).toBeLessThanOrEqual(2000);
    });


    test('RandomHelper.randomNumber test', () => {
        const a = RandomHelper.randomNumber();
        console.log("a: " + a);
    });
	

	test('RandomHelper.randomHEXString test', () => {
        const a = RandomHelper.randomHEXString(8);
        console.log("hexString: " + a);
    });
});