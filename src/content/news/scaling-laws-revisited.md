---
title: "Scaling laws revisited: a closer look at compute-optimal inference"
date: 2026-01-22
sourceUrl: https://arxiv.org/abs/2601.12345
sourceLabel: arxiv.org/abs/2601.12345
tags: [scaling-laws, inference]
---

The original Chinchilla scaling laws were derived in a regime where training compute dominated the cost of a model over its lifetime. That assumption no longer holds for most deployed systems. A new paper revisits the compute-optimal frontier under an inference-heavy workload model, where the breakeven point between training cost and serving cost shifts the optimal model size and training-token ratio substantially.

What I found interesting is the framing: rather than asking "what is the largest model I can train for a fixed budget?", the authors ask "given a target serving-traffic profile, what training recipe minimizes total cost?". The answer depends sharply on traffic shape — bursty vs. steady-state, peak vs. average — and on hardware amortization assumptions that are usually left implicit.

The practical takeaway is that the model's "compute-optimal" size is not a single number but a function of how you expect to serve it. For teams building products around a single model, this matters: the same training budget produces very different models depending on the deployment assumption.

I'm not entirely sold on the cost model — it assumes a particular hardware generation and a particular amortization schedule — but the framing is useful and the empirical fit is good. Worth a read if you're sizing a training run today.
