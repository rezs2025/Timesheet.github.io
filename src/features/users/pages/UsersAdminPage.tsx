// src/features/users/pages/UsersAdminPage.tsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import { usersService } from "../services/user.service";
import { UserTable } from "../components/UserTable";
import { UserForm } from "../components/UserForm";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import type { User } from "@/shared/types/user";

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

export function UsersAdminPage() {
  const navigate = useNavigate();
  const {
    users,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    query,
    setPage,
    setQuery,
    refresh,
  } = useUsers(1, 10);
  
  const [editing, setEditing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  
  const openEdit = (id: string) => {
    setEditing(id);
    setModalOpen(true);
  };

  const openProjectAssignment = (id: string) => {
    navigate(`/users/${id}/projects`);
  };
  
  const close = () => setModalOpen(false);

  const handleSaved = () => {
    close();
    refresh();
  };

  const handleDelete = (id: string) => {
    setDeletingUserId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUserId) return;
    
    setIsDeleting(true);
    try {
      await usersService.remove(deletingUserId);
      setDeletingUserId(null);
      refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      // TODO: Show toast error message
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingUserId(null);
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
          {!isMobile && 'User'} Management
        </h1>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {!isMobile && 'New'} User
        </Button>
      </div>

      {/* Search */}
      <div className="w-full md:w-1/2">
        <SearchInput
          initialValue={query}
          onSearch={onSearch}
          placeholder="Search users..."
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading users…</div>
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <UserTable
              users={users}
              onEdit={openEdit}
              onDelete={handleDelete}
              onManageProjects={openProjectAssignment}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
            />
            <div className="text-sm text-muted-foreground">
              Total users: {totalCount}
            </div>
          </>
        )}
      </div>

      {/* Modal de Usuario */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit User" : "New User"}
            </DialogTitle>
            <DialogDescription>
              {editing 
                ? "Modify the selected user's data."
                : "Complete the data to create a new user."
              }
            </DialogDescription>
          </DialogHeader>
          <UserForm
            userId={editing}
            onSaved={handleSaved}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingUserId}
        title="Are you sure?"
        description="This action cannot be undone. The selected user and all their associated data will be permanently deleted."
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />

    </div>
  );
}