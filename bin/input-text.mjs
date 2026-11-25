import { closeSync, createReadStream, openSync, readFileSync, readSync } from 'node:fs';

function detectEncoding(bytes) {
    // Windows PowerShell 5.1 emits UTF-16LE with a BOM when using >.
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
        return { encoding: 'utf16le', start: 2 };
    }
    const hasUtf8Bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
    return { encoding: 'utf8', start: hasUtf8Bom ? 3 : 0 };
}

export function readTextFile(file) {
    const bytes = readFileSync(file);
    const { encoding, start } = detectEncoding(bytes);
    return bytes.toString(encoding, start);
}

export function openTextStream(file) {
    const fd = openSync(file, 'r');
    try {
        const header = Buffer.alloc(3);
        const length = readSync(fd, header, 0, header.length, 0);
        return createReadStream(file, { fd, ...detectEncoding(header.subarray(0, length)) });
    } catch (error) {
        closeSync(fd);
        throw error;
    }
}
