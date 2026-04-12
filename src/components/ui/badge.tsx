import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-cyan-800/50 bg-cyan-950/50 text-cyan-300",
        secondary:
          "border-slate-700/50 bg-slate-800/50 text-slate-300",
        success:
          "border-emerald-800/50 bg-emerald-950/50 text-emerald-300",
        warning:
          "border-amber-800/50 bg-amber-950/50 text-amber-300",
        destructive:
          "border-red-800/50 bg-red-950/50 text-red-300",
        outline: "border-slate-700 text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
