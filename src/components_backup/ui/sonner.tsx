import * as React from "react"
import { toast, Toaster as HotToaster } from "sonner"
import { cn } from "@/lib/utils"

const Toaster = React.forwardRef<
  React.ElementRef<typeof HotToaster>,
  React.ComponentPropsWithoutRef<typeof HotToaster>
>(({ className, ...props }, ref) => (
  <HotToaster
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    toastOptions={{
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    }}
    {...props}
  />
))
Toaster.displayName = "Toaster"

export { Toaster, toast }
