interface LastUpdatedProps {
  date: string;
  label?: string;
}

export function LastUpdated({
  date,
  label = "Page structure last updated",
}: LastUpdatedProps) {
  return (
    <p className="font-mono text-xs text-charcoal/40 mt-12 pt-6 border-t border-border">
      {label}: {date}
    </p>
  );
}
