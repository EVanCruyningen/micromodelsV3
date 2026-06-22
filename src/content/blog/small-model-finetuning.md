---
title: "A practitioner's guide to small-model fine-tuning"
date: 2025-12-30
description: "LoRA, QLoRA, DoRA — what actually matters when you're fine-tuning a 7B model on a single consumer GPU. Plus the gotchas nobody mentions."
tags: [fine-tuning, small-models]
series: small-models
---

Fine-tuning large language models on consumer hardware has become feasible thanks to parameter-efficient fine-tuning (PEFT) methods. But the gap between "it runs" and "it works well" is wide. This post covers what I've learned from dozens of fine-tuning runs on a single RTX 3090, focusing on practical choices that actually matter for downstream task performance.

## LoRA basics

Low-Rank Adaptation (LoRA) freezes the base model weights and injects trainable rank-decomposition matrices into attention layers. For a 7B model, this reduces the trainable parameter count from 7B to roughly 0.1-1% of that, depending on rank and target modules.

The standard recommendation is rank r=8 or r=16, targeting the Q and V projection matrices. In my experience, r=16 consistently outperforms r=8 for instruction-following tasks, while r=32 provides diminishing returns that rarely justify the extra memory. For domain adaptation (code, medicine, law), I've found that targeting all attention projections (Q, K, V, O) with r=8 works better than targeting just QV with r=32.

## QLoRA: the memory trade-off

QLoRA quantizes the base model to 4-bit (using NormalFloat4) while keeping LoRA adapters in full precision. This drops memory usage for a 7B model from ~14GB to ~6GB, making it feasible to fine-tune on 8-10GB GPUs.

The trade-off is training stability. The 4-bit base model introduces quantization noise that propagates through the LoRA updates. In practice, this means you need a lower learning rate (1e-4 vs 2e-4 for full-precision LoRA) and may need to double the number of training steps to reach the same loss.

The gotcha: QLoRA evaluation is deceptively noisy. The quantization noise during training means the loss curve is bumpier than full-precision training. I've seen runs where the loss appeared to plateau, but switching to full-precision inference (loading the base model in 16-bit) revealed significant quality improvements from continued training. Don't trust a QLoRA loss curve — periodically evaluate with full precision.

## DoRA and other variants

Weight-Decomposed Low-Rank Adaptation (DoRA) decomposes pre-trained weights into magnitude and direction components, applying LoRA only to the direction. This is theoretically appealing because it separates the learning of feature magnitude from feature direction.

In my benchmarks across three task categories (instruction tuning, classification, and code generation), DoRA matched or slightly outperformed LoRA in all cases, with no additional inference cost. The training cost is marginally higher (about 10% more FLOPs), but the convergence is faster in terms of steps to target loss. I'd recommend DoRA over LoRA as a default, with the caveat that the ecosystem support is still catching up.

## Learning rate is the most important hyperparameter

After dozens of runs, the single most impactful hyperparameter is the learning rate, and the optimal value varies more than most guides suggest. For LoRA on a 7B model:

- Too high (5e-4+): The adapter overfits to the training set within a few hundred steps, and the base model's capabilities degrade (catastrophic forgetting).
- Too low (5e-5-): Training is stable but painfully slow, and the adapter may never deviate enough from the base model to learn the target task.
- Sweet spot: 1e-4 to 2e-4, but this depends on rank, target modules, and dataset size.

My protocol: start with a cosine annealing schedule peaking at 2e-4, run for 500 steps, and check the loss. If it's still dropping steeply, let it continue. If it's plateaued above your target, try 3e-4. If loss is oscillating, drop to 1e-4.

## The gotchas nobody mentions

**Dataset formatting matters more than architecture.** I've seen a 50% performance difference between two identical LoRA runs with different prompt templates. Use the exact template the base model was instruction-tuned with. For Llama-derived models, this means the chat template from tokenizer.apply_chat_template().

**Multi-epoch training degrades rapidly.** Unlike full fine-tuning where multiple epochs can help, LoRA adapters overfit severely after one epoch. I've never seen improvement past 1.5 epochs, and degradation is common after epoch 2.

**Merge adapter weights before evaluation.** Some evaluation frameworks support loading adapters on the fly, but I've observed subtle inconsistencies between adapter-mode evaluation and merged-weight evaluation due to how quantization and batched inference interact. Always merge and save a full-precision checkpoint for final evaluation.

**Watch the embedding layer.** When you tune on a domain with specialized vocabulary, the input embeddings need updating too. LoRA doesn't touch embeddings by default, which means the model may fail to represent domain-specific tokens even if the attention layers have adapted. Add embedding LoRA modules for domain adaptation tasks.

## Practical recipe

Here's what I'd recommend as a starting point for any 7B fine-tuning project:

1. Use DoRA with rank 16 on all attention projections
2. Learning rate: 2e-4 with cosine schedule, 10% warmup
3. Batch size: as large as memory allows (gradient accumulation to 64 total)
4. Precision: bfloat16 if available, else float16
5. Max sequence length: as long as your task requires, but no longer
6. Train for exactly 1 epoch
7. Merge weights and evaluate in full precision

This won't be optimal for every task, but it will be within 10% of optimal with minimal tuning effort. That's usually good enough to decide whether fine-tuning is the right approach before investing in extensive hyperparameter optimization.
