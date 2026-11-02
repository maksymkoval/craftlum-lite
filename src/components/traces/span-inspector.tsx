"use client";

import { useState } from "react";
import { CheckIcon, CircleXIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { formatDuration, formatInteger } from "@/lib/format";
import { getModel } from "@/lib/mock/models";
import { SPAN_KINDS, type Span } from "@/lib/mock/spans";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? <CheckIcon className="text-status-good-text" /> : <CopyIcon />}
    </Button>
  );
};

const Payload = ({ title, text }: { title: string; text: string }) => (
  <section>
    <div className="flex items-center justify-between">
      <h3 className="text-[13px] font-medium">{title}</h3>
      <CopyButton text={text} />
    </div>
    <pre className="mt-1 max-h-64 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {text}
    </pre>
  </section>
);

const Fact = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <dt className="text-[13px] text-muted-foreground">{label}</dt>
    <dd className={mono ? "font-mono text-xs" : "text-[13px] tabular-nums"}>{value}</dd>
  </div>
);

export const SpanInspector = ({ span }: { span: Span }) => {
  const kind = SPAN_KINDS[span.kind];

  return (
    <Panel className="flex flex-col gap-4 p-4" aria-label={`Span ${span.name}`}>
      <header>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-[3px]" style={{ background: kind.colorVar }} aria-hidden="true" />
          {kind.label}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight break-words">{span.name}</h2>
      </header>

      {span.error ? (
        <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px]">
          <CircleXIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-medium text-destructive">Failed</p>
            <p className="mt-0.5">{span.error}</p>
          </div>
        </div>
      ) : null}

      <dl className="divide-y border-y">
        <Fact label="Duration" value={formatDuration(span.duration)} />
        <Fact label="Starts at" value={`+${formatDuration(span.start)}`} />
        {span.model ? <Fact label="Model" value={getModel(span.model).name} mono /> : null}
        {span.tokens ? <Fact label="Tokens" value={formatInteger(span.tokens)} /> : null}
        <Fact label="Span ID" value={span.id} mono />
      </dl>

      {span.input ? <Payload title="Input" text={span.input} /> : null}
      {span.output ? <Payload title="Output" text={span.output} /> : null}
      {!span.output && !span.error ? (
        <p className="text-[13px] text-muted-foreground">This span recorded no output.</p>
      ) : null}
    </Panel>
  );
};
