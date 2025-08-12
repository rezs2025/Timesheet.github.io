// src/features/projects/pages/ProjectsAdminPage.tsx
import React, { useState, useCallback } from "react";
import { useProjects } from "../hooks/useProjects";
import { projectsService } from "../services/project.service";
import { ProjectTable } from "../components/ProjectTable";
import { ProjectForm } from "../components/ProjectForm";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { SearchInput } from "@/shared/components/SearchInput";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { toast } from "sonner";
import { useAuth } from '@/shared/hooks/useAuth';

export function ProjectsAdminPage() {
  const {
    projects,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    query,
    setPage,
    setQuery,
    refresh,
  } = useProjects(1, 10);
  const [editing, setEditing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  
  const openEdit = (id: string) => {
    setEditing(id);
    setModalOpen(true);
  };
  
  const close = () => setModalOpen(false);

  const handleSaved = () => {
    close();
    refresh();
  };

  const handleDelete = (id: string) => {
    setDeletingProjectId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;
    
    setIsDeleting(true);
    try {
      await projectsService.remove(deletingProjectId);
      toast.success('Project deleted successfully');
      setDeletingProjectId(null);
      refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingProjectId(null);
  };

  const onSearch = useCallback((q: string) => {
    setQuery(q);
    setPage(1);
  }, [setQuery, setPage]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          {!isMobile && 'Manage'} Projects
        </h1>
        {user?.role === 'admin' && (
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            {!isMobile && 'New'} Project
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="w-full md:w-1/2">
        <SearchInput
          initialValue={query}
          onSearch={onSearch}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading projects…</div>
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <ProjectTable
              projects={projects}
              onEdit={openEdit}
              onDelete={handleDelete}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
            />
            <div className="text-sm text-muted-foreground">
              Total projects: {totalCount}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription>
              {editing 
                ? "Modify the selected project data."
                : "Complete the data to create a new project."
              }
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            projectId={editing}
            onSaved={handleSaved}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingProjectId}
        title="Are you sure?"
        description="This action cannot be undone. The selected project and all its associated data will be permanently deleted."
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
}