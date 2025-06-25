// src/features/projects/components/ProjectTable.tsx
import React from 'react';
import {
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Pagination,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Project } from '@/shared/types/project';

interface Props {
  projects: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export const ProjectTable: React.FC<Props> = ({
  projects,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // handler para Pagination (1-based)
  const handleMobilePage = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  return isMobile ? (
    <Box>
      {projects.map(p => (
        <Card key={p.id} variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: theme.palette.primary.light}}>{p.name}</Typography>
            {p.description && (
              <Typography variant="body2" color="textSecondary" sx={{ pb: 1 }}>
                {p.description}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Address:</strong> {p.address || '-'}
            </Typography>
            <Typography variant="body2">
              <strong>Coords:</strong> {`${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`}
            </Typography>
            <Typography variant="body2">
              <strong>Lunch:</strong> {p.lunchTime} min
            </Typography>
          </CardContent>
          <CardActions sx={{ bgcolor: theme.palette.primary.light }}>
            <IconButton size="small" sx={{ color: theme.palette.background.default}} onClick={() => onEdit(p.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: theme.palette.background.default}} onClick={() => onDelete(p.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      ))}
      <Stack direction="row" justifyContent="center" alignItems="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleMobilePage}
          shape="rounded"
          size="small"
        />
      </Stack>
    </Box>
  ) : (
    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Coordinates</TableCell>
              <TableCell align="right">Lunch Time (min)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map(p => (
              <TableRow hover key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.description || '-'}</TableCell>
                <TableCell>{p.address || '-'}</TableCell>
                <TableCell>{`${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`}</TableCell>
                <TableCell align="right">{p.lunchTime}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => onEdit(p.id)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(p.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" p={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleMobilePage}
          showFirstButton
          showLastButton
        />
      </Box>
    </Paper>
  );
};
