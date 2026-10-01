

// Nombre total de tirages virtuels C(28, 12)
const TOTAL_DRAWS = 30421755;

// Parser pour extraire les grilles depuis une chaîne multi-lignes
const parseSystem = (text) => {
    const trimmed = text.trim();
    if (trimmed === "") return [];
    return trimmed
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .map((line) => line.split(/\s+/).map(Number));
};

// Convertit un tableau de numéros [1..28] en masque de bits
function arrayToBitmask(numbers) {
    let mask = 0;
    for (let i = 0; i < numbers.length; i++) {
        mask |= (1 << (numbers[i] - 1));
    }
    return mask;
}

// Algorithme de Gosper : génère la combinaison suivante à 12 bits
function nextCombination(v) {
    const t = (v | (v - 1)) + 1;
    return t | ((((t & -t) / (v & -v)) >> 1) - 1);
}

// 1. Tes grilles brutes au format texte
const rawTextSystem = `
1 2 3 4 5 6
7 8 9 10 11 12
13 14 15 16 17 18
19 20 21 22 23 24
25 26 27 28 1 2
`;

// 2. Conversion du texte en tableaux puis en masques binaires
const myGrids = parseSystem(rawTextSystem);
const gridMasks = myGrids.map(arrayToBitmask);
const gridCount = gridMasks.length;

console.log(`Grilles chargées : ${gridCount}`);
console.time("Évaluation des 30M de tirages");

let maskDraw = (1 << 12) - 1; // Premier tirage binaire (bits 0 à 11 à 1)
let coveredCount = 0;

// 3. Boucle sur les 30 421 755 tirages de 12 numéros
for (let i = 0; i < TOTAL_DRAWS; i++) {
    for (let j = 0; j < gridCount; j++) {
        // Test de couverture instantané : (grille & tirage) === grille
        if ((gridMasks[j] & maskDraw) === gridMasks[j]) {
            coveredCount++;
            break; // Ce tirage est couvert, passage au suivant
        }
    }
    maskDraw = nextCombination(maskDraw);
}

console.timeEnd("Évaluation des 30M de tirages");

// 4. Bilan
const coveragePct = ((coveredCount / TOTAL_DRAWS) * 100).toFixed(2);
console.log(`Tirages couverts à 6/12 : ${coveredCount.toLocaleString('fr-FR')} / ${TOTAL_DRAWS.toLocaleString('fr-FR')} (${coveragePct} %)`);




