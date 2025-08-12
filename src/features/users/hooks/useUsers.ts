// src/features/users/hooks/useUsers.ts
import { useState, useEffect, useCallback } from "react";
import { usersService } from "../services/user.service";
import type { User } from "@/shared/types/user";

interface UseUsersResult {
  users: User[];
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
 * Hook to get the users list with pagination.
 * @param initialPage initial page (default 1)
 * @param pageSize number of items per page (default 10)
 */
export function useUsers(
  initialPage = 1,
  pageSize = 10,
  initialQuery = '',
): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const { users, totalCount, totalPages } =
          await usersService.findAll(page, pageSize, query);
        setUsers(users);
        setTotalCount(totalCount);
        setTotalPages(totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Error loading users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPage();
  }, [page, pageSize, query]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { users, totalCount, totalPages } =
        await usersService.findAll(page, pageSize, query);
      setUsers(users);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error loading users");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query]);

  return {
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
  };
}