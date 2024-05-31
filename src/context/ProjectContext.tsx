import { createContext, useContext, useState } from "react";
import { Project, ProjectFormType, Section, Todo } from "../types";

interface ProjectContextType {
  projectData: Project[];
  setProjectData: React.Dispatch<React.SetStateAction<Project[]>>;
  isProjectLoading: boolean;
  setIsProjectLoading: React.Dispatch<React.SetStateAction<boolean>>;
  sectionData: Section[];
  setSectionData: React.Dispatch<React.SetStateAction<Section[]>>;
  isSectionLoading: boolean;
  setIsSectionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProjectData: Project | null;
  setSelectedProjectData: React.Dispatch<React.SetStateAction<Project | null>>;
  isFormType: ProjectFormType;
  setIsFormType: React.Dispatch<React.SetStateAction<ProjectFormType>>;
  selectedProjectId: number;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number>>;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleFormOpen: (type: ProjectFormType) => void;
  handleFormClose: () => void;
  selectedSectionData: Section | null;
  setSelectedSectionData: React.Dispatch<React.SetStateAction<Section | null>>;
  selectedSectionDataArr: Section[];
  setSelectedSectionDataArr: React.Dispatch<React.SetStateAction<Section[]>>;
  selectedTaskDataArr: Todo[];
  setSelectedTaskDataArr: React.Dispatch<React.SetStateAction<Todo[]>>;
  isDrag: boolean;
  setIsDrag: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTaskData: Todo | null;
  setSelectedTaskData: React.Dispatch<React.SetStateAction<Todo | null>>;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined,
);

export const ProjectContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [sectionData, setSectionData] = useState<Section[]>([]);
  const [isSectionLoading, setIsSectionLoading] = useState(true);
  const [selectedProjectData, setSelectedProjectData] =
    useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(0);
  const [selectedSectionDataArr, setSelectedSectionDataArr] = useState<
    Section[]
  >([]);
  const [selectedTaskDataArr, setSelectedTaskDataArr] = useState<Todo[]>([]);

  const [selectedSectionData, setSelectedSectionData] =
    useState<Section | null>(null);
  const [selectedTaskData, setSelectedTaskData] = useState<Todo | null>(null);

  const [isFormType, setIsFormType] = useState<ProjectFormType>("none");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isDrag, setIsDrag] = useState(false);

  // フォームを開く
  const handleFormOpen = (type: ProjectFormType) => {
    setIsFormType(type);
    setIsFormOpen(true);
  };

  // フォームを閉じる
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <ProjectContext.Provider
      value={{
        isProjectLoading,
        setIsProjectLoading,
        projectData,
        setProjectData,
        isSectionLoading,
        setIsSectionLoading,
        sectionData,
        setSectionData,
        selectedProjectData,
        setSelectedProjectData,
        selectedProjectId,
        setSelectedProjectId,
        isFormType,
        setIsFormType,
        isMenuOpen,
        setIsMenuOpen,
        isFormOpen,
        setIsFormOpen,
        handleFormOpen,
        handleFormClose,
        selectedSectionData,
        setSelectedSectionData,
        selectedSectionDataArr,
        setSelectedSectionDataArr,
        selectedTaskDataArr,
        setSelectedTaskDataArr,
        isDrag,
        setIsDrag,
        selectedTaskData,
        setSelectedTaskData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("ProjectContextをプロバイダーの中で取得してください");
  }
  return context;
};
