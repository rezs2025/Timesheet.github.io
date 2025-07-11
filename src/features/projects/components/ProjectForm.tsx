// src/features/projects/components/ProjectForm.tsx
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateProjectDto, projectsService } from "../services/project.service";
import type { Project } from "@/shared/types/project";
import { MapPin, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

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
      lunchMinutes: 0,
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
          lunchMinutes: p.lunchMinutes,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Controller
          name="name"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              placeholder="Nombre del proyecto"
              className={errors.name ? "border-destructive" : ""}
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="description"
              placeholder="Descripción del proyecto (opcional)"
            />
          )}
        />
      </div>

      {/* Dirección */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="address"
              placeholder="Dirección del proyecto"
            />
          )}
        />
      </div>

      {/* Botón para obtener ubicación */}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={handleGetLocation}
          className="gap-2"
        >
          <MapPin className="h-4 w-4" />
          Obtener ubicación actual
        </Button>
      </div>

      {/* Coordenadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latitud */}
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitud *</Label>
          <Controller
            name="latitude"
            control={control}
            rules={{
              required: "Latitud obligatoria",
              min: { value: -90, message: "Min -90" },
              max: { value: 90, message: "Max 90" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                id="latitude"
                type="number"
                step="any"
                placeholder="Ej: -33.4489"
                className={errors.latitude ? "border-destructive" : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={field.value ?? ""}
              />
            )}
          />
          {errors.latitude && (
            <p className="text-sm text-destructive">{errors.latitude.message}</p>
          )}
        </div>

        {/* Longitud */}
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitud *</Label>
          <Controller
            name="longitude"
            control={control}
            rules={{
              required: "Longitud obligatoria",
              min: { value: -180, message: "Min -180" },
              max: { value: 180, message: "Max 180" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                id="longitude"
                type="number"
                step="any"
                placeholder="Ej: -70.6693"
                className={errors.longitude ? "border-destructive" : ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={field.value ?? ""}
              />
            )}
          />
          {errors.longitude && (
            <p className="text-sm text-destructive">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      {/* Tiempo de almuerzo */}
      <div className="space-y-2">
        <Label htmlFor="lunchMinutes">Tiempo de almuerzo (minutos) *</Label>
        <Controller
          name="lunchMinutes"
          control={control}
          rules={{
            required: "Tiempo de almuerzo obligatorio",
            min: { value: 0, message: "Min 0" },
          }}
          render={({ field }) => (
            <Input
              {...field}
              id="lunchMinutes"
              type="number"
              placeholder="60"
              className={errors.lunchMinutes ? "border-destructive" : ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              value={field.value ?? ""}
            />
          )}
        />
        {errors.lunchMinutes && (
          <p className="text-sm text-destructive">{errors.lunchMinutes.message}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {projectId ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}