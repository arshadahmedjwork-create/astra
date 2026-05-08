import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Standard shadcn variants — use token colours */
        default:     "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium",
        outline:     "border border-input bg-background hover:bg-secondary hover:text-foreground font-medium",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium",
        ghost:       "hover:bg-secondary hover:text-foreground font-medium",
        link:        "text-primary underline-offset-4 hover:underline font-medium",

        /* ── Astra Dairy brand button variants ── */
        /* Forest Green bg + White text — primary CTA */
        hero: [
          "bg-[#1A7A3F] text-white",
          "hover:bg-[#145f30] active:bg-[#0f4a25]",
          "shadow-md hover:shadow-lg",
          "transition-all duration-300 rounded-full font-semibold",
        ].join(" "),

        /* White bg + Forest Green border + Forest Green text — secondary CTA */
        "hero-outline": [
          "bg-white text-[#1A7A3F] border-2 border-[#1A7A3F]",
          "hover:bg-[#1A7A3F] hover:text-white",
          "transition-all duration-300 rounded-full font-semibold",
        ].join(" "),

        /* Amber Gold accent button */
        gold: [
          "bg-[#F5A623] text-[#1C1C1C]",
          "hover:bg-[#e0941a] active:bg-[#c97f12]",
          "shadow-md hover:shadow-lg",
          "transition-all duration-300 rounded-full font-semibold",
        ].join(" "),

        /* Leaf Green pill */
        pill: [
          "bg-[#1A7A3F] text-white rounded-full",
          "shadow-lg hover:shadow-xl hover:bg-[#145f30]",
          "transition-all duration-300 font-semibold",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
