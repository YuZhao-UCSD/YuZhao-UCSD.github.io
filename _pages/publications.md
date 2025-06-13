---
layout: archive
title: "Research"
permalink: /publications/
author_profile: true
---

### Peak height distribution of non-stationary Gaussian random fields
- Derive the explicit peak height distribution of smooth, non-stationary Gaussian processes in 1D with general covariance.
- Explore statistical properties of scale space fields, which play an important role in peak detection by helping to handle peaks of different spatial extents.
- Propose two efficient <a href="https://github.com/YuZhao-UCSD/NonstationaryGRF" style="color: black; text-decoration: underline; text-decoration-style: dotted;">numerical algorithms</a> as a general solution for computing the peak height distribution of smooth multidimensional Gaussian random fields in applications.

<img src="/images/grf_nonstationary.png" style="width: 40%; margin: auto; display: block;">

### <a href="https://www.sciencedirect.com/science/article/abs/pii/S0047259X24000538" style="color: black; text-decoration: underline; text-decoration-style: dotted;">An approximation to peak detection power using Gaussian random field theory</a>
- Provide new insights into random field theory (RFT) based power approximation formulas for peak detection.
- The approximation is based on the expected number of local maxima above the threshold $u$, $\text{E}[M_u]$, and proved to work well under three asymptotic scenarios: small domain, large threshold, and sharp signal.
- Explicit formulas are derived when the noise is modeled by a smooth isotropic Gaussian random field and the mean function is rotationally symmetric.
- Validate the methodology through simulation in MATLAB, and applied to real fMRI data from Human Connectome Project (HCP).

<img src="/images/grf_peak.png" style="width: 40%; margin: auto; display: block;">

### The chronic progressive repeated measures (CPRM) model for longitudinal data
- Describe a parsimonious covariance structure for repeated measures analysis when the MMRM model with unstructured covariance fails to converge.
- Demonstrate with computer simulations that alternative parsimonious MMRM covariance structures perform poorly for chronic progressive conditions.
- Derive power calculation formulas for the CPRM model that have the advantage of being independent of the design of the pilot studies informing the power calculations.
- Implement the power formulas in R package <a href="https://cran.r-project.org/web/packages/longpower/index.html" style="color: black; text-decoration: underline; text-decoration-style: dotted;">longpower</a> and <a href="https://yuz867.shinyapps.io/LongitudinalPower/" style="color: black; text-decoration: underline; text-decoration-style: dotted;">R shiny app</a>.

Professor Steven Edland presented our work at <a href="https://ww2.amstat.org/meetings/jsm/2022/onlineprogram/AbstractDetails.cfm?abstractid=320330" style="color: black; text-decoration: underline; text-decoration-style: dotted;">JSM 2022</a>.

<img src="/images/CPRM.png" style="width: 40%; margin: auto; display: block;">

### <a href="https://pubmed.ncbi.nlm.nih.gov/33581000/" style="color: black; text-decoration: underline; text-decoration-style: dotted;">Power formulas for mixed effects models with random slope and intercept comparing rate of change across groups</a>
- Derive power formulas for longitudinal studies accommodating differences in length and interval between longitudinal observations, different allocation ratios, and different subject missing pattern across groups.
- Illustrate the formulas could be used to power future study with arbitrary design.
- Implement the power formulas in R package <a href="https://cran.r-project.org/web/packages/longpower/index.html" style="color: black; text-decoration: underline; text-decoration-style: dotted;">longpower</a> and <a href="https://yuz867.shinyapps.io/LongitudinalPower/" style="color: black; text-decoration: underline; text-decoration-style: dotted;">R shiny app</a>.

I had the opportunity to present this work in an oral presentation at <a href="https://ww2.amstat.org/meetings/jsm/2020/onlineprogram/AbstractDetails.cfm?abstractid=313862" style="color: black; text-decoration: underline; text-decoration-style: dotted;">JSM 2020</a>.

<img src="/images/Rshiny.png" style="width: 100%; margin: auto; display: block;">