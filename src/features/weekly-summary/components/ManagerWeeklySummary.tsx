import React, { useState, useEffect } from 'react';
import { startOfWeek, addWeeks, subWeeks, endOfWeek, format } from 'date-fns';
import { useAuth } from '@/shared/hooks/useAuth';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, Clock } from 'lucide-react';

import WeekSelector from './WeekSelector';
import FiltersPanel from './FiltersPanel';
import TimeEntriesTable from './TimeEntriesTable';
import { calculateHoursWorked } from '../utils/weeklyCalculations';
import { TimeEntry, UpdateTimeEntryData } from '@/features/time-entry/types';
import { Project } from '@/shared/types/project';
import { User } from '@/shared/types/user';
import { toast } from 'sonner';
import EditEntryDialog from './EditEntryDialog';
import { timeEntryService } from '@/features/time-entry/services/timeEntry.service';
import { useWeeklyPMSummary } from '../hooks/useWeeklyPMSummary';
import { projectsService } from '@/features/projects/services/project.service';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';

const ManagerWeeklySummary = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  
  const { user, loading: loadingUser } = useAuth();
  
  const { loading, weekSummary, refetch } = useWeeklyPMSummary({
    currentWeekStart,
    projectId: selectedProject === 'all' ? undefined : selectedProject,
    userId: selectedUser === 'all' ? undefined : selectedUser,
  });

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      try {
        const fetchedProjects = await projectsService.findAll();
        setProjects(fetchedProjects.projects || []);
        
      } catch (error) {
        console.error("Error fetching projects and users:", error);
      }
    };

    fetchProjectsAndUsers();
  }, []);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prevWeek) => subWeeks(prevWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prevWeek) => addWeeks(prevWeek, 1));
  };

  const handleEditSubmit = async (editForm: UpdateTimeEntryData) => {
    if (!editingEntry) return;
    
    setIsEditLoading(true);
    try {
      await timeEntryService.updateTimeEntry(editingEntry.id, {
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        projectId: editForm.projectId,
        lunchMinutes: editForm.lunchMinutes,
      });
      
      toast.success('Record updated successfully');
      setEditingEntry(null);
      
      // Refresh the data
      await refetch();
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('Error updating record');
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteClick = (entry: TimeEntry) => {
    setDeletingEntryId(entry.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntryId) return;
    
    setIsDeleteLoading(true);
    try {
      await timeEntryService.deleteTimeEntry(deletingEntryId);
      toast.success('Record deleted successfully');
      setDeletingEntryId(null);
      
      // Refresh the data
      await refetch();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast.error('Error deleting record');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingEntryId(null);
  };

  if (loadingUser || loading) {
    return <AppLoader text="Loading team summary..." />;
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>Authentication error</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.role === 'admin' ? 'System Overview' : 'Team Summary'}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' ? 'Complete system view' : 'Team time management'} - {user?.fullName || user?.email}
        </p>
      </div>
      <Card>
        <WeekSelector
          currentWeekStart={currentWeekStart}
          weekSummary={weekSummary}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />
        
        <FiltersPanel
          loadingUser={loadingUser}
          loading={loading}
          user={user}
          projects={projects}
          users={users}
          selectedProject={selectedProject}
          selectedUser={selectedUser}
          onProjectChange={setSelectedProject}
          onUserChange={setSelectedUser}
          showUserFilter={true}
          showProjectFilter={true}
        />
      </Card>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              {user?.role === 'admin' ? 'Total Users' : 'Total Members'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-green-600" />
              {user?.role === 'admin' ? 'Active Users' : 'Active'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.activeMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Total Hours
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Total hours worked, excluding break times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.totalHours}</div>
          </CardContent>
        </Card>
      </div>

      <TimeEntriesTable
        entries={weekSummary.timeEntries}
        user={user}
        calculateHoursWorked={calculateHoursWorked}
        showUserColumn={true}
        showProjectColumn={true}
        showEditButton={true}
        onEditClick={(entry) => {
          setEditingEntry(entry);
        }}
        onDeleteClick={handleDeleteClick}
        showDeleteButton={true}
        showExportButton={true}
        exportFileName={`weekly-summary-${format(currentWeekStart, 'MM-dd-yyyy')}_${format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MM-dd-yyyy')}`}
      />

      <EditEntryDialog
        editingEntry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleEditSubmit}
        projects={projects}
        loading={isEditLoading}
      />
      <ConfirmDialog
        open={!!deletingEntryId}
        title="Are you sure?"
        description="This action cannot be undone. The selected time record will be permanently deleted."
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={isDeleteLoading}
      />
    </div>
  );
};

export default ManagerWeeklySummary;