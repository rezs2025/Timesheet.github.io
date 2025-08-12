import * as React from "react"
import {
  IconDashboard,
  IconClock,
  IconChartBar,
  IconFolder,
  IconUsers,
  IconCircleCheck,
  IconCalendarTime,
} from "@tabler/icons-react"
import { useAuth } from "@/shared/hooks/useAuth"

import { NavMain } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const navAdmin = user?.role === 'admin' ? [
    {
      id: 'dashboard',
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      id: 'projects-admin',
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      id: 'users-admin',
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    // {
    //   id: 'approvals',
    //   title: "Aprobaciones",
    //   url: "/approvals",
    //   icon: IconCircleCheck,
    // },
  ] : []

  const navPM = user?.role === 'pm' ? [
    {
      id: 'dashboard',
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      id: 'projects-pm',
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
  ] : []

  const navEmployee = user?.role === 'employee' ? [
    {
      id: 'time-entry',
      title: "Time Entry",
      url: "/time-entry",
      icon: IconClock,
    },
  ]: []

  // Weekly summary available for all users
  const navWeeklySummary = user ? [
    {
      id: 'weekly-summary',
      title: "Weekly Summary",
      url: "/weekly-summary",
      icon: IconChartBar,
    },
  ] : []

  const userData = {
    name: user?.fullName || user?.email?.split('@')[0] || "User",
    email: user?.email || "user@timesheet.com",
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconCalendarTime className="!size-5" />
                <span className="text-base font-semibold">TimeSheet</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={[...navEmployee, ...navWeeklySummary, ...navPM, ...navAdmin]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
