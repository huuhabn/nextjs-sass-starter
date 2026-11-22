'use client';

/**
 * Fully client-side hook for filtering navigation items based on RBAC
 */

import { useMemo } from 'react';
import { authClient } from '@/lib/auth-client';
import { useWorkspace } from '@/lib/workspace-context';
import type { NavItem, NavGroup } from '@/types';

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const { activeWorkspace } = useWorkspace();
  const session = authClient.useSession();
  const user = session.data?.user;

  // Memoize context and permissions
  const accessContext = useMemo(() => {
    const role = activeWorkspace?.role || 'owner';
    const permissions: string[] = ['*'];

    return {
      organization: activeWorkspace ?? undefined,
      user: user ?? undefined,
      permissions,
      role,
      hasOrg: !!activeWorkspace,
      plan: activeWorkspace?.plan || 'pro'
    };
  }, [activeWorkspace, user]);

  // Filter items synchronously (all client-side)
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // No access restrictions
        if (!item.access) {
          return true;
        }

        // Check requireOrg
        if (item.access.requireOrg && !accessContext.hasOrg) {
          return false;
        }

        // Check permission
        if (item.access.permission) {
          if (!accessContext.hasOrg) {
            return false;
          }
          if (
            !accessContext.permissions.includes('*') &&
            !accessContext.permissions.includes(item.access.permission)
          ) {
            return false;
          }
        }

        // Check role
        if (item.access.role) {
          if (!accessContext.hasOrg) {
            return false;
          }
          if (accessContext.role !== item.access.role && accessContext.role !== 'owner') {
            return false;
          }
        }

        // Check plan
        if (item.access.plan) {
          if (item.access.plan === 'pro' && accessContext.plan === 'free') {
            return false;
          }
        }

        return true;
      })
      .map((item) => {
        // Recursively filter child items
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((childItem) => {
            if (!childItem.access) {
              return true;
            }

            if (childItem.access.requireOrg && !accessContext.hasOrg) {
              return false;
            }

            if (childItem.access.permission) {
              if (!accessContext.hasOrg) {
                return false;
              }
              if (
                !accessContext.permissions.includes('*') &&
                !accessContext.permissions.includes(childItem.access.permission)
              ) {
                return false;
              }
            }

            if (childItem.access.role) {
              if (!accessContext.hasOrg) {
                return false;
              }
              if (accessContext.role !== childItem.access.role && accessContext.role !== 'owner') {
                return false;
              }
            }

            return true;
          });

          return {
            ...item,
            items: filteredChildren
          };
        }

        return item;
      });
  }, [items, accessContext]);

  return filteredItems;
}

/**
 * Hook to filter navigation groups based on RBAC (fully client-side)
 *
 * @param groups - Array of navigation groups to filter
 * @returns Filtered groups (empty groups are removed)
 */
export function useFilteredNavGroups(groups: NavGroup[]) {
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const filteredItems = useFilteredNavItems(allItems);

  return useMemo(() => {
    const filteredSet = new Set(filteredItems.map((item) => item.title));
    return groups
      .map((group) => ({
        ...group,
        items: filteredItems.filter((item) =>
          group.items.some((gi) => gi.title === item.title && filteredSet.has(gi.title))
        )
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, filteredItems]);
}
