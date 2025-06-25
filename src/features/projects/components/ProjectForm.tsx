// src/features/projects/components/ProjectForm.tsx
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateProjectDto, projectsService } from "../services/project.service";
import type { Project } from "@/shared/types/project";

import { TextField, Grid, Button, CircularProgress } from "@mui/material";

import { LocationOn as LocationOnIcon } from "@mui/icons-material";

interface Props {
  projectId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function ProjectForm({ projectId, onSaved, onCancel }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectDto>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      latitude: 0,
      longitude: 0,
      lunchTime: 60,
    },
  });

  useEffect(() => {
    if (projectId) {
      projectsService.findOne(projectId).then((p: Project) =>
        reset({
          name: p.name,
          description: p.description,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          lunchTime: p.lunchTime,
        })
      );
    }
  }, [projectId, reset]);

  // Obtiene geolocalización y rellena coordenadas
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue("latitude", coords.latitude);
        setValue("longitude", coords.longitude);
      },
      (err) => {
        alert("Error al obtener ubicación: " + err.message);
      }
    );
  };

  const onSubmit = async (data: CreateProjectDto) => {
    if (projectId) {
      await projectsService.update(projectId, data);
    } else {
      await projectsService.create(data);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        {/* Nombre */}
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "El nombre es obligatorio" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        {/* Descripción */}
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Descripción" fullWidth />
            )}
          />
        </Grid>

        {/* Dirección */}
        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Dirección" fullWidth />
            )}
          />
        </Grid>

        {/* Botón para obtener ubicación */}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<LocationOnIcon />}
            onClick={handleGetLocation}
          >
            Obtener ubicación actual
          </Button>
        </Grid>

        {/* Latitud */}
        <Grid item xs={6}>
          <Controller
            name="latitude"
            control={control}
            rules={{
              required: "Latitud obligatoria",
              min: { value: -90, message: "Min -90" },
              max: { value: 90, message: "Max 90" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Latitud"
                type="number"
                fullWidth
                error={!!errors.latitude}
                helperText={errors.latitude?.message}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={field.value ?? ""}
              />
            )}
          />
        </Grid>

        {/* Longitud */}
        <Grid item xs={6}>
          <Controller
            name="longitude"
            control={control}
            rules={{
              required: "Longitud obligatoria",
              min: { value: -180, message: "Min -180" },
              max: { value: 180, message: "Max 180" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Longitud"
                type="number"
                fullWidth
                error={!!errors.longitude}
                helperText={errors.longitude?.message}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={field.value ?? ""}
              />
            )}
          />
        </Grid>

        {/* Lunch Time */}
        <Grid item xs={12}>
          <Controller
            name="lunchTime"
            control={control}
            rules={{
              required: "Tiempo de lunch obligatorio",
              min: { value: 0, message: "Min 0" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Lunch Time (min)"
                type="number"
                fullWidth
                error={!!errors.lunchTime}
                helperText={errors.lunchTime?.message}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={field.value ?? ""}
              />
            )}
          />
        </Grid>

        {/* Botones */}
        <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onCancel} disabled={isSubmitting} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {projectId ? "Guardar" : "Crear"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
