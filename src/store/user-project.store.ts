
import { UserProject } from '@/shared/types/user';
import { create } from 'zustand';

interface UserProjectsState {
  selectedProject: UserProject | undefined;
  projects: UserProject[];
  addProject: (project: UserProject) => void;
  deleteProject: (project: UserProject) => void;
  updateProject: (project: UserProject) => void;
  setSelectedProject: (project: UserProject) => void;
  setProjects: (projects: UserProject[]) => void;
}

const useUserProjectStore = create<UserProjectsState>((set) => ({
  selectedProject: undefined,
  projects: [],
  addProject: (project: UserProject) => set((state) => ({ projects: [...state.projects, project] })),
  deleteProject: (project: UserProject) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== project.id),
      selectedProject: state.selectedProject?.id === project.id ? undefined : state.selectedProject,
    })),
  updateProject: (project: UserProject) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      selectedProject: state.selectedProject?.id === project.id ? project : state.selectedProject,
    })),
  setSelectedProject: (project: UserProject) => set(() => ({
    selectedProject: project
  })),
  setProjects: (projects: UserProject[]) => set(() => ({
    projects
  })),
}));

export default useUserProjectStore;