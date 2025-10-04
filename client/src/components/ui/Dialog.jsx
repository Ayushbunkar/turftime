import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;

export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 ${className}`}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={`fixed z-50 left-1/2 top-1/2 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-xl ${className}`}
      {...props}
    >
      {children}
      <RadixDialog.Close className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </RadixDialog.Close>
    </RadixDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
