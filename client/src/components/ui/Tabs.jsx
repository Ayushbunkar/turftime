// src/components/ui/tabs.jsx
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils"; // make sure this exists or replace with classNames

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }) => (
  <TabsPrimitive.List
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({ className, ...props }) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
      "data-[state=active]:bg-white data-[state=active]:text-foreground",
      className
    )}
    {...props}
  />
);

export const TabsContent = ({ className, ...props }) => (
  <TabsPrimitive.Content
    className={cn("mt-2 rounded-md border p-4", className)}
    {...props}
  />
);
