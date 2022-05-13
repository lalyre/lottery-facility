'use strict';
import {
     Random,
     DrawBox,
} from '../src/main';


describe('DrawBox module', () => {
    beforeEach(() => {
    });


    test('DrawBox.draw test', () => {
        const r = new DrawBox(99);
        const a = r.draw(99, 40);
        const b = !((a[1] === 1) && (a[2] === 2) && (a[3] === 3) && (a[4] === 4))
        expect(b).toBe(true);
        expect(() => { new DrawBox(0); }).toThrow(Error);
    });
});

