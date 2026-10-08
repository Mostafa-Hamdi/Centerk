'use client';

import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import { Ban, Download, Plus, Printer, Receipt, Trash2, Users, Wallet } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { BulkActionsBar } from '@/components/data/BulkActionsBar';
import { DataTable } from '@/components/data/DataTable';
import { FilterBar } from '@/components/data/FilterBar';
import { Pagination } from '@/components/data/Pagination';
import { SearchInput } from '@/components/data/SearchInput';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { toast } from '@/components/feedback/toast';
import { FormField } from '@/components/form/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { ar } from '@/i18n/ar';
import { formatMoney, formatNumber } from '@/lib/format';

interface DemoStudent {
  id: string;
  name: string;
  group: string;
  balance: number;
  status: 'Active' | 'Paused';
}

const groups = ['كيمياء ٣ث', 'فيزياء ٢ث', 'أحياء ٣ث'];
const names = [
  'سلمى إبراهيم نصر',
  'يوسف أحمد سالم',
  'مريم خالد عادل',
  'عمر طارق حسن',
  'نور محمد علي',
  'آدم سامح فؤاد',
];
const demoRows: DemoStudent[] = Array.from({ length: 24 }, (_, index) => ({
  id: `s-${index + 1}`,
  name: names[index % names.length] ?? '',
  group: groups[index % groups.length] ?? '',
  balance: (index * 137) % 900,
  status: index % 5 === 0 ? 'Paused' : 'Active',
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <h2 className="mb-5 font-display text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** Every shared component in its states — Phase 2 review page. */
export function Showcase() {
  const [confirm, setConfirm] = useState<'delete' | 'void' | 'typed' | null>(null);
  const [otp, setOtp] = useState('');
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [group, setGroup] = useState<string>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState<RowSelectionState>({});

  const filtered = demoRows.filter(
    (row) => (!search || row.name.includes(search)) && (!group || row.group === group),
  );
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const columns = useMemo<ColumnDef<DemoStudent>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'الطالب',
        cell: (info) => <span className="font-medium">{info.getValue<string>()}</span>,
      },
      { accessorKey: 'group', header: 'المجموعة', enableSorting: false },
      {
        accessorKey: 'balance',
        header: 'المستحق',
        meta: { className: 'tabular' },
        cell: (info) => formatMoney(info.getValue<number>()),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        enableSorting: false,
        cell: (info) =>
          info.getValue<string>() === 'Active' ? (
            <Badge tone="success" dot>
              نشط
            </Badge>
          ) : (
            <Badge tone="warning" dot>
              موقوف
            </Badge>
          ),
      },
    ],
    [],
  );
  const selectedCount = Object.keys(selection).length;

  return (
    <div className="flex flex-col gap-(--shell-gap) pb-24">
      <h1 className="font-display text-2xl font-bold text-ink">مكتبة المكونات</h1>

      <Section title="الأزرار — اللون بيوضّح الغرض">
        <div className="flex flex-wrap gap-3">
          <Button iconStart={<Plus />}>إضافة طالب</Button>
          <Button variant="success" iconStart={<Wallet />}>
            تحصيل دفعة
          </Button>
          <Button variant="danger" iconStart={<Trash2 />} onClick={() => setConfirm('delete')}>
            حذف
          </Button>
          <Button variant="warning">تأجيل الحصة</Button>
          <Button variant="info" iconStart={<Printer />}>
            طباعة
          </Button>
          <Button variant="neutral">إلغاء</Button>
          <Button variant="ghost">رجوع</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">صغير</Button>
          <Button size="lg">كبير</Button>
          <Button loading>جارِ الحفظ</Button>
          <Button disabled>معطّل</Button>
          <Button variant="danger" iconStart={<Ban />} onClick={() => setConfirm('void')}>
            إلغاء إيصال
          </Button>
          <Button variant="neutral" onClick={() => setConfirm('typed')}>
            حذف عالي الخطورة
          </Button>
        </div>
      </Section>

      <Section title="الإشعارات (Toaster)">
        <div className="flex flex-wrap gap-3">
          <Button variant="success" onClick={() => toast.success('تم الحفظ', 'اتضاف الطالب بنجاح')}>
            نجاح
          </Button>
          <Button
            variant="danger"
            onClick={() => toast.error('فشل الحفظ', 'رقم الموبايل مسجّل قبل كده')}
          >
            خطأ
          </Button>
          <Button
            variant="warning"
            onClick={() => toast.warning('تنبيه', 'الخزنة مفتوحة من ٨ ساعات')}
          >
            تحذير
          </Button>
          <Button variant="info" onClick={() => toast.info('معلومة', 'التقرير هيوصلك على واتساب')}>
            معلومة
          </Button>
          <Button
            variant="neutral"
            onClick={() =>
              void toast
                .promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                  loading: 'جارِ إرسال التذكير…',
                  success: 'اتبعت التذكير لـ ١٢ ولي أمر',
                  error: 'فشل الإرسال',
                })
                .catch(() => undefined)
            }
          >
            Promise
          </Button>
        </div>
      </Section>

      <Section title="حقول الإدخال">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="اسم الطالب" required hint="الاسم رباعي">
            {(control) => <Input {...control} placeholder="سلمى إبراهيم نصر" />}
          </FormField>
          <FormField label="رقم الموبايل" error="اكتب رقم موبايل مصري صحيح">
            {(control) => <Input {...control} dir="ltr" defaultValue="0101" />}
          </FormField>
          <FormField label="المجموعة">
            {(control) => (
              <Select
                {...control}
                value={group}
                onValueChange={setGroup}
                placeholder="اختار المجموعة"
                options={groups.map((g) => ({ value: g, label: g }))}
              />
            )}
          </FormField>
          <FormField label="ملاحظات">{(control) => <Textarea {...control} rows={2} />}</FormField>
          <div className="flex flex-wrap items-center gap-6">
            <Switch
              checked={switchOn}
              onCheckedChange={setSwitchOn}
              label="إرسال إشعار لولي الأمر"
            />
            <Checkbox checked={checked} onCheckedChange={setChecked} label="خصم أخوات" />
          </div>
          <div className="max-w-xs">
            <OtpInput
              value={otp}
              onChange={setOtp}
              label="كود التأكيد"
              onComplete={(code) => toast.info(`الكود ${code}`)}
            />
          </div>
        </div>
      </Section>

      <Section title="البطاقات والمؤشرات">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="تحصيل النهارده"
            value={formatMoney(12450)}
            icon={Receipt}
            tone="success"
            trend={{ label: '+١٢٪ عن امبارح', direction: 'up' }}
          />
          <StatCard
            label="الطلاب النشطين"
            value={formatNumber(486)}
            icon={Users}
            trend={{ label: '+٨ الأسبوع ده', direction: 'up' }}
          />
          <StatCard
            label="المستحقات المفتوحة"
            value={formatMoney(31800)}
            icon={Wallet}
            tone="warning"
            trend={{ label: '٤٢ طالب', direction: 'down', positive: true }}
          />
          <Card interactive className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </Card>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>محايد</Badge>
          <Badge tone="primary">جديد</Badge>
          <Badge tone="info">قيد الانتظار</Badge>
          <Badge tone="success" dot>
            مدفوع
          </Badge>
          <Badge tone="warning" dot>
            متأخر
          </Badge>
          <Badge tone="danger" dot>
            ملغي
          </Badge>
        </div>
      </Section>

      <Section title="جدول البيانات + فلاتر + تحديد جماعي">
        <div className="flex flex-col gap-4">
          <FilterBar
            search={
              <SearchInput
                value={search}
                onSearch={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
            }
            filters={
              <Select
                value={group}
                onValueChange={(value) => {
                  setGroup(value);
                  setPage(1);
                }}
                placeholder="كل المجموعات"
                options={groups.map((g) => ({ value: g, label: g }))}
                aria-label="المجموعة"
              />
            }
            activeFilters={group ? [{ key: 'group', label: `المجموعة: ${group}` }] : []}
            onRemoveFilter={() => setGroup(undefined)}
            onClearAll={() => {
              setGroup(undefined);
              setSearch('');
            }}
            actions={
              <Button variant="info" iconStart={<Download />}>
                تصدير
              </Button>
            }
          />
          <DataTable
            caption="الطلاب (بيانات تجريبية)"
            data={pageRows}
            columns={columns}
            getRowId={(row) => row.id}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={selection}
            onRowSelectionChange={setSelection}
            empty={
              <EmptyState
                title="مفيش نتائج مطابقة"
                description="جرّب تغيّر البحث أو تمسح الفلاتر"
              />
            }
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={filtered.length}
            totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </Section>

      <Section title="حالات التحميل والخطأ">
        <div className="grid gap-4 md:grid-cols-2">
          <DataTable
            caption="تحميل"
            data={undefined}
            columns={columns}
            getRowId={(row) => row.id}
            isLoading
            skeletonRows={3}
          />
          <ErrorState
            title="مقدرناش نحمّل البيانات"
            description="تعذّر الاتصال بالخادم"
            onRetry={() => toast.info('إعادة المحاولة')}
          />
        </div>
      </Section>

      <BulkActionsBar count={selectedCount} onClear={() => setSelection({})}>
        <Button size="sm" variant="info" iconStart={<Download />}>
          تصدير المحدد
        </Button>
        <Button
          size="sm"
          variant="danger"
          iconStart={<Trash2 />}
          onClick={() => setConfirm('delete')}
        >
          حذف
        </Button>
      </BulkActionsBar>

      <ConfirmDialog
        open={confirm === 'delete'}
        onOpenChange={(open) => !open && setConfirm(null)}
        itemName="سلمى إبراهيم نصر"
        description="هيتشال من كل المجموعات، والإيصالات القديمة هتفضل في السجل."
        onConfirm={() =>
          new Promise((resolve) => setTimeout(resolve, 900)).then(() => toast.success('تم الحذف'))
        }
      />
      <ConfirmDialog
        open={confirm === 'void'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="إلغاء الإيصال"
        itemName="إيصال 2026-10-0482"
        questionPrefix={ar.confirm.voidPrefix}
        description="الإيصال هيفضل في السجل بحالة «ملغي» والمبلغ هيرجع للمستحقات."
        confirmLabel="إلغاء الإيصال"
        requireReason
        onConfirm={(reason) =>
          Promise.resolve().then(() => toast.success('تم إلغاء الإيصال', reason))
        }
      />
      <ConfirmDialog
        open={confirm === 'typed'}
        onOpenChange={(open) => !open && setConfirm(null)}
        itemName="فرع سموحة"
        description="هيتقفل الفرع وكل مجموعاته."
        requireTypedName
        onConfirm={() => Promise.resolve().then(() => toast.success('تم الحذف'))}
      />
    </div>
  );
}
