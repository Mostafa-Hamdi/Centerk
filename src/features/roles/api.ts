import { api } from '@/services/api';
import type { RoleRequest } from '@/services/generated/backend';
import { normalizePaged, read, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Roles & permissions — live /roles, /roles/system, /permissions (catalogue grouped by module). */
export type BaseRole = Exclude<RoleRequest['baseRole'], null>;
export const BASE_ROLES: readonly BaseRole[] = [
  'BranchManager',
  'Teacher',
  'Assistant',
  'Receptionist',
  'Accountant',
];

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  baseRole: string;
  dataScope: string | null;
  codes: string[];
  isActive: boolean;
  isSystem: boolean;
}

export interface SystemRoleDto {
  name: string;
  dataScope: string | null;
  isOwner: boolean;
}

export interface PermissionModuleDto {
  module: string;
  permissions: { code: string; action: string }[];
}

export interface RoleInput {
  name: string;
  description: string | null;
  baseRole: BaseRole;
  codes: string[];
  isActive: boolean;
}

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? (value as unknown[]).filter((item): item is string => typeof item === 'string')
    : [];

const normalizeRole = (raw: unknown, index = 0): RoleDto => ({
  id: readString(raw, 'id') ?? `role-${index}`,
  name: readString(raw, 'name') ?? '—',
  description: readString(raw, 'description'),
  baseRole: readString(raw, 'baseRole') ?? '—',
  dataScope: readString(raw, 'dataScope'),
  codes: strings(read(raw, 'codes')),
  isActive: read(raw, 'isActive') !== false,
  isSystem: read(raw, 'isSystem') === true,
});

const rolesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<Paged<RoleDto>, ListParams>({
      query: (params) => ({ url: '/roles', params: toQueryParams(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeRole, params, 'roles'),
      providesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    getSystemRoles: build.query<SystemRoleDto[], undefined>({
      query: () => '/roles/system',
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[]).map((item) => ({
              name: readString(item, 'name') ?? '—',
              dataScope: readString(item, 'dataScope'),
              isOwner: read(item, 'isOwner') === true,
            }))
          : [],
      keepUnusedDataFor: 60 * 60,
    }),
    getPermissionCatalogue: build.query<PermissionModuleDto[], undefined>({
      query: () => '/permissions',
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[])
              .map((group) => {
                const permissions = read(group, 'permissions');
                return {
                  module: readString(group, 'module') ?? '—',
                  permissions: Array.isArray(permissions)
                    ? (permissions as unknown[])
                        .map((item) => ({
                          code: readString(item, 'code') ?? '',
                          action: readString(item, 'action') ?? '',
                        }))
                        .filter((item) => item.code)
                    : [],
                };
              })
              .filter((group) => group.permissions.length)
          : [],
      keepUnusedDataFor: 60 * 60,
    }),
    getRole: build.query<RoleDto, string>({
      query: (id) => `/roles/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeRole(raw),
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),
    saveRole: build.mutation<RoleDto, RoleInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/roles/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/roles', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeRole(raw),
      // A role edit can change the signed-in user's own permissions.
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id: 'LIST' },
        ...(id ? [{ type: 'Role' as const, id }] : []),
        'Me',
      ],
    }),
    roleAction: build.mutation<undefined, { id: string; action: 'duplicate' | 'delete' }>({
      query: ({ id, action }) =>
        action === 'delete'
          ? { url: `/roles/${encodeURIComponent(id)}`, method: 'DELETE' }
          : { url: `/roles/${encodeURIComponent(id)}/duplicate`, method: 'POST' },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetSystemRolesQuery,
  useGetPermissionCatalogueQuery,
  useGetRoleQuery,
  useSaveRoleMutation,
  useRoleActionMutation,
} = rolesApi;
