---
name: python-uv
description: Nudge to prefer `uv` over `python` directly when using pip, venv, or running Python scripts.
---

# Python Environment Skill

This skill optimizes Python development by prioritizing `uv` as the Python interface when available.

## Availability

Before any Python operation, check if `uv` is available: `uv --version`

## Workflow

1. Use `uv` if available
2. Fall back to `python` directly - only if `uv` is not installed
