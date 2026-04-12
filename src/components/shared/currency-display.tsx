import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
}

export function CurrencyDisplay({
  amount,
  className,
  showSign = false,
}: CurrencyDisplayProps) {
  const isPositive = amount >= 0;
  const sign = showSign ? (isPositive ? "+" : "") : "";

  return (
    <span
      className={cn(
        "font-mono text-sm",
        showSign && isPositive && "text-emerald-400",
        showSign && !isPositive && "text-red-400",
        !showSign && "text-amber-300",
        className
      )}
    >
      {sign}{formatCurrency(amount)}
    </span>
  );
}
