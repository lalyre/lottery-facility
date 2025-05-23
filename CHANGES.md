Roadmap
=======
* filter CLI enhancement with calculation of common neighbor count/neighborhood overlap/Jaccard similarity coefficient/Jaccard index.
* in Web application, allow user to store lists of following draws patterns to be detected and notified about after getting the latest draws.
* draws pattern detection on sequence of following draws, observing a set of balls.
* average failure (earnigs consideration) period of a game (lottery grid system), in number of following draws
* maximum failure (earnigs consideration) period of a game (lottery grid system), in number of following draws
* minimum failure (earnigs consideration) period of a game (lottery grid system), in number of following draws
* current failure (earnigs consideration) period of a game (lottery grid system), in number of following draws
* adding ConnectionsRegistry class for stacking combinations collisions information rather than combinations themselves, and capable of answering collisions requests quickly (inspired by neural networks).
* add Web features to the library.
* implement all CLI features in a Web application.
* draws statistics.
* draws prediction algorithms.
* enhance library by incorporating CLI features.
* paste CLI utility.
* cut CLI utility.
* join CLI utility.
* for filter CLI utility, add feature for saving the final selection of combinations.
* manage all history databases of Euromillions draws for euromillions.
* manage all history databases of Keno draws for kenoFR.
* manage all history databases of Lottery draws in JSON format.
* combination CLI enhancement with starting combination and/or ending combination.
* filter CLI enhancement with "_selection" mode, adding a sub-combination of the tested combination rather than the tested combination itself as it contains too much connections regarding to the requested constraints.
* filter CLI enhancement, adding a selection based on line numbers given in a list.
* filter CLI enhancement, specify a dispersion parameter.
* complete refactoring of filter CLI utility for a more clean and more simple code.
* enhancement of combination CLI utility, specify a max_gap/min_gap parameter.
* enhancement of combination CLI utility, specify a base to prefix on output combinations.
* enhancement of flash CLI utility, specify a max_gap/min_gap parameter.
* write a transposition CLI tool that rewrite data lines to columns.


2025-xx-xx, Version 0.0.1-alpha.10
==================================
* Adding length filter, collision filter and scorage filter in the API.
* Adding filters pipeline in the API.
* Adding cartesian_product CLI utility.
* Adding complement CLI utility.
* Documentation update.


2023-04-21, Version 0.0.1-alpha.9
=================================
* Enhancement of filter CLI utility, add a "selectionSkip" feature for skipping x tested combinations that was able to be selected.
* Enhancement of filter CLI utility, add a "coverlines" feature for displaying filter's matching lines as one big combination of line numbers.
* Enhancement of filter CLI utility, load a pre-selection file of combinations.
* Enhancement of filter CLI utility, add a feature for adding a slice of tested combinations.
* Enhancement of filter CLI utility, enable calculation of lottery winnings, and filtering on the amount of winnings.
* Enhancement of filter CLI utility, selection mode based on count of passed/failed filters, selection on scoring of filters, printing scores.
* Enhancement of combination CLI utility, multiple files output.
* Enhancement of flash CLI utility, multiple files output.
* Adding difference CLI utility.
* Removal of 99 balls limitation in DrawBox class.
* Adding CombinationHelper class.
* Package fix.
* Documentation update.


2022-03-14, Version 0.0.1-alpha.8
=================================
* Documentation update.


2021-11-16, Version 0.0.1-alpha.7
=================================
* Package fix.
* Fixing compilation issue.


2021-11-16, Version 0.0.1-alpha.6
=================================
* Package fix.
* Documentation update.
* Adding Random class.
* Adding DrawBox class.


2021-10-23, Version 0.0.1-alpha.5
=================================
* Package fix.
* Adding combination CLI utility.
* Adding filter CLI utility.


2021-10-21, Version 0.0.1-alpha.4
=================================
* Adding translate CLI utility.
* Adding euromillions_draws CLI utility.
* Adding kenoFR_draws CLI utility.


2021-09-12, Version 0.0.1-alpha.3
=================================
* Adding flash CLI utility.


2021-08-28, Version 0.0.1-alpha.2
=================================
* Compilation of both nodeJS and Web versions of the library.


2021-03-04, Version 0.0.1-alpha.1
=================================
* Writing a quick start documentation.


2021-02-16, Version 0.0.1-alpha.0
=================================
* Publication on NPM registry, thus taking the NPM package name.


2021-02-11, Version 0.0.0
=========================
* Project creation.
