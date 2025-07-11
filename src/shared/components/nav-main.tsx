import { type Icon } from "@tabler/icons-react"
import { useNavigate, useLocation } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    id: string
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setOpenMobile } = useSidebar()

  const handleNavigation = (url: string) => {
    navigate(url)
    // Cerrar sidebar en móvil después de la navegación
    setOpenMobile(false)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                tooltip={item.title}
                isActive={location.pathname === item.url}
                onClick={() => handleNavigation(item.url)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
