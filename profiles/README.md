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
| [loto.json](loto.json) | Mise de 2,20 EUR, 5 numéros parmi 49, Chance ignorée ; barème de compromis |
| [euromillions.json](euromillions.json) | Mise de 2,50 EUR, 5 numéros parmi 50, étoiles ignorées ; barème de compromis |

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

Pour Loto et EuroMillions, le modèle `fixed_simulation` retient uniquement les
5 numéros principaux. Une cible est une ligne de 5 numéros distincts, sans Chance
ni étoiles. Les barèmes convenus pour 0 à 5 bons numéros sont respectivement
`[0, 0, 3, 10, 200, 20000]` et `[0, 0, 2, 5, 25, 10000]` EUR.
Ces hypothèses ne sont ni des minima garantis ni des minima historiques vérifiés.
Le prix complet de la grille est conservé ; les gains liés à la Chance, aux étoiles,
aux codes et aux options sont exclus du calcul. Les gains réels restent variables.

```sh
node bin/target-recovery.mjs --profile profiles/loto.json --ticket-size 5 --tickets 10 --target 15 --draws 2000
node bin/target-recovery.mjs --profile profiles/euromillions.json --ticket-size 5 --tickets 10 --target 15 --draws 2000
```
