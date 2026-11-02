'use strict';
import {
     DrawBox,
} from '../src/index';


describe('DrawBox module', () => {
    beforeEach(() => {
    });


    test('DrawBox.draw test', () => {
        const r = new DrawBox(99);
        const random = jest.spyOn(Math, 'random').mockReturnValue(0);
        try {
            const a = r.draw(99);
            expect(a).toEqual([...Array.from({ length: 98 }, (_, i) => i + 2), 1]);
            expect(r.balls).toEqual(a);
            a[0] = -1;
            expect(r.balls[0]).toBe(2);
            expect(random).toHaveBeenCalledTimes(98);
        } finally {
            random.mockRestore();
        }
        expect(() => { new DrawBox(0); }).toThrow(Error);
    });


    test('DrawBox.shuffle produces each permutation exactly once across all Fisher-Yates choices', () => {
        const outcomes = new Set<string>();
        const random = jest.spyOn(Math, 'random');
        try {
            for (let first = 0; first < 3; first++) {
                for (let second = 0; second < 2; second++) {
                    const box = new DrawBox(3);
                    const balls = box.balls;
                    random.mockReturnValueOnce((first + 0.5) / 3)
                        .mockReturnValueOnce((second + 0.5) / 2);
                    box.shuffle();
                    expect(box.balls).toBe(balls);
                    expect([...box.balls].sort((a, b) => a - b)).toEqual([1, 2, 3]);
                    outcomes.add(box.balls.join('-'));
                }
            }
            expect(outcomes.size).toBe(6);
            expect(random).toHaveBeenCalledTimes(12);
        } finally {
            random.mockRestore();
        }
    });

    test('DrawBox.shuffle handles a single ball without consuming randomness', () => {
        const random = jest.spyOn(Math, 'random').mockReturnValue(0);
        try {
            const singleton = new DrawBox(1);
            singleton.shuffle();
            expect(singleton.balls).toEqual([1]);
            expect(random).not.toHaveBeenCalled();
        } finally {
            random.mockRestore();
        }
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
        const tickets = box.drawIndividualBalancedTickets(14, 3);
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

