import { api } from '@/services/api';
import type { MaterialRequest } from '@/services/generated/backend';
import { normalizePaged, read, readNumber, readString } from '@/services/normalize';
import { toQueryParams, type ListParams, type Paged } from '@/services/types';

/** Materials & stock — live /materials, /stock-movements, /material-deliveries. */
export interface MaterialDto {
  id: string;
  name: string;
  gradeLevelId: string | null;
  price: number;
  stockQty: number;
  minStockAlert: number;
  includedInSubscription: boolean;
  isActive: boolean;
}

export type MovementType = 'In' | 'Out' | 'Damaged' | 'Adjustment';
export const MOVEMENT_TYPES: readonly MovementType[] = ['In', 'Out', 'Damaged', 'Adjustment'];

export interface StockMovementDto {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: string | null;
}

export type DeliveryPayment = 'Free' | 'Owed';

export interface DeliveryDto {
  id: string;
  studentId: string | null;
  studentName: string | null;
  deliveredAt: string | null;
  paymentStatus: string;
  chargeId: string | null;
}

export const isLowStock = (material: MaterialDto) => material.stockQty <= material.minStockAlert;

function normalizeMaterial(raw: unknown, index = 0): MaterialDto {
  return {
    id: readString(raw, 'id') ?? `material-${index}`,
    name: readString(raw, 'name') ?? '—',
    gradeLevelId: readString(raw, 'gradeLevelId'),
    price: readNumber(raw, 'price') ?? 0,
    stockQty: readNumber(raw, 'stockQty') ?? 0,
    minStockAlert: readNumber(raw, 'minStockAlert') ?? 0,
    includedInSubscription: read(raw, 'includedInSubscription') === true,
    isActive: read(raw, 'isActive') !== false,
  };
}

function normalizeMovement(raw: unknown, index: number): StockMovementDto {
  return {
    id: readString(raw, 'id') ?? `movement-${index}`,
    type: readString(raw, 'type') ?? '—',
    quantity: readNumber(raw, 'quantity') ?? 0,
    note: readString(raw, 'note'),
    createdAt: readString(raw, 'createdAtUtc'),
  };
}

function normalizeDelivery(raw: unknown, index: number): DeliveryDto {
  const source = read(raw, 'delivery') ?? raw;
  return {
    id: readString(source, 'id') ?? `delivery-${index}`,
    studentId: readString(source, 'studentId'),
    studentName: readString(raw, 'studentName', 'student.fullName', 'delivery.studentName'),
    deliveredAt: readString(source, 'deliveredAtUtc'),
    paymentStatus: readString(source, 'paymentStatus') ?? '—',
    chargeId: readString(source, 'chargeId'),
  };
}

export interface MaterialsParams extends ListParams {
  lowStock?: boolean;
}

export type MaterialInput = Required<Omit<MaterialRequest, 'gradeLevelId'>> & {
  gradeLevelId?: string;
};

const materialsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMaterials: build.query<Paged<MaterialDto>, MaterialsParams>({
      query: ({ lowStock, ...params }) => ({
        url: '/materials',
        params: { ...toQueryParams(params), ...(lowStock ? { lowStock: true } : {}) },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeMaterial, params, 'materials'),
      providesTags: [{ type: 'Material', id: 'LIST' }],
    }),
    getMaterial: build.query<MaterialDto, string>({
      query: (id) => `/materials/${encodeURIComponent(id)}`,
      transformResponse: (raw: unknown) => normalizeMaterial(raw),
      providesTags: (_result, _error, id) => [{ type: 'Material', id }],
    }),
    createMaterial: build.mutation<MaterialDto, MaterialInput>({
      query: (body) => ({ url: '/materials', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeMaterial(raw),
      invalidatesTags: [{ type: 'Material', id: 'LIST' }],
    }),
    updateMaterial: build.mutation<MaterialDto, MaterialInput & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/materials/${encodeURIComponent(id)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (raw: unknown) => normalizeMaterial(raw),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Material', id },
        { type: 'Material', id: 'LIST' },
      ],
    }),
    deleteMaterial: build.mutation<undefined, string>({
      query: (id) => ({ url: `/materials/${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Material', id: 'LIST' }],
    }),
    duplicateMaterial: build.mutation<MaterialDto, string>({
      query: (id) => ({ url: `/materials/${encodeURIComponent(id)}/duplicate`, method: 'POST' }),
      transformResponse: (raw: unknown) => normalizeMaterial(raw),
      invalidatesTags: [{ type: 'Material', id: 'LIST' }],
    }),

    getStockMovements: build.query<Paged<StockMovementDto>, ListParams & { materialId: string }>({
      query: ({ materialId, ...params }) => ({
        url: '/stock-movements',
        params: { ...toQueryParams(params), materialId },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeMovement, params, 'stock-movements'),
      providesTags: (_result, _error, { materialId }) => [
        { type: 'Material', id: `MOVES-${materialId}` },
      ],
    }),
    addStockMovement: build.mutation<
      undefined,
      { materialId: string; type: MovementType; quantity: number; note: string }
    >({
      query: (body) => ({ url: '/stock-movements', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { materialId }) => [
        { type: 'Material', id: materialId },
        { type: 'Material', id: `MOVES-${materialId}` },
        { type: 'Material', id: 'LIST' },
      ],
    }),

    getDeliveries: build.query<Paged<DeliveryDto>, ListParams & { materialId: string }>({
      query: ({ materialId, ...params }) => ({
        url: '/material-deliveries',
        params: { ...toQueryParams(params), materialId },
      }),
      transformResponse: (raw: unknown, _meta, params) =>
        normalizePaged(raw, normalizeDelivery, params, 'material-deliveries'),
      providesTags: (_result, _error, { materialId }) => [
        { type: 'Material', id: `DELIVERIES-${materialId}` },
      ],
    }),
    deliverMaterial: build.mutation<
      undefined,
      { materialId: string; studentId: string; paymentStatus: DeliveryPayment }
    >({
      query: (body) => ({ url: '/material-deliveries', method: 'POST', body }),
      transformResponse: () => undefined,
      invalidatesTags: (_result, _error, { materialId }) => [
        { type: 'Material', id: materialId },
        { type: 'Material', id: `DELIVERIES-${materialId}` },
        { type: 'Material', id: `MOVES-${materialId}` },
        { type: 'Material', id: 'LIST' },
        'Due',
      ],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useDuplicateMaterialMutation,
  useGetStockMovementsQuery,
  useAddStockMovementMutation,
  useGetDeliveriesQuery,
  useDeliverMaterialMutation,
} = materialsApi;
