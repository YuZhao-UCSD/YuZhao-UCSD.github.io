---
layout: archive
title: "Research"
permalink: /publications/
author_profile: true
---


### [An approximation to peak detection power using Gaussian random field theory](https://arxiv.org/abs/2301.04830)
- Provide new insights into random field theory (RFT) based power approximation formulas for peak detection.
- The approximation is based on the expected number of local maxima above the threshold $u$, $\text{E}[M_u]$, and proved to work well under three asymptotic scenarios: small domain, large threshold, and sharp signal.
- Explicit formulas are derived when the noise is modeled by a smooth isotropic Gaussian random field and the mean function is rotationally symmetric.
- Validate the methodology through simulation in MATLAB, and applied to real fMRI data from Human Connectome Project (HCP).

### The chronic progressive repeated measures (CPRM) model for longitudinal data
- Describe a parsimonious covariance structure for repeated measures analysis when the MMRM model with unstructured covariance fails to converge.
- Demonstrate with computer simulations that alternative parsimonious MMRM covariance structures perform poorly for chronic progressive conditions.
- Derive power calculation formulas for the CPRM model that have the advantage of being independent of the design of the pilot studies informing the power calculations.
- Implement the power formulas in R package [longpower](https://cran.r-project.org/web/packages/longpower/index.html) and [R shiny app](https://yuz867.shinyapps.io/LongitudinalPower/).

[Professor Steven Edland](https://profiles.ucsd.edu/steven.edland) presented our work at [JSM 2022](https://ww2.amstat.org/meetings/jsm/2022/onlineprogram/AbstractDetails.cfm?abstractid=320330).

### [Power formulas for mixed effects models with random slope and intercept comparing rate of change across groups](https://pubmed.ncbi.nlm.nih.gov/33581000/)
- Derive power formulas for longitudinal studies accommodating differences in length and interval between longitudinal observations, different allocation ratios, and different subject missing pattern across groups.
- Illustrate the formulas could be used to power future study with arbitrary design.
- Implement the power formulas in R package [longpower](https://cran.r-project.org/web/packages/longpower/index.html) and [R shiny app](https://yuz867.shinyapps.io/LongitudinalPower/).

I had the opportunity to present this work in an oral presentation at [JSM 2020](https://ww2.amstat.org/meetings/jsm/2020/onlineprogram/AbstractDetails.cfm?abstractid=313862).