import { randomNumber, randomNumberRange } from '../src/random';


describe('Random module', () => {


    beforeEach(() => {
    });


    test('randomNumberRange test', () => {
        const a = randomNumberRange(1, 2000);
        const b = randomNumberRange(1, 2000);
        //console.log("a: " + a);
        //console.log("b: " + b);

        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThanOrEqual(2000);

        expect(b).toBeGreaterThanOrEqual(1);
        expect(b).toBeLessThanOrEqual(2000);
    });


    test('randomNumber test', () => {
        const a = randomNumber();
        //console.log("a: " + a);
    });

});