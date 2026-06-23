import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--action-blue)] text-white rounded-[9999px] px-[22px] py-[11px] text-[17px] font-[400] hover:bg-[var(--action-blue-hover)]",
        primary:
          "bg-[var(--action-blue)] text-white rounded-[9999px] px-[22px] py-[11px] text-[17px] font-[400] hover:bg-[var(--action-blue-hover)]",
        destructive:
          "bg-red-600 text-white rounded-[8px] px-[15px] py-[8px] text-[14px] hover:bg-red-700",
        outline:
          "border border-[var(--hairline)] bg-[var(--canvas)] text-[var(--ink)] rounded-[8px] px-3 py-2 text-[14px] hover:bg-[var(--canvas-parchment)]",
        secondary:
          "bg-[var(--ink)] text-white rounded-[8px] px-[15px] py-[8px] text-[14px] font-[400] tracking-[-0.224px] hover:bg-[var(--ink)]/90",
        ghost:
          "bg-transparent text-[var(--ink)] rounded-[8px] px-3 py-2 text-[14px] hover:bg-[var(--canvas-parchment)]",
        link:
          "text-[var(--action-blue)] underline-offset-4 hover:underline bg-transparent p-0 text-[17px]",
        "secondary-pill":
          "bg-transparent text-[var(--action-blue)] rounded-[9999px] px-[22px] py-[11px] text-[17px] font-[400] border border-[var(--action-blue)] hover:bg-[var(--action-blue)]/5",
        "dark-utility":
          "bg-[var(--ink)] text-white rounded-[8px] px-[15px] py-[8px] text-[14px] font-[400] tracking-[-0.224px] hover:bg-[var(--ink)]/90",
        "pearl-capsule":
          "bg-[var(--surface-pearl)] text-[var(--ink-muted-80)] rounded-[11px] px-[14px] py-[8px] text-[14px] font-[400] border border-[var(--divider-soft)] hover:bg-[var(--canvas-parchment)]",
      },
      size: {
        default: "h-auto",
        sm: "text-[14px] px-[14px] py-[6px]",
        lg: "text-[18px] font-[300] px-[28px] py-[14px] rounded-[9999px]",
        icon: "h-10 w-10 rounded-[8px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
