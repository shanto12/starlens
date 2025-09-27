'use client';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
  outline:
    "inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60",
};

type ButtonVariant = keyof typeof buttonVariants;

type ButtonProps = {
  asChild?: boolean;
  variant?: ButtonVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants[variant], className)}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
