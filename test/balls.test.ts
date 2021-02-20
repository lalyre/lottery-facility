'use strict';
import { lotteryBalls, shuffleBalls, } from '../src';


describe('Balls module', () => {


    beforeEach(() => {
    });


    test('lotteryBalls test', () => {
        const a = lotteryBalls(99);
		//console.log(JSON.stringify(a));
        expect(a.length).toBeGreaterThanOrEqual(99);
        expect(() => { lotteryBalls(200); }).toThrow(Error);
    });

});