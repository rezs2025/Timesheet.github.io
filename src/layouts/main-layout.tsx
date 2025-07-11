// src/layouts/MainLayout.tsx
import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/shared/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { SiteHeader } from '@/shared/components/site-header'
import { AppLoader } from '@/shared/components/ui/AppLoader'
import { Toaster } from '@/shared/components/ui/sonner'

export function MainLayout() {
  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={
            <div className="p-4">
              <AppLoader size="md" text="Cargando página..." />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
