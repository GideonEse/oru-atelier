import type { Motif, Tone } from "@/lib/shop";
import { cn } from "@/lib/cn";

export function ProductMark({
  tone,
  motif,
  name,
  className,
}: {
  tone: Tone;
  motif: Motif;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn("mark", `mark-${motif}`, className)}
      data-tone={tone}
      role="img"
      aria-label={name}
    />
  );
}
