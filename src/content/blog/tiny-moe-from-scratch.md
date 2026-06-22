---
title: "Notes on building a small mixture-of-experts from scratch"
date: 2026-01-20
description: "A walkthrough of training a tiny MoE on a single GPU: routing collapse, load-balancing losses, and what the literature glosses over."
tags: [architecture, training, small-models]
series: small-models
relatedNews: [scaling-laws-revisited]
---

Most MoE write-ups assume you're training at scale. The interesting problems — routing collapse, expert specialization, load balancing under capacity constraints — show up just as clearly at small scale, where you can actually run the experiments in an afternoon. This post walks through building a tiny MoE (8 experts, top-2 routing) on a single GPU, with notes on what the literature glosses over.

## Architecture setup

The setup is straightforward: a transformer with 8 feed-forward experts, a learned router that selects the top-2 experts per token, and a gating mechanism that combines expert outputs. The total parameter count is roughly equivalent to a 2x dense model of the same hidden dimension, but only a fraction of the parameters are active for any given forward pass.

The router is the most interesting piece. It's a small linear layer that projects the token embedding to an 8-dimensional logit vector, followed by a softmax to produce routing weights. During top-2 routing, we select the two experts with the highest routing weights and compute the output as a weighted sum of their contributions.

## Routing collapse

The first thing you'll hit is routing collapse, where the router learns to send all tokens to the same 1-2 experts while the others atrophy. This happens because the router and the experts are optimized jointly — the router gets positive feedback for sending tokens to experts that are already well-trained, creating a snowball effect.

The literature recommends load-balancing losses as the remedy. The standard approach adds an auxiliary loss that penalizes imbalanced routing by measuring the coefficient of variation of expert utilization across a batch. In practice, I found this needs careful tuning: too weak and collapse still happens, too strong and the router becomes essentially random, defeating the purpose of having specialized experts.

I ended up using a variant of the Switch Transformer's load-balancing loss with a temperature parameter that anneals over training. This lets the router specialize early while preventing collapse as training progresses.

## Expert specialization

With routing collapse under control, the next phenomenon is expert specialization. Different experts do learn different functions, but not always in the way you'd expect. In my experiments, experts tended to specialize along token-frequency lines rather than semantic categories — one expert handles rare tokens, another handles common tokens, and a third acts as a general-purpose fallback.

This is consistent with what larger MoE papers have observed, but it's much easier to verify at small scale. I added logging for per-expert token assignments and found that the specialization patterns emerge within the first few hundred training steps and remain largely stable afterward.

The practical implication is that capacity planning for experts matters. If one expert handles 40% of tokens and another handles 5%, the underutilized expert is essentially wasted capacity. The load-balancing loss helps, but it can only do so much without degrading overall model performance.

## What the literature glosses over

Three things stood out that papers tend to hand-wave:

First, **batch construction matters a lot**. Because different tokens route to different experts, the effective batch size per expert varies dynamically. Padding or dropping tokens at expert boundaries creates training instability that's rarely discussed.

Second, **expert dropout interacts badly with routing**. If you drop out an expert's weights during training, the router suddenly needs to redistribute those tokens, creating a sharp gradient signal that can destabilize the router. Expert dropout needs careful scheduling.

Third, **evaluation requires dense baselines**. It's easy to claim MoE wins when comparing to a poorly-tuned dense model. A proper comparison needs a dense baseline trained with the same compute budget, not the same parameter count.

## Results

On a small language modeling benchmark (50M tokens, 8-layer transformer, 8 experts), the MoE variant achieved 15% lower perplexity than the equivalent dense model at the same FLOP budget. The gain comes almost entirely from the increased parameter count — more total knowledge stored across experts — while maintaining similar inference throughput.

The code is straightforward enough to run on a single RTX 3090 in under an hour. If you haven't played with MoE training before, I'd recommend starting here rather than jumping straight to a large-scale implementation. The failure modes are the same, but the iteration speed is orders of magnitude faster.
