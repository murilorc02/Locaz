import { CreateSalaPayload, LocationApiResponse, Workspace, WorkspaceApiResponse, WorkspacesApiResponse } from "@/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "@/services/api";

interface WorkspacesContextType {
    workspaces: WorkspacesApiResponse;
    isLoading: boolean;
    error: string | null;
    addWorkspace: (payload: CreateSalaPayload) => Promise<any>;
    fetchWorkspaces: () => void;
    getWorkspaceById: (workspaceId: number) => Promise<WorkspaceApiResponse>;
    editWorkspace: (workspace: Partial<Workspace>) => Promise<any>
}

// Cria o contexto
const WorkspacesContext = createContext<WorkspacesContextType | undefined>(undefined);

export function WorkspacesProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [workspaces, setWorkspaces] = useState<WorkspacesApiResponse>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = async () => {
        if (!user) {
            setIsLoading(false);
            setError("Usuário não autenticado, tente fazer o login novamente.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get<WorkspacesApiResponse>('/sala/getByAll');
            setWorkspaces(response.data);
        } catch {
            setError("Não foi possível carregar os espaços.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (user && user.tipo === 'locador') {
            fetchWorkspaces();
        } else {
            setWorkspaces(null);
            setIsLoading(false);
        }
    }, [user]);

    const addWorkspace = async (payload: CreateSalaPayload) => {
        try {
            await api.post('/sala/create', payload);
            await fetchWorkspaces();
        } catch {
            throw new Error("Não foi possível adicionar o novo espaço.");
        }
    }

    const getWorkspaceById = async (workspaceId: number) => {
        try {
            const response = await api.get<WorkspaceApiResponse>(`/sala/${workspaceId}`);
            return response.data;
        } catch (err) {
            throw new Error("Não foi possível econtrar o local", err)
        }
    }

    const editWorkspace = async (workspace: Partial<Workspace>) => {
        try {
            await api.patch<LocationApiResponse>(`/sala/editar/${workspace.id}`, workspace);
            await fetchWorkspaces();
        } catch (err) {
            throw new Error("Não foi possível editar o local", err)
        }
    }

    const contextValue = {
        workspaces,
        isLoading,
        error,
        fetchWorkspaces,
        addWorkspace,
        getWorkspaceById,
        editWorkspace
    }

    return (
        <WorkspacesContext.Provider value={contextValue}>
            {children}
        </WorkspacesContext.Provider>
    );
};

export const useWorkspaces = () => {
    const context = useContext(WorkspacesContext);
    if (context === undefined) {
        throw new Error('useWorkspaces must be used within a WorkspacesProvider');
    }
    return context;
};
