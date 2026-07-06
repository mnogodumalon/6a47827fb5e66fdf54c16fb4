import { useState } from 'react';
import { IconLink, IconCheck } from '@tabler/icons-react';

interface ShareFormLinkProps {
  appId: string;
  label?: string;
  prefill?: Record<string, string>;
  variant?: 'button' | 'icon' | 'inline';
  className?: string;
}

export function ShareFormLink({ appId, label, prefill, variant = 'button', className = '' }: ShareFormLinkProps) {
  const [copied, setCopied] = useState(false);

  function buildUrl() {
    const base = `${window.location.origin}${window.location.pathname}#/public/${appId}`;
    if (prefill && Object.keys(prefill).length > 0) {
      const params = new URLSearchParams(prefill).toString();
      return `${base}?${params}`;
    }
    return base;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = buildUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} ${className}`}
        title={copied ? 'Link kopiert!' : (label ?? 'Link teilen')}
      >
        {copied ? <IconCheck size={16} /> : <IconLink size={16} />}
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 text-sm text-primary hover:underline ${className}`}
      >
        {copied ? <IconCheck size={14} /> : <IconLink size={14} />}
        {copied ? 'Link kopiert!' : (label ?? 'Link teilen')}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent transition-colors ${className}`}
    >
      {copied ? <IconCheck size={16} className="text-primary" /> : <IconLink size={16} />}
      {copied ? 'Link kopiert!' : (label ?? 'Link teilen')}
    </button>
  );
}
