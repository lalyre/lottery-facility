import { RandomHelper } from '../src/random';


describe('Random module', () => {


    beforeEach(() => {
    });


    test('Random.randomNumberRange test', () => {
        const a = RandomHelper.randomNumberRange(1, 2000);
        const b = RandomHelper.randomNumberRange(1, 2000);
        console.log("a: " + a);
        console.log("b: " + b);

        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThanOrEqual(2000);

        expect(b).toBeGreaterThanOrEqual(1);
        expect(b).toBeLessThanOrEqual(2000);
    });


    test('Random.randomNumber test', () => {
        const a = RandomHelper.randomNumber();
        console.log("a: " + a);
    });

});