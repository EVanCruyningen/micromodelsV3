---
title: "Why your eval set is lying to you (part 1)"
date: 2026-01-08
description: "Contamination, format leakage, and the quiet ways benchmark scores stop reflecting real-world capability. With a worked example."
tags: [evals, methodology]
---

If you've ever celebrated a benchmark improvement only to see no change in production behavior, you've experienced eval set rot. Benchmarks degrade as measures of capability over time — not because the questions change, but because the model's training data inevitably overlaps with them. This is the first in a series examining how eval sets lie to us and what to do about it.

## Contamination is everywhere

The open secret in ML is that benchmark contamination is pervasive and largely unmeasured. When a model trains on the open internet, and your eval questions were also posted on the open internet, there's direct overlap. Companies run decontamination pipelines, but these are leaky by design — near-duplicate questions, paraphrased answers, and conceptual contamination (where the model has seen similar problems even if not the exact question) all slip through.

A 2024 study found that even aggressive n-gram decontamination misses 30-60% of contaminated examples when measured by embedding similarity. The model doesn't need to have seen the exact text; having seen enough similar material allows it to pattern-match its way to the right answer without actually demonstrating the capability you're trying to measure.

## Format leakage

A subtler form of eval set degradation comes from format leakage. Multiple-choice benchmarks are particularly vulnerable. If the model has seen thousands of multiple-choice examples during training, it learns structural cues: the correct answer tends to be the longest option, or the one with the most specific language, or the one that avoids certain hedge words.

The model isn't answering the question — it's answering the format. And because these cues are statistically reliable on standard benchmarks, the model can achieve impressive scores without meaningful capability.

I tested this on a popular reasoning benchmark by replacing all answer options with random labels (A, B, C, D) and re-randomizing the correct answer position. A state-of-the-art model that scored 87% on the original benchmark dropped to 28% — barely above random chance. The model was exploiting format patterns, not reasoning.

## A worked example

Consider the question: "A train leaves Station A at 60 mph. Another train leaves Station B at 80 mph. If the stations are 300 miles apart, when do they meet?"

A model that genuinely understands relative motion can solve this regardless of framing. But a model that's memorized training examples might only succeed when the numbers and framing match what it's seen before. Change "train" to "car," change "mph" to "km/h," or change the distance, and the model that seemed to understand suddenly fails.

I constructed a minimal test: same underlying math, five different surface framings. The model got 4/5 on familiar framings but 0/3 on novel ones. The benchmark score implied 80% capability. The real capability was closer to 0% for anything outside the training distribution.

## What to do about it

First, **hold out a private eval set** that never touches the internet. This is the gold standard and surprisingly rare outside of competition settings.

Second, **continuously refresh your eval set**. Static benchmarks decay. Every quarter, retire the oldest examples and introduce new ones that test the same capabilities with different surface forms.

Third, **measure capability gradients**, not point scores. Instead of asking "does the model get this right?", ask "how does performance change as we vary irrelevant surface features?" A flat gradient (performance doesn't depend on surface form) is a good sign. A steep gradient suggests format exploitation.

Part 2 will cover label noise, annotator bias, and what happens when eval sets become training sets through iterative model releases.
