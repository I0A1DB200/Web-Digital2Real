# EE-0009 — HMI Incorrect Machine State

Canonical Contract 2.0.0 Experience for distinguishing a correct physical and PLC state from an incorrect HMI representation. The TP700 Comfort remains connected; `BoxAtStop_HMI` initially points to `DB_HMI.BoxAtStop_2` at `%DB10.DBX1.1` instead of `DB_HMI.BoxAtStop` at `%DB10.DBX0.0`.

`experience.yaml` owns the authoring and private diagnostic truth. `locales/` owns ES/EN learner text. `assets/` contains the six approved frozen PNGs. `media-source/` records provenance and is not packaged.
