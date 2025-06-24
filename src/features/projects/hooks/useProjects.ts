// src/features/projects/hooks/useProjects.ts
import { useState, useEffect, useCallback } from "react";
import { projectsService } from "../services/project.service";
import type { Project } from "@shared/types/project";

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalCount: number;
  query: string;
  setPage: (page: number) => void;
  setQuery: (q: string) => void;
  refresh: () => void;
}

/**
 * Hook para obtener la lista de proyectos con paginación.
 * @param initialPage página inicial (por defecto 1)
 * @param pageSize cantidad de ítems por página (por defecto 10)
 */
export function useProjects(
  initialPage = 1,
  pageSize = 10,
  initialQuery = '',
): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState(initialQuery)

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { projects, totalCount, totalPages } =
        await projectsService.findAll(page, pageSize, query);
      setProjects(projects);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    projects,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    query,
    setPage,
    setQuery,
    refresh: fetchPage,
  };
}
