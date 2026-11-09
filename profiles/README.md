# Profils de gains

Ces fichiers préparent le chargement des barèmes par le futur `target-recovery.mjs`.
Ils ne sont pas encore consommés par les scripts existants : `target-covering.mjs`
optimise des correspondances et `crescendo-recovery.mjs` conserve sa configuration actuelle.

| Fichier | Modèle |
| --- | --- |
| [keno.json](keno.json) | Mise de 1 EUR, tailles de grille de 4 à 10, lots nominaux fixes, gain maximal en capital |
| [crescendo.json](crescendo.json) | Mise de 1 EUR, 10 numéros, gains sans lettre ; 10/10 valorisé à 1000 EUR pour la simulation |

Chaque profil indique l’univers, la taille du tirage, la mise par grille et les
tableaux `payoutsByTicketSize`. La clé est le nombre de numéros joués ; l’indice du
tableau est le nombre de bons numéros. Les montants sont des gains bruts en EUR,
sans soustraire la mise. Pour un tirage, on additionne les gains de toutes les grilles.
Ces profils décrivent une mise de 1 EUR ; aucune extrapolation à une autre mise
ne doit être appliquée implicitement.

Pour Crescendo, la valeur du 10/10 est une convention de modélisation, identique à
celle du moteur actuel, détaillée dans `jackpot`. Le tableau avec lettre est conservé
comme information distincte ; il ne se cumule pas avec le tableau sans lettre et
ne participe pas au modèle principal. La redistribution de 19 h n’est pas modélisée.

Les liens vers les règlements, leur date d’application et la date de vérification
sont enregistrés dans chaque fichier. Les exclusions de modèle y sont explicites.

Pour de futurs profils Loto ou EuroMillions, les gains variables devront être
décrits comme tels, avec des montants de simulation explicitement choisis et leur
provenance (par exemple des médianes historiques sur une période définie).
Une estimation historique ne constitue pas un lot garanti. Les rangs devront aussi
tenir compte du numéro Chance ou des étoiles ; un tableau indexé seulement par le
nombre de bons numéros serait insuffisant. Aucun montant indicatif n’est inventé ici.
