'use strict';
import {
     DrawBox,
} from '../src/index';


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


    test('DrawBox.drawFisherYates covers all ordered pairs without changing the box', () => {
        const box = new DrawBox(3);
        const outcomes = new Set<string>();
        const random = jest.spyOn(Math, 'random');
        try {
            for (let first = 0; first < 3; first++) {
                for (let second = 0; second < 2; second++) {
                    random.mockReturnValueOnce((first + 0.5) / 3)
                        .mockReturnValueOnce((second + 0.5) / 2);
                    const ticket = box.drawFisherYates(2);
                    expect(new Set(ticket).size).toBe(2);
                    outcomes.add(ticket.join('-'));
                }
            }
            expect(outcomes.size).toBe(6);
            expect(box.balls).toEqual([1, 2, 3]);
        } finally {
            random.mockRestore();
        }
    });

    test('DrawBox.drawFisherYates handles empty and full draws and rejects invalid sizes', () => {
        const box = new DrawBox(5);
        expect(box.drawFisherYates(0)).toEqual([]);
        expect(box.drawFisherYates(5).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
        for (const size of [-1, 6, 1.5, NaN, Infinity]) {
            expect(() => box.drawFisherYates(size)).toThrow('Invalid size parameter');
        }
    });

    test('DrawBox.drawIndividualBalancedTickets keeps full-cycle frequencies across boundaries', () => {
        const box = new DrawBox(7);
        const tickets = box.drawIndividualBalancedTickets(14, 3, 0);
        const frequencies = new Map<number, number>();

        for (const ticket of tickets) {
            expect(new Set(ticket).size).toBe(3);
            for (const ball of ticket) {
                frequencies.set(ball, (frequencies.get(ball) ?? 0) + 1);
            }
        }

        expect(tickets).toHaveLength(14);
        expect([...frequencies.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect([...frequencies.values()]).toEqual(new Array(7).fill(6));
    });
});

