'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

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

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getWorkspacesSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('workspaces_list') || '';
}

function getActiveWorkspaceIdSnapshot(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('active_workspace_id') || '';
}

function getServerSnapshot(): string {
  return '';
}

function setActiveWorkspace(ws: Workspace) {
  try {
    localStorage.setItem('active_workspace_id', ws.id);
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const workspacesRaw = useSyncExternalStore(subscribe, getWorkspacesSnapshot, getServerSnapshot);
  const activeIdRaw = useSyncExternalStore(
    subscribe,
    getActiveWorkspaceIdSnapshot,
    getServerSnapshot
  );

  const workspaces = useMemo(() => {
    if (!isMounted || !workspacesRaw) return DEFAULT_WORKSPACES;
    try {
      return (JSON.parse(workspacesRaw) as Workspace[]) || DEFAULT_WORKSPACES;
    } catch {
      return DEFAULT_WORKSPACES;
    }
  }, [isMounted, workspacesRaw]);

  const activeWorkspace = useMemo(() => {
    if (!isMounted) return DEFAULT_WORKSPACES[0];
    if (!activeIdRaw) return workspaces[0] || null;
    return workspaces.find((w) => w.id === activeIdRaw) || workspaces[0] || null;
  }, [isMounted, activeIdRaw, workspaces]);

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
    try {
      localStorage.setItem('workspaces_list', JSON.stringify(updated));
      localStorage.setItem('active_workspace_id', newWs.id);
      window.dispatchEvent(new Event('storage'));
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
        isLoaded: isMounted
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
