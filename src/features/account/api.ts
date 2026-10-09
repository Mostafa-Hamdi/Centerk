import { api } from '@/services/api';
import { readString } from '@/services/normalize';

/** Account & membership helpers — PUT /me/password, /users/{id}/roles, group roster + enroll. */
export interface GroupStudentDto {
  id: string;
  fullName: string;
  code: string | null;
  status: string | null;
}

const accountApi = api.injectEndpoints({
  endpoints: (build) => ({
    changePassword: build.mutation<undefined, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/me/password', method: 'PUT', body }),
      transformResponse: () => undefined,
    }),
    /** Custom role for a staff member (PUT) or back to the base role (DELETE). */
    setUserRole: build.mutation<
      undefined,
      { userId: string; roleId: string | null; branchId?: string }
    >({
      query: ({ userId, roleId, branchId }) =>
        roleId
          ? {
              url: `/users/${encodeURIComponent(userId)}/roles`,
              method: 'PUT',
              body: { roleId, branchId },
            }
          : { url: `/users/${encodeURIComponent(userId)}/roles`, method: 'DELETE' },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Staff', id: userId }, 'Me'],
    }),
    getGroupStudents: build.query<GroupStudentDto[], string>({
      query: (groupId) => `/groups/${encodeURIComponent(groupId)}/students`,
      transformResponse: (raw: unknown) =>
        Array.isArray(raw)
          ? (raw as unknown[]).map((item, index) => ({
              id: readString(item, 'id') ?? `student-${index}`,
              fullName: readString(item, 'fullName') ?? '—',
              code: readString(item, 'code'),
              status: readString(item, 'status'),
            }))
          : [],
      providesTags: (_result, _error, groupId) => [{ type: 'Group', id: `STUDENTS-${groupId}` }],
    }),
    /** POST /students/{id}/enrollments — may answer 409 group-full (or put the student on the waitlist). */
    enrollStudent: build.mutation<undefined, { studentId: string; groupId: string }>({
      query: ({ studentId, groupId }) => ({
        url: `/students/${encodeURIComponent(studentId)}/enrollments`,
        method: 'POST',
        body: { groupId },
      }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { groupId, studentId }) => [
        { type: 'Group', id: `STUDENTS-${groupId}` },
        { type: 'Group', id: groupId },
        { type: 'Student', id: studentId },
        'Due',
      ],
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useSetUserRoleMutation,
  useGetGroupStudentsQuery,
  useEnrollStudentMutation,
} = accountApi;
