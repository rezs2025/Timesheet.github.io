import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from "@/shared/lib/utils"

// Popover root
const Popover = PopoverPrimitive.Root

// Popover Trigger with ref forwarding
const PopoverTrigger = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> & { asChild?: boolean }
>(function PopoverTrigger({ asChild = false, children, ...props }, ref) {
  const Comp = asChild ? Slot : 'button'
  return (
    <PopoverPrimitive.Trigger asChild={asChild} {...props} ref={ref}>
      <Comp {...props} ref={ref}>
        {children}
      </Comp>
    </PopoverPrimitive.Trigger>
  )
})

// Popover Content with ref forwarding
const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = "center", sideOffset = 4, children, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        data-slot="popover-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-full sm:w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})

// Popover Anchor
const PopoverAnchor = PopoverPrimitive.Anchor

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
