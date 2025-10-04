"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Card - Wrapper container for card content
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-green-500 bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * CardHeader - Header section of card
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle - Title text of card
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-tight tracking-tight text-green-800",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription - Small description text
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent - Main content area
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter - Footer section for actions
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-6 pt-0 border-t border-green-200",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
