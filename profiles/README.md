# Profils de gains

Ces fichiers sont chargés par `target-recovery.mjs` via `--profile`.
`target-covering.mjs` optimise des correspondances et `crescendo-recovery.mjs`
conserve sa configuration actuelle.

| Fichier | Modèle |
| --- | --- |
| [keno.json](keno.json) | Mise de 1 EUR, tailles de grille de 4 à 10, lots nominaux fixes, gain maximal en capital |
| [crescendo.json](crescendo.json) | Mise de 1 EUR, 10 numéros, gains sans lettre ; 10/10 valorisé à 1000 EUR pour la simulation |
| [eurodreams.json](eurodreams.json) | Mise de 2,50 EUR, 6 numéros parmi 40, Dream ignoré ; barème conventionnel de simulation |
| [amigo.json](amigo.json) | Mise de 2 EUR, 7 numéros parmi 28, tirage de 12 numéros sans couleurs ; minimum nominal par nombre de bons numéros |

Chaque profil indique l’univers, la taille du tirage, la mise par grille et les
tableaux `payoutsByTicketSize`. La clé est le nombre de numéros joués ; l’indice du
tableau est le nombre de bons numéros. Les montants sont des gains bruts en EUR,
sans soustraire la mise. Pour un tirage, on additionne les gains de toutes les grilles.
La mise est propre à chaque profil ; aucune extrapolation à une autre mise
ne doit être appliquée implicitement.

Pour Crescendo, la valeur du 10/10 est une convention de modélisation, identique à
celle du moteur actuel, détaillée dans `jackpot`. Le tableau avec lettre est conservé
comme information distincte ; il ne se cumule pas avec le tableau sans lettre et
ne participe pas au modèle principal. La redistribution de 19 h n’est pas modélisée.

Pour EuroDreams, le modèle `fixed_simulation` utilise les gains bruts convenus :
0, 0, 2,50, 4, 20, 200 et 2000 EUR pour respectivement 0 à 6 bons numéros.
Ce ne sont pas des minima garantis ni des minima historiques vérifiés. Le 6/6
compte une seule mensualité nominale sans Dream, et non le total de la rente.
Les hypothèses sont détaillées dans `simulationAssumptions` et affichées dans
le périmètre du profil au lancement.

```sh
node bin/target-recovery.mjs --profile profiles/eurodreams.json --ticket-size 6 --tickets 10 --target 20 --draws 2000
```

Pour Amigo, les couleurs sont ignorées : chaque cible contient les 12 numéros
distincts du tirage sur une seule ligne. Le barème retenu pour 0 à 7 bons numéros
est `[0, 0, 0, 0, 2, 3, 15, 100]` EUR. Il correspond au minimum nominal selon
les couleurs, avant éventuel plafonnement collectif, hors animations commerciales.

```sh
node bin/target-recovery.mjs --profile profiles/amigo.json --ticket-size 7 --tickets 10 --target 16 --draws 2000
```

Les liens vers les règlements, leur date d’application et la date de vérification
sont enregistrés dans chaque fichier. Les exclusions de modèle y sont explicites.

Pour de futurs profils Loto ou EuroMillions, les gains variables devront être
décrits comme tels, avec des montants de simulation explicitement choisis et leur
provenance (par exemple des médianes historiques sur une période définie).
Une estimation historique ne constitue pas un lot garanti. Les rangs devront aussi
tenir compte du numéro Chance ou des étoiles ; un tableau indexé seulement par le
nombre de bons numéros serait insuffisant. Aucun montant indicatif n’est inventé ici.
