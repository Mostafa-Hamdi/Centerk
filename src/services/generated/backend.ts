import { api } from "../api";
export const addTagTypes = [
  "Attendance",
  "Audit",
  "Auth",
  "Branches",
  "CashShifts",
  "Dashboard",
  "Discounts",
  "Excuses",
  "Expenses",
  "Finance",
  "Groups",
  "Guardians",
  "Halls",
  "Health",
  "Messages",
  "Platform",
  "Portal",
  "Profile",
  "Quizzes",
  "Reports",
  "Sessions",
  "Settings",
  "Staff",
  "Students",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      attendanceControllerGetSessionsIdAttendance: build.query<
        AttendanceControllerGetSessionsIdAttendanceApiResponse,
        AttendanceControllerGetSessionsIdAttendanceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/attendance`,
        }),
        providesTags: ["Attendance"],
      }),
      attendanceControllerGetSessionsIdOfflinePack: build.query<
        AttendanceControllerGetSessionsIdOfflinePackApiResponse,
        AttendanceControllerGetSessionsIdOfflinePackApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/offline-pack`,
        }),
        providesTags: ["Attendance"],
      }),
      attendanceControllerPostAttendanceScan: build.mutation<
        AttendanceControllerPostAttendanceScanApiResponse,
        AttendanceControllerPostAttendanceScanApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/attendance/scan`,
          method: "POST",
          body: queryArg.scanItem,
        }),
        invalidatesTags: ["Attendance"],
      }),
      attendanceControllerPostSessionsIdClose: build.mutation<
        AttendanceControllerPostSessionsIdCloseApiResponse,
        AttendanceControllerPostSessionsIdCloseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/close`,
          method: "POST",
          body: queryArg.closeSession,
        }),
        invalidatesTags: ["Attendance"],
      }),
      attendanceControllerPostAttendanceSync: build.mutation<
        AttendanceControllerPostAttendanceSyncApiResponse,
        AttendanceControllerPostAttendanceSyncApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/attendance/sync`,
          method: "POST",
          body: queryArg.syncBatch,
        }),
        invalidatesTags: ["Attendance"],
      }),
      attendanceManagementControllerManual: build.mutation<
        AttendanceManagementControllerManualApiResponse,
        AttendanceManagementControllerManualApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/attendance/manual`,
          method: "POST",
          body: queryArg.manualAttendanceRequest,
        }),
        invalidatesTags: ["Attendance"],
      }),
      attendanceManagementControllerCorrect: build.mutation<
        AttendanceManagementControllerCorrectApiResponse,
        AttendanceManagementControllerCorrectApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/attendance/${queryArg.recordId}`,
          method: "PUT",
          body: queryArg.correctAttendanceRequest,
        }),
        invalidatesTags: ["Attendance"],
      }),
      attendanceManagementControllerDelete: build.mutation<
        AttendanceManagementControllerDeleteApiResponse,
        AttendanceManagementControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/attendance/${queryArg.recordId}`,
          method: "DELETE",
          params: {
            reason: queryArg.reason,
          },
        }),
        invalidatesTags: ["Attendance"],
      }),
      sessionManagementControllerReopen: build.mutation<
        SessionManagementControllerReopenApiResponse,
        SessionManagementControllerReopenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/reopen`,
          method: "POST",
          body: queryArg.cancelSessionRequest,
        }),
        invalidatesTags: ["Attendance"],
      }),
      auditControllerGetAuditLogs: build.query<
        AuditControllerGetAuditLogsApiResponse,
        AuditControllerGetAuditLogsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/audit-logs`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Audit"],
      }),
      authControllerLogin: build.mutation<
        AuthControllerLoginApiResponse,
        AuthControllerLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: "POST",
          body: queryArg.loginV1,
        }),
        invalidatesTags: ["Auth"],
      }),
      authControllerRequestOtp: build.mutation<
        AuthControllerRequestOtpApiResponse,
        AuthControllerRequestOtpApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/otp/request`,
          method: "POST",
          body: queryArg.otpRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      authControllerVerifyOtp: build.mutation<
        AuthControllerVerifyOtpApiResponse,
        AuthControllerVerifyOtpApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/otp/verify`,
          method: "POST",
          body: queryArg.otpVerify,
        }),
        invalidatesTags: ["Auth"],
      }),
      authControllerRefresh: build.mutation<
        AuthControllerRefreshApiResponse,
        AuthControllerRefreshApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/refresh`,
          method: "POST",
          body: queryArg.refreshRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      authControllerLogout: build.mutation<
        AuthControllerLogoutApiResponse,
        AuthControllerLogoutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/logout`,
          method: "POST",
          body: queryArg.logoutRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      legacyAuthControllerLogin: build.mutation<
        LegacyAuthControllerLoginApiResponse,
        LegacyAuthControllerLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      legacyAuthControllerCurrentTenant: build.query<
        LegacyAuthControllerCurrentTenantApiResponse,
        LegacyAuthControllerCurrentTenantApiArg
      >({
        query: () => ({ url: `/api/tenants/me` }),
        providesTags: ["Auth"],
      }),
      passwordControllerChangePassword: build.mutation<
        PasswordControllerChangePasswordApiResponse,
        PasswordControllerChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/me/password`,
          method: "PUT",
          body: queryArg.changePasswordRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      branchesControllerGetBranches: build.query<
        BranchesControllerGetBranchesApiResponse,
        BranchesControllerGetBranchesApiArg
      >({
        query: () => ({ url: `/api/v1/branches` }),
        providesTags: ["Branches"],
      }),
      branchesControllerPostBranches: build.mutation<
        BranchesControllerPostBranchesApiResponse,
        BranchesControllerPostBranchesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/branches`,
          method: "POST",
          body: queryArg.newBranch,
        }),
        invalidatesTags: ["Branches"],
      }),
      facilityManagementControllerBranch: build.query<
        FacilityManagementControllerBranchApiResponse,
        FacilityManagementControllerBranchApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/branches/${queryArg.id}` }),
        providesTags: ["Branches"],
      }),
      facilityManagementControllerEditBranch: build.mutation<
        FacilityManagementControllerEditBranchApiResponse,
        FacilityManagementControllerEditBranchApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/branches/${queryArg.id}`,
          method: "PUT",
          body: queryArg.editBranchRequest,
        }),
        invalidatesTags: ["Branches"],
      }),
      cashShiftsControllerGetCashShiftsCurrent: build.query<
        CashShiftsControllerGetCashShiftsCurrentApiResponse,
        CashShiftsControllerGetCashShiftsCurrentApiArg
      >({
        query: () => ({ url: `/api/v1/cash-shifts/current` }),
        providesTags: ["CashShifts"],
      }),
      cashShiftsControllerPostCashShiftsOpen: build.mutation<
        CashShiftsControllerPostCashShiftsOpenApiResponse,
        CashShiftsControllerPostCashShiftsOpenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/cash-shifts/open`,
          method: "POST",
          body: queryArg.openShift,
        }),
        invalidatesTags: ["CashShifts"],
      }),
      cashShiftsControllerPostCashShiftsIdClose: build.mutation<
        CashShiftsControllerPostCashShiftsIdCloseApiResponse,
        CashShiftsControllerPostCashShiftsIdCloseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/cash-shifts/${queryArg.id}/close`,
          method: "POST",
          body: queryArg.closeShift,
        }),
        invalidatesTags: ["CashShifts"],
      }),
      dashboardControllerGetDashboardSummary: build.query<
        DashboardControllerGetDashboardSummaryApiResponse,
        DashboardControllerGetDashboardSummaryApiArg
      >({
        query: () => ({ url: `/api/v1/dashboard/summary` }),
        providesTags: ["Dashboard"],
      }),
      dashboardControllerGetDashboardTodaySessions: build.query<
        DashboardControllerGetDashboardTodaySessionsApiResponse,
        DashboardControllerGetDashboardTodaySessionsApiArg
      >({
        query: () => ({ url: `/api/v1/dashboard/today-sessions` }),
        providesTags: ["Dashboard"],
      }),
      discountsControllerList: build.query<
        DiscountsControllerListApiResponse,
        DiscountsControllerListApiArg
      >({
        query: () => ({ url: `/api/v1/discounts` }),
        providesTags: ["Discounts"],
      }),
      discountsControllerCreate: build.mutation<
        DiscountsControllerCreateApiResponse,
        DiscountsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/discounts`,
          method: "POST",
          body: queryArg.discountRequest,
        }),
        invalidatesTags: ["Discounts"],
      }),
      discountsControllerUpdate: build.mutation<
        DiscountsControllerUpdateApiResponse,
        DiscountsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/discounts/${queryArg.id}`,
          method: "PUT",
          body: queryArg.discountRequest,
        }),
        invalidatesTags: ["Discounts"],
      }),
      discountsControllerDelete: build.mutation<
        DiscountsControllerDeleteApiResponse,
        DiscountsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/discounts/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Discounts"],
      }),
      discountsControllerStudentDiscounts: build.query<
        DiscountsControllerStudentDiscountsApiResponse,
        DiscountsControllerStudentDiscountsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/discounts`,
        }),
        providesTags: ["Discounts"],
      }),
      discountsControllerAssign: build.mutation<
        DiscountsControllerAssignApiResponse,
        DiscountsControllerAssignApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/discounts`,
          method: "POST",
          body: queryArg.studentDiscountRequest,
        }),
        invalidatesTags: ["Discounts"],
      }),
      discountsControllerApprove: build.mutation<
        DiscountsControllerApproveApiResponse,
        DiscountsControllerApproveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/discounts/${queryArg.assignmentId}/approve`,
          method: "POST",
        }),
        invalidatesTags: ["Discounts"],
      }),
      discountsControllerRemove: build.mutation<
        DiscountsControllerRemoveApiResponse,
        DiscountsControllerRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/discounts/${queryArg.assignmentId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Discounts"],
      }),
      excusesControllerPortalList: build.query<
        ExcusesControllerPortalListApiResponse,
        ExcusesControllerPortalListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/students/${queryArg.id}/excuses`,
        }),
        providesTags: ["Excuses"],
      }),
      excusesControllerCreate: build.mutation<
        ExcusesControllerCreateApiResponse,
        ExcusesControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/students/${queryArg.id}/excuses`,
          method: "POST",
          body: queryArg.excuseRequest,
        }),
        invalidatesTags: ["Excuses"],
      }),
      excusesControllerEdit: build.mutation<
        ExcusesControllerEditApiResponse,
        ExcusesControllerEditApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/excuses/${queryArg.id}`,
          method: "PUT",
          body: queryArg.excuseRequest,
        }),
        invalidatesTags: ["Excuses"],
      }),
      excusesControllerWithdraw: build.mutation<
        ExcusesControllerWithdrawApiResponse,
        ExcusesControllerWithdrawApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/excuses/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Excuses"],
      }),
      excusesControllerStaffList: build.query<
        ExcusesControllerStaffListApiResponse,
        ExcusesControllerStaffListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/excuses`,
          params: {
            status: queryArg.status,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Excuses"],
      }),
      excusesControllerApprove: build.mutation<
        ExcusesControllerApproveApiResponse,
        ExcusesControllerApproveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/excuses/${queryArg.id}/approve`,
          method: "POST",
        }),
        invalidatesTags: ["Excuses"],
      }),
      excusesControllerReject: build.mutation<
        ExcusesControllerRejectApiResponse,
        ExcusesControllerRejectApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/excuses/${queryArg.id}/reject`,
          method: "POST",
        }),
        invalidatesTags: ["Excuses"],
      }),
      expensesControllerList: build.query<
        ExpensesControllerListApiResponse,
        ExpensesControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses`,
          params: {
            status: queryArg.status,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Expenses"],
      }),
      expensesControllerCreate: build.mutation<
        ExpensesControllerCreateApiResponse,
        ExpensesControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses`,
          method: "POST",
          body: queryArg.expenseRequest,
        }),
        invalidatesTags: ["Expenses"],
      }),
      expensesControllerDetail: build.query<
        ExpensesControllerDetailApiResponse,
        ExpensesControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/expenses/${queryArg.id}` }),
        providesTags: ["Expenses"],
      }),
      expensesControllerEdit: build.mutation<
        ExpensesControllerEditApiResponse,
        ExpensesControllerEditApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses/${queryArg.id}`,
          method: "PUT",
          body: queryArg.expenseRequest,
        }),
        invalidatesTags: ["Expenses"],
      }),
      expensesControllerDelete: build.mutation<
        ExpensesControllerDeleteApiResponse,
        ExpensesControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Expenses"],
      }),
      expensesControllerApprove: build.mutation<
        ExpensesControllerApproveApiResponse,
        ExpensesControllerApproveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses/${queryArg.id}/approve`,
          method: "POST",
        }),
        invalidatesTags: ["Expenses"],
      }),
      expensesControllerReject: build.mutation<
        ExpensesControllerRejectApiResponse,
        ExpensesControllerRejectApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expenses/${queryArg.id}/reject`,
          method: "POST",
        }),
        invalidatesTags: ["Expenses"],
      }),
      duesControllerDues: build.query<
        DuesControllerDuesApiResponse,
        DuesControllerDuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dues`,
          params: {
            groupId: queryArg.groupId,
            overdueDays: queryArg.overdueDays,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Finance"],
      }),
      duesControllerRemind: build.mutation<
        DuesControllerRemindApiResponse,
        DuesControllerRemindApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dues/${queryArg.studentId}/remind`,
          method: "POST",
        }),
        invalidatesTags: ["Finance"],
      }),
      duesControllerGenerate: build.mutation<
        DuesControllerGenerateApiResponse,
        DuesControllerGenerateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/charges/generate`,
          method: "POST",
          params: {
            period: queryArg.period,
          },
        }),
        invalidatesTags: ["Finance"],
      }),
      financeControllerGetStudentsIdBalance: build.query<
        FinanceControllerGetStudentsIdBalanceApiResponse,
        FinanceControllerGetStudentsIdBalanceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/balance`,
        }),
        providesTags: ["Finance"],
      }),
      financeControllerGetCharges: build.query<
        FinanceControllerGetChargesApiResponse,
        FinanceControllerGetChargesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/charges`,
          params: {
            studentId: queryArg.studentId,
          },
        }),
        providesTags: ["Finance"],
      }),
      financeControllerPostCharges: build.mutation<
        FinanceControllerPostChargesApiResponse,
        FinanceControllerPostChargesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/charges`,
          method: "POST",
          body: queryArg.newChargeV1,
        }),
        invalidatesTags: ["Finance"],
      }),
      financeControllerPostPayments: build.mutation<
        FinanceControllerPostPaymentsApiResponse,
        FinanceControllerPostPaymentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payments`,
          method: "POST",
          body: queryArg.newPaymentV1,
        }),
        invalidatesTags: ["Finance"],
      }),
      financeControllerGetPayments: build.query<
        FinanceControllerGetPaymentsApiResponse,
        FinanceControllerGetPaymentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payments`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Finance"],
      }),
      financeControllerGetPaymentsId: build.query<
        FinanceControllerGetPaymentsIdApiResponse,
        FinanceControllerGetPaymentsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/payments/${queryArg.id}` }),
        providesTags: ["Finance"],
      }),
      financeControllerPostPaymentsIdVoid: build.mutation<
        FinanceControllerPostPaymentsIdVoidApiResponse,
        FinanceControllerPostPaymentsIdVoidApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payments/${queryArg.id}/void`,
          method: "POST",
          body: queryArg.voidPayment,
        }),
        invalidatesTags: ["Finance"],
      }),
      enrollmentWorkflowControllerWaitlist: build.query<
        EnrollmentWorkflowControllerWaitlistApiResponse,
        EnrollmentWorkflowControllerWaitlistApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/waitlist`,
        }),
        providesTags: ["Groups"],
      }),
      enrollmentWorkflowControllerJoinWaitlist: build.mutation<
        EnrollmentWorkflowControllerJoinWaitlistApiResponse,
        EnrollmentWorkflowControllerJoinWaitlistApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/waitlist`,
          method: "POST",
          body: queryArg.waitlistRequest,
        }),
        invalidatesTags: ["Groups"],
      }),
      enrollmentWorkflowControllerRemoveWaitlist: build.mutation<
        EnrollmentWorkflowControllerRemoveWaitlistApiResponse,
        EnrollmentWorkflowControllerRemoveWaitlistApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/waitlist/${queryArg.entryId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Groups"],
      }),
      enrollmentWorkflowControllerTransfer: build.mutation<
        EnrollmentWorkflowControllerTransferApiResponse,
        EnrollmentWorkflowControllerTransferApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/enrollments/${queryArg.id}/transfer`,
          method: "POST",
          body: queryArg.transferEnrollmentRequest,
        }),
        invalidatesTags: ["Groups"],
      }),
      enrollmentWorkflowControllerWithdraw: build.mutation<
        EnrollmentWorkflowControllerWithdrawApiResponse,
        EnrollmentWorkflowControllerWithdrawApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/enrollments/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Groups"],
      }),
      groupManagementControllerDetail: build.query<
        GroupManagementControllerDetailApiResponse,
        GroupManagementControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/groups/${queryArg.id}` }),
        providesTags: ["Groups"],
      }),
      schedulingWorkflowControllerUpdateGroup: build.mutation<
        SchedulingWorkflowControllerUpdateGroupApiResponse,
        SchedulingWorkflowControllerUpdateGroupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateGroupRequest,
        }),
        invalidatesTags: ["Groups"],
      }),
      groupManagementControllerPause: build.mutation<
        GroupManagementControllerPauseApiResponse,
        GroupManagementControllerPauseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/pause`,
          method: "POST",
        }),
        invalidatesTags: ["Groups"],
      }),
      groupManagementControllerResume: build.mutation<
        GroupManagementControllerResumeApiResponse,
        GroupManagementControllerResumeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/resume`,
          method: "POST",
        }),
        invalidatesTags: ["Groups"],
      }),
      groupManagementControllerSchedule: build.query<
        GroupManagementControllerScheduleApiResponse,
        GroupManagementControllerScheduleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/schedule`,
        }),
        providesTags: ["Groups"],
      }),
      groupManagementControllerReplaceSchedule: build.mutation<
        GroupManagementControllerReplaceScheduleApiResponse,
        GroupManagementControllerReplaceScheduleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/schedule`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Groups"],
      }),
      groupsControllerGetGroups: build.query<
        GroupsControllerGetGroupsApiResponse,
        GroupsControllerGetGroupsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Groups"],
      }),
      groupsControllerPostGroups: build.mutation<
        GroupsControllerPostGroupsApiResponse,
        GroupsControllerPostGroupsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups`,
          method: "POST",
          body: queryArg.newGroup,
        }),
        invalidatesTags: ["Groups"],
      }),
      groupsControllerGetGroupsIdStudents: build.query<
        GroupsControllerGetGroupsIdStudentsApiResponse,
        GroupsControllerGetGroupsIdStudentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/students`,
        }),
        providesTags: ["Groups"],
      }),
      guardiansControllerList: build.query<
        GuardiansControllerListApiResponse,
        GuardiansControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/guardians`,
          params: {
            phone: queryArg.phone,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Guardians"],
      }),
      facilityManagementControllerHall: build.query<
        FacilityManagementControllerHallApiResponse,
        FacilityManagementControllerHallApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/halls/${queryArg.id}` }),
        providesTags: ["Halls"],
      }),
      facilityManagementControllerEditHall: build.mutation<
        FacilityManagementControllerEditHallApiResponse,
        FacilityManagementControllerEditHallApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/halls/${queryArg.id}`,
          method: "PUT",
          body: queryArg.editHallRequest,
        }),
        invalidatesTags: ["Halls"],
      }),
      hallsControllerGetHalls: build.query<
        HallsControllerGetHallsApiResponse,
        HallsControllerGetHallsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/halls`,
          params: {
            branchId: queryArg.branchId,
          },
        }),
        providesTags: ["Halls"],
      }),
      hallsControllerPostHalls: build.mutation<
        HallsControllerPostHallsApiResponse,
        HallsControllerPostHallsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/halls`,
          method: "POST",
          body: queryArg.newHall,
        }),
        invalidatesTags: ["Halls"],
      }),
      schedulingWorkflowControllerAvailability: build.query<
        SchedulingWorkflowControllerAvailabilityApiResponse,
        SchedulingWorkflowControllerAvailabilityApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/halls/availability`,
          params: {
            branchId: queryArg.branchId,
            fromUtc: queryArg.fromUtc,
            toUtc: queryArg.toUtc,
          },
        }),
        providesTags: ["Halls"],
      }),
      getHealthLive: build.query<GetHealthLiveApiResponse, GetHealthLiveApiArg>(
        {
          query: () => ({ url: `/health/live` }),
          providesTags: ["Health"],
        },
      ),
      messagesControllerGetMessages: build.query<
        MessagesControllerGetMessagesApiResponse,
        MessagesControllerGetMessagesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/messages`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Messages"],
      }),
      platformControllerCreateTenant: build.mutation<
        PlatformControllerCreateTenantApiResponse,
        PlatformControllerCreateTenantApiArg
      >({
        query: (queryArg) => ({
          url: `/api/platform/tenants`,
          method: "POST",
          body: queryArg.provisionTenant,
        }),
        invalidatesTags: ["Platform"],
      }),
      portalControllerMe: build.query<
        PortalControllerMeApiResponse,
        PortalControllerMeApiArg
      >({
        query: () => ({ url: `/api/v1/portal/me` }),
        providesTags: ["Portal"],
      }),
      portalControllerOverview: build.query<
        PortalControllerOverviewApiResponse,
        PortalControllerOverviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/students/${queryArg.id}/overview`,
        }),
        providesTags: ["Portal"],
      }),
      portalControllerSessions: build.query<
        PortalControllerSessionsApiResponse,
        PortalControllerSessionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/students/${queryArg.id}/sessions`,
          params: {
            from: queryArg["from"],
            to: queryArg.to,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Portal"],
      }),
      portalControllerBalance: build.query<
        PortalControllerBalanceApiResponse,
        PortalControllerBalanceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/students/${queryArg.id}/balance`,
        }),
        providesTags: ["Portal"],
      }),
      portalControllerCard: build.query<
        PortalControllerCardApiResponse,
        PortalControllerCardApiArg
      >({
        query: () => ({ url: `/api/v1/portal/card` }),
        providesTags: ["Portal"],
      }),
      portalControllerSchedule: build.query<
        PortalControllerScheduleApiResponse,
        PortalControllerScheduleApiArg
      >({
        query: () => ({ url: `/api/v1/portal/schedule` }),
        providesTags: ["Portal"],
      }),
      profileControllerGetMe: build.query<
        ProfileControllerGetMeApiResponse,
        ProfileControllerGetMeApiArg
      >({
        query: () => ({ url: `/api/v1/me` }),
        providesTags: ["Profile"],
      }),
      quizAnalyticsControllerDistribution: build.query<
        QuizAnalyticsControllerDistributionApiResponse,
        QuizAnalyticsControllerDistributionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/distribution`,
        }),
        providesTags: ["Quizzes"],
      }),
      quizAnalyticsControllerTop: build.query<
        QuizAnalyticsControllerTopApiResponse,
        QuizAnalyticsControllerTopApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/top`,
          params: {
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Quizzes"],
      }),
      quizAnalyticsControllerMakeups: build.query<
        QuizAnalyticsControllerMakeupsApiResponse,
        QuizAnalyticsControllerMakeupsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/makeups`,
        }),
        providesTags: ["Quizzes"],
      }),
      quizAnalyticsControllerScheduleMakeup: build.mutation<
        QuizAnalyticsControllerScheduleMakeupApiResponse,
        QuizAnalyticsControllerScheduleMakeupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/makeups`,
          method: "POST",
          body: queryArg.quizMakeupRequest,
        }),
        invalidatesTags: ["Quizzes"],
      }),
      quizAnalyticsControllerCancelMakeup: build.mutation<
        QuizAnalyticsControllerCancelMakeupApiResponse,
        QuizAnalyticsControllerCancelMakeupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/makeups/${queryArg.makeupId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Quizzes"],
      }),
      quizzesControllerGetQuizzes: build.query<
        QuizzesControllerGetQuizzesApiResponse,
        QuizzesControllerGetQuizzesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes`,
          params: {
            groupId: queryArg.groupId,
          },
        }),
        providesTags: ["Quizzes"],
      }),
      quizzesControllerPostQuizzes: build.mutation<
        QuizzesControllerPostQuizzesApiResponse,
        QuizzesControllerPostQuizzesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes`,
          method: "POST",
          body: queryArg.newQuizV1,
        }),
        invalidatesTags: ["Quizzes"],
      }),
      quizzesControllerGetQuizzesId: build.query<
        QuizzesControllerGetQuizzesIdApiResponse,
        QuizzesControllerGetQuizzesIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/quizzes/${queryArg.id}` }),
        providesTags: ["Quizzes"],
      }),
      quizzesControllerPutQuizzesIdGrades: build.mutation<
        QuizzesControllerPutQuizzesIdGradesApiResponse,
        QuizzesControllerPutQuizzesIdGradesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/grades`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Quizzes"],
      }),
      quizzesControllerPostQuizzesIdPublish: build.mutation<
        QuizzesControllerPostQuizzesIdPublishApiResponse,
        QuizzesControllerPostQuizzesIdPublishApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/publish`,
          method: "POST",
        }),
        invalidatesTags: ["Quizzes"],
      }),
      reportsControllerAttendanceReport: build.query<
        ReportsControllerAttendanceReportApiResponse,
        ReportsControllerAttendanceReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/reports/attendance`,
          params: {
            fromUtc: queryArg.fromUtc,
            toUtc: queryArg.toUtc,
            groupId: queryArg.groupId,
          },
        }),
        providesTags: ["Reports"],
      }),
      reportsControllerFinancialReport: build.query<
        ReportsControllerFinancialReportApiResponse,
        ReportsControllerFinancialReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/reports/financial`,
          params: {
            fromUtc: queryArg.fromUtc,
            toUtc: queryArg.toUtc,
            branchId: queryArg.branchId,
          },
        }),
        providesTags: ["Reports"],
      }),
      reportsControllerStudentsCsv: build.query<
        ReportsControllerStudentsCsvApiResponse,
        ReportsControllerStudentsCsvApiArg
      >({
        query: () => ({ url: `/api/v1/reports/students.csv` }),
        providesTags: ["Reports"],
      }),
      schedulingWorkflowControllerGenerate: build.mutation<
        SchedulingWorkflowControllerGenerateApiResponse,
        SchedulingWorkflowControllerGenerateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/generate-sessions`,
          method: "POST",
          body: queryArg.generateSessionsRequest,
        }),
        invalidatesTags: ["Sessions"],
      }),
      schedulingWorkflowControllerPostpone: build.mutation<
        SchedulingWorkflowControllerPostponeApiResponse,
        SchedulingWorkflowControllerPostponeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/postpone`,
          method: "POST",
          body: queryArg.postponeSessionRequest,
        }),
        invalidatesTags: ["Sessions"],
      }),
      sessionManagementControllerDetail: build.query<
        SessionManagementControllerDetailApiResponse,
        SessionManagementControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/sessions/${queryArg.id}` }),
        providesTags: ["Sessions"],
      }),
      sessionManagementControllerEdit: build.mutation<
        SessionManagementControllerEditApiResponse,
        SessionManagementControllerEditApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}`,
          method: "PUT",
          body: queryArg.editSessionRequest,
        }),
        invalidatesTags: ["Sessions"],
      }),
      sessionManagementControllerCancel: build.mutation<
        SessionManagementControllerCancelApiResponse,
        SessionManagementControllerCancelApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}/cancel`,
          method: "POST",
          body: queryArg.cancelSessionRequest,
        }),
        invalidatesTags: ["Sessions"],
      }),
      sessionsControllerGetSessions: build.query<
        SessionsControllerGetSessionsApiResponse,
        SessionsControllerGetSessionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions`,
          params: {
            from: queryArg["from"],
            to: queryArg.to,
            groupId: queryArg.groupId,
          },
        }),
        providesTags: ["Sessions"],
      }),
      sessionsControllerPostSessions: build.mutation<
        SessionsControllerPostSessionsApiResponse,
        SessionsControllerPostSessionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions`,
          method: "POST",
          body: queryArg.newSession,
        }),
        invalidatesTags: ["Sessions"],
      }),
      settingsControllerTenantSettings: build.query<
        SettingsControllerTenantSettingsApiResponse,
        SettingsControllerTenantSettingsApiArg
      >({
        query: () => ({ url: `/api/v1/settings/tenant` }),
        providesTags: ["Settings"],
      }),
      settingsControllerUpdateTenant: build.mutation<
        SettingsControllerUpdateTenantApiResponse,
        SettingsControllerUpdateTenantApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/tenant`,
          method: "PUT",
          body: queryArg.tenantSettingsRequest,
        }),
        invalidatesTags: ["Settings"],
      }),
      settingsControllerPolicies: build.query<
        SettingsControllerPoliciesApiResponse,
        SettingsControllerPoliciesApiArg
      >({
        query: () => ({ url: `/api/v1/settings/policies` }),
        providesTags: ["Settings"],
      }),
      settingsControllerUpdatePolicies: build.mutation<
        SettingsControllerUpdatePoliciesApiResponse,
        SettingsControllerUpdatePoliciesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settings/policies`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Settings"],
      }),
      staffControllerGetStaff: build.query<
        StaffControllerGetStaffApiResponse,
        StaffControllerGetStaffApiArg
      >({
        query: () => ({ url: `/api/v1/staff` }),
        providesTags: ["Staff"],
      }),
      staffControllerPostStaff: build.mutation<
        StaffControllerPostStaffApiResponse,
        StaffControllerPostStaffApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff`,
          method: "POST",
          body: queryArg.newStaffV1,
        }),
        invalidatesTags: ["Staff"],
      }),
      staffManagementControllerSuspend: build.mutation<
        StaffManagementControllerSuspendApiResponse,
        StaffManagementControllerSuspendApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff/${queryArg.id}/suspend`,
          method: "POST",
        }),
        invalidatesTags: ["Staff"],
      }),
      staffManagementControllerActivate: build.mutation<
        StaffManagementControllerActivateApiResponse,
        StaffManagementControllerActivateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff/${queryArg.id}/activate`,
          method: "POST",
        }),
        invalidatesTags: ["Staff"],
      }),
      studentHistoryControllerAttendance: build.query<
        StudentHistoryControllerAttendanceApiResponse,
        StudentHistoryControllerAttendanceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/attendance`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Students"],
      }),
      studentHistoryControllerGrades: build.query<
        StudentHistoryControllerGradesApiResponse,
        StudentHistoryControllerGradesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/grades`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Students"],
      }),
      studentHistoryControllerArchive: build.mutation<
        StudentHistoryControllerArchiveApiResponse,
        StudentHistoryControllerArchiveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Students"],
      }),
      studentsControllerGetStudentsId: build.query<
        StudentsControllerGetStudentsIdApiResponse,
        StudentsControllerGetStudentsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/students/${queryArg.id}` }),
        providesTags: ["Students"],
      }),
      studentsControllerPutStudentsId: build.mutation<
        StudentsControllerPutStudentsIdApiResponse,
        StudentsControllerPutStudentsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}`,
          method: "PUT",
          body: queryArg.editStudent,
        }),
        invalidatesTags: ["Students"],
      }),
      studentHistoryControllerRotateQr: build.mutation<
        StudentHistoryControllerRotateQrApiResponse,
        StudentHistoryControllerRotateQrApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/qr/rotate`,
          method: "POST",
        }),
        invalidatesTags: ["Students"],
      }),
      studentsControllerGetStudents: build.query<
        StudentsControllerGetStudentsApiResponse,
        StudentsControllerGetStudentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Students"],
      }),
      studentsControllerPostStudents: build.mutation<
        StudentsControllerPostStudentsApiResponse,
        StudentsControllerPostStudentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students`,
          method: "POST",
          body: queryArg.newStudent,
        }),
        invalidatesTags: ["Students"],
      }),
      studentsControllerPatchStudentsIdStatus: build.mutation<
        StudentsControllerPatchStudentsIdStatusApiResponse,
        StudentsControllerPatchStudentsIdStatusApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/status`,
          method: "PATCH",
          body: queryArg.studentStatusChange,
        }),
        invalidatesTags: ["Students"],
      }),
      studentsControllerPostStudentsIdEnrollments: build.mutation<
        StudentsControllerPostStudentsIdEnrollmentsApiResponse,
        StudentsControllerPostStudentsIdEnrollmentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/enrollments`,
          method: "POST",
          body: queryArg.enrollV1,
        }),
        invalidatesTags: ["Students"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as backendApi };
export type AttendanceControllerGetSessionsIdAttendanceApiResponse = unknown;
export type AttendanceControllerGetSessionsIdAttendanceApiArg = {
  id: string;
};
export type AttendanceControllerGetSessionsIdOfflinePackApiResponse = unknown;
export type AttendanceControllerGetSessionsIdOfflinePackApiArg = {
  id: string;
};
export type AttendanceControllerPostAttendanceScanApiResponse = unknown;
export type AttendanceControllerPostAttendanceScanApiArg = {
  scanItem: ScanItem;
};
export type AttendanceControllerPostSessionsIdCloseApiResponse = unknown;
export type AttendanceControllerPostSessionsIdCloseApiArg = {
  id: string;
  closeSession: CloseSession;
};
export type AttendanceControllerPostAttendanceSyncApiResponse = unknown;
export type AttendanceControllerPostAttendanceSyncApiArg = {
  syncBatch: SyncBatch;
};
export type AttendanceManagementControllerManualApiResponse = unknown;
export type AttendanceManagementControllerManualApiArg = {
  id: string;
  manualAttendanceRequest: ManualAttendanceRequest;
};
export type AttendanceManagementControllerCorrectApiResponse = unknown;
export type AttendanceManagementControllerCorrectApiArg = {
  recordId: string;
  correctAttendanceRequest: CorrectAttendanceRequest;
};
export type AttendanceManagementControllerDeleteApiResponse = unknown;
export type AttendanceManagementControllerDeleteApiArg = {
  recordId: string;
  reason?: string;
};
export type SessionManagementControllerReopenApiResponse = unknown;
export type SessionManagementControllerReopenApiArg = {
  id: string;
  cancelSessionRequest: CancelSessionRequest;
};
export type AuditControllerGetAuditLogsApiResponse = unknown;
export type AuditControllerGetAuditLogsApiArg = {
  page?: number;
  pageSize?: number;
};
export type AuthControllerLoginApiResponse = /** status 200 OK */ AuthTokens;
export type AuthControllerLoginApiArg = {
  loginV1: LoginV1Write;
};
export type AuthControllerRequestOtpApiResponse = unknown;
export type AuthControllerRequestOtpApiArg = {
  otpRequest: OtpRequest;
};
export type AuthControllerVerifyOtpApiResponse =
  /** status 200 OK */ AuthTokens;
export type AuthControllerVerifyOtpApiArg = {
  otpVerify: OtpVerify;
};
export type AuthControllerRefreshApiResponse = /** status 200 OK */ AuthTokens;
export type AuthControllerRefreshApiArg = {
  refreshRequest: RefreshRequest;
};
export type AuthControllerLogoutApiResponse = unknown;
export type AuthControllerLogoutApiArg = {
  logoutRequest: LogoutRequest;
};
export type LegacyAuthControllerLoginApiResponse = unknown;
export type LegacyAuthControllerLoginApiArg = {
  loginRequest: LoginRequestWrite;
};
export type LegacyAuthControllerCurrentTenantApiResponse = unknown;
export type LegacyAuthControllerCurrentTenantApiArg = void;
export type PasswordControllerChangePasswordApiResponse = unknown;
export type PasswordControllerChangePasswordApiArg = {
  changePasswordRequest: ChangePasswordRequestWrite;
};
export type BranchesControllerGetBranchesApiResponse = unknown;
export type BranchesControllerGetBranchesApiArg = void;
export type BranchesControllerPostBranchesApiResponse = unknown;
export type BranchesControllerPostBranchesApiArg = {
  newBranch: NewBranch;
};
export type FacilityManagementControllerBranchApiResponse = unknown;
export type FacilityManagementControllerBranchApiArg = {
  id: string;
};
export type FacilityManagementControllerEditBranchApiResponse = unknown;
export type FacilityManagementControllerEditBranchApiArg = {
  id: string;
  editBranchRequest: EditBranchRequest;
};
export type CashShiftsControllerGetCashShiftsCurrentApiResponse = unknown;
export type CashShiftsControllerGetCashShiftsCurrentApiArg = void;
export type CashShiftsControllerPostCashShiftsOpenApiResponse = unknown;
export type CashShiftsControllerPostCashShiftsOpenApiArg = {
  openShift: OpenShift;
};
export type CashShiftsControllerPostCashShiftsIdCloseApiResponse = unknown;
export type CashShiftsControllerPostCashShiftsIdCloseApiArg = {
  id: string;
  closeShift: CloseShift;
};
export type DashboardControllerGetDashboardSummaryApiResponse = unknown;
export type DashboardControllerGetDashboardSummaryApiArg = void;
export type DashboardControllerGetDashboardTodaySessionsApiResponse = unknown;
export type DashboardControllerGetDashboardTodaySessionsApiArg = void;
export type DiscountsControllerListApiResponse = unknown;
export type DiscountsControllerListApiArg = void;
export type DiscountsControllerCreateApiResponse = unknown;
export type DiscountsControllerCreateApiArg = {
  discountRequest: DiscountRequest;
};
export type DiscountsControllerUpdateApiResponse = unknown;
export type DiscountsControllerUpdateApiArg = {
  id: string;
  discountRequest: DiscountRequest;
};
export type DiscountsControllerDeleteApiResponse = unknown;
export type DiscountsControllerDeleteApiArg = {
  id: string;
};
export type DiscountsControllerStudentDiscountsApiResponse = unknown;
export type DiscountsControllerStudentDiscountsApiArg = {
  id: string;
};
export type DiscountsControllerAssignApiResponse = unknown;
export type DiscountsControllerAssignApiArg = {
  id: string;
  studentDiscountRequest: StudentDiscountRequest;
};
export type DiscountsControllerApproveApiResponse = unknown;
export type DiscountsControllerApproveApiArg = {
  id: string;
  assignmentId: string;
};
export type DiscountsControllerRemoveApiResponse = unknown;
export type DiscountsControllerRemoveApiArg = {
  id: string;
  assignmentId: string;
};
export type ExcusesControllerPortalListApiResponse = unknown;
export type ExcusesControllerPortalListApiArg = {
  id: string;
};
export type ExcusesControllerCreateApiResponse = unknown;
export type ExcusesControllerCreateApiArg = {
  id: string;
  excuseRequest: ExcuseRequest;
};
export type ExcusesControllerEditApiResponse = unknown;
export type ExcusesControllerEditApiArg = {
  id: string;
  excuseRequest: ExcuseRequest;
};
export type ExcusesControllerWithdrawApiResponse = unknown;
export type ExcusesControllerWithdrawApiArg = {
  id: string;
};
export type ExcusesControllerStaffListApiResponse = unknown;
export type ExcusesControllerStaffListApiArg = {
  status?: string;
  page?: number;
  pageSize?: number;
};
export type ExcusesControllerApproveApiResponse = unknown;
export type ExcusesControllerApproveApiArg = {
  id: string;
};
export type ExcusesControllerRejectApiResponse = unknown;
export type ExcusesControllerRejectApiArg = {
  id: string;
};
export type ExpensesControllerListApiResponse = unknown;
export type ExpensesControllerListApiArg = {
  status?: string;
  page?: number;
  pageSize?: number;
};
export type ExpensesControllerCreateApiResponse = unknown;
export type ExpensesControllerCreateApiArg = {
  expenseRequest: ExpenseRequest;
};
export type ExpensesControllerDetailApiResponse = unknown;
export type ExpensesControllerDetailApiArg = {
  id: string;
};
export type ExpensesControllerEditApiResponse = unknown;
export type ExpensesControllerEditApiArg = {
  id: string;
  expenseRequest: ExpenseRequest;
};
export type ExpensesControllerDeleteApiResponse = unknown;
export type ExpensesControllerDeleteApiArg = {
  id: string;
};
export type ExpensesControllerApproveApiResponse = unknown;
export type ExpensesControllerApproveApiArg = {
  id: string;
};
export type ExpensesControllerRejectApiResponse = unknown;
export type ExpensesControllerRejectApiArg = {
  id: string;
};
export type DuesControllerDuesApiResponse = unknown;
export type DuesControllerDuesApiArg = {
  groupId?: string;
  overdueDays?: number;
  page?: number;
  pageSize?: number;
};
export type DuesControllerRemindApiResponse = unknown;
export type DuesControllerRemindApiArg = {
  studentId: string;
};
export type DuesControllerGenerateApiResponse = unknown;
export type DuesControllerGenerateApiArg = {
  period?: string;
};
export type FinanceControllerGetStudentsIdBalanceApiResponse = unknown;
export type FinanceControllerGetStudentsIdBalanceApiArg = {
  id: string;
};
export type FinanceControllerGetChargesApiResponse = unknown;
export type FinanceControllerGetChargesApiArg = {
  studentId?: string;
};
export type FinanceControllerPostChargesApiResponse = unknown;
export type FinanceControllerPostChargesApiArg = {
  newChargeV1: NewChargeV1;
};
export type FinanceControllerPostPaymentsApiResponse = unknown;
export type FinanceControllerPostPaymentsApiArg = {
  newPaymentV1: NewPaymentV1;
};
export type FinanceControllerGetPaymentsApiResponse = unknown;
export type FinanceControllerGetPaymentsApiArg = {
  page?: number;
  pageSize?: number;
};
export type FinanceControllerGetPaymentsIdApiResponse = unknown;
export type FinanceControllerGetPaymentsIdApiArg = {
  id: string;
};
export type FinanceControllerPostPaymentsIdVoidApiResponse = unknown;
export type FinanceControllerPostPaymentsIdVoidApiArg = {
  id: string;
  voidPayment: VoidPayment;
};
export type EnrollmentWorkflowControllerWaitlistApiResponse = unknown;
export type EnrollmentWorkflowControllerWaitlistApiArg = {
  id: string;
};
export type EnrollmentWorkflowControllerJoinWaitlistApiResponse = unknown;
export type EnrollmentWorkflowControllerJoinWaitlistApiArg = {
  id: string;
  waitlistRequest: WaitlistRequest;
};
export type EnrollmentWorkflowControllerRemoveWaitlistApiResponse = unknown;
export type EnrollmentWorkflowControllerRemoveWaitlistApiArg = {
  id: string;
  entryId: string;
};
export type EnrollmentWorkflowControllerTransferApiResponse = unknown;
export type EnrollmentWorkflowControllerTransferApiArg = {
  id: string;
  transferEnrollmentRequest: TransferEnrollmentRequest;
};
export type EnrollmentWorkflowControllerWithdrawApiResponse = unknown;
export type EnrollmentWorkflowControllerWithdrawApiArg = {
  id: string;
};
export type GroupManagementControllerDetailApiResponse = unknown;
export type GroupManagementControllerDetailApiArg = {
  id: string;
};
export type SchedulingWorkflowControllerUpdateGroupApiResponse = unknown;
export type SchedulingWorkflowControllerUpdateGroupApiArg = {
  id: string;
  updateGroupRequest: UpdateGroupRequest;
};
export type GroupManagementControllerPauseApiResponse = unknown;
export type GroupManagementControllerPauseApiArg = {
  id: string;
};
export type GroupManagementControllerResumeApiResponse = unknown;
export type GroupManagementControllerResumeApiArg = {
  id: string;
};
export type GroupManagementControllerScheduleApiResponse = unknown;
export type GroupManagementControllerScheduleApiArg = {
  id: string;
};
export type GroupManagementControllerReplaceScheduleApiResponse = unknown;
export type GroupManagementControllerReplaceScheduleApiArg = {
  id: string;
  body: WeeklySlot[];
};
export type GroupsControllerGetGroupsApiResponse = unknown;
export type GroupsControllerGetGroupsApiArg = {
  page?: number;
  pageSize?: number;
};
export type GroupsControllerPostGroupsApiResponse = unknown;
export type GroupsControllerPostGroupsApiArg = {
  newGroup: NewGroup;
};
export type GroupsControllerGetGroupsIdStudentsApiResponse = unknown;
export type GroupsControllerGetGroupsIdStudentsApiArg = {
  id: string;
};
export type GuardiansControllerListApiResponse = unknown;
export type GuardiansControllerListApiArg = {
  phone?: string;
  page?: number;
  pageSize?: number;
};
export type FacilityManagementControllerHallApiResponse = unknown;
export type FacilityManagementControllerHallApiArg = {
  id: string;
};
export type FacilityManagementControllerEditHallApiResponse = unknown;
export type FacilityManagementControllerEditHallApiArg = {
  id: string;
  editHallRequest: EditHallRequest;
};
export type HallsControllerGetHallsApiResponse = unknown;
export type HallsControllerGetHallsApiArg = {
  branchId?: string;
};
export type HallsControllerPostHallsApiResponse = unknown;
export type HallsControllerPostHallsApiArg = {
  newHall: NewHall;
};
export type SchedulingWorkflowControllerAvailabilityApiResponse = unknown;
export type SchedulingWorkflowControllerAvailabilityApiArg = {
  branchId?: string;
  fromUtc?: string;
  toUtc?: string;
};
export type GetHealthLiveApiResponse = unknown;
export type GetHealthLiveApiArg = void;
export type MessagesControllerGetMessagesApiResponse = unknown;
export type MessagesControllerGetMessagesApiArg = {
  page?: number;
  pageSize?: number;
};
export type PlatformControllerCreateTenantApiResponse = unknown;
export type PlatformControllerCreateTenantApiArg = {
  provisionTenant: ProvisionTenantWrite;
};
export type PortalControllerMeApiResponse = unknown;
export type PortalControllerMeApiArg = void;
export type PortalControllerOverviewApiResponse = unknown;
export type PortalControllerOverviewApiArg = {
  id: string;
};
export type PortalControllerSessionsApiResponse = unknown;
export type PortalControllerSessionsApiArg = {
  id: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};
export type PortalControllerBalanceApiResponse = unknown;
export type PortalControllerBalanceApiArg = {
  id: string;
};
export type PortalControllerCardApiResponse = unknown;
export type PortalControllerCardApiArg = void;
export type PortalControllerScheduleApiResponse = unknown;
export type PortalControllerScheduleApiArg = void;
export type ProfileControllerGetMeApiResponse = unknown;
export type ProfileControllerGetMeApiArg = void;
export type QuizAnalyticsControllerDistributionApiResponse = unknown;
export type QuizAnalyticsControllerDistributionApiArg = {
  id: string;
};
export type QuizAnalyticsControllerTopApiResponse = unknown;
export type QuizAnalyticsControllerTopApiArg = {
  id: string;
  limit?: number;
};
export type QuizAnalyticsControllerMakeupsApiResponse = unknown;
export type QuizAnalyticsControllerMakeupsApiArg = {
  id: string;
};
export type QuizAnalyticsControllerScheduleMakeupApiResponse = unknown;
export type QuizAnalyticsControllerScheduleMakeupApiArg = {
  id: string;
  quizMakeupRequest: QuizMakeupRequest;
};
export type QuizAnalyticsControllerCancelMakeupApiResponse = unknown;
export type QuizAnalyticsControllerCancelMakeupApiArg = {
  id: string;
  makeupId: string;
};
export type QuizzesControllerGetQuizzesApiResponse = unknown;
export type QuizzesControllerGetQuizzesApiArg = {
  groupId?: string;
};
export type QuizzesControllerPostQuizzesApiResponse = unknown;
export type QuizzesControllerPostQuizzesApiArg = {
  newQuizV1: NewQuizV1;
};
export type QuizzesControllerGetQuizzesIdApiResponse = unknown;
export type QuizzesControllerGetQuizzesIdApiArg = {
  id: string;
};
export type QuizzesControllerPutQuizzesIdGradesApiResponse = unknown;
export type QuizzesControllerPutQuizzesIdGradesApiArg = {
  id: string;
  body: GradeInputV1[];
};
export type QuizzesControllerPostQuizzesIdPublishApiResponse = unknown;
export type QuizzesControllerPostQuizzesIdPublishApiArg = {
  id: string;
};
export type ReportsControllerAttendanceReportApiResponse = unknown;
export type ReportsControllerAttendanceReportApiArg = {
  fromUtc?: string;
  toUtc?: string;
  groupId?: string;
};
export type ReportsControllerFinancialReportApiResponse = unknown;
export type ReportsControllerFinancialReportApiArg = {
  fromUtc?: string;
  toUtc?: string;
  branchId?: string;
};
export type ReportsControllerStudentsCsvApiResponse = unknown;
export type ReportsControllerStudentsCsvApiArg = void;
export type SchedulingWorkflowControllerGenerateApiResponse = unknown;
export type SchedulingWorkflowControllerGenerateApiArg = {
  id: string;
  generateSessionsRequest: GenerateSessionsRequest;
};
export type SchedulingWorkflowControllerPostponeApiResponse = unknown;
export type SchedulingWorkflowControllerPostponeApiArg = {
  id: string;
  postponeSessionRequest: PostponeSessionRequest;
};
export type SessionManagementControllerDetailApiResponse = unknown;
export type SessionManagementControllerDetailApiArg = {
  id: string;
};
export type SessionManagementControllerEditApiResponse = unknown;
export type SessionManagementControllerEditApiArg = {
  id: string;
  editSessionRequest: EditSessionRequest;
};
export type SessionManagementControllerCancelApiResponse = unknown;
export type SessionManagementControllerCancelApiArg = {
  id: string;
  cancelSessionRequest: CancelSessionRequest;
};
export type SessionsControllerGetSessionsApiResponse = unknown;
export type SessionsControllerGetSessionsApiArg = {
  from?: string;
  to?: string;
  groupId?: string;
};
export type SessionsControllerPostSessionsApiResponse = unknown;
export type SessionsControllerPostSessionsApiArg = {
  newSession: NewSession;
};
export type SettingsControllerTenantSettingsApiResponse = unknown;
export type SettingsControllerTenantSettingsApiArg = void;
export type SettingsControllerUpdateTenantApiResponse = unknown;
export type SettingsControllerUpdateTenantApiArg = {
  tenantSettingsRequest: TenantSettingsRequest;
};
export type SettingsControllerPoliciesApiResponse = unknown;
export type SettingsControllerPoliciesApiArg = void;
export type SettingsControllerUpdatePoliciesApiResponse = unknown;
export type SettingsControllerUpdatePoliciesApiArg = {
  body: {
    [key: string]: any;
  };
};
export type StaffControllerGetStaffApiResponse = unknown;
export type StaffControllerGetStaffApiArg = void;
export type StaffControllerPostStaffApiResponse = unknown;
export type StaffControllerPostStaffApiArg = {
  newStaffV1: NewStaffV1Write;
};
export type StaffManagementControllerSuspendApiResponse = unknown;
export type StaffManagementControllerSuspendApiArg = {
  id: string;
};
export type StaffManagementControllerActivateApiResponse = unknown;
export type StaffManagementControllerActivateApiArg = {
  id: string;
};
export type StudentHistoryControllerAttendanceApiResponse = unknown;
export type StudentHistoryControllerAttendanceApiArg = {
  id: string;
  page?: number;
  pageSize?: number;
};
export type StudentHistoryControllerGradesApiResponse = unknown;
export type StudentHistoryControllerGradesApiArg = {
  id: string;
  page?: number;
  pageSize?: number;
};
export type StudentHistoryControllerArchiveApiResponse = unknown;
export type StudentHistoryControllerArchiveApiArg = {
  id: string;
};
export type StudentsControllerGetStudentsIdApiResponse = unknown;
export type StudentsControllerGetStudentsIdApiArg = {
  id: string;
};
export type StudentsControllerPutStudentsIdApiResponse = unknown;
export type StudentsControllerPutStudentsIdApiArg = {
  id: string;
  editStudent: EditStudent;
};
export type StudentHistoryControllerRotateQrApiResponse = unknown;
export type StudentHistoryControllerRotateQrApiArg = {
  id: string;
};
export type StudentsControllerGetStudentsApiResponse = unknown;
export type StudentsControllerGetStudentsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
};
export type StudentsControllerPostStudentsApiResponse = unknown;
export type StudentsControllerPostStudentsApiArg = {
  newStudent: NewStudent;
};
export type StudentsControllerPatchStudentsIdStatusApiResponse = unknown;
export type StudentsControllerPatchStudentsIdStatusApiArg = {
  id: string;
  studentStatusChange: StudentStatusChange;
};
export type StudentsControllerPostStudentsIdEnrollmentsApiResponse = unknown;
export type StudentsControllerPostStudentsIdEnrollmentsApiArg = {
  id: string;
  enrollV1: EnrollV1;
};
export type ApiErrorResponse = {
  type: string | null;
  title: string | null;
  status: number;
  code: string | null;
  message: string | null;
  traceId: string | null;
  instance: string | null;
  errors?: {
    [key: string]: string[] | null;
  } | null;
};
export type ScanItem = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  sessionId?: string;
  qrToken?: string | null;
  code?: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  scannedAt?: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  clientRecordId?: string | null;
  deviceId?: string | null;
  override?: boolean;
  overrideReason?: string | null;
};
export type CloseSession = {
  notifyAbsent?: boolean;
};
export type SyncBatch = {
  deviceId: string | null;
  items: ScanItem[] | null;
};
export type ManualAttendanceRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  status: ("Present" | "Late" | "Absent" | "Excused") | null;
  reason: string | null;
};
export type CorrectAttendanceRequest = {
  status: ("Present" | "Late" | "Absent" | "Excused") | null;
  reason: string | null;
};
export type CancelSessionRequest = {
  reason: string | null;
  notify?: boolean;
};
export type AuthTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresInSeconds?: number;
  refreshExpiresAtUtc?: string;
  profile?: any | null;
  tenant?: any | null;
};
export type LoginV1 = {
  tenantSlug?: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
};
export type LoginV1Write = {
  tenantSlug?: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  password: string | null;
};
export type OtpRequest = {
  tenantSlug: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  purpose: ("guardian-login" | "student-login") | null;
  studentCode?: string | null;
};
export type OtpVerify = {
  tenantSlug: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  challengeId?: string;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  purpose: ("guardian-login" | "student-login") | null;
  code: string | null;
};
export type RefreshRequest = {
  tenantSlug: string | null;
  refreshToken: string | null;
};
export type LogoutRequest = {
  refreshToken: string | null;
};
export type LoginRequest = {
  tenantSlug: string | null;
  email: string | null;
};
export type LoginRequestWrite = {
  tenantSlug: string | null;
  email: string | null;
  password: string | null;
};
export type ChangePasswordRequest = {};
export type ChangePasswordRequestWrite = {
  currentPassword: string | null;
  newPassword: string | null;
};
export type NewBranch = {
  name: string | null;
  address?: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone?: string | null;
};
export type EditBranchRequest = {
  name: string | null;
  address?: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone?: string | null;
  isOpen: boolean;
};
export type OpenShift = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string;
  openingBalance: number;
};
export type CloseShift = {
  countedCash: number;
  varianceReason?: string | null;
};
export type DiscountRequest = {
  name: string | null;
  type: ("Percent" | "Fixed") | null;
  value: number;
  requiresApproval?: boolean;
};
export type StudentDiscountRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  discountId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  validFromUtc?: string;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  validToUtc?: string | null;
};
export type ExcuseRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  sessionId?: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  dateUtc?: string;
  reason: string | null;
  wantsMakeup?: boolean;
};
export type ExpenseRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  cashShiftId?: string | null;
  category: string | null;
  description: string | null;
  amount?: number;
};
export type NewChargeV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  period: string | null;
  amount?: number;
};
export type AllocationInput = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  feeChargeId?: string;
  amount?: number;
};
export type NewPaymentV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  amount?: number;
  method: ("Cash" | "VodafoneCash" | "InstaPay" | "Card" | "Fawry") | null;
  allocations?: AllocationInput[] | null;
  idempotencyKey?: string | null;
};
export type VoidPayment = {
  reason: string | null;
};
export type WaitlistRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
};
export type TransferEnrollmentRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  toGroupId?: string;
  reason: string | null;
};
export type UpdateGroupRequest = {
  name: string | null;
  capacity?: number;
  monthlyPrice: number;
  /** Non-empty UUID; all-zero UUID is invalid. */
  teacherId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string | null;
};
export type WeeklySlot = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes?: number;
};
export type NewGroup = {
  name: string | null;
  subject: string | null;
  grade: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  teacherId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string | null;
  capacity?: number;
  price: number;
};
export type EditHallRequest = {
  name: string | null;
  capacity?: number;
  equipment?: string | null;
  isAvailable: boolean;
};
export type NewHall = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string;
  name: string | null;
  capacity?: number;
  equipment?: string | null;
};
export type ProvisionTenant = {
  slug: string | null;
  name: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  ownerPhone?: string | null;
};
export type ProvisionTenantWrite = {
  slug: string | null;
  name: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPassword: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  ownerPhone?: string | null;
};
export type QuizMakeupRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  scheduledAtUtc?: string;
};
export type NewQuizV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  sessionId?: string;
  title: string | null;
  maxScore?: number;
};
export type GradeInputV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  score?: number | null;
  reason?: string | null;
};
export type GenerateSessionsRequest = {
  fromDate?: string;
  days?: number;
};
export type PostponeSessionRequest = {
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  startsAtUtc?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string | null;
  durationMinutes?: number;
  reason: string | null;
  notify?: boolean;
};
export type EditSessionRequest = {
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  startsAtUtc?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string | null;
  durationMinutes?: number;
  topic?: string | null;
};
export type NewSession = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  startsAtUtc?: string;
  durationMinutes?: number;
  kind: ("Regular" | "Extra" | "Review" | "Makeup") | null;
  topic?: string | null;
};
export type TenantSettingsRequest = {
  name: string | null;
};
export type NewStaffV1 = {
  name: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  email: string | null;
  role:
    | (
        | "BranchManager"
        | "Teacher"
        | "Assistant"
        | "Receptionist"
        | "Accountant"
      )
    | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string | null;
};
export type NewStaffV1Write = {
  name: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  email: string | null;
  password: string | null;
  role:
    | (
        | "BranchManager"
        | "Teacher"
        | "Assistant"
        | "Receptionist"
        | "Accountant"
      )
    | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string | null;
};
export type EditStudent = {
  /** Student name containing at least three words. */
  fullName: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone?: string | null;
  grade?: string | null;
};
export type NewGuardian = {
  fullName: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  relation: string | null;
};
export type NewStudent = {
  /** Student name containing at least three words. */
  fullName: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone?: string | null;
  grade?: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string | null;
  guardian: NewGuardian;
  guardianConsent?: boolean;
  confirmSibling?: boolean;
};
export type StudentStatusChange = {
  status: ("Active" | "Suspended" | "Withdrawn" | "Graduated") | null;
  reason: string | null;
};
export type EnrollV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
};
