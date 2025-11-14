
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_COLLAPSED_WIDTH = "3.5rem"

type SidebarContextType = {
  isExpanded: boolean
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export function SidebarProvider({ children, onOpenChange }: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [openMobile, setOpenMobile] = React.useState(false)
  const isMobile = useIsMobile()
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (!isMobile) {
      setIsExpanded(true)
      onOpenChange?.(true)
    }
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isMobile) {
        setIsExpanded(false)
        onOpenChange?.(false)
      }
    }, 150) // 150ms delay to prevent flickering
  }
  
  // Close mobile sidebar on navigation
  React.useEffect(() => {
    if(isMobile && openMobile) {
       setOpenMobile(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);


  const contextValue = {
    isExpanded: isExpanded || openMobile,
    isMobile,
    openMobile,
    setOpenMobile,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-collapsed-width": SIDEBAR_COLLAPSED_WIDTH,
          } as React.CSSProperties}
          className="group/sidebar-wrapper"
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isExpanded, onMouseEnter, onMouseLeave } = useSidebar()
    return (
      <aside
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out md:flex",
          isExpanded ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-collapsed-width)]",
          className
        )}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"


export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const { isExpanded } = useSidebar();
        return <div ref={ref} className={cn("flex h-16 items-center", isExpanded ? "px-4" : "px-3.5", className)} {...props} />;
    }
);
SidebarHeader.displayName = "SidebarHeader";


export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)} {...props} />
  )
)
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-auto p-4", className)} {...props} />
  )
)
SidebarFooter.displayName = "SidebarFooter"

export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "flex-1 transition-[margin-left] duration-300 ease-in-out",
          "md:ml-[var(--sidebar-collapsed-width)]",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarInset.displayName = "SidebarInset"

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768)
    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return isMobile
}

// Sidebar Menu Components
export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-1 px-2", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("group/item relative", className)} {...props} />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"


interface SidebarMenuButtonProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ asChild, isActive, tooltip, children, ...props }, ref) => {
  const { isExpanded } = useSidebar()
  const Comp = asChild ? Slot : Button

  const buttonContent = (
    <Comp
      ref={ref}
      variant="ghost"
      data-active={isActive}
      className={cn(
        "flex h-9 w-full justify-start items-center gap-3 rounded-md px-3 text-sm font-medium",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
      )}
      {...props}
    >
      {children}
    </Comp>
  )

  if (!isExpanded && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right" align="center" sideOffset={10}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }

  return buttonContent
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { setOpenMobile } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={(event) => {
        onClick?.(event);
        setOpenMobile(true);
      }}
      {...props}
    />
  );
});
SidebarTrigger.displayName = "SidebarTrigger";
