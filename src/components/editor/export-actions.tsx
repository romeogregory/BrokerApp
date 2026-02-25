"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportActionsProps {
  title: string;
  description: string;
  features: string[];
  propertyAddress: string;
  isPublished: boolean;
  onTogglePublish: () => void;
}

function formatAdvertText(
  title: string,
  description: string,
  features: string[],
  address: string
): string {
  const lines = [
    title,
    "",
    description,
    "",
    "Kenmerken:",
    ...features.map((f) => `  - ${f}`),
    "",
    `Adres: ${address}`,
  ];
  return lines.join("\n");
}

export function ExportActions({
  title,
  description,
  features,
  propertyAddress,
  isPublished,
  onTogglePublish,
}: ExportActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = formatAdvertText(title, description, features, propertyAddress);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    const text = formatAdvertText(title, description, features, propertyAddress);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `advertentie-${propertyAddress.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-[var(--space-2)]">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-[var(--space-2)]"
      >
        {copied ? (
          <Check className="size-3.5 text-[var(--success)]" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? "Gekopieerd!" : "Kopieer tekst"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-[var(--space-2)]"
      >
        <Download className="size-3.5" />
        Download
      </Button>

      <Button
        variant={isPublished ? "secondary" : "default"}
        size="sm"
        onClick={onTogglePublish}
        className={cn(
          "gap-[var(--space-2)]",
          isPublished && "text-[var(--success)]"
        )}
      >
        <Globe className="size-3.5" />
        {isPublished ? "Gepubliceerd" : "Markeer als gepubliceerd"}
      </Button>
    </div>
  );
}
