import * as React from "react"
import * as RadixToast from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const ToastProvider = RadixToast.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof RadixToast.Viewport>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Viewport>
>(({ className, ...props }, ref) => (
  <RadixToast.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-[22vh] w-[380px] flex-col gap-2 p-4 sm:pointer-events-none sm:pb-20 md:w-[420px]",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = RadixToast.Viewport.displayName

const toastVariants = cva(
  "group relative flex w-full items-center justify-between overflow-hidden rounded-md border bg-background px-4 py-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:zoom-out-95 data-[side=top]:border-b-0 data-[side=bottom]:border-t-0 data-[side=left]:border-r-0 data-[side=right]:border-l-0",
  {
    variants: {
      variant: {
        default: "border",
        destructive:
          "destructive group-[.destructive]:border-destructive text-destructive dark:border-destructive [&[role=alert]:data-[state=open]]:bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof RadixToast.Root>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <RadixToast.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
})
Toast.displayName = RadixToast.Root.displayName

const ToastTrigger = RadixToast.Trigger
const ToastClose = React.forwardRef<
  React.ElementRef<typeof RadixToast.Close>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Close>
>(({ className, ...props }, ref) => (
  <RadixToast.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md opacity-0 transition-opacity hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground focus:outline-none focus:ring-0 group-hover:opacity-100",
      className,
    )}
    aria-label="Close"
    {...props}
  />
))
ToastClose.displayName = RadixToast.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof RadixToast.Title>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Title>
>(({ className, ...props }, ref) => (
  <RadixToast.Title ref={ref} className={cn("mb-1 font-semibold leading-snug tracking-tight", className)} {...props} />
))
ToastTitle.displayName = RadixToast.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof RadixToast.Description>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Description>
>(({ className, ...props }, ref) => (
  <RadixToast.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
ToastDescription.displayName = RadixToast.Description.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof RadixToast.Action>,
  React.ComponentPropsWithoutRef<typeof RadixToast.Action>
>(({ className, ...props }, ref) => (
  <RadixToast.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/50 group-[.destructive]:text-destructive group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:bg-destructive group-[.destructive]:focus:text-destructive-foreground",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = RadixToast.Action.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
  useToast,
}
