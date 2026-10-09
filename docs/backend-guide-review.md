# Backend guide review — what the frontend does not use, and what it still needs

_Source: `TeacherCenters_Frontend_Complete_Guide.html` (402 operations). Frontend: `main` @ latest. Date: 2026-10-09._

## Summary

|                                                     | Count |
| --------------------------------------------------- | ----: |
| Operations in the guide                             |   402 |
| Used by the frontend                                |   221 |
| Not used yet                                        |   181 |
| …of which list **export** / **bulk-delete** helpers |    44 |
| Frontend calls that do **not** exist in the guide   |  0 ✅ |

Every endpoint the frontend calls exists in the guide, so no page is pointing at a missing route.

## 1. Endpoints the frontend does not use (yet)

Each one is a frontend gap, not a backend problem. The **Plan** line under each module says which screen would use it.

### `/academic-terms` — 2

**Plan:** Settings → terms: export / bulk archive

| Method | Path                          | Guide summary                        |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/academic-terms/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/academic-terms/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/assignments` — 4

**Plan:** Assignments: edit, archive, export

| Method | Path                       | Guide summary                        |
| ------ | -------------------------- | ------------------------------------ |
| PUT    | `/assignments/{id}`        | تعديل عنصر كتالوج                    |
| DELETE | `/assignments/{id}`        | أرشفة عنصر غير مستخدم                |
| GET    | `/assignments/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/assignments/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/attendance` — 3

**Plan:** Attendance: correct / delete a record, offline sync

| Method | Path                     | Guide summary                 |
| ------ | ------------------------ | ----------------------------- |
| POST   | `/attendance/sync`       | مزامنة طابور الحضور الأوفلاين |
| PUT    | `/attendance/{recordId}` | تصحيح حالة حضور               |
| DELETE | `/attendance/{recordId}` | حذف سجل حضور بتدقيق           |

### `/audit-logs` — 1

**Plan:** Audit: Excel export

| Method | Path                 | Guide summary                    |
| ------ | -------------------- | -------------------------------- |
| GET    | `/audit-logs/export` | تصدير التدقيق بنفس فلاتر القائمة |

### `/automation-rules` — 2

**Plan:** Automation: export / bulk archive

| Method | Path                            | Guide summary                        |
| ------ | ------------------------------- | ------------------------------------ |
| GET    | `/automation-rules/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/automation-rules/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/branches` — 1

**Plan:** Settings → branches: bulk archive

| Method | Path                    | Guide summary                            |
| ------ | ----------------------- | ---------------------------------------- |
| POST   | `/branches/bulk-delete` | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة |

### `/campaigns` — 3

**Plan:** Campaigns: recipients preview before sending, export

| Method | Path                                 | Guide summary                        |
| ------ | ------------------------------------ | ------------------------------------ |
| GET    | `/campaigns/{id}/recipients/preview` | معاينة مستلمي الحملة                 |
| GET    | `/campaigns/export`                  | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/campaigns/bulk-delete`             | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/cash-shifts` — 1

**Plan:** Cash drawer: shift details page

| Method | Path                | Guide summary                |
| ------ | ------------------- | ---------------------------- |
| GET    | `/cash-shifts/{id}` | تفاصيل وردية ورصيدها المتوقع |

### `/centers` — 1

**Plan:** Centers: day grid of halls / sessions / bookings

| Method | Path                  | Guide summary                              |
| ------ | --------------------- | ------------------------------------------ |
| GET    | `/centers/halls-grid` | شبكة القاعات والحصص والحجوزات ليوم القاهرة |

### `/charges` — 6

**Plan:** Finance: student charges management (create, generate month, waive, correct)

| Method | Path                  | Guide summary              |
| ------ | --------------------- | -------------------------- |
| GET    | `/charges/{id}`       | تفاصيل مستحق ورصيده المسدد |
| PUT    | `/charges/{id}`       | تصحيح قيمة مستحق مع سبب    |
| DELETE | `/charges/{id}`       | إلغاء مستحق غير مستخدم     |
| POST   | `/charges/{id}/waive` | إعفاء من الرصيد المتبقي    |
| POST   | `/charges/generate`   | توليد رسوم شهر             |
| POST   | `/charges`            | إنشاء رسوم للطالب          |

### `/courses` — 2

**Plan:** Courses: export / bulk archive

| Method | Path                   | Guide summary                        |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/courses/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/courses/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/dashboard` — 2

**Plan:** Dashboard alerts: drill-down list + "notify" action

| Method | Path                                | Guide summary                |
| ------ | ----------------------------------- | ---------------------------- |
| GET    | `/dashboard/alerts/{type}/students` | طلاب تنبيه محدد              |
| POST   | `/dashboard/alerts/{type}/notify`   | وضع رسائل التنبيه في الطابور |

### `/discounts` — 5

**Plan:** Finance: discount catalogue

| Method | Path              | Guide summary         |
| ------ | ----------------- | --------------------- |
| GET    | `/discounts`      | قائمة الخصومات النشطة |
| POST   | `/discounts`      | إنشاء خصم             |
| GET    | `/discounts/{id}` | تفاصيل تعريف خصم      |
| PUT    | `/discounts/{id}` | تعديل تعريف خصم       |
| DELETE | `/discounts/{id}` | أرشفة تعريف خصم       |

### `/enrollments` — 2

**Plan:** Student profile: transfer / withdraw from a group

| Method | Path                         | Guide summary  |
| ------ | ---------------------------- | -------------- |
| POST   | `/enrollments/{id}/transfer` | نقل تسجيل طالب |
| DELETE | `/enrollments/{id}`          | سحب التسجيل    |

### `/excuses` — 3

**Plan:** Attendance: guardian excuses inbox (approve / reject)

| Method | Path                    | Guide summary      |
| ------ | ----------------------- | ------------------ |
| GET    | `/excuses`              | عرض الأعذار للموظف |
| POST   | `/excuses/{id}/approve` | اعتماد عذر         |
| POST   | `/excuses/{id}/reject`  | رفض عذر            |

### `/expense-categories` — 6

**Plan:** Expenses: categories management

| Method | Path                              | Guide summary                        |
| ------ | --------------------------------- | ------------------------------------ |
| POST   | `/expense-categories`             | إنشاء عنصر كتالوج                    |
| GET    | `/expense-categories/{id}`        | تفاصيل عنصر الكتالوج                 |
| PUT    | `/expense-categories/{id}`        | تعديل عنصر كتالوج                    |
| DELETE | `/expense-categories/{id}`        | أرشفة عنصر غير مستخدم                |
| GET    | `/expense-categories/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/expense-categories/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/grade-levels` — 2

**Plan:** Settings → grades: export / bulk archive

| Method | Path                        | Guide summary                        |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/grade-levels/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/grade-levels/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/groups` — 13

**Plan:** Groups: waitlist, recurrence, students tab, duplicate, generate sessions, export

| Method | Path                              | Guide summary                              |
| ------ | --------------------------------- | ------------------------------------------ |
| POST   | `/groups/bulk-delete`             | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة   |
| GET    | `/groups/export`                  | تصدير المجموعات بنفس فلاتر القائمة         |
| GET    | `/groups/{id}/waitlist`           | قائمة انتظار المجموعة                      |
| POST   | `/groups/{id}/waitlist`           | إضافة طالب لقائمة الانتظار                 |
| DELETE | `/groups/{id}/waitlist/{entryId}` | إزالة طالب من الانتظار                     |
| DELETE | `/groups/{id}`                    | أرشفة مجموعة                               |
| PUT    | `/groups/{id}/schedule`           | استبدال الجدول الأسبوعي                    |
| GET    | `/groups/{id}/recurrence`         | حالة تشغيل الحصص الدورية للمجموعة          |
| PUT    | `/groups/{id}/recurrence`         | تفعيل أو تعطيل توليد حصص المجموعة تلقائيًا |
| POST   | `/groups/{id}/recurrence/refresh` | تحديث نافذة الحصص الدورية الآن             |
| GET    | `/groups/{id}/students`           | طلاب المجموعة                              |
| POST   | `/groups/{id}/duplicate`          | نسخ تعريف مجموعة بدون الطلاب أو المواعيد   |
| POST   | `/groups/{id}/generate-sessions`  | توليد حصص من الجدول                        |

### `/hall-bookings` — 3

**Plan:** Hall bookings: edit, clashes view + resolve

| Method | Path                                  | Guide summary                              |
| ------ | ------------------------------------- | ------------------------------------------ |
| GET    | `/hall-bookings/clashes`              | تعارضات القاعات والمدرسين والمجموعات       |
| POST   | `/hall-bookings/clashes/{id}/resolve` | حل تعارض بإلغاء أو إعادة جدولة حجز لم يبدأ |
| PUT    | `/hall-bookings/{id}`                 | تعديل حجز لم يبدأ                          |

### `/halls` — 2

**Plan:** Halls: availability grid, bulk archive

| Method | Path                  | Guide summary                            |
| ------ | --------------------- | ---------------------------------------- |
| POST   | `/halls/bulk-delete`  | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة |
| GET    | `/halls/availability` | شبكة إشغال القاعات                       |

### `/lessons` — 6

**Plan:** Question bank: lessons management

| Method | Path                   | Guide summary                        |
| ------ | ---------------------- | ------------------------------------ |
| POST   | `/lessons`             | إنشاء عنصر كتالوج                    |
| GET    | `/lessons/{id}`        | تفاصيل عنصر الكتالوج                 |
| PUT    | `/lessons/{id}`        | تعديل عنصر كتالوج                    |
| DELETE | `/lessons/{id}`        | أرشفة عنصر غير مستخدم                |
| GET    | `/lessons/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/lessons/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/material-deliveries` — 3

**Plan:** Materials: delivery details, edit / cancel delivery

| Method | Path                        | Guide summary                           |
| ------ | --------------------------- | --------------------------------------- |
| GET    | `/material-deliveries/{id}` | تفاصيل تسليم ورصيده المالي              |
| PUT    | `/material-deliveries/{id}` | تعديل المسؤولية المالية لتسليم غير محصل |
| DELETE | `/material-deliveries/{id}` | إلغاء تسليم وإرجاع المخزون              |

### `/materials` — 2

**Plan:** Materials: export / bulk archive

| Method | Path                     | Guide summary                            |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/materials/bulk-delete` | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة |
| GET    | `/materials/export`      | تصدير المواد وحالة المخزون               |

### `/me` — 1

**Plan:** Profile menu: change password

| Method | Path           | Guide summary     |
| ------ | -------------- | ----------------- |
| PUT    | `/me/password` | تغيير كلمة المرور |

### `/message-templates` — 2

**Plan:** Templates: export / bulk archive

| Method | Path                             | Guide summary                        |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/message-templates/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/message-templates/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/messages` — 3

**Plan:** Messages log: details, resend failed, direct message

| Method | Path                    | Guide summary                     |
| ------ | ----------------------- | --------------------------------- |
| GET    | `/messages/{id}`        | تفاصيل رسالة من الطابور           |
| POST   | `/messages/{id}/resend` | إعادة رسالة فاشلة إلى الطابور     |
| POST   | `/messages/direct`      | وضع رسالة مباشرة لطالب في الطابور |

### `/messaging` — 1

**Plan:** Messages: usage counters

| Method | Path               | Guide summary        |
| ------ | ------------------ | -------------------- |
| GET    | `/messaging/usage` | عدادات طابور الرسائل |

### `/notifications` — 1

**Plan:** Notifications: mark one as read

| Method | Path                       | Guide summary    |
| ------ | -------------------------- | ---------------- |
| POST   | `/notifications/{id}/read` | قراءة إشعار واحد |

### `/payments` — 4

**Plan:** Receipts: PDF download, send by WhatsApp, correction, export

| Method | Path                          | Guide summary                        |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/payments/export`            | تصدير المدفوعات بدون تكرار الإيصالات |
| PUT    | `/payments/{id}`              | تصحيح دفعة وتوزيعها مع سبب           |
| GET    | `/payments/{id}/receipt.pdf`  | تحميل إيصال دفع PDF                  |
| POST   | `/payments/{id}/receipt/send` | طلب إرسال إيصال دفع                  |

### `/payrolls` — 1

**Plan:** Payroll: edit unpaid

| Method | Path             | Guide summary        |
| ------ | ---------------- | -------------------- |
| PUT    | `/payrolls/{id}` | تعديل راتب غير مدفوع |

### `/portal` — 11

**Plan:** Portal: excuses, weekly schedule, chat threads

| Method | Path                            | Guide summary                     |
| ------ | ------------------------------- | --------------------------------- |
| GET    | `/portal/students/{id}/excuses` | أعذار الطالب لولي الأمر           |
| POST   | `/portal/students/{id}/excuses` | تقديم عذر غياب                    |
| PUT    | `/portal/excuses/{id}`          | تعديل عذر معلق                    |
| DELETE | `/portal/excuses/{id}`          | سحب عذر معلق                      |
| GET    | `/portal/schedule`              | الجدول الأسبوعي للطالب            |
| GET    | `/portal/threads`               | محادثات المستخدم ضمن نطاق الطلاب  |
| POST   | `/portal/threads`               | بدء محادثة نصية مع مدرس الطالب    |
| GET    | `/portal/threads/{id}`          | تفاصيل المحادثة                   |
| DELETE | `/portal/threads/{id}`          | إغلاق محادثة مع الاحتفاظ بالرسائل |
| GET    | `/portal/threads/{id}/messages` | رسائل المحادثة النصية             |
| POST   | `/portal/threads/{id}/messages` | إضافة رسالة للمحادثة              |

### `/questions` — 3

**Plan:** Question bank: Excel import, export, bulk archive

| Method | Path                     | Guide summary                            |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/questions/bulk-delete` | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة |
| GET    | `/questions/export`      | تصدير الأسئلة داخل نطاق صاحبها           |
| POST   | `/questions/import`      | استيراد أسئلة من Excel مع نتائج كل صف    |

### `/quizzes` — 10

**Plan:** Session quizzes: edit, delete draft, analytics (distribution / top), make-ups, single-grade save

| Method | Path                                        | Guide summary                            |
| ------ | ------------------------------------------- | ---------------------------------------- |
| POST   | `/quizzes/bulk-delete`                      | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة |
| GET    | `/quizzes/{id}/distribution`                | توزيع درجات الاختبار                     |
| GET    | `/quizzes/{id}/top`                         | المتفوقون وترتيبهم                       |
| GET    | `/quizzes/{id}/makeups`                     | قائمة اختبارات الإعادة                   |
| POST   | `/quizzes/{id}/makeups`                     | جدولة إعادة لطالب                        |
| DELETE | `/quizzes/{id}/makeups/{makeupId}`          | إلغاء إعادة مجدولة                       |
| POST   | `/quizzes/{id}/makeups/{makeupId}/complete` | تسجيل نتيجة إعادة الاختبار               |
| PUT    | `/quizzes/{id}`                             | تعديل عنوان الاختبار والدرجة النهائية    |
| DELETE | `/quizzes/{id}`                             | حذف اختبار مسودة غير مستخدم              |
| PUT    | `/quizzes/{id}/grades/{studentId}`          | حفظ درجة طالب واحد                       |

### `/report-runs` — 1

**Plan:** Scheduled reports: download a generated run

| Method | Path                       | Guide summary                              |
| ------ | -------------------------- | ------------------------------------------ |
| GET    | `/report-runs/{id}/export` | تنزيل نسخة التقرير المخصصة للمستخدم الحالي |

### `/reports` — 6

**Plan:** Reports: monthly income, attendance by group, levels, debts, at-risk, export

| Method | Path                           | Guide summary                        |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/reports/income-monthly`      | الدخل الشهري والمصروفات وصافي التدفق |
| GET    | `/reports/attendance-by-group` | معدلات الحضور لكل مجموعة             |
| GET    | `/reports/student-levels`      | مستويات الطلاب من الدرجات المنشورة   |
| GET    | `/reports/debts`               | المديونيات المفتوحة للطلاب           |
| GET    | `/reports/at-risk-students`    | الطلاب المعرضون للتعثر               |
| GET    | `/reports/{type}/export`       | تصدير تقرير كامل إلى Excel أو PDF    |

### `/roles` — 1

**Plan:** Roles: permissions-only replace (UI saves the whole role instead)

| Method | Path                      | Guide summary            |
| ------ | ------------------------- | ------------------------ |
| PUT    | `/roles/{id}/permissions` | استبدال صلاحيات دور مخصص |

### `/scheduled-reports` — 4

**Plan:** Scheduled reports: run now, run history, export

| Method | Path                              | Guide summary                        |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/scheduled-reports/export`       | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/scheduled-reports/bulk-delete`  | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |
| POST   | `/scheduled-reports/{id}/run-now` | توليد تقرير مجدول يدويًا داخل النظام |
| GET    | `/scheduled-reports/{id}/runs`    | سجل التقارير المتولدة                |

### `/sessions` — 8

**Plan:** Sessions: create / edit / delete one-off session, reopen, offline pack

| Method | Path                                | Guide summary                                                                             |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/sessions/{id}/offline-pack`       | تحميل بيانات الحضور للأوفلاين                                                             |
| GET    | `/sessions/{id}/attendance/pending` | الطلاب المنتظرون لتسجيل الحالة في حصة محددة                                               |
| POST   | `/sessions/{id}/reopen`             | إعادة فتح حصة مغلقة                                                                       |
| POST   | `/sessions/bulk-delete`             | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة                                                  |
| DELETE | `/sessions/{id}`                    | حذف حصة غير مستخدمة                                                                       |
| GET    | `/sessions/{id}`                    | Read one session, its group, hall and attendance counters within the caller&#x27;s scope. |
| PUT    | `/sessions/{id}`                    | تعديل حصة قبل بدئها                                                                       |
| POST   | `/sessions`                         | إنشاء حصة                                                                                 |

### `/settings` — 1

**Plan:** Settings: run due background jobs now

| Method | Path                     | Guide summary                       |
| ------ | ------------------------ | ----------------------------------- |
| POST   | `/settings/jobs/run-now` | تنفيذ المهام الداخلية المستحقة الآن |

### `/settlements` — 1

**Plan:** Settlements: details page with the agreement snapshot

| Method | Path                | Guide summary                       |
| ------ | ------------------- | ----------------------------------- |
| GET    | `/settlements/{id}` | تفاصيل تسوية واتفاقيتها وقت التوليد |

### `/staff` — 2

**Plan:** Staff: export / bulk archive

| Method | Path                 | Guide summary                            |
| ------ | -------------------- | ---------------------------------------- |
| POST   | `/staff/bulk-delete` | حذف أو أرشفة عناصر مع تطبيق قواعد الوحدة |
| GET    | `/staff/export`      | تصدير الموظفين بدون الأسرار              |

### `/staff-attendance` — 1

**Plan:** Staff attendance: correct a record

| Method | Path                     | Guide summary       |
| ------ | ------------------------ | ------------------- |
| PUT    | `/staff-attendance/{id}` | تصحيح سجل حضور موظف |

### `/stock-movements` — 3

**Plan:** Materials: edit / cancel a manual movement

| Method | Path                    | Guide summary               |
| ------ | ----------------------- | --------------------------- |
| GET    | `/stock-movements/{id}` | تفاصيل حركة مخزون           |
| PUT    | `/stock-movements/{id}` | تصحيح حركة يدوية ورصيدها    |
| DELETE | `/stock-movements/{id}` | إلغاء حركة يدوية وعكس أثرها |

### `/students` — 11

**Plan:** Student profile: card PDF / send / QR rotate, attendance & grades tabs, balance, discounts, enroll

| Method | Path                                              | Guide summary                       |
| ------ | ------------------------------------------------- | ----------------------------------- |
| GET    | `/students/{id}/discounts`                        | خصومات الطالب                       |
| POST   | `/students/{id}/discounts`                        | تعيين خصم للطالب                    |
| POST   | `/students/{id}/discounts/{assignmentId}/approve` | اعتماد خصم طالب                     |
| DELETE | `/students/{id}/discounts/{assignmentId}`         | إزالة تعيين خصم                     |
| GET    | `/students/{id}/balance`                          | رصيد الطالب للموظف                  |
| GET    | `/students/{id}/card.pdf`                         | تحميل بطاقة طالب PDF برمز QR الحالي |
| POST   | `/students/{id}/card/send`                        | طلب إرسال بطاقة الطالب              |
| GET    | `/students/{id}/attendance`                       | سجل حضور طالب                       |
| GET    | `/students/{id}/grades`                           | سجل درجات طالب للموظف               |
| POST   | `/students/{id}/qr/rotate`                        | تغيير رمز QR                        |
| POST   | `/students/{id}/enrollments`                      | تسجيل طالب في مجموعة                |

### `/subjects` — 2

**Plan:** Settings → subjects: export / bulk archive

| Method | Path                    | Guide summary                        |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/subjects/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/subjects/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/teachers` — 10

**Plan:** Centers: external teachers + agreements

| Method | Path                        | Guide summary                        |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/teachers/{id}/agreements` | اتفاقيات المدرس بتاريخ سريانها       |
| POST   | `/teachers/{id}/agreements` | إضافة اتفاقية تبدأ أول شهر قادم      |
| GET    | `/teachers`                 | قائمة عناصر الكتالوج                 |
| POST   | `/teachers`                 | إنشاء عنصر كتالوج                    |
| GET    | `/teachers/{id}`            | تفاصيل عنصر الكتالوج                 |
| PUT    | `/teachers/{id}`            | تعديل عنصر كتالوج                    |
| DELETE | `/teachers/{id}`            | أرشفة عنصر غير مستخدم                |
| GET    | `/teachers/export`          | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/teachers/bulk-delete`     | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |
| GET    | `/teachers/me/settlements`  | قائمة التسويات المالية للمدرسين      |

### `/threads` — 6

**Plan:** Staff ↔ guardian chat

| Method | Path                     | Guide summary                     |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/threads`               | محادثات المستخدم ضمن نطاق الطلاب  |
| POST   | `/threads`               | بدء محادثة نصية مع مدرس الطالب    |
| GET    | `/threads/{id}`          | تفاصيل المحادثة                   |
| DELETE | `/threads/{id}`          | إغلاق محادثة مع الاحتفاظ بالرسائل |
| GET    | `/threads/{id}/messages` | رسائل المحادثة النصية             |
| POST   | `/threads/{id}/messages` | إضافة رسالة للمحادثة              |

### `/units` — 5

**Plan:** Question bank: edit / archive units

| Method | Path                 | Guide summary                        |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/units/{id}`        | تفاصيل عنصر الكتالوج                 |
| PUT    | `/units/{id}`        | تعديل عنصر كتالوج                    |
| DELETE | `/units/{id}`        | أرشفة عنصر غير مستخدم                |
| GET    | `/units/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/units/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

### `/users` — 2

**Plan:** Staff: assign a custom role

| Method | Path                | Guide summary                            |
| ------ | ------------------- | ---------------------------------------- |
| PUT    | `/users/{id}/roles` | تعيين دور مخصص لموظف                     |
| DELETE | `/users/{id}/roles` | إزالة الدور المخصص والعودة للدور الأساسي |

### `/videos` — 5

**Plan:** Videos: edit, archive, export

| Method | Path                  | Guide summary                        |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/videos/{id}`        | تفاصيل عنصر الكتالوج                 |
| PUT    | `/videos/{id}`        | تعديل عنصر كتالوج                    |
| DELETE | `/videos/{id}`        | أرشفة عنصر غير مستخدم                |
| GET    | `/videos/export`      | تصدير الكتالوج بنفس البحث والترتيب   |
| POST   | `/videos/bulk-delete` | أرشفة مجموعة عناصر مع نتيجة لكل عنصر |

## 2. What the frontend still needs from the backend

### 2.1 Endpoints that are still missing (not in the guide)

| Module         | Missing                                                                                                                                                     | Used for                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Finance        | `POST /payments/online/intent`, `POST /webhooks/paymob`                                                                                                     | Online payment (Paymob / Fawry)                                   |
| Portal         | `POST /portal/students/{id}/pay`                                                                                                                            | Guardian pays dues from the portal                                |
| Messages       | `POST /webhooks/whatsapp`                                                                                                                                   | Delivery / read status of WhatsApp messages                       |
| Content        | `POST /videos/{id}/publish`, `GET /videos/{id}/stats`, `GET /portal/videos`, `POST /portal/videos/{id}/play`, `POST /portal/videos/views/{viewId}/progress` | Video upload/publish, watch stats, student video player           |
| Staff          | `POST /staff/{id}/reset-password`, `POST /payrolls/generate?month=`                                                                                         | Reset a staff password, generate the month's payroll in one click |
| Roles          | `POST /roles/{id}/reset`                                                                                                                                    | Reset a role to its base permissions                              |
| Groups / halls | `PATCH /halls/{id}/status`                                                                                                                                  | Quick hall status (PUT works today)                               |
| Billing        | `GET /billing/subscription`, `GET /billing/invoices`, `GET /billing/invoices/{id}.pdf`, `POST /billing/invoices/{id}/pay`, `POST /billing/change-plan`      | Center subscription & invoices page                               |

### 2.2 Data the existing endpoints should return

| Endpoint                                                                           | Needed                                                                                                       | Why                                                                                                                                                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /payments` (items)                                                            | `studentId`, `studentName`, `studentCode`                                                                    | The `Payment` schema only has `chargeId`; the payments table and receipts cannot show who paid                                                                                |
| `GET /assignments/{id}/submissions`                                                | `studentName`, `studentCode`                                                                                 | `AssignmentSubmission` only has `studentId`                                                                                                                                   |
| `GET /online-exams/{id}/results`                                                   | Per attempt: `studentName`, `studentCode`, `maxScore`, and `answers[{questionId, essayText, pointsAwarded}]` | Showing who took the exam and marking essay answers                                                                                                                           |
| `GET /staff-attendance`, `GET /payrolls`, `GET /settlements`, `GET /hall-bookings` | `userName` / `teacherName` / `hallName`                                                                      | Today the frontend joins names from `/staff` and `/halls` (extra calls, breaks past 100 staff)                                                                                |
| `GET /groups/{id}/students`, `GET /students/{id}`                                  | `enrollmentId` per student/group (and enrollment status)                                                     | `POST /enrollments/{id}/transfer` and `DELETE /enrollments/{id}` need the enrollment id, which no response exposes — transfer / withdraw cannot be built until it is returned |
| `GET /staff/{id}`                                                                  | Current `customRoleId` / `customRoleName`                                                                    | The staff edit page can assign a custom role but cannot show the current one                                                                                                  |
| `GET /audit-logs`                                                                  | `actorName`                                                                                                  | Same reason                                                                                                                                                                   |
| `GET /settings/policies`                                                           | A label (Arabic) and type per key                                                                            | The settings page renders raw keys                                                                                                                                            |

### 2.3 Contracts to confirm

1. **Student import commit** — the frontend sends `mapping` as `{ field: sheetColumn }` with fields `fullName, phone, parentName, parentPhone, gradeLevel, school, code, notes`, plus `guardianConsent` and `branchId`. The guide does not describe the `mapping` keys; please confirm the direction and the field names.
2. **If-Match / rowVersion** — the guide says it is optional and a stale token returns 412. The frontend does not send it yet; edits are last-write-wins until we add it. OK for now?
3. **Cash shift** — `GET /cash-shifts/current` returning 404 when no shift is open is handled as "no open shift" ✅.

### 2.4 Environment

| Item         | Status                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| CORS         | Allow the production (Vercel) origin, not only `http://localhost:3000`                                                                             |
| OTP provider | `/auth/otp/*` returns 503 `otp-provider-unavailable` — guardian / student login cannot be tested end-to-end                                        |
| Test data    | A seeded tenant with groups, sessions, payments, an online exam and a guardian + student linked to it, so every page can be checked with real data |
