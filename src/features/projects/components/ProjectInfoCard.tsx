import React from "react";
import { Building, MapPin, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { MapDialog } from "./MapDialog";

import type { Project } from "@/shared/types/project";

interface ProjectInfoCardProps {
  project: Project;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  project,
}) => {
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return "0 min";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary md:text-xl">
          <Building className="h-5 w-5" />
          {project.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">
              Description
            </h3>
            <p className="text-sm">{project.description}</p>
          </div>
        )}

        <div>
          <h3 className="font-medium text-sm text-muted-foreground">
            Address
          </h3>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="">
                <p className="text-sm">
                  {project.address || "No especificada"}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <MapDialog
                projectName={project.name}
                latitude={project.latitude}
                longitude={project.longitude}
                address={project.address}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-sm text-muted-foreground">
            Lunch Time
          </h3>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{formatDuration(project.lunchMinutes)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
