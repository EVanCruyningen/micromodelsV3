---
title: "Anthropic publishes a constitution for agentic assistants"
date: 2026-01-18
sourceUrl: https://www.anthropic.com/news/constitution
sourceLabel: anthropic.com/news/constitution
tags: [agents, safety]
---

Anthropic released a 14-page document outlining behavioral norms for long-horizon agents. The constitution covers when an agent should ask for clarification versus when it should act autonomously, how it should handle ambiguous instructions, and what kinds of refusal are appropriate in high-stakes contexts.

The document is structured as a set of principles rather than hard rules, which I think is the right call given how varied agent deployments are today. It covers delegation boundaries, escalation paths, and the tricky question of how much context an agent should retain across sessions.

What stands out is the emphasis on uncertainty communication. The constitution explicitly directs agents to signal confidence levels when the path forward isn't clear. This is a refreshing departure from the typical assistant paradigm where every answer is delivered with equal conviction.

If you build tool-using systems, this is worth reading even if you disagree with specific principles. Having any published framework to react against is better than designing in a vacuum.
