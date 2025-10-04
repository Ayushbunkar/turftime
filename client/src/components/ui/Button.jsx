import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const buttonVariants = ({ variant = "default", size = "default" } = {}) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return cn(base, variants[variant], sizes[size]);
};

export { Button, buttonVariants };
