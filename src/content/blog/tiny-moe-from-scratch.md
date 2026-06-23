---
title: "Project MiniThink: An Idea"
date: 2026-06-22
description: "My ideas on what could be the future of distributed LLMs."
tags: [architecture, training, small-models]
series: small-models
relatedNews: [scaling-laws-revisited]
---

# Introduction
I strongly believe the future of LLMs will be small, distributed edge LLMs, runnable on a desktop, laptop, or even a phone. The VibeThinker-3B model showed, although not externally verified, that a small model can reason further than the model size would lead you to believe. It had it's limitations in terms of knowledge, but that can be changed with agentic patterns like bash and web searches. I want you to think about a future where you have an army of 1B param models, each specialized to a specific task, running locally, solving your problems for you.

# The Idea
Currently, I am hardware limited by my laptop and it's poor GPU, so these goals are long down the road.
1. Replicate the results of VibeThinker-3B with agentic tool use as part of it's training data.
2. See how small we can get similar levels of reasoning. Can we go all the way down to 500M params?
3. Implement and test different Key-Value cache compression mechanisms.
4. Train a DFlash model on the reasoning traces of MiniThink, letting it run at extreme speeds with deep reasoning.
5. See how far I can get local reasoning to advance when given access to an agentic system.