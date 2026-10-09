import { api } from '@/services/api';
import type {
  AutomationRequest,
  CampaignRequest,
  TemplateRequest,
} from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Messaging — live /messages (outbox), /campaigns, /message-templates, /automation-rules. */
type NonNull<T> = Exclude<T, null>;
export type Channel = NonNull<TemplateRequest['channel']>;
export type TemplateType = NonNull<TemplateRequest['type']>;
export type TemplateLanguage = NonNull<TemplateRequest['language']>;
export type AutomationEvent = NonNull<AutomationRequest['event']>;
export type AutomationTiming = NonNull<AutomationRequest['timing']>;

export const CHANNELS: readonly Channel[] = ['WhatsApp', 'Sms', 'Push'];
export const TEMPLATE_TYPES: readonly TemplateType[] = [
  'Attendance',
  'Absence',
  'Grade',
  'Payment',
  'General',
  'Otp',
];
export const LANGUAGES: readonly TemplateLanguage[] = ['ar', 'en'];
export const AUTOMATION_EVENTS: readonly AutomationEvent[] = [
  'AttendanceRecorded',
  'SessionClosedAbsent',
  'GradePublished',
  'PaymentOverdue7d',
  'ConsecutiveAbsences2',
  'SessionCancelled',
  'SessionPostponed',
  'PaymentReceived',
];
export const AUTOMATION_TIMINGS: readonly AutomationTiming[] = ['Immediate', 'After1Hour', 'At21'];

export interface OutboxMessageDto {
  id: string;
  channel: string;
  kind: string | null;
  recipientPhone: string | null;
  body: string;
  status: string;
  createdAt: string | null;
}

export interface CampaignDto {
  id: string;
  title: string;
  body: string;
  channel: string;
  status: string;
  scheduledAt: string | null;
  recipientCount: number;
  studentIds: string[];
}

export interface TemplateDto {
  id: string;
  name: string;
  type: string;
  channel: string;
  body: string;
  whatsAppTemplateName: string | null;
  language: string;
  isActive: boolean;
  isSystem: boolean;
}

export interface AutomationRuleDto {
  id: string;
  name: string;
  event: string;
  templateId: string | null;
  timing: string;
  isActive: boolean;
}

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? (value as unknown[]).filter((item): item is string => typeof item === 'string')
    : [];

const normalizeOutbox = (raw: unknown, index: number): OutboxMessageDto => ({
  id: readString(raw, 'id') ?? `message-${index}`,
  channel: readString(raw, 'channel') ?? '—',
  kind: readString(raw, 'kind'),
  recipientPhone: readString(raw, 'recipientPhone'),
  body: readString(raw, 'body') ?? '',
  status: readString(raw, 'status') ?? '—',
  createdAt: readString(raw, 'createdAtUtc'),
});

const normalizeCampaign = (raw: unknown, index = 0): CampaignDto => ({
  id: readString(raw, 'id') ?? `campaign-${index}`,
  title: readString(raw, 'title') ?? '—',
  body: readString(raw, 'body') ?? '',
  channel: readString(raw, 'channel') ?? 'WhatsApp',
  status: readString(raw, 'status') ?? 'Draft',
  scheduledAt: readString(raw, 'scheduledAtUtc'),
  recipientCount: readNumber(raw, 'recipientCount') ?? strings(read(raw, 'studentIds')).length,
  studentIds: strings(read(raw, 'studentIds')),
});

const normalizeTemplate = (raw: unknown, index = 0): TemplateDto => ({
  id: readString(raw, 'id') ?? `template-${index}`,
  name: readString(raw, 'name') ?? '—',
  type: readString(raw, 'type') ?? 'General',
  channel: readString(raw, 'channel') ?? 'WhatsApp',
  body: readString(raw, 'body') ?? '',
  whatsAppTemplateName: readString(raw, 'whatsAppTemplateName'),
  language: readString(raw, 'language') ?? 'ar',
  isActive: read(raw, 'isActive') !== false,
  isSystem: read(raw, 'isSystem') === true,
});

const normalizeRule = (raw: unknown, index = 0): AutomationRuleDto => ({
  id: readString(raw, 'id') ?? `rule-${index}`,
  name: readString(raw, 'name') ?? '—',
  event: readString(raw, 'event') ?? '—',
  templateId: readString(raw, 'templateId'),
  timing: readString(raw, 'timing') ?? 'Immediate',
  isActive: read(raw, 'isActive') !== false,
});

const withInactive = (params: ListParams) => ({ ...toQueryParams(params), includeInactive: true });

export type CampaignInput = Omit<NonNullable<CampaignRequest>, 'channel' | 'studentIds'> & {
  channel: Channel;
  studentIds: string[];
};
export type TemplateInput = TemplateRequest & {
  type: TemplateType;
  channel: Channel;
  language: TemplateLanguage;
};
export type AutomationInput = AutomationRequest & {
  event: AutomationEvent;
  timing: AutomationTiming;
};

const messagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOutbox: build.query<Paged<OutboxMessageDto>, ListParams>({
      query: (params) => ({ url: '/messages', params: toQueryParams(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeOutbox, params, 'messages'),
      providesTags: [{ type: 'Message', id: 'LIST' }],
    }),

    getCampaigns: build.query<Paged<CampaignDto>, ListParams>({
      query: (params) => ({ url: '/campaigns', params: withInactive(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeCampaign, params, 'campaigns'),
      providesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),
    getCampaign: build.query<CampaignDto, string>({
      query: (id) => `/campaigns/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeCampaign(raw),
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),
    saveCampaign: build.mutation<CampaignDto, CampaignInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/campaigns/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/campaigns', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeCampaign(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Campaign', id: 'LIST' },
        ...(id ? [{ type: 'Campaign' as const, id }] : []),
      ],
    }),
    campaignAction: build.mutation<
      undefined,
      { id: string; action: 'send-now' | 'cancel' | 'duplicate' | 'delete' }
    >({
      query: ({ id, action }) =>
        action === 'delete'
          ? { url: `/campaigns/${encodeURIComponent(id)}`, method: 'DELETE' }
          : { url: `/campaigns/${encodeURIComponent(id)}/${action}`, method: 'POST' },
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { id, action }) => [
        { type: 'Campaign', id: 'LIST' },
        { type: 'Campaign', id },
        ...(action === 'send-now' ? [{ type: 'Message' as const, id: 'LIST' }] : []),
      ],
    }),

    getTemplates: build.query<Paged<TemplateDto>, ListParams>({
      query: (params) => ({ url: '/message-templates', params: withInactive(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeTemplate, params, 'message-templates'),
      providesTags: [{ type: 'MessageTemplate', id: 'LIST' }],
    }),
    getTemplate: build.query<TemplateDto, string>({
      query: (id) => `/message-templates/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeTemplate(raw),
      providesTags: (_result, _error, id) => [{ type: 'MessageTemplate', id }],
    }),
    saveTemplate: build.mutation<TemplateDto, TemplateInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/message-templates/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/message-templates', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeTemplate(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'MessageTemplate', id: 'LIST' },
        ...(id ? [{ type: 'MessageTemplate' as const, id }] : []),
      ],
    }),
    templateAction: build.mutation<undefined, { id: string; action: 'duplicate' | 'delete' }>({
      query: ({ id, action }) =>
        action === 'delete'
          ? { url: `/message-templates/${encodeURIComponent(id)}`, method: 'DELETE' }
          : { url: `/message-templates/${encodeURIComponent(id)}/duplicate`, method: 'POST' },
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'MessageTemplate', id: 'LIST' }],
    }),

    getAutomationRules: build.query<Paged<AutomationRuleDto>, ListParams>({
      query: (params) => ({ url: '/automation-rules', params: withInactive(params) }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeRule, params, 'automation-rules'),
      providesTags: [{ type: 'AutomationRule', id: 'LIST' }],
    }),
    getAutomationRule: build.query<AutomationRuleDto, string>({
      query: (id) => `/automation-rules/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeRule(raw),
      providesTags: (_result, _error, id) => [{ type: 'AutomationRule', id }],
    }),
    saveAutomationRule: build.mutation<AutomationRuleDto, AutomationInput & { id?: string }>({
      query: ({ id, ...body }) =>
        id
          ? { url: `/automation-rules/${encodeURIComponent(id)}`, method: 'PUT', body }
          : { url: '/automation-rules', method: 'POST', body },
      transformResponse: (raw: unknown) => normalizeRule(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AutomationRule', id: 'LIST' },
        ...(id ? [{ type: 'AutomationRule' as const, id }] : []),
      ],
    }),
    /** PATCH /automation-rules/{id}/active — optimistic toggle with rollback. */
    setAutomationActive: build.mutation<
      undefined,
      { id: string; isActive: boolean; params: ListParams }
    >({
      query: ({ id, isActive }) => ({
        url: `/automation-rules/${encodeURIComponent(id)}/active`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: () => undefined,
      async onQueryStarted({ id, isActive, params }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          messagesApi.util.updateQueryData('getAutomationRules', params, (draft) => {
            const rule = draft.items.find((item) => item.id === id);
            if (rule) rule.isActive = isActive;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'AutomationRule', id }],
    }),
    deleteAutomationRule: build.mutation<undefined, string>({
      query: (id) => ({ url: `/automation-rules/${encodeURIComponent(id)}`, method: 'DELETE' }),
      transformResponse: () => undefined,
      invalidatesTags: [{ type: 'AutomationRule', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOutboxQuery,
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useSaveCampaignMutation,
  useCampaignActionMutation,
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useSaveTemplateMutation,
  useTemplateActionMutation,
  useGetAutomationRulesQuery,
  useGetAutomationRuleQuery,
  useSaveAutomationRuleMutation,
  useSetAutomationActiveMutation,
  useDeleteAutomationRuleMutation,
} = messagesApi;
