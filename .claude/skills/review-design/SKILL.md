---
name: review-design
description: 섹션·컴포넌트 작업을 끝내기 전에 하드코딩·토큰·CDN·접근성·화면 대조를 검사해 PASS/FAIL을 낸다.
---

이 명령은 마지막 검증을 design-reviewer 서브 에이전트에 맡깁니다.

## 절차

1. 사용자에게 검사할 파일이나 섹션과, 대조할 기준 화면(있으면)을 확인합니다.
2. design-reviewer 서브 에이전트를 호출해 검사 대상을 전달합니다.
3. design-reviewer가 5가지 항목(하드코딩 0건·토큰 참조·CDN 화이트리스트·접근성·화면 대조)을 검사하고 최종 PASS 또는 FAIL을 내면, 그 결과를 사용자에게 그대로 전달합니다.
4. FAIL 항목이 있으면, design-reviewer가 보고한 파일·줄 번호와 수정 방향을 사용자에게 전달합니다. 실제 수정은 이 명령이 하지 않고, figma-implementer·section-builder·token-guardian 가운데 알맞은 에이전트에 맡기도록 안내합니다.
5. PASS·FAIL 결과와 무관하게 매번 `docs/design-reviews/`에 보고서 파일을 저장합니다. 이 폴더가 없으면 새로 만듭니다.
   - 파일명: `{YYYY-MM-DD}-{검사-대상-slug}.md` (kebab-case, `docs/file-naming-rules.md` 규칙을 따름). 같은 날 같은 대상을 다시 검사하면 파일을 덮어씁니다.
   - 내용: 검사 대상, 대조 기준 화면(있으면), 5개 항목별 PASS/FAIL과 근거, 최종 판정을 그대로 옮겨 적습니다.

## 주의

- design-reviewer는 코드를 고치지 않습니다. 판정과 수정 방향 보고까지만 합니다.
- 작업을 끝내기 전 마지막 관문으로 이 명령을 부릅니다. PASS가 나와야 그 섹션·컴포넌트를 완료로 봅니다.
- 보고서 저장 위치는 `docs/design-reviews/`로 고정합니다. 다른 위치(루트, `_archive/` 등)에 저장하지 않습니다.
