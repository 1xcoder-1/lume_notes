import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

export interface Note {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  content?: any;
  tags?: string[];
  folder?: string | null;
  folderId?: string | null;
  author?: { email: string };
  isOptimistic?: boolean;
  shared_note?: SharedNote | null;
}

export interface Folder {
  id: string;
  name: string;
  tenant_id: string;
  parentId?: string | null;
  created_at: string;
  updated_at: string;
  sharing?: {
    id: string;
    token: string;
    is_public: boolean;
    expires_at?: string | null;
    view_count: number;
  } | null;
}

export interface Tenant {
  name: string;
  slug: string;
  plan: "free" | "pro";
  noteCount: number;
  limit: number | null;
  email?: string | null;
  members_can_edit: boolean;
  members_can_create: boolean;
  members_can_share: boolean;
}

export interface SharedNote {
  id: string;
  note_id: string;
  token: string;
  is_public: boolean;
  expires_at?: string | null;
  view_count: number;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
  tenantPlan: "free" | "pro";
  role: "admin" | "member";
}

const getAuthHeaders = (): Record<string, string> => {
  return { "Content-Type": "application/json" };
};

const handleApiError = async (error: any) => {
  let message = "An unexpected error occurred";

  if (error instanceof Response) {
    try {
      const cloned = error.clone();
      const data = await cloned.json();
      message = data.error || data.message || message;
    } catch (e) {
      // Ignore JSON parsing errors
    }

    if (error.status === 401) {
      if (message === "User account no longer exists. Please sign in again.") {
        await signOut({ callbackUrl: "/auth/login" });
        return;
      }
      window.location.href = "/auth/login";
      return;
    }

    if (error.status === 403 || error.status === 404) {
      if (
        message === "Tenant not found or access revoked" ||
        message === "Tenant not found"
      ) {
        window.location.href = "/organization/setup?refresh=true";
        return;
      }
    }

    const err = new Error(message);
    (err as any).status = error.status;
    throw err;
  }

  throw error;
};

export const api = {
  getNotes: async (): Promise<Note[]> => {
    const response = await fetch(`/api/notes`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  getNote: async (id: string): Promise<Note> => {
    const response = await fetch(`/api/notes/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  createNote: async (data: {
    title: string;
    content: any;
    tags?: string[];
    folderId?: string | null;
  }): Promise<Note> => {
    const response = await fetch(`/api/notes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  updateNote: async (
    id: string,
    data: {
      title?: string;
      content?: any;
      tags?: string[];
      folder?: string | null;
      folderId?: string | null;
    }
  ): Promise<Note> => {
    const response = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  deleteNote: async (id: string): Promise<void> => {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
  },

  getTenant: async (): Promise<Tenant> => {
    const response = await fetch(`/api/tenant`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  getOrganizationUsers: async (): Promise<User[]> => {
    const response = await fetch(`/api/organization/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  removeOrganizationUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/organization/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
  },

  getOrganizationStats: async (): Promise<{
    name: string;
    memberCount: number;
    adminCount: number;
    totalCount: number;
  }> => {
    const response = await fetch(`/api/organization/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  upgradeTenant: async (
    slug: string
  ): Promise<{ message: string; tenant: Tenant }> => {
    const response = await fetch(`/api/tenants/${slug}/upgrade`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  inviteUser: async (data: {
    email: string;
    role: "admin" | "member";
    password?: string;
  }): Promise<any> => {
    const response = await fetch(`/api/auth/invite`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  searchNotes: async (
    query: string,
    filters?: {
      tags?: string[];
      startDate?: string;
      endDate?: string;
      authorId?: string;
    }
  ): Promise<Note[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);
    if (filters?.tags?.length) {
      searchParams.append("tags", filters.tags.join(","));
    }
    if (filters?.startDate) {
      searchParams.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      searchParams.append("endDate", filters.endDate);
    }
    if (filters?.authorId) {
      searchParams.append("authorId", filters.authorId);
    }

    const response = await fetch(
      `/api/notes/search?${searchParams.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  toggleShareNote: async (
    id: string,
    enabled: boolean
  ): Promise<SharedNote | null> => {
    const response = await fetch(`/api/notes/${id}/share`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled }),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  toggleShareFolder: async (
    id: string,
    enabled: boolean,
    expires_in?: string
  ): Promise<any> => {
    const response = await fetch(`/api/folders/${id}/share`, {
      method: enabled ? "POST" : "DELETE",
      headers: getAuthHeaders(),
      body: enabled ? JSON.stringify({ expires_in }) : undefined,
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  getFolders: async (): Promise<Folder[]> => {
    const response = await fetch(`/api/folders`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  createFolder: async (data: {
    name: string;
    parentId?: string | null;
  }): Promise<Folder> => {
    const response = await fetch(`/api/folders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  deleteFolder: async (id: string): Promise<void> => {
    const response = await fetch(`/api/folders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) await handleApiError(response);
  },
};

export const useNotes = (): UseQueryResult<Note[], Error> => {
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: api.getNotes,
    staleTime: 1000 * 60 * 5,
  });
};

export const useNote = (id: string): UseQueryResult<Note, Error> => {
  const queryClient = useQueryClient();
  return useQuery<Note>({
    queryKey: ["notes", id],
    queryFn: () => api.getNote(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    initialData: () => {
      return queryClient
        .getQueryData<Note[]>(["notes"])
        ?.find(n => n.id === id);
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["notes"])?.dataUpdatedAt,
  });
};

export const useFolders = (): UseQueryResult<Folder[], Error> => {
  return useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: api.getFolders,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateFolder = (): UseMutationResult<
  Folder,
  Error,
  { name: string; parentId?: string | null }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useDeleteFolder = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useTenant = (): UseQueryResult<Tenant, Error> => {
  return useQuery<Tenant>({
    queryKey: ["tenant"],
    queryFn: api.getTenant,
    staleTime: 0,
    refetchInterval: 5000,
  });
};

export const useOrganizationStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["organizationStats"],
    queryFn: api.getOrganizationStats,
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

export const useCreateNote = (): UseMutationResult<
  Note,
  Error,
  { title: string; content: any; tags?: string[]; folderId?: string | null },
  { previousNotes: Note[] | undefined }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    Note,
    Error,
    { title: string; content: any; tags?: string[]; folderId?: string | null },
    { previousNotes: Note[] | undefined }
  >({
    mutationFn: api.createNote,
    onMutate: async newNote => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes"],
          [
            {
              ...newNote,
              id: "temp",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              isOptimistic: true,
            } as Note,
            ...previousNotes,
          ]
        );
      }

      return { previousNotes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
  });
};

export const useUpdateNote = (): UseMutationResult<
  Note,
  Error,
  {
    id: string;
    data: {
      title?: string;
      content?: any;
      tags?: string[];
      folder?: string | null;
      folderId?: string | null;
    };
  },
  { previousNotes: Note[] | undefined; previousNote: Note | undefined }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    Note,
    Error,
    {
      id: string;
      data: {
        title?: string;
        content?: any;
        tags?: string[];
        folder?: string | null;
        folderId?: string | null;
      };
    },
    { previousNotes: Note[] | undefined; previousNote: Note | undefined }
  >({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        content?: any;
        tags?: string[];
        folder?: string | null;
        folderId?: string | null;
      };
    }) => api.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      await queryClient.cancelQueries({ queryKey: ["notes", id] });

      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);
      const previousNote = queryClient.getQueryData<Note>(["notes", id]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes"],
          previousNotes.map(n => (n.id === id ? { ...n, ...data } : n))
        );
      }
      if (previousNote) {
        queryClient.setQueryData<Note>(["notes", id], {
          ...previousNote,
          ...data,
        });
      }

      return { previousNotes, previousNote };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", id] });
    },
    onError: (err, { id }, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
      if (context?.previousNote) {
        queryClient.setQueryData(["notes", id], context.previousNote);
      }
    },
  });
};

export const useDeleteNote = (): UseMutationResult<
  void,
  Error,
  string,
  { previousNotes: Note[] | undefined }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    string,
    { previousNotes: Note[] | undefined }
  >({
    mutationFn: api.deleteNote,
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes"],
          previousNotes.filter(n => n.id !== id)
        );
      }

      return { previousNotes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: (err, id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
  });
};

export const useUpgradeTenant = (): UseMutationResult<
  { message: string; tenant: Tenant },
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; tenant: Tenant }, Error, string>({
    mutationFn: api.upgradeTenant,
    onSuccess: () => {
      toast.success("Successfully upgraded to PRO!");

      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: () => {
      toast.error("Upgrade failed. Please try again.");
    },
  });
};

export const useOrganizationUsers = (
  enabled: boolean = true
): UseQueryResult<any[], Error> => {
  return useQuery<any[]>({
    queryKey: ["organizationUsers"],
    queryFn: () => api.getOrganizationUsers(),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

export const useRemoveUser = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: api.removeOrganizationUser,
    onSuccess: () => {
      toast.success("User removed successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
      queryClient.invalidateQueries({ queryKey: ["organizationStats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove user");
    },
  });
};

export const useInviteUser = (): UseMutationResult<
  any,
  Error,
  { email: string; role: "admin" | "member"; password?: string }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { email: string; role: "admin" | "member"; password?: string }
  >({
    mutationFn: api.inviteUser,
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      queryClient.invalidateQueries({ queryKey: ["organizationStats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });
};

export const useSearchNotes = (
  query: string,
  filters?: {
    tags?: string[];
    startDate?: string;
    endDate?: string;
    authorId?: string;
  }
): UseQueryResult<Note[], Error> => {
  return useQuery<Note[]>({
    queryKey: ["notes", "search", query, filters],
    queryFn: () => api.searchNotes(query, filters),
    enabled: query.length > 0 || (filters && Object.keys(filters).length > 0),
    staleTime: 1000 * 60,
    placeholderData: previousData => previousData as Note[],
  });
};

export const useAIAction = (): UseMutationResult<
  string,
  Error,
  {
    option: "summarize" | "rewrite" | "brainstorm" | "improve";
    context: string;
    prompt?: string;
  }
> => {
  return useMutation<
    string,
    Error,
    {
      option: "summarize" | "rewrite" | "brainstorm" | "improve";
      context: string;
      prompt?: string;
    }
  >({
    mutationFn: async ({
      option,
      context,
      prompt,
    }: {
      option: "summarize" | "rewrite" | "brainstorm" | "improve";
      context: string;
      prompt?: string;
    }): Promise<string> => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ option, context, prompt }),
      });
      if (!response.ok) throw new Error("AI request failed");
      return response.text();
    },
    onError: () => {
      toast.error("AI Assistant is currently unavailable");
    },
  });
};

export const useToggleShare = (): UseMutationResult<
  SharedNote | null,
  Error,
  { id: string; enabled: boolean }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    SharedNote | null,
    Error,
    { id: string; enabled: boolean }
  >({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.toggleShareNote(id, enabled),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["notes", id] });
      toast.success("Sharing settings updated");
    },
    onError: () => {
      toast.error("Failed to update sharing settings");
    },
  });
};

export const useToggleShareFolder = (): UseMutationResult<
  any,
  Error,
  { id: string; enabled: boolean; expires_in?: string }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { id: string; enabled: boolean; expires_in?: string }
  >({
    mutationFn: ({
      id,
      enabled,
      expires_in,
    }: {
      id: string;
      enabled: boolean;
      expires_in?: string;
    }) => api.toggleShareFolder(id, enabled, expires_in),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder sharing updated");
    },
    onError: () => {
      toast.error("Failed to update folder sharing");
    },
  });
};
