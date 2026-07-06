---
name: landing-pages
description: |
  Activate this skill when the user asks for a public landing page
  ("Landingpage", "Verteilseite", "Marketing-Seite", "public form page").
  Triggers include phrases like "mach/bau/erstelle eine Landing Page für X",
  "landing page fürs Kontaktformular", "bau mir eine öffentliche Seite",
  or when the user attaches a design mockup/screenshot/Figma image and
  asks to turn it into a page. Skip this skill for unrelated UI work.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Public Landing Pages

Build a standalone, unauthenticated page that submits through the existing
form-proxy. Cloned from a reference skeleton, wired via dedicated App.tsx
markers, reachable under `/#/public/p/<slug>` on the deployed dashboard.

## Where everything lives

```
/home/user/app/
├── _agent_context/
│   └── public_forms.json     ← READ FIRST. Lists every active form hole
│                                with its app_id, path, allowed_fields.
├── src/pages/public/
│   ├── LandingTemplate.tsx   ← Reference skeleton. Do NOT route. Clone it.
│   ├── PublicForm_*.tsx      ← Existing form pages. Do NOT touch.
│   └── Landing_<Slug>.tsx    ← Your new landing pages go here.
└── src/App.tsx                ← Add imports + routes via public: markers.
```

## Step-by-step

1. **Read `_agent_context/public_forms.json`.** It's the source of truth for
   which `app_id` accepts submissions and which `allowed_fields` the
   form-proxy lets through. The field set you render MUST be a subset of
   `allowed_fields` — anything else is silently stripped on submit.

2. **Pick a slug** from the user's prompt (lowercase, hyphenated, URL-safe).
   Examples: `kontakt`, `newsletter`, `event-2026-spring`.

3. **Clone the skeleton:** copy `src/pages/public/LandingTemplate.tsx` →
   `src/pages/public/Landing_<PascalSlug>.tsx`.

4. **Adapt the content:**
   - Replace `APP_ID` with the real app_id from `public_forms.json` matching
     the target app.
   - Add/remove form fields to match that app's `allowed_fields`. Use
     `<Label>`, `<Input>`, `<Textarea>`, `<Select>` from `@/components/ui/*`.
   - Rewrite the hero section (headline, subtitle, colors, layout) per the
     user's prompt.
   - If the user attached an image: treat it as the visual reference — match
     colors, typography, spacing, section order. Generated Tailwind classes
     should visually approximate the mockup.
   - Keep the ALTCHA widget exactly where it is. It's the spam gate. Don't
     remove, hide, or auto-solve it.
   - Keep the submit wiring (`submit()`, `PROXY_BASE`, `SUBMIT_PATH`,
     `X-Captcha-Token` header). Don't change the POST URL pattern.

5. **Wire it into `src/App.tsx`** via the public-namespace markers:
   - Inside `// <public:imports> … </public:imports>`:
     ```tsx
     import Landing<PascalSlug> from '@/pages/public/Landing_<PascalSlug>';
     ```
   - Inside `{/* <public:routes> */} … {/* </public:routes> */}`:
     ```tsx
     <Route path="public/p/<slug>" element={<Landing<PascalSlug> />} />
     ```
   - Never touch `<custom:imports>` or `<custom:routes>` — those are for
     unrelated customizations.

6. **Verify:** `npm run build` must pass. The page is reachable at
   `/#/public/p/<slug>`.

## Rules — do and don't

- DO keep the ALTCHA widget and captcha-token flow intact.
- DO respect `allowed_fields` from `_agent_context/public_forms.json`.
- DO use `@/components/ui/*` primitives, Tabler icons, Tailwind classes —
  same stack as the rest of the dashboard.
- DO NOT touch `LandingTemplate.tsx` (it stays as a reference).
- DO NOT touch `PublicForm_*.tsx` (generator-owned).
- DO NOT create a new app. Landing pages submit to **existing** apps.
- DO NOT hard-code secrets or headers beyond `X-Captcha-Token`.
- DO NOT change the POST URL pattern
  `${PROXY_BASE}/api/rest/apps/${APP_ID}/records`.
