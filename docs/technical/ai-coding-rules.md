# AI Coding Rules

Short checklist for AI-assisted refactors and new code in My Lane.

## Core Rules

- Preserve the existing architecture.
- Do not redesign the interface unless explicitly requested.
- Prefer reuse over new components.
- Keep page files focused on orchestration.
- Move shared logic out of screen files early.

## Component Rules

**`components/ui/` is reserved for kits used by 2+ pages. Nothing page-only belongs there.**

- If a page has many local subcomponents, split them into separate files under `frontend/src/pages/<page>/components/` — a sibling folder next to the page's own screen file, not a subfolder of `components/ui/`.
- `frontend/src/components/ui/` only holds kits that are genuinely shared across multiple pages: generic primitives (`button/`, `card/`, `layout/`, `grid/`, ungrouped atoms like `Avatar.tsx`, `BackButton.tsx`) and cross-page feature kits — e.g. `gameplay/` holds only the board components (`NumberBoard`, `AlphabetBoard`, `GridBoard`, `SequenceBoard`, `KeypadButton`) because both `pages/gameplay` and `pages/versus-gameplay` render them. Everything else specific to a single screen (headers, cards, rows, overlays, dev-only state pills, etc.) stays local to that page's `components/` folder even if it looks reusable in the abstract — don't promote it to `components/ui/` until a second page actually imports it.
- A component that starts in `pages/<page>/components/` and later gets reused by a second page should move into `components/ui/<kit>/` at that point, not before.
- Keep reusable atoms in `components/ui` only if they are truly shared and small.

## Types, Enums, API, Mock (Services Layer)

**Interfaces, mock data, and API helpers live in `frontend/src/services/<page>/`, mirrored by page name — never inside `pages/` and never inside `components/ui/`.**

- Put shared enum-like values in `frontend/src/configs/enum.ts`.
- Avoid many feature-local `enum.ts` files when the values are shared.
- Put feature-specific interfaces in `frontend/src/services/<page>/xxx.interface.ts`.
- Put API helpers in `frontend/src/services/<page>/xxx.api.ts`.
- Put mock data in `frontend/src/services/<page>/xxx.mock.ts` (or `.mock.tsx` if it embeds JSX, e.g. icon nodes in mock records).
- A page's components import from `@/services/<page>/...` (absolute alias), not a relative path, since `services/` is a sibling of `pages/`, not a child.
- Do not keep UI, API stubs, and mock data together in a dense page file.

## Screen Refactor Order

1. Extract repeated shell, header, and navigation patterns.
2. Extract repeated cards, rows, filters, and overlays.
3. Split dense page-local subcomponents into separate files.
4. Move shared types, enums, API helpers, and mock data out of the page.
5. Keep behavior and visuals unchanged unless a minimal fix is required.

## Placement Examples

```text
frontend/src/
  pages/
    <page>/
      <Page>Screen.tsx        # orchestrator: state, handlers, composition only
      components/             # page-only subcomponents (flat, no further nesting)
        SomeCard.tsx
        SomeRow.tsx
  services/
    <page>/                   # data layer, mirrored by page name
      <page>.interface.ts
      <page>.mock.ts
  components/ui/
    button/ card/ layout/ grid/   # generic cross-page primitives
    <feature>/                    # cross-page feature kit (only if 2+ pages import it)
```

- `enum` shared across screens: `frontend/src/configs/enum.ts`
- `interface` by feature: `frontend/src/services/<feature>/xxx.interface.ts`
- `api` by feature: `frontend/src/services/<feature>/xxx.api.ts`
- `mock` by feature: `frontend/src/services/<feature>/xxx.mock.ts`
- dense page subcomponents: `frontend/src/pages/<feature>/components/`
- a component used by 2+ pages: `frontend/src/components/ui/<kit>/`

## Do Not

- Do not create duplicate components with near-identical behavior.
- Do not keep many local components inside one page file when the page is already dense.
- Do not introduce new architecture, new libraries, or new visual language by default.
- Do not put a single-page component under `components/ui/<page-name>/` — that belongs in `pages/<page>/components/`.
- Do not put interface/mock/api files inside `pages/<page>/` — that belongs in `services/<page>/`.