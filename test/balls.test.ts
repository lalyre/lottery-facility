'use strict';
import { lotteryBalls, shuffleBalls, combinationString, canonicalCombinationString, collisionsCount, union, intersection, complementCombination, } from '../src/node';


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
        const b = !((a[1] === 1) && (a[2] === 2) && (a[3] === 3) && (a[4] === 4))
        expect(b).toBe(true);
        expect(() => { lotteryBalls(200); }).toThrow(Error);
    });


    test('combinationString test', () => {
         let a = [8, 3, 1, 7, 6, 5];
         let s = combinationString(a, " ");
         expect(s).toBe("08 03 01 07 06 05");
    });


    test('canonicalCombinationString test', () => {
         let a = [8, 3, 1, 7, 6, 5];
         let s = canonicalCombinationString(a, " ");
         expect(s).toBe("01 03 05 06 07 08");
    });


    test('collisionsCount test', () => {
         let a = [8, 3, 1, 7, 6, 5];
         let b = [4, 3, 1, 2, 6, 9];
         let c = collisionsCount(a, b);
         expect(c).toBe(3);
    });


    test('union test', () => {
         let a = [8, 3, 1, 7, 6, 5];
         let b = [4, 3, 1, 2, 6, 9];
         let c = union(a, b);
         let s = canonicalCombinationString(c, " ");
         expect(s).toBe("01 02 03 04 05 06 07 08 09");
    });


    test('intersection test', () => {
         let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
         let b = [4, 3, 1, 2, 6, 9, 1, 9, 3];
         let c = intersection(a, b);
         let s1 = canonicalCombinationString(c, " ");
         expect(s1).toBe("01 03 06");

         let d = intersection(b, a);
         let s2 = canonicalCombinationString(d, " ");
         expect(s2).toBe("01 03 06");
    });


    test('complementCombination test', () => {
         let a = [8, 3, 1, 7, 8, 6, 5, 3, 7, 1];
         let c = complementCombination(9, a);
         let s = combinationString(c, " ");
         expect(s).toBe("02 07 09 03 02 04 05 07 03 09");
    });
});
