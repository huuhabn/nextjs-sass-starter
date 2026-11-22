'use client';

import React, { createContext, useContext, useState } from 'react';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  plan: 'free' | 'pro' | 'enterprise';
  imageUrl?: string;
  membersCount: number;
}

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-personal',
    name: 'Personal Workspace',
    slug: 'personal',
    role: 'owner',
    plan: 'pro',
    membersCount: 1
  },
  {
    id: 'ws-acme',
    name: 'Acme Corp',
    slug: 'acme',
    role: 'admin',
    plan: 'enterprise',
    membersCount: 8
  }
];

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => Workspace;
  isLoaded: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

function getInitialWorkspaces(): Workspace[] {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACES;
  try {
    const savedList = localStorage.getItem('workspaces_list');
    if (savedList) return JSON.parse(savedList);
  } catch {}
  return DEFAULT_WORKSPACES;
}

function getInitialActiveWorkspace(list: Workspace[]): Workspace | null {
  if (typeof window === 'undefined') return list[0] || null;
  try {
    const savedId = localStorage.getItem('active_workspace_id');
    const match = list.find((w) => w.id === savedId);
    if (match) return match;
  } catch {}
  return list[0] || null;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(getInitialWorkspaces);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(() =>
    getInitialActiveWorkspace(workspaces)
  );
  const [isLoaded] = useState(true);

  const setActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    try {
      localStorage.setItem('active_workspace_id', ws.id);
    } catch {}
  };

  const createWorkspace = (name: string): Workspace => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      slug,
      role: 'owner',
      plan: 'free',
      membersCount: 1
    };
    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    setActiveWorkspace(newWs);
    try {
      localStorage.setItem('workspaces_list', JSON.stringify(updated));
    } catch {}
    return newWs;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace,
        isLoaded
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      workspaces: DEFAULT_WORKSPACES,
      activeWorkspace: DEFAULT_WORKSPACES[0],
      setActiveWorkspace: () => {},
      createWorkspace: (_name: string) => DEFAULT_WORKSPACES[0],
      isLoaded: true
    };
  }
  return context;
}
