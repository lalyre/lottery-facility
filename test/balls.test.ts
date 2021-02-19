'use strict';
import { flashBalls, shuffleBalls, } from '../src';


describe('Balls module', () => {


    beforeEach(() => {
    });


    test('flashBalls test', () => {
        const a = flashBalls(99);
		//console.log(JSON.stringify(a));
        expect(a.length).toBeGreaterThanOrEqual(99);
        expect(() => { flashBalls(200); }).toThrow(Error);
    });

});