import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { projectsService } from '../services/project.service';
import { AssignedUsersCard } from '../components/AssignedUsersCard';
import { ProjectInfoCard } from '../components/ProjectInfoCard';
import type { Project, UserProjectDetail } from '@/shared/types/project';


export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectUsers, setProjectUsers] = useState<UserProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/projects');
      return;
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details and users in parallel
        const [projectData, usersData] = await Promise.all([
          projectsService.findOne(id),
          projectsService.getProjectUsers(id)
        ]);

        setProject(projectData);
        setProjectUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Error loading project', {
          description: 'Could not load project information',
          duration: 5000,
        });
        navigate('/projects');
      } finally {
        setLoading(false);
        setUsersLoading(false);
      }
    };

    fetchProjectData();
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate('/projects');
  };


  const handleUsersUpdated = (updatedUsers: UserProjectDetail[]) => {
    setProjectUsers(updatedUsers);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <Button onClick={handleGoBack} className="mt-4">
            Back to projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 md:p-6">
      {/* Header */}
      <div>
        <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="h-8 px-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to projects
        </Button>
      </div>

      <div className="space-y-6">
        {/* Project Information */}
        <ProjectInfoCard project={project} />

        {/* Assigned Users */}
        <AssignedUsersCard
          project={project}
          users={projectUsers}
          loading={usersLoading}
          onUsersUpdated={handleUsersUpdated}
        />
      </div>
    </div>
  );
};

export default ProjectDetailPage;