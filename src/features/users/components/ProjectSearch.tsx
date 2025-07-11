"use client"

import * as React from "react"
import { Check, ChevronDown, Loader2 } from "lucide-react"

import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/shared/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

import type { Project } from '@/shared/types/project'
import { projectsService } from '@/features/projects/services/project.service'
import { useDebounce } from '@/shared/hooks/useDebounce'

interface ProjectSearchProps {
  value: string
  onValueChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  excludeProjectIds?: string[]
}

interface TriggerButtonProps {
  selected: Project | null
  placeholder: string
  disabled: boolean
}

const TriggerButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & TriggerButtonProps
>(({ selected, placeholder, disabled, className, ...props }, ref) => (
  <button
    ref={ref}
    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    disabled={disabled}
    {...props}
  >
    <span className={selected ? "text-foreground" : "text-muted-foreground"}>
      {selected ? selected.name : placeholder}
    </span>
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
TriggerButton.displayName = "TriggerButton"

export function ProjectSearch({
  value,
  onValueChange,
  placeholder = 'Buscar proyecto...',
  disabled = false,
  excludeProjectIds = [],
}: ProjectSearchProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [searchTerm, setSearchTerm] = React.useState('')
  const debounced = useDebounce(searchTerm, 300)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selected, setSelected] = React.useState<Project | null>(null)
  
  // Memoizar excludeProjectIds para evitar re-renders
  const memoizedExcludeIds = React.useMemo(() => excludeProjectIds, [excludeProjectIds.join(',')])

  // cargar selección actual
  React.useEffect(() => {
    if (value) {
      projectsService.findOne(value).then(p => setSelected(p)).catch(() => setSelected(null))
    } else {
      setSelected(null)
    }
  }, [value])

  // búsqueda - busca en el servidor con el texto escrito
  React.useEffect(() => {
    if (!open) return
    
    let cancelled = false
    setLoading(true)
    
    // Usar directamente searchTerm si está disponible, sino debounced
    const queryText = searchTerm.length > 0 ? debounced : ''
    
    projectsService
      .findAll(1, 10, queryText)
      .then(res => {
        if (!cancelled) {
          const filteredProjects = res.projects.filter(
            project => !memoizedExcludeIds.includes(project.id)
          )
          setProjects(filteredProjects)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Error searching projects:', err)
          setProjects([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    
    return () => {
      cancelled = true
    }
  }, [debounced, open, memoizedExcludeIds])

  const handleSelect = (id: string) => {
    const project = projects.find(p => p.id === id)
    if (project) {
      setSelected(project)
    }
    onValueChange(id)
    setOpen(false)
    setSearchTerm('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchTerm('')
      setProjects([])
    }
  }


  const commandList = (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Teclea para buscar…"
        value={searchTerm}
        onValueChange={setSearchTerm}
        autoFocus
      />
      <CommandList className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              Buscando…
            </span>
          </div>
        ) : (
          <>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              {projects.map(p => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => handleSelect(p.id)}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{p.name}</span>
                      {p.description && (
                        <span className="text-xs text-muted-foreground">
                          {p.description}
                        </span>
                      )}
                    </div>
                    {p.id === value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  )

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <TriggerButton 
            selected={selected} 
            placeholder={placeholder} 
            disabled={disabled} 
          />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          sideOffset={4}
          align="start"
          className="w-[400px] p-0"
        >
          {commandList}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <TriggerButton 
          selected={selected} 
          placeholder={placeholder} 
          disabled={disabled} 
        />
      </DrawerTrigger>
      <DrawerContent className="p-4">
        {commandList}
      </DrawerContent>
    </Drawer>
  )
}