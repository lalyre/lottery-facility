'use strict';
import { flashBalls } from '../src';


describe('Balls module', () => {


    beforeEach(() => {
    });


    test('flashBalls test', () => {
        const a = flashBalls(10);
		console.log(JSON.stringify(a));
		
		
        //const b = randomNumberRange(10, 20);
        //console.log("a: " + a);
        //console.log("b: " + b);

        //expect(a).toBeGreaterThanOrEqual(10);
        //expect(a).toBeLessThanOrEqual(20);

        //expect(b).toBeGreaterThanOrEqual(10);
        //expect(b).toBeLessThanOrEqual(20);
    });

});