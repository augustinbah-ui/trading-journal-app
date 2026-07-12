import { LucideIcon } from "lucide-react";
import clsx from "clsx";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-textSecondary">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-textSecondary" />}
      </div>
      <p
        className={clsx(
          "text-xl font-semibold",
          tone === "positive" && "text-profit",
          tone === "negative" && "text-loss",
          tone === "neutral" && "text-textPrimary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
