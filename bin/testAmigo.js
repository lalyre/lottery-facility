// ==========================================
// 1. PARAMÈTRES DU JEU
// ==========================================
const TOTAL_BALLS = 28;  // Total de numéros dans l'urne (ex: 28)
const DRAW_SIZE   = 12;  // Nombre de numéros tirés par le tirage (ex: 12)
const TARGET_MATCH = 6;  // Nombre minimum de bons numéros visés

// ==========================================
// 2. TES GRILLES (Format texte brut)
// ==========================================
const rawTextSystem = `
1 2 3 4 5 6 7
8 9 10 11 12 13 14
15 16 17 18 19 20 21
22 23 24 25 26 27 28
`;

// ==========================================
// 3. MOTEUR UNIVERSEL (Ne rien modifier)
// ==========================================

// Calcul combinatoire C(n, k)
function combinationsCount(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let c = 1;
    for (let i = 1; i <= k; i++) {
        c = (c * (n - i + 1)) / i;
    }
    return Math.round(c);
}

const parseSystem = (text) => {
    const trimmed = text.trim();
    if (trimmed === "") return [];
    return trimmed
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .map((line) => line.split(/\s+/).map(Number));
};

function arrayToBitmask(numbers) {
    let mask = 0;
    for (let i = 0; i < numbers.length; i++) {
        mask |= (1 << (numbers[i] - 1));
    }
    return mask;
}

// Fonction binaire universelle (inchangée)
function popcount(v) {
    v = v - ((v >> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
    return (((v + (v >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

// Algorithme de Gosper universel
function nextCombination(v) {
    const t = (v | (v - 1)) + 1;
    return t | ((((t & -t) / (v & -v)) >> 1) - 1);
}

// Execution
const myGrids = parseSystem(rawTextSystem);

if (myGrids.length === 0) {
    console.log("Erreur : aucune grille détectée.");
    process.exit(1);
}

const gridMasks = myGrids.map(arrayToBitmask);
const gridCount = gridMasks.length;
const detectedGridSize = myGrids[0].length;
const totalDraws = combinationsCount(TOTAL_BALLS, DRAW_SIZE);

console.log(`Grilles chargées    : ${gridCount}`);
console.log(`Taille détectée     : ${detectedGridSize} numéros par grille`);
console.log(`Objectif            : au moins ${TARGET_MATCH}/${DRAW_SIZE} bons numéros parmi ${TOTAL_BALLS}`);
console.log(`Tirages à évaluer   : ${totalDraws.toLocaleString('fr-FR')}\n`);

console.time("Évaluation");

let maskDraw = (1 << DRAW_SIZE) - 1;
let coveredCount = 0;

for (let i = 0; i < totalDraws; i++) {
    for (let j = 0; j < gridCount; j++) {
        if (popcount(gridMasks[j] & maskDraw) >= TARGET_MATCH) {
            coveredCount++;
            break;
        }
    }
    maskDraw = nextCombination(maskDraw);
}

console.timeEnd("Évaluation");

const coveragePct = ((coveredCount / totalDraws) * 100).toFixed(2);
console.log(`\nTirages couverts : ${coveredCount.toLocaleString('fr-FR')} / ${totalDraws.toLocaleString('fr-FR')} (${coveragePct} %)`);





/*

class BitSet {
    constructor(totalBalls, grid = []) {
        this.size = Math.ceil(totalBalls / 32);
        this.words = new Uint32Array(this.size);
        for (const num of grid) {
            this.add(num);
        }
    }

    add(num) {
        const index = Math.floor((num - 1) / 32);
        const bit = (num - 1) % 32;
        this.words[index] |= (1 << bit);
    }

    // Compte le nombre de numéros en commun avec un autre BitSet
    overlapWith(other) {
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            let v = this.words[i] & other.words[i];
            // Popcount 32 bits rapide
            v = v - ((v >> 1) & 0x55555555);
            v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
            count += (((v + (v >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
        }
        return count;
    }
}

// Exemple sur 200 numéros
const TOTAL_NUMEROS = 200;
const grille1 = new BitSet(TOTAL_NUMEROS, [10, 80, 150, 199]);
const grille2 = new BitSet(TOTAL_NUMEROS, [5, 80, 150, 200]);

console.log(`Numéros en commun : ${grille1.overlapWith(grille2)}`); // Résultat : 2


*/
