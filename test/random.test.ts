import { RandomHelper } from '../src/random';

describe('RandomHelper', () => {
    afterEach(() => jest.restoreAllMocks());

    test('generates byte endpoints directly from Math.random', () => {
        jest.spyOn(Math, 'random').mockReturnValueOnce(0)
            .mockReturnValueOnce(0.5).mockReturnValueOnce(1 - Number.EPSILON);
        expect(RandomHelper.randomBytes(3)).toEqual(new Uint8Array([0, 128, 255]));
        expect(RandomHelper.randomBytes(32)).toHaveLength(32);
    });

    test.each([0, -1, 33, 48, 1.5, NaN, Infinity])('rejects invalid byte length %s', len => {
        expect(() => RandomHelper.randomBytes(len)).toThrow('Invalid len parameter');
        expect(() => RandomHelper.randomHEXString(len)).toThrow('Invalid len parameter');
    });

    test('generates exact 53-bit integer endpoints without signed truncation', () => {
        const bytes = jest.spyOn(RandomHelper, 'randomBytes');
        bytes.mockReturnValueOnce(new Uint8Array(7));
        expect(RandomHelper.randomNumber()).toBe(0);
        bytes.mockReturnValueOnce(new Uint8Array(7).fill(255));
        expect(RandomHelper.randomNumber()).toBe(Number.MAX_SAFE_INTEGER);
        bytes.mockReturnValueOnce(new Uint8Array([1, 0, 0, 0, 0, 0, 0]));
        expect(RandomHelper.randomNumber()).toBe(2 ** 48);
    });

    test('formats hexadecimal bytes with leading zeros without Buffer', () => {
        jest.spyOn(RandomHelper, 'randomBytes')
            .mockReturnValue(new Uint8Array([0, 1, 15, 16, 128, 255]));
        expect(RandomHelper.randomHEXString(6)).toBe('00010f1080ff');
    });

    test('rejects surplus values instead of folding them with modulo', () => {
        const bytes = jest.spyOn(RandomHelper, 'randomBytes');
        bytes.mockReturnValueOnce(new Uint8Array([255]))
            .mockReturnValueOnce(new Uint8Array([2]));
        expect(RandomHelper.randomNumberInRange(10, 12)).toBe(12);
        expect(bytes).toHaveBeenCalledTimes(2);
    });

    test('maps all accepted choices equally in an interval of three values', () => {
        const bytes = jest.spyOn(RandomHelper, 'randomBytes');
        const frequencies = [0, 0, 0];
        for (let value = 0; value < 256; value++) {
            if ((value & 3) === 3) continue;
            bytes.mockReturnValueOnce(new Uint8Array([value]));
            frequencies[RandomHelper.randomNumberInRange(0, 2)]++;
        }
        expect(frequencies).toEqual([64, 64, 64]);
    });

    test('supports negative and reversed bounds, inclusive endpoints and singleton ranges', () => {
        const bytes = jest.spyOn(RandomHelper, 'randomBytes');
        bytes.mockReturnValueOnce(new Uint8Array([0]))
            .mockReturnValueOnce(new Uint8Array([4]));
        expect(RandomHelper.randomNumberInRange(2, -2)).toBe(-2);
        expect(RandomHelper.randomNumberInRange(-2, 2)).toBe(2);
        bytes.mockClear();
        expect(RandomHelper.randomNumberInRange(-7, -7)).toBe(-7);
        expect(bytes).not.toHaveBeenCalled();
    });

    test('handles ranges crossing the entire safe-integer domain exactly', () => {
        const bytes = jest.spyOn(RandomHelper, 'randomBytes');
        bytes.mockReturnValueOnce(new Uint8Array(7))
            .mockReturnValueOnce(new Uint8Array([63, 255, 255, 255, 255, 255, 254]));
        expect(RandomHelper.randomNumberInRange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))
            .toBe(Number.MIN_SAFE_INTEGER);
        expect(RandomHelper.randomNumberInRange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))
            .toBe(Number.MAX_SAFE_INTEGER);
    });

    test.each([NaN, Infinity, -Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])(
        'rejects invalid range bound %s', value => {
            expect(() => RandomHelper.randomNumberInRange(value, 1)).toThrow('Invalid range parameters');
            expect(() => RandomHelper.randomNumberInRange(1, value)).toThrow('Invalid range parameters');
        });
});