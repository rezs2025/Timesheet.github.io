// src/features/projects/pages/ProjectsAdminPage.tsx
import React, { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import { projectsService } from "../services/project.service";
import { ProjectTable } from "../components/ProjectTable";
import { ProjectForm } from "../components/ProjectForm";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { SearchInput } from "@shared/components/SearchInput";

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
  } = useProjects(1, 2);
  const [editing, setEditing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  

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

  const handleDelete = async (id: string) => {
    await projectsService.remove(id);
    setPage(page);
  };

  const onSearch = (q: string) => {
    setQuery(q)
    setPage(1)
  }

  return (
    <Box p={{ sx: 1, sm: 3 }} >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
        >
          {!isMobile && 'Administrar'} Proyectos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          {!isMobile && 'Proyecto'} Nuevo
        </Button>
      </Box>
      <Box mb={2} sx={{ width: {xs: '100%', sm: '50%'}}}>
        <SearchInput
          initialValue={query}
          onSearch={onSearch}
        />
      </Box>

      {loading && <Typography>Cargando proyectos…</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        <ProjectTable
          projects={projects}
          onEdit={openEdit}
          onDelete={handleDelete}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      )}
      <Typography variant="body2" mt={1}>
        Total de proyectos: {totalCount}
      </Typography>

      <Dialog open={modalOpen} onClose={close} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? "Editar Proyecto" : "Nuevo Proyecto"}
        </DialogTitle>
        <DialogContent dividers>
          <ProjectForm
            projectId={editing}
            onSaved={handleSaved}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
