// src/shared/components/ProjectSelector.tsx
'use client'

import * as React from 'react'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/shared/components/ui/popover'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/components/ui/drawer'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/shared/components/ui/command'
import { Check, ChevronDown, Briefcase, Calendar } from 'lucide-react'
import { UserProject } from '../types/user'

interface ProjectSelectorProps {
  projects: UserProject[];
  selectedProject: UserProject | null;
  onSelectProject: (project: UserProject) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onSelectProject,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState('')

  // Lista filtrada
  const filtered = React.useMemo(
    () =>
      projects.filter((p) =>
        p.project.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    [projects, filter],
  )

  const trigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="justify-between w-full min-w-0 bg-card hover:bg-card/80 border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Briefcase className="h-4 w-4 text-primary/60 shrink-0" />
        <span className={`truncate ${selectedProject ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {selectedProject?.project.name ?? 'Seleccionar proyecto'}
        </span>
      </div>
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 transition-transform duration-200" />
    </Button>
  )

  const list = (
    <Command
      className="rounded-lg border-0"
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Buscar proyecto..."
        value={filter}
        onValueChange={setFilter}
        className="text-base border-b border-border/50 bg-background/50 placeholder:text-muted-foreground/60"
        autoFocus
      />
      <CommandList className="overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <CommandEmpty className="py-6 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Briefcase className="h-8 w-8 opacity-40" />
            <p className="text-sm">No hay proyectos encontrados</p>
          </div>
        </CommandEmpty>
        <CommandGroup>
          {filtered.map((p) => (
            <CommandItem
              key={p.id}
              value={p.id}
              onSelect={() => {
                onSelectProject(p)
                setOpen(false)
              }}
              className="cursor-pointer rounded-md mx-1 my-0.5 px-3 py-2.5 transition-all duration-200 hover:bg-primary/10 aria-selected:bg-primary/10 flex items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {p.project.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>Proyecto activo</span>
                  </div>
                </div>
              </div>
              {selectedProject?.id === p.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent 
          side="bottom"
          sideOffset={4}
          align="start"
          className="min-w-96 p-0 backdrop-blur-sm border-border/50 shadow-lg"
        >
          {list}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="p-0 bg-card/95 backdrop-blur-sm border-border/50">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <DrawerTitle className="text-lg font-semibold text-foreground">Seleccionar proyecto</DrawerTitle>
          </div>
          <DrawerDescription className="text-sm text-muted-foreground">
            Elige el proyecto en el que trabajas actualmente
          </DrawerDescription>
        </div>
        <div className="p-4">
          {list}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
