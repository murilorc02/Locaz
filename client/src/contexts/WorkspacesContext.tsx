import { CreateSalaPayload, LocationApiResponse, SearchSalaPayload, Workspace, WorkspaceApiResponse, WorkspaceCategory, WorkspacesApiResponse } from "@/types";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "@/services/api";

interface WorkspacesContextType {
    workspaces: WorkspacesApiResponse;
    isLoading: boolean;
    error: string | null;
    addWorkspace: (payload: CreateSalaPayload) => Promise<any>;
    fetchWorkspaces: () => void;
    getWorkspaceById: (workspaceId: string) => Promise<WorkspaceApiResponse>;
    editWorkspace: (workspaceId: number, payload: Partial<CreateSalaPayload>) => Promise<any>
    deleteWorkspace: (workspaceId: number) => void
    getFilteredWorkspaces: (searchParams: SearchSalaPayload) => Promise<WorkspacesApiResponse>
}

// Cria o contexto
const WorkspacesContext = createContext<WorkspacesContextType | undefined>(undefined);

export function WorkspacesProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [workspaces, setWorkspaces] = useState<WorkspacesApiResponse>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get<WorkspacesApiResponse>('/sala/getByAll');
            setWorkspaces(response.data);
        } catch (err) {
            setError("Não foi possível carregar os espaços: " + err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

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
        } catch (err) {
            throw new Error(err);
        }
    }

    const getWorkspaceById = async (workspaceId: string) => {
        try {
            const response = await api.get<WorkspaceApiResponse>(`/sala/${workspaceId}`);
            return response.data;
        } catch (err) {
            throw new Error("Não foi possível econtrar o local", err);
        }
    }

    const editWorkspace = async (workspaceId: number, payload: Partial<CreateSalaPayload>) => {
        try {
            await api.patch<WorkspaceApiResponse>(`/sala/editar/${workspaceId}`, payload);
            await fetchWorkspaces();
        } catch (err) {
            throw Error(err);
        }
    }

    const deleteWorkspace = async (workspaceId: number) => {
        try {
            await api.delete(`/sala/delete/${workspaceId}`);
            await fetchWorkspaces();
        } catch (err) {
            throw Error(err);
        }
    }

    const getFilteredWorkspaces = async (searchParams: SearchSalaPayload): Promise<WorkspacesApiResponse> => {
        try {
            const response = await api.get<WorkspacesApiResponse>('/sala/search', {
                params: searchParams
            });
            return response.data;
        } catch (err) {
            console.error('Erro na busca:', err);
            throw err;
        }
    }

    const contextValue = {
        workspaces,
        isLoading,
        error,
        fetchWorkspaces,
        addWorkspace,
        getWorkspaceById,
        editWorkspace,
        deleteWorkspace,
        getFilteredWorkspaces
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
