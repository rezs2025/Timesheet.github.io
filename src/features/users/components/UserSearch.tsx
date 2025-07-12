import * as React from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";

import { useMediaQuery } from "@/shared/hooks/use-media-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

import type { User } from "@/shared/types/user";
import { usersService } from "@/features/users/services/user.service";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface UserSearchProps {
  value: string;
  onValueChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeUserIds?: string[];
  roleFilter?: "pm" | "employee";
}

interface TriggerButtonProps {
  selected: User | null;
  placeholder: string;
  disabled: boolean;
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
      {selected ? selected.fullName : placeholder}
    </span>
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
TriggerButton.displayName = "TriggerButton";

export function UserSearch({
  value,
  onValueChange,
  placeholder = "Buscar proyecto...",
  disabled = false,
  excludeUserIds = [],
  roleFilter,
}: UserSearchProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchTerm, setSearchTerm] = React.useState("");
  const debounced = useDebounce(searchTerm, 300);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<User | null>(null);

  // Memoizar excludeUserIds para evitar re-renders
  const memoizedExcludeIds = React.useMemo(
    () => excludeUserIds,
    [excludeUserIds.join(",")]
  );

  // búsqueda - busca en el servidor con el texto escrito
  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    // Usar directamente searchTerm si está disponible, sino debounced
    const queryText = searchTerm.length > 0 ? debounced : "";

    usersService
      .findAll(1, 10, queryText, roleFilter)
      .then((res) => {
        if (!cancelled) {
          const filteredUsers = res.users.filter(
            (user) => !memoizedExcludeIds.includes(user.id)
          );
          setUsers(filteredUsers);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error searching users:", err);
          setUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, open, memoizedExcludeIds]);

  const handleSelect = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelected(user);
    }
    onValueChange(id);
    setOpen(false);
    setSearchTerm("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
      setUsers([]);
    }
  };

  const commandList = (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Escribe para buscar…"
        value={searchTerm}
        onValueChange={setSearchTerm}
        autoFocus
      />
      <CommandList className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            <span className="text-sm text-muted-foreground">Buscando…</span>
          </div>
        ) : (
          <>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="clear"
                value="none"
                onSelect={() => {
                  setSelected(null);
                  onValueChange("");
                  setOpen(false);
                  setSearchTerm("");
                }}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-muted-foreground italic">
                    Todos
                  </span>
                  {value === "" && <Check className="h-4 w-4 text-primary" />}
                </div>
              </CommandItem>
              {users.map((u) => (
                <CommandItem
                  key={u.id}
                  value={u.fullName}
                  onSelect={() => handleSelect(u.id)}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{u.fullName}</span>
                    </div>
                    {u.id === value && (
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
  );

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
    );
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
      <DrawerContent className="p-4">{commandList}</DrawerContent>
    </Drawer>
  );
}
