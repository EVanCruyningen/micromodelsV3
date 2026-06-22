---
title: "A survey of mechanistic interpretability at the 2025 frontier"
date: 2026-01-05
sourceUrl: https://arxiv.org/abs/2601.00042
sourceLabel: arxiv.org/abs/2601.00042
tags: [interpretability, survey]
---

This 80-page survey covers the state of mechanistic interpretability across the largest open-weight models as of late 2025. It covers sparse autoencoders, attention-pattern probing, circuit-level analysis, and activation patching — with detailed comparisons of what works at scale versus what only works in toy settings.

The section on sparse autoencoders is particularly useful. It consolidates findings from several labs on how reconstruction fidelity scales with dictionary size, and where current approaches still fail (particularly on rare features and compositional behaviors). The authors don't shy away from the limitations.

The survey also catalogs a shift in the field toward automated circuit discovery. Manual circuit analysis was the norm in 2023–2024, but the community is converging on tools that can propose and test mechanistic hypotheses with minimal human intervention. Whether these tools actually produce faithful explanations is still an open question.

Dense but well-organized. Each section has a concrete recommendations box for practitioners, which makes it more useful than most surveys in this space.
