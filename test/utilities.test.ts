'use strict';
import { displayUTCDateTime,
    displayUTCDateTimeYYYYMMDDhhmmssNNN,
    displayUTCDateTimeYYYYMMDDhhmmss,
    displayUTCDateTimeYYYYMMDDhhmm,
    displayUTCDateTimeYYYYMMDD
} from '../src/utilities';


describe('Utilities module', () => {


    beforeEach(() => {
    });


    test('displayUTCDateTime test', () => {
        const a  = 1682328936354;
        const b = displayUTCDateTime(new Date(a));
        console.log(b);
        expect(b).toBe('2023-04-24 09:35:36.354Z');
    });


    test('displayUTCDateTimeYYYYMMDDhhmmssNNN test', () => {
        const a  = 1682328936354;
        const b = displayUTCDateTimeYYYYMMDDhhmmssNNN(new Date(a));
        console.log(b);
        expect(b).toBe('20230424093536354');
    });
	

    test('displayUTCDateTimeYYYYMMDDhhmmss test', () => {
        const a  = 1682328936354;
        const b = displayUTCDateTimeYYYYMMDDhhmmss(new Date(a));
        console.log(b);
        expect(b).toBe('20230424093536');
    });


    test('displayUTCDateTimeYYYYMMDDhhmm test', () => {
        const a  = 1682328936354;
        const b = displayUTCDateTimeYYYYMMDDhhmm(new Date(a));
        console.log(b);
        expect(b).toBe('202304240935');
    });


    test('displayUTCDateTimeYYYYMMDD test', () => {
        const a  = 1682328936354;
        const b = displayUTCDateTimeYYYYMMDD(new Date(a));
        console.log(b);
        expect(b).toBe('20230424');
    });
});