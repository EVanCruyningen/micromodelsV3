---
title: "RAG is mostly a retrieval problem: a year-end retrospective"
date: 2025-12-28
sourceUrl: https://www.anthropic.com/news/rag-retrospective
sourceLabel: anthropic.com/news/rag-retrospective
tags: [retrieval, evals]
---

This industry post-mortem argues that most RAG failures trace to retrieval quality, not generation. The authors analyzed hundreds of RAG pipeline logs across production deployments and found that when the system produced a bad answer, the root cause was almost always in the retrieval step — missing documents, low-ranked relevant passages, or context windows cluttered with noise.

The concrete benchmarks are instructive. They propose a retrieval-centric evaluation framework that decouples retriever performance from generator performance, making it possible to pinpoint which component needs improvement. This is obvious in retrospect but rarely done in practice.

The practical recommendations: invest in chunking strategy, metadata filtering, and hybrid search before worrying about prompt engineering or fine-tuning the generator. Most teams over-optimize the generation side because it's more visible, while leaving obvious retrieval gaps unaddressed.

This resonates with my experience. I've seen teams spend weeks tuning system prompts for a RAG pipeline that was fundamentally limited by embedding quality and chunk boundary choices. Measure retrieval first.
