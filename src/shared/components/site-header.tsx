import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { ProjectSelector } from "./project-selector"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) overflow-hidden">
      <div className="flex w-full items-center gap-1 px-3 md:px-4 lg:gap-2 lg:px-6 min-w-0">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 shrink-0 md:block hidden"
        />
        <h1 className="text-base font-medium shrink-0 hidden md:block">Documents</h1>
        <div className="flex-1" />
        <div className="max-w-[280px] md:max-w-sm lg:max-w-md xl:max-w-lg min-w-0">
          <ProjectSelector />
        </div>
      </div>
    </header>
  )
}
