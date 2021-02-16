import { randomNumberRange } from '../src';


describe('Random module', () => {


    beforeEach(() => {
    });


    test('randomNumberRange test', () => {
        const a = randomNumberRange(10, 20);
        const b = randomNumberRange(10, 20);
        //console.log("a: " + a);
        //console.log("b: " + b);

        expect(a).toBeGreaterThanOrEqual(10);
        expect(a).toBeLessThanOrEqual(20);

        expect(b).toBeGreaterThanOrEqual(10);
        expect(b).toBeLessThanOrEqual(20);
    });

});