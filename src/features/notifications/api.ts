import { api } from '@/services/api';

/** Not in backend-spec — see docs/api-gaps.md #8. Served by the mock until the backend adds it. */
export interface NotificationDto {
  id: string;
  title: string;
  body: string;
  type: 'Payment' | 'Attendance' | 'Alert' | 'System';
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

export interface NotificationsResponse {
  items: NotificationDto[];
  unreadCount: number;
}

const notificationsApi = api.enhanceEndpoints({ addTagTypes: ['Notification'] }).injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationsResponse, undefined>({
      query: () => '/notifications?page=1&pageSize=10',
      providesTags: ['Notification'],
      keepUnusedDataFor: 300,
    }),
    markAllNotificationsRead: build.mutation<undefined, undefined>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      // Optimistic: flip everything to read, roll back on failure.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            draft.items.forEach((item) => {
              item.isRead = true;
            });
            draft.unreadCount = 0;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAllNotificationsReadMutation } = notificationsApi;
