import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[44px] w-full rounded-[9999px] border border-[rgba(0,0,0,0.08)] bg-[var(--canvas)] px-[20px] py-[12px] text-[17px] text-[var(--ink)] placeholder:text-[var(--ink-muted-48)] outline-none transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-[var(--action-blue)] focus:shadow-[0_0_0_2px_rgba(0,102,204,0.2)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
