import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[9999px] px-[10px] py-[3px] text-[12px] font-[500] tracking-[-0.12px] leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--action-blue)] text-white",
        secondary: "bg-[var(--ink)] text-white",
        success: "bg-[#e8f5e9] text-[#2e7d32]",
        warning: "bg-[#fff8e1] text-[#f57f17]",
        destructive: "bg-[#ffebee] text-[#c62828]",
        outline: "border border-[var(--hairline)] text-[var(--ink-muted-48)]",
        neutral: "bg-[var(--canvas-parchment)] text-[var(--ink-muted-80)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
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
