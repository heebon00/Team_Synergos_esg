---
name: implement
description: Step 3 of the design system workflow. Apply precise HTML/CSS changes using only tokens without raw values.
---

# Implement Skill (Surgical Changes)

This skill controls how modifications are written to code. It ensures 100% compliance with token usage.

## Procedures

1. **Strict Token Reference**: Do NOT write any raw hex codes, px, rgb, or arbitrary Tailwind brackets `[...]`.
2. **Anchor Commenting**: When modifying components, target the exact range marked by `<!-- SEGMENT: [Name] -->` and `<!-- /SEGMENT: [Name] -->` comments.
3. **Use Tailwind v4 Directives**: Apply `@theme` mapped classnames like `text-ink-2`, `bg-bg-light`, etc.
