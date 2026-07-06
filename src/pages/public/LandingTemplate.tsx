/**
 * LandingTemplate.tsx — REFERENCE SKELETON FOR AGENT-BUILT LANDING PAGES.
 *
 * Do NOT route this file. It exists so Claude can clone it into
 *   src/pages/public/Landing_<Slug>.tsx
 * and adapt the content to the user's prompt (plus optional image / Figma
 * context from _agent_context/).
 *
 * Rules the agent must follow when cloning:
 *   1. The form's `fields` set MUST be a subset of the app's `allowed_fields`
 *      from _agent_context/public_forms.json. Otherwise the form-proxy strips
 *      them silently on submit.
 *   2. Keep the ALTCHA widget — it's the spam gate. Do not remove, disable,
 *      or work around it.
 *   3. The POST URL pattern is fixed by the form-proxy contract:
 *      ${PROXY_BASE}/api/rest/apps/${APP_ID}/records
 *   4. Add imports via the <public:imports> marker in App.tsx and
 *      routes via <public:routes>. Never touch <custom:*> markers.
 *   5. Route path convention: `public/p/<slug>` (lowercase, hyphenated).
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── WIRING — agent must keep these three constants in sync with the target form-config ───
// Matches settings.PROXY_BASE_URL; empty string → relative URL against the deploy host.
const PROXY_BASE = '';
// Replace with the app_id the landing page submits to. Must have an active
// form-proxy hole with compatible allowed_fields.
const APP_ID = '6a4782736e67a998c8af44c7';
const SUBMIT_PATH = `/rest/apps/${APP_ID}/records`;
const ALTCHA_SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/altcha/dist/altcha.min.js';

async function submit(fields: Record<string, unknown>, captchaToken: string) {
  const res = await fetch(`${PROXY_BASE}/api${SUBMIT_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Captcha-Token': captchaToken,
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Submission failed');
  }
  return res.json();
}

export default function LandingTemplate() {
  const [fields, setFields] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (document.querySelector(`script[src="${ALTCHA_SCRIPT_SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = ALTCHA_SCRIPT_SRC;
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  function readCaptchaToken(): string | null {
    const el = captchaRef.current as any;
    if (!el) return null;
    return el.value || el.getAttribute('value') || null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = readCaptchaToken();
    if (!token) {
      setError('Bitte warte auf die Spam-Prüfung und versuche es erneut.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submit(fields, token);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-bold">Vielen Dank!</h2>
          <p className="text-muted-foreground">Wir haben deine Eingabe erhalten.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── HERO — agent rewrites headline, subtitle, colors, optional image ─── */}
      <section className="px-6 py-20 md:py-32 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Dein Landing-Page-Titel
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Untertitel oder Einleitung, die den Besucher abholt.
        </p>
      </section>

      {/* ─── FORM — fields must be ⊆ allowed_fields of the target app ─── */}
      <section className="px-6 pb-20">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5 bg-card rounded-xl border border-border p-6 shadow-md">
          <div className="space-y-2">
            <Label htmlFor="example_field">Beispiel-Feld *</Label>
            <Input
              id="example_field"
              required
              value={fields.example_field || ''}
              onChange={(e) => setFields({ ...fields, example_field: e.target.value })}
            />
          </div>

          <altcha-widget
            ref={captchaRef as any}
            challengeurl={`${PROXY_BASE}/api/_challenge?path=${encodeURIComponent(SUBMIT_PATH)}`}
            auto="onsubmit"
            hidefooter
          />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Wird gesendet...' : 'Absenden'}
          </Button>
        </form>
      </section>

      {/* ─── FOOTER — optional, agent may replace or remove ─── */}
      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        Powered by Klar
      </footer>
    </div>
  );
}
