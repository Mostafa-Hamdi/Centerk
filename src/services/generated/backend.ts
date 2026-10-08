import { api } from "../api";
export const addTagTypes = [
  "AcademicSettings",
  "Assignments",
  "Attendance",
  "Audit",
  "Auth",
  "AutomationRules",
  "Branches",
  "Campaigns",
  "CashShifts",
  "CenterTeachers",
  "ContentVideos",
  "Courses",
  "Dashboard",
  "Discounts",
  "Excuses",
  "Expenses",
  "Finance",
  "Groups",
  "Guardians",
  "HallBookings",
  "Halls",
  "Health",
  "Lookups",
  "Materials",
  "Messages",
  "MessageTemplates",
  "Notifications",
  "OnlineExams",
  "Payrolls",
  "Platform",
  "Portal",
  "PortalAssignments",
  "PortalExams",
  "Profile",
  "QuestionBank",
  "Quizzes",
  "Reports",
  "RolesPermissions",
  "ScheduledReports",
  "Search",
  "Sessions",
  "Settings",
  "Staff",
  "StaffAttendance",
  "Students",
  "TeacherSettlements",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV1Subjects: build.query<
        GetApiV1SubjectsApiResponse,
        GetApiV1SubjectsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/subjects`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["AcademicSettings"],
      }),
      postApiV1Subjects: build.mutation<
        PostApiV1SubjectsApiResponse,
        PostApiV1SubjectsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/subjects`,
          method: "POST",
          body: queryArg.subjectRequest,
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      getApiV1SubjectsId: build.query<
        GetApiV1SubjectsIdApiResponse,
        GetApiV1SubjectsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/subjects/${queryArg.id}` }),
        providesTags: ["AcademicSettings"],
      }),
      putApiV1SubjectsId: build.mutation<
        PutApiV1SubjectsIdApiResponse,
        PutApiV1SubjectsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/subjects/${queryArg.id}`,
          method: "PUT",
          body: queryArg.subjectRequest,
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      deleteApiV1SubjectsId: build.mutation<
        DeleteApiV1SubjectsIdApiResponse,
        DeleteApiV1SubjectsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/subjects/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      getApiV1GradeLevels: build.query<
        GetApiV1GradeLevelsApiResponse,
        GetApiV1GradeLevelsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/grade-levels`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["AcademicSettings"],
      }),
      postApiV1GradeLevels: build.mutation<
        PostApiV1GradeLevelsApiResponse,
        PostApiV1GradeLevelsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/grade-levels`,
          method: "POST",
          body: queryArg.gradeLevelRequest,
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      getApiV1GradeLevelsId: build.query<
        GetApiV1GradeLevelsIdApiResponse,
        GetApiV1GradeLevelsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/grade-levels/${queryArg.id}` }),
        providesTags: ["AcademicSettings"],
      }),
      putApiV1GradeLevelsId: build.mutation<
        PutApiV1GradeLevelsIdApiResponse,
        PutApiV1GradeLevelsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/grade-levels/${queryArg.id}`,
          method: "PUT",
          body: queryArg.gradeLevelRequest,
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      deleteApiV1GradeLevelsId: build.mutation<
        DeleteApiV1GradeLevelsIdApiResponse,
        DeleteApiV1GradeLevelsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/grade-levels/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      getApiV1AcademicTerms: build.query<
        GetApiV1AcademicTermsApiResponse,
        GetApiV1AcademicTermsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/academic-terms`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["AcademicSettings"],
      }),
      postApiV1AcademicTerms: build.mutation<
        PostApiV1AcademicTermsApiResponse,
        PostApiV1AcademicTermsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/academic-terms`,
          method: "POST",
          body: queryArg.academicTermRequest,
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      getApiV1AcademicTermsId: build.query<
        GetApiV1AcademicTermsIdApiResponse,
        GetApiV1AcademicTermsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/academic-terms/${queryArg.id}` }),
        providesTags: ["AcademicSettings"],
      }),
      putApiV1AcademicTermsId: build.mutation<
        PutApiV1AcademicTermsIdApiResponse,
        PutApiV1AcademicTermsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/academic-terms/${queryArg.id}`,
          method: "PUT",
          body: queryArg.academicTermRequest,
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      deleteApiV1AcademicTermsId: build.mutation<
        DeleteApiV1AcademicTermsIdApiResponse,
        DeleteApiV1AcademicTermsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/academic-terms/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AcademicSettings"],
      }),
      assignmentSubmissionsControllerList: build.query<
        AssignmentSubmissionsControllerListApiResponse,
        AssignmentSubmissionsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments/${queryArg.id}/submissions`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Assignments"],
      }),
      assignmentSubmissionsControllerGrade: build.mutation<
        AssignmentSubmissionsControllerGradeApiResponse,
        AssignmentSubmissionsControllerGradeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/submissions/${queryArg.id}/grade`,
          method: "PUT",
          body: queryArg.submissionGradeRequest,
        }),
        invalidatesTags: ["Assignments"],
      }),
      assignmentsControllerClose: build.mutation<
        AssignmentsControllerCloseApiResponse,
        AssignmentsControllerCloseApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments/${queryArg.id}/close`,
          method: "POST",
        }),
        invalidatesTags: ["Assignments"],
      }),
      assignmentsControllerOpen: build.mutation<
        AssignmentsControllerOpenApiResponse,
        AssignmentsControllerOpenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments/${queryArg.id}/open`,
          method: "POST",
        }),
        invalidatesTags: ["Assignments"],
      }),
      getApiV1Assignments: build.query<
        GetApiV1AssignmentsApiResponse,
        GetApiV1AssignmentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["Assignments"],
      }),
      postApiV1Assignments: build.mutation<
        PostApiV1AssignmentsApiResponse,
        PostApiV1AssignmentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments`,
          method: "POST",
          body: queryArg.assignmentRequest,
        }),
        invalidatesTags: ["Assignments"],
      }),
      getApiV1AssignmentsId: build.query<
        GetApiV1AssignmentsIdApiResponse,
        GetApiV1AssignmentsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/assignments/${queryArg.id}` }),
        providesTags: ["Assignments"],
      }),
      putApiV1AssignmentsId: build.mutation<
        PutApiV1AssignmentsIdApiResponse,
        PutApiV1AssignmentsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments/${queryArg.id}`,
          method: "PUT",
          body: queryArg.assignmentRequest,
        }),
        invalidatesTags: ["Assignments"],
      }),
      deleteApiV1AssignmentsId: build.mutation<
        DeleteApiV1AssignmentsIdApiResponse,
        DeleteApiV1AssignmentsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assignments/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Assignments"],
      }),
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
            userId: queryArg.userId,
            action: queryArg.action,
            entityType: queryArg.entityType,
            entityId: queryArg.entityId,
            from: queryArg["from"],
            to: queryArg.to,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Audit"],
      }),
      historyDetailControllerAuditDetail: build.query<
        HistoryDetailControllerAuditDetailApiResponse,
        HistoryDetailControllerAuditDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/audit-logs/${queryArg.id}` }),
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
          url: `/api/auth/login`,
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
      passwordRecoveryControllerForgot: build.mutation<
        PasswordRecoveryControllerForgotApiResponse,
        PasswordRecoveryControllerForgotApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/password/forgot`,
          method: "POST",
          body: queryArg.forgotPasswordRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      passwordRecoveryControllerReset: build.mutation<
        PasswordRecoveryControllerResetApiResponse,
        PasswordRecoveryControllerResetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/password/reset`,
          method: "POST",
          body: queryArg.resetPasswordRequest,
        }),
        invalidatesTags: ["Auth"],
      }),
      automationRulesControllerActive: build.mutation<
        AutomationRulesControllerActiveApiResponse,
        AutomationRulesControllerActiveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/automation-rules/${queryArg.id}/active`,
          method: "PATCH",
          body: queryArg.activeRequest,
        }),
        invalidatesTags: ["AutomationRules"],
      }),
      getApiV1AutomationRules: build.query<
        GetApiV1AutomationRulesApiResponse,
        GetApiV1AutomationRulesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/automation-rules`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["AutomationRules"],
      }),
      postApiV1AutomationRules: build.mutation<
        PostApiV1AutomationRulesApiResponse,
        PostApiV1AutomationRulesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/automation-rules`,
          method: "POST",
          body: queryArg.automationRequest,
        }),
        invalidatesTags: ["AutomationRules"],
      }),
      getApiV1AutomationRulesId: build.query<
        GetApiV1AutomationRulesIdApiResponse,
        GetApiV1AutomationRulesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/automation-rules/${queryArg.id}`,
        }),
        providesTags: ["AutomationRules"],
      }),
      putApiV1AutomationRulesId: build.mutation<
        PutApiV1AutomationRulesIdApiResponse,
        PutApiV1AutomationRulesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/automation-rules/${queryArg.id}`,
          method: "PUT",
          body: queryArg.automationRequest,
        }),
        invalidatesTags: ["AutomationRules"],
      }),
      deleteApiV1AutomationRulesId: build.mutation<
        DeleteApiV1AutomationRulesIdApiResponse,
        DeleteApiV1AutomationRulesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/automation-rules/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AutomationRules"],
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
      resourceLifecycleControllerDeleteBranch: build.mutation<
        ResourceLifecycleControllerDeleteBranchApiResponse,
        ResourceLifecycleControllerDeleteBranchApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/branches/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Branches"],
      }),
      campaignsControllerPreview: build.query<
        CampaignsControllerPreviewApiResponse,
        CampaignsControllerPreviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns/${queryArg.id}/recipients/preview`,
        }),
        providesTags: ["Campaigns"],
      }),
      campaignsControllerSendNow: build.mutation<
        CampaignsControllerSendNowApiResponse,
        CampaignsControllerSendNowApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns/${queryArg.id}/send-now`,
          method: "POST",
        }),
        invalidatesTags: ["Campaigns"],
      }),
      campaignsControllerCancel: build.mutation<
        CampaignsControllerCancelApiResponse,
        CampaignsControllerCancelApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns/${queryArg.id}/cancel`,
          method: "POST",
        }),
        invalidatesTags: ["Campaigns"],
      }),
      campaignsControllerDuplicate: build.mutation<
        CampaignsControllerDuplicateApiResponse,
        CampaignsControllerDuplicateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns/${queryArg.id}/duplicate`,
          method: "POST",
        }),
        invalidatesTags: ["Campaigns"],
      }),
      getApiV1Campaigns: build.query<
        GetApiV1CampaignsApiResponse,
        GetApiV1CampaignsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["Campaigns"],
      }),
      postApiV1Campaigns: build.mutation<
        PostApiV1CampaignsApiResponse,
        PostApiV1CampaignsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns`,
          method: "POST",
          body: queryArg.campaignRequest,
        }),
        invalidatesTags: ["Campaigns"],
      }),
      getApiV1CampaignsId: build.query<
        GetApiV1CampaignsIdApiResponse,
        GetApiV1CampaignsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/campaigns/${queryArg.id}` }),
        providesTags: ["Campaigns"],
      }),
      putApiV1CampaignsId: build.mutation<
        PutApiV1CampaignsIdApiResponse,
        PutApiV1CampaignsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns/${queryArg.id}`,
          method: "PUT",
          body: queryArg.campaignRequest,
        }),
        invalidatesTags: ["Campaigns"],
      }),
      deleteApiV1CampaignsId: build.mutation<
        DeleteApiV1CampaignsIdApiResponse,
        DeleteApiV1CampaignsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/campaigns/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Campaigns"],
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
      historyDetailControllerShiftsList: build.query<
        HistoryDetailControllerShiftsListApiResponse,
        HistoryDetailControllerShiftsListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/cash-shifts`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            userId: queryArg.userId,
          },
        }),
        providesTags: ["CashShifts"],
      }),
      historyDetailControllerShift: build.query<
        HistoryDetailControllerShiftApiResponse,
        HistoryDetailControllerShiftApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/cash-shifts/${queryArg.id}` }),
        providesTags: ["CashShifts"],
      }),
      centerTeachersControllerAgreements: build.query<
        CenterTeachersControllerAgreementsApiResponse,
        CenterTeachersControllerAgreementsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/teachers/${queryArg.id}/agreements`,
        }),
        providesTags: ["CenterTeachers"],
      }),
      centerTeachersControllerAgreement: build.mutation<
        CenterTeachersControllerAgreementApiResponse,
        CenterTeachersControllerAgreementApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/teachers/${queryArg.id}/agreements`,
          method: "POST",
          body: queryArg.agreementRequest,
        }),
        invalidatesTags: ["CenterTeachers"],
      }),
      getApiV1Teachers: build.query<
        GetApiV1TeachersApiResponse,
        GetApiV1TeachersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/teachers`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["CenterTeachers"],
      }),
      postApiV1Teachers: build.mutation<
        PostApiV1TeachersApiResponse,
        PostApiV1TeachersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/teachers`,
          method: "POST",
          body: queryArg.teacherRequest,
        }),
        invalidatesTags: ["CenterTeachers"],
      }),
      getApiV1TeachersId: build.query<
        GetApiV1TeachersIdApiResponse,
        GetApiV1TeachersIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/teachers/${queryArg.id}` }),
        providesTags: ["CenterTeachers"],
      }),
      putApiV1TeachersId: build.mutation<
        PutApiV1TeachersIdApiResponse,
        PutApiV1TeachersIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/teachers/${queryArg.id}`,
          method: "PUT",
          body: queryArg.teacherRequest,
        }),
        invalidatesTags: ["CenterTeachers"],
      }),
      deleteApiV1TeachersId: build.mutation<
        DeleteApiV1TeachersIdApiResponse,
        DeleteApiV1TeachersIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/teachers/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["CenterTeachers"],
      }),
      videosControllerHide: build.mutation<
        VideosControllerHideApiResponse,
        VideosControllerHideApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/videos/${queryArg.id}/hide`,
          method: "POST",
        }),
        invalidatesTags: ["ContentVideos"],
      }),
      getApiV1Videos: build.query<
        GetApiV1VideosApiResponse,
        GetApiV1VideosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/videos`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["ContentVideos"],
      }),
      postApiV1Videos: build.mutation<
        PostApiV1VideosApiResponse,
        PostApiV1VideosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/videos`,
          method: "POST",
          body: queryArg.videoRequest,
        }),
        invalidatesTags: ["ContentVideos"],
      }),
      getApiV1VideosId: build.query<
        GetApiV1VideosIdApiResponse,
        GetApiV1VideosIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/videos/${queryArg.id}` }),
        providesTags: ["ContentVideos"],
      }),
      putApiV1VideosId: build.mutation<
        PutApiV1VideosIdApiResponse,
        PutApiV1VideosIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/videos/${queryArg.id}`,
          method: "PUT",
          body: queryArg.videoRequest,
        }),
        invalidatesTags: ["ContentVideos"],
      }),
      deleteApiV1VideosId: build.mutation<
        DeleteApiV1VideosIdApiResponse,
        DeleteApiV1VideosIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/videos/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ContentVideos"],
      }),
      getApiV1Courses: build.query<
        GetApiV1CoursesApiResponse,
        GetApiV1CoursesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/courses`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["Courses"],
      }),
      postApiV1Courses: build.mutation<
        PostApiV1CoursesApiResponse,
        PostApiV1CoursesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/courses`,
          method: "POST",
          body: queryArg.courseRequest,
        }),
        invalidatesTags: ["Courses"],
      }),
      getApiV1CoursesId: build.query<
        GetApiV1CoursesIdApiResponse,
        GetApiV1CoursesIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/courses/${queryArg.id}` }),
        providesTags: ["Courses"],
      }),
      putApiV1CoursesId: build.mutation<
        PutApiV1CoursesIdApiResponse,
        PutApiV1CoursesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/courses/${queryArg.id}`,
          method: "PUT",
          body: queryArg.courseRequest,
        }),
        invalidatesTags: ["Courses"],
      }),
      deleteApiV1CoursesId: build.mutation<
        DeleteApiV1CoursesIdApiResponse,
        DeleteApiV1CoursesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/courses/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Courses"],
      }),
      dashboardControllerSummary: build.query<
        DashboardControllerSummaryApiResponse,
        DashboardControllerSummaryApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dashboard/summary`,
          params: {
            branchId: queryArg.branchId,
            date: queryArg.date,
          },
        }),
        providesTags: ["Dashboard"],
      }),
      dashboardControllerTodaySessions: build.query<
        DashboardControllerTodaySessionsApiResponse,
        DashboardControllerTodaySessionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dashboard/today-sessions`,
          params: {
            branchId: queryArg.branchId,
            date: queryArg.date,
          },
        }),
        providesTags: ["Dashboard"],
      }),
      dashboardControllerAlerts: build.query<
        DashboardControllerAlertsApiResponse,
        DashboardControllerAlertsApiArg
      >({
        query: () => ({ url: `/api/v1/dashboard/alerts` }),
        providesTags: ["Dashboard"],
      }),
      dashboardControllerAlertStudents: build.query<
        DashboardControllerAlertStudentsApiResponse,
        DashboardControllerAlertStudentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dashboard/alerts/${queryArg["type"]}/students`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Dashboard"],
      }),
      dashboardControllerNotify: build.mutation<
        DashboardControllerNotifyApiResponse,
        DashboardControllerNotifyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/dashboard/alerts/${queryArg["type"]}/notify`,
          method: "POST",
          body: queryArg.alertNotifyRequest,
        }),
        invalidatesTags: ["Dashboard"],
      }),
      dashboardControllerIncome7Days: build.query<
        DashboardControllerIncome7DaysApiResponse,
        DashboardControllerIncome7DaysApiArg
      >({
        query: () => ({ url: `/api/v1/dashboard/income-7d` }),
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
      discountsControllerDetail: build.query<
        DiscountsControllerDetailApiResponse,
        DiscountsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/discounts/${queryArg.id}` }),
        providesTags: ["Discounts"],
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
      getApiV1ExpenseCategories: build.query<
        GetApiV1ExpenseCategoriesApiResponse,
        GetApiV1ExpenseCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense-categories`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["Expenses"],
      }),
      postApiV1ExpenseCategories: build.mutation<
        PostApiV1ExpenseCategoriesApiResponse,
        PostApiV1ExpenseCategoriesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense-categories`,
          method: "POST",
          body: queryArg.categoryRequest,
        }),
        invalidatesTags: ["Expenses"],
      }),
      getApiV1ExpenseCategoriesId: build.query<
        GetApiV1ExpenseCategoriesIdApiResponse,
        GetApiV1ExpenseCategoriesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense-categories/${queryArg.id}`,
        }),
        providesTags: ["Expenses"],
      }),
      putApiV1ExpenseCategoriesId: build.mutation<
        PutApiV1ExpenseCategoriesIdApiResponse,
        PutApiV1ExpenseCategoriesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense-categories/${queryArg.id}`,
          method: "PUT",
          body: queryArg.categoryRequest,
        }),
        invalidatesTags: ["Expenses"],
      }),
      deleteApiV1ExpenseCategoriesId: build.mutation<
        DeleteApiV1ExpenseCategoriesIdApiResponse,
        DeleteApiV1ExpenseCategoriesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/expense-categories/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Expenses"],
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
      chargeManagementControllerDetail: build.query<
        ChargeManagementControllerDetailApiResponse,
        ChargeManagementControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/charges/${queryArg.id}` }),
        providesTags: ["Finance"],
      }),
      chargeManagementControllerUpdate: build.mutation<
        ChargeManagementControllerUpdateApiResponse,
        ChargeManagementControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/charges/${queryArg.id}`,
          method: "PUT",
          body: queryArg.chargeEditRequest,
        }),
        invalidatesTags: ["Finance"],
      }),
      chargeManagementControllerDelete: build.mutation<
        ChargeManagementControllerDeleteApiResponse,
        ChargeManagementControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/charges/${queryArg.id}`,
          method: "DELETE",
          params: {
            reason: queryArg.reason,
          },
        }),
        invalidatesTags: ["Finance"],
      }),
      chargeManagementControllerWaive: build.mutation<
        ChargeManagementControllerWaiveApiResponse,
        ChargeManagementControllerWaiveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/charges/${queryArg.id}/waive`,
          method: "POST",
          body: queryArg.actionReasonRequest,
        }),
        invalidatesTags: ["Finance"],
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
            studentId: queryArg.studentId,
            date: queryArg.date,
            shiftId: queryArg.shiftId,
            method: queryArg.method,
            status: queryArg.status,
            sort: queryArg.sort,
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
      paymentManagementControllerUpdate: build.mutation<
        PaymentManagementControllerUpdateApiResponse,
        PaymentManagementControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payments/${queryArg.id}`,
          method: "PUT",
          body: queryArg.paymentEditRequest,
        }),
        invalidatesTags: ["Finance"],
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
      printableDocumentsControllerReceipt: build.query<
        PrintableDocumentsControllerReceiptApiResponse,
        PrintableDocumentsControllerReceiptApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payments/${queryArg.id}/receipt.pdf`,
        }),
        providesTags: ["Finance"],
      }),
      printableDocumentsControllerSendReceipt: build.mutation<
        PrintableDocumentsControllerSendReceiptApiResponse,
        PrintableDocumentsControllerSendReceiptApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payments/${queryArg.id}/receipt/send`,
          method: "POST",
          body: queryArg.documentSendRequest,
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
      resourceLifecycleControllerDeleteGroup: build.mutation<
        ResourceLifecycleControllerDeleteGroupApiResponse,
        ResourceLifecycleControllerDeleteGroupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Groups"],
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
            search: queryArg.search,
            gradeLevelId: queryArg.gradeLevelId,
            status: queryArg.status,
            teacherId: queryArg.teacherId,
            sort: queryArg.sort,
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
      resourceLifecycleControllerDuplicateGroup: build.mutation<
        ResourceLifecycleControllerDuplicateGroupApiResponse,
        ResourceLifecycleControllerDuplicateGroupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/groups/${queryArg.id}/duplicate`,
          method: "POST",
        }),
        invalidatesTags: ["Groups"],
      }),
      guardianManagementControllerDetail: build.query<
        GuardianManagementControllerDetailApiResponse,
        GuardianManagementControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/guardians/${queryArg.id}` }),
        providesTags: ["Guardians"],
      }),
      guardianManagementControllerUpdate: build.mutation<
        GuardianManagementControllerUpdateApiResponse,
        GuardianManagementControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/guardians/${queryArg.id}`,
          method: "PUT",
          body: queryArg.guardianRequest,
        }),
        invalidatesTags: ["Guardians"],
      }),
      guardianManagementControllerDelete: build.mutation<
        GuardianManagementControllerDeleteApiResponse,
        GuardianManagementControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/guardians/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Guardians"],
      }),
      guardianManagementControllerCreate: build.mutation<
        GuardianManagementControllerCreateApiResponse,
        GuardianManagementControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/guardians`,
          method: "POST",
          body: queryArg.guardianRequest,
        }),
        invalidatesTags: ["Guardians"],
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
      hallBookingsControllerList: build.query<
        HallBookingsControllerListApiResponse,
        HallBookingsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/hall-bookings`,
          params: {
            hallId: queryArg.hallId,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["HallBookings"],
      }),
      hallBookingsControllerCreate: build.mutation<
        HallBookingsControllerCreateApiResponse,
        HallBookingsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/hall-bookings`,
          method: "POST",
          body: queryArg.bookingRequest,
        }),
        invalidatesTags: ["HallBookings"],
      }),
      hallBookingsControllerDetail: build.query<
        HallBookingsControllerDetailApiResponse,
        HallBookingsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/hall-bookings/${queryArg.id}` }),
        providesTags: ["HallBookings"],
      }),
      hallBookingsControllerUpdate: build.mutation<
        HallBookingsControllerUpdateApiResponse,
        HallBookingsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/hall-bookings/${queryArg.id}`,
          method: "PUT",
          body: queryArg.bookingRequest,
        }),
        invalidatesTags: ["HallBookings"],
      }),
      hallBookingsControllerDelete: build.mutation<
        HallBookingsControllerDeleteApiResponse,
        HallBookingsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/hall-bookings/${queryArg.id}`,
          method: "DELETE",
          params: {
            reason: queryArg.reason,
          },
        }),
        invalidatesTags: ["HallBookings"],
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
      resourceLifecycleControllerDeleteHall: build.mutation<
        ResourceLifecycleControllerDeleteHallApiResponse,
        ResourceLifecycleControllerDeleteHallApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/halls/${queryArg.id}`,
          method: "DELETE",
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
      frontendLookupsControllerGrades: build.query<
        FrontendLookupsControllerGradesApiResponse,
        FrontendLookupsControllerGradesApiArg
      >({
        query: () => ({ url: `/api/v1/lookups/grade-levels` }),
        providesTags: ["Lookups"],
      }),
      materialsControllerList: build.query<
        MaterialsControllerListApiResponse,
        MaterialsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/materials`,
          params: {
            search: queryArg.search,
            lowStock: queryArg.lowStock,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["Materials"],
      }),
      materialsControllerCreate: build.mutation<
        MaterialsControllerCreateApiResponse,
        MaterialsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/materials`,
          method: "POST",
          body: queryArg.materialRequest,
        }),
        invalidatesTags: ["Materials"],
      }),
      materialsControllerDetail: build.query<
        MaterialsControllerDetailApiResponse,
        MaterialsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/materials/${queryArg.id}` }),
        providesTags: ["Materials"],
      }),
      materialsControllerUpdate: build.mutation<
        MaterialsControllerUpdateApiResponse,
        MaterialsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/materials/${queryArg.id}`,
          method: "PUT",
          body: queryArg.materialRequest,
        }),
        invalidatesTags: ["Materials"],
      }),
      materialsControllerDelete: build.mutation<
        MaterialsControllerDeleteApiResponse,
        MaterialsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/materials/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Materials"],
      }),
      materialsControllerDuplicate: build.mutation<
        MaterialsControllerDuplicateApiResponse,
        MaterialsControllerDuplicateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/materials/${queryArg.id}/duplicate`,
          method: "POST",
        }),
        invalidatesTags: ["Materials"],
      }),
      stockMovementsControllerList: build.query<
        StockMovementsControllerListApiResponse,
        StockMovementsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/stock-movements`,
          params: {
            materialId: queryArg.materialId,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Materials"],
      }),
      stockMovementsControllerCreate: build.mutation<
        StockMovementsControllerCreateApiResponse,
        StockMovementsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/stock-movements`,
          method: "POST",
          body: queryArg.movementRequest,
        }),
        invalidatesTags: ["Materials"],
      }),
      stockMovementsControllerDetail: build.query<
        StockMovementsControllerDetailApiResponse,
        StockMovementsControllerDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/stock-movements/${queryArg.id}`,
        }),
        providesTags: ["Materials"],
      }),
      stockMovementsControllerUpdate: build.mutation<
        StockMovementsControllerUpdateApiResponse,
        StockMovementsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/stock-movements/${queryArg.id}`,
          method: "PUT",
          body: queryArg.movementRequest,
        }),
        invalidatesTags: ["Materials"],
      }),
      stockMovementsControllerDelete: build.mutation<
        StockMovementsControllerDeleteApiResponse,
        StockMovementsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/stock-movements/${queryArg.id}`,
          method: "DELETE",
          params: {
            reason: queryArg.reason,
          },
        }),
        invalidatesTags: ["Materials"],
      }),
      materialDeliveriesControllerList: build.query<
        MaterialDeliveriesControllerListApiResponse,
        MaterialDeliveriesControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/material-deliveries`,
          params: {
            studentId: queryArg.studentId,
            materialId: queryArg.materialId,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Materials"],
      }),
      materialDeliveriesControllerCreate: build.mutation<
        MaterialDeliveriesControllerCreateApiResponse,
        MaterialDeliveriesControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/material-deliveries`,
          method: "POST",
          body: queryArg.deliveryRequest,
        }),
        invalidatesTags: ["Materials"],
      }),
      materialDeliveriesControllerDetail: build.query<
        MaterialDeliveriesControllerDetailApiResponse,
        MaterialDeliveriesControllerDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/material-deliveries/${queryArg.id}`,
        }),
        providesTags: ["Materials"],
      }),
      materialDeliveriesControllerUpdate: build.mutation<
        MaterialDeliveriesControllerUpdateApiResponse,
        MaterialDeliveriesControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/material-deliveries/${queryArg.id}`,
          method: "PUT",
          body: queryArg.deliveryRequest,
        }),
        invalidatesTags: ["Materials"],
      }),
      materialDeliveriesControllerDelete: build.mutation<
        MaterialDeliveriesControllerDeleteApiResponse,
        MaterialDeliveriesControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/material-deliveries/${queryArg.id}`,
          method: "DELETE",
          params: {
            reason: queryArg.reason,
          },
        }),
        invalidatesTags: ["Materials"],
      }),
      materialDeliveriesControllerCollect: build.mutation<
        MaterialDeliveriesControllerCollectApiResponse,
        MaterialDeliveriesControllerCollectApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/material-deliveries/${queryArg.id}/collect`,
          method: "POST",
          body: queryArg.newPaymentV1,
        }),
        invalidatesTags: ["Materials"],
      }),
      historyDetailControllerMessage: build.query<
        HistoryDetailControllerMessageApiResponse,
        HistoryDetailControllerMessageApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/messages/${queryArg.id}` }),
        providesTags: ["Messages"],
      }),
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
      messageTemplatesControllerDuplicate: build.mutation<
        MessageTemplatesControllerDuplicateApiResponse,
        MessageTemplatesControllerDuplicateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/message-templates/${queryArg.id}/duplicate`,
          method: "POST",
        }),
        invalidatesTags: ["MessageTemplates"],
      }),
      getApiV1MessageTemplates: build.query<
        GetApiV1MessageTemplatesApiResponse,
        GetApiV1MessageTemplatesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/message-templates`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["MessageTemplates"],
      }),
      postApiV1MessageTemplates: build.mutation<
        PostApiV1MessageTemplatesApiResponse,
        PostApiV1MessageTemplatesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/message-templates`,
          method: "POST",
          body: queryArg.templateRequest,
        }),
        invalidatesTags: ["MessageTemplates"],
      }),
      getApiV1MessageTemplatesId: build.query<
        GetApiV1MessageTemplatesIdApiResponse,
        GetApiV1MessageTemplatesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/message-templates/${queryArg.id}`,
        }),
        providesTags: ["MessageTemplates"],
      }),
      putApiV1MessageTemplatesId: build.mutation<
        PutApiV1MessageTemplatesIdApiResponse,
        PutApiV1MessageTemplatesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/message-templates/${queryArg.id}`,
          method: "PUT",
          body: queryArg.templateRequest,
        }),
        invalidatesTags: ["MessageTemplates"],
      }),
      deleteApiV1MessageTemplatesId: build.mutation<
        DeleteApiV1MessageTemplatesIdApiResponse,
        DeleteApiV1MessageTemplatesIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/message-templates/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["MessageTemplates"],
      }),
      frontendShellControllerNotifications: build.query<
        FrontendShellControllerNotificationsApiResponse,
        FrontendShellControllerNotificationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/notifications`,
          params: {
            unreadOnly: queryArg.unreadOnly,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Notifications"],
      }),
      frontendShellControllerReadAll: build.mutation<
        FrontendShellControllerReadAllApiResponse,
        FrontendShellControllerReadAllApiArg
      >({
        query: () => ({
          url: `/api/v1/notifications/read-all`,
          method: "POST",
        }),
        invalidatesTags: ["Notifications"],
      }),
      frontendShellControllerRead: build.mutation<
        FrontendShellControllerReadApiResponse,
        FrontendShellControllerReadApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/notifications/${queryArg.id}/read`,
          method: "POST",
        }),
        invalidatesTags: ["Notifications"],
      }),
      onlineExamsControllerList: build.query<
        OnlineExamsControllerListApiResponse,
        OnlineExamsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams`,
          params: {
            groupId: queryArg.groupId,
            status: queryArg.status,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["OnlineExams"],
      }),
      onlineExamsControllerCreate: build.mutation<
        OnlineExamsControllerCreateApiResponse,
        OnlineExamsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams`,
          method: "POST",
          body: queryArg.onlineExamRequest,
        }),
        invalidatesTags: ["OnlineExams"],
      }),
      onlineExamsControllerDetail: build.query<
        OnlineExamsControllerDetailApiResponse,
        OnlineExamsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/online-exams/${queryArg.id}` }),
        providesTags: ["OnlineExams"],
      }),
      onlineExamsControllerUpdate: build.mutation<
        OnlineExamsControllerUpdateApiResponse,
        OnlineExamsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams/${queryArg.id}`,
          method: "PUT",
          body: queryArg.onlineExamRequest,
        }),
        invalidatesTags: ["OnlineExams"],
      }),
      onlineExamsControllerDelete: build.mutation<
        OnlineExamsControllerDeleteApiResponse,
        OnlineExamsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["OnlineExams"],
      }),
      onlineExamsControllerPublish: build.mutation<
        OnlineExamsControllerPublishApiResponse,
        OnlineExamsControllerPublishApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams/${queryArg.id}/publish`,
          method: "POST",
        }),
        invalidatesTags: ["OnlineExams"],
      }),
      onlineExamsControllerUnpublish: build.mutation<
        OnlineExamsControllerUnpublishApiResponse,
        OnlineExamsControllerUnpublishApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams/${queryArg.id}/unpublish`,
          method: "POST",
        }),
        invalidatesTags: ["OnlineExams"],
      }),
      onlineExamsControllerResultsList: build.query<
        OnlineExamsControllerResultsListApiResponse,
        OnlineExamsControllerResultsListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/online-exams/${queryArg.id}/results`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["OnlineExams"],
      }),
      examGradingControllerGrade: build.mutation<
        ExamGradingControllerGradeApiResponse,
        ExamGradingControllerGradeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/attempts/${queryArg.id}/answers/${queryArg.questionId}/grade`,
          method: "PUT",
          body: queryArg.essayGradeRequest,
        }),
        invalidatesTags: ["OnlineExams"],
      }),
      payrollsControllerList: build.query<
        PayrollsControllerListApiResponse,
        PayrollsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payrolls`,
          params: {
            month: queryArg.month,
            userId: queryArg.userId,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Payrolls"],
      }),
      payrollsControllerCreate: build.mutation<
        PayrollsControllerCreateApiResponse,
        PayrollsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payrolls`,
          method: "POST",
          body: queryArg.payrollRequest,
        }),
        invalidatesTags: ["Payrolls"],
      }),
      payrollsControllerDetail: build.query<
        PayrollsControllerDetailApiResponse,
        PayrollsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/payrolls/${queryArg.id}` }),
        providesTags: ["Payrolls"],
      }),
      payrollsControllerUpdate: build.mutation<
        PayrollsControllerUpdateApiResponse,
        PayrollsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payrolls/${queryArg.id}`,
          method: "PUT",
          body: queryArg.payrollRequest,
        }),
        invalidatesTags: ["Payrolls"],
      }),
      payrollsControllerDelete: build.mutation<
        PayrollsControllerDeleteApiResponse,
        PayrollsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payrolls/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Payrolls"],
      }),
      payrollsControllerPay: build.mutation<
        PayrollsControllerPayApiResponse,
        PayrollsControllerPayApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/payrolls/${queryArg.id}/pay`,
          method: "POST",
          body: queryArg.payrollPayRequest,
        }),
        invalidatesTags: ["Payrolls"],
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
      portalAssignmentsControllerList: build.query<
        PortalAssignmentsControllerListApiResponse,
        PortalAssignmentsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/assignments`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["PortalAssignments"],
      }),
      portalAssignmentsControllerDetail: build.query<
        PortalAssignmentsControllerDetailApiResponse,
        PortalAssignmentsControllerDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/assignments/${queryArg.id}/submission`,
        }),
        providesTags: ["PortalAssignments"],
      }),
      portalAssignmentsControllerSubmit: build.mutation<
        PortalAssignmentsControllerSubmitApiResponse,
        PortalAssignmentsControllerSubmitApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/assignments/${queryArg.id}/submission`,
          method: "POST",
          body: queryArg.submissionRequest,
        }),
        invalidatesTags: ["PortalAssignments"],
      }),
      portalAssignmentsControllerUpdate: build.mutation<
        PortalAssignmentsControllerUpdateApiResponse,
        PortalAssignmentsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/assignments/${queryArg.id}/submission`,
          method: "PUT",
          body: queryArg.submissionRequest,
        }),
        invalidatesTags: ["PortalAssignments"],
      }),
      portalAssignmentsControllerWithdraw: build.mutation<
        PortalAssignmentsControllerWithdrawApiResponse,
        PortalAssignmentsControllerWithdrawApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/assignments/${queryArg.id}/submission`,
          method: "DELETE",
        }),
        invalidatesTags: ["PortalAssignments"],
      }),
      portalExamsControllerList: build.query<
        PortalExamsControllerListApiResponse,
        PortalExamsControllerListApiArg
      >({
        query: () => ({ url: `/api/v1/portal/exams` }),
        providesTags: ["PortalExams"],
      }),
      portalExamsControllerStart: build.mutation<
        PortalExamsControllerStartApiResponse,
        PortalExamsControllerStartApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/exams/${queryArg.id}/attempts`,
          method: "POST",
        }),
        invalidatesTags: ["PortalExams"],
      }),
      portalExamsControllerDetail: build.query<
        PortalExamsControllerDetailApiResponse,
        PortalExamsControllerDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/attempts/${queryArg.id}`,
        }),
        providesTags: ["PortalExams"],
      }),
      portalExamsControllerAnswer: build.mutation<
        PortalExamsControllerAnswerApiResponse,
        PortalExamsControllerAnswerApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/attempts/${queryArg.id}/answers/${queryArg.questionId}`,
          method: "PUT",
          body: queryArg.examAnswerRequest,
        }),
        invalidatesTags: ["PortalExams"],
      }),
      portalExamsControllerSubmit: build.mutation<
        PortalExamsControllerSubmitApiResponse,
        PortalExamsControllerSubmitApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/attempts/${queryArg.id}/submit`,
          method: "POST",
        }),
        invalidatesTags: ["PortalExams"],
      }),
      portalExamsControllerReview: build.query<
        PortalExamsControllerReviewApiResponse,
        PortalExamsControllerReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/portal/attempts/${queryArg.id}/review`,
        }),
        providesTags: ["PortalExams"],
      }),
      profileControllerGetMe: build.query<
        ProfileControllerGetMeApiResponse,
        ProfileControllerGetMeApiArg
      >({
        query: () => ({ url: `/api/v1/me` }),
        providesTags: ["Profile"],
      }),
      getApiV1Units: build.query<GetApiV1UnitsApiResponse, GetApiV1UnitsApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/v1/units`,
            params: {
              search: queryArg.search,
              page: queryArg.page,
              pageSize: queryArg.pageSize,
              includeInactive: queryArg.includeInactive,
            },
          }),
          providesTags: ["QuestionBank"],
        },
      ),
      postApiV1Units: build.mutation<
        PostApiV1UnitsApiResponse,
        PostApiV1UnitsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/units`,
          method: "POST",
          body: queryArg.unitRequest,
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      getApiV1UnitsId: build.query<
        GetApiV1UnitsIdApiResponse,
        GetApiV1UnitsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/units/${queryArg.id}` }),
        providesTags: ["QuestionBank"],
      }),
      putApiV1UnitsId: build.mutation<
        PutApiV1UnitsIdApiResponse,
        PutApiV1UnitsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/units/${queryArg.id}`,
          method: "PUT",
          body: queryArg.unitRequest,
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      deleteApiV1UnitsId: build.mutation<
        DeleteApiV1UnitsIdApiResponse,
        DeleteApiV1UnitsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/units/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      getApiV1Lessons: build.query<
        GetApiV1LessonsApiResponse,
        GetApiV1LessonsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/lessons`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["QuestionBank"],
      }),
      postApiV1Lessons: build.mutation<
        PostApiV1LessonsApiResponse,
        PostApiV1LessonsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/lessons`,
          method: "POST",
          body: queryArg.lessonRequest,
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      getApiV1LessonsId: build.query<
        GetApiV1LessonsIdApiResponse,
        GetApiV1LessonsIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/lessons/${queryArg.id}` }),
        providesTags: ["QuestionBank"],
      }),
      putApiV1LessonsId: build.mutation<
        PutApiV1LessonsIdApiResponse,
        PutApiV1LessonsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/lessons/${queryArg.id}`,
          method: "PUT",
          body: queryArg.lessonRequest,
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      deleteApiV1LessonsId: build.mutation<
        DeleteApiV1LessonsIdApiResponse,
        DeleteApiV1LessonsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/lessons/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      questionsControllerList: build.query<
        QuestionsControllerListApiResponse,
        QuestionsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/questions`,
          params: {
            unitId: queryArg.unitId,
            lessonId: queryArg.lessonId,
            type: queryArg["type"],
            difficulty: queryArg.difficulty,
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["QuestionBank"],
      }),
      questionsControllerCreate: build.mutation<
        QuestionsControllerCreateApiResponse,
        QuestionsControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/questions`,
          method: "POST",
          body: queryArg.questionRequest,
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      questionsControllerDetail: build.query<
        QuestionsControllerDetailApiResponse,
        QuestionsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/questions/${queryArg.id}` }),
        providesTags: ["QuestionBank"],
      }),
      questionsControllerUpdate: build.mutation<
        QuestionsControllerUpdateApiResponse,
        QuestionsControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/questions/${queryArg.id}`,
          method: "PUT",
          body: queryArg.questionRequest,
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      questionsControllerDelete: build.mutation<
        QuestionsControllerDeleteApiResponse,
        QuestionsControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/questions/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["QuestionBank"],
      }),
      questionsControllerDuplicate: build.mutation<
        QuestionsControllerDuplicateApiResponse,
        QuestionsControllerDuplicateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/questions/${queryArg.id}/duplicate`,
          method: "POST",
        }),
        invalidatesTags: ["QuestionBank"],
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
      quizManagementControllerUpdate: build.mutation<
        QuizManagementControllerUpdateApiResponse,
        QuizManagementControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}`,
          method: "PUT",
          body: queryArg.quizEditRequest,
        }),
        invalidatesTags: ["Quizzes"],
      }),
      quizManagementControllerDelete: build.mutation<
        QuizManagementControllerDeleteApiResponse,
        QuizManagementControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}`,
          method: "DELETE",
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
      quizManagementControllerGrade: build.mutation<
        QuizManagementControllerGradeApiResponse,
        QuizManagementControllerGradeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/quizzes/${queryArg.id}/grades/${queryArg.studentId}`,
          method: "PUT",
          body: queryArg.singleGradeRequest,
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
      rolesControllerPermissions: build.query<
        RolesControllerPermissionsApiResponse,
        RolesControllerPermissionsApiArg
      >({
        query: () => ({ url: `/api/v1/permissions` }),
        providesTags: ["RolesPermissions"],
      }),
      rolesControllerSystemRoles: build.query<
        RolesControllerSystemRolesApiResponse,
        RolesControllerSystemRolesApiArg
      >({
        query: () => ({ url: `/api/v1/roles/system` }),
        providesTags: ["RolesPermissions"],
      }),
      rolesControllerList: build.query<
        RolesControllerListApiResponse,
        RolesControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["RolesPermissions"],
      }),
      rolesControllerCreate: build.mutation<
        RolesControllerCreateApiResponse,
        RolesControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles`,
          method: "POST",
          body: queryArg.roleRequest,
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      rolesControllerDetail: build.query<
        RolesControllerDetailApiResponse,
        RolesControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/roles/${queryArg.id}` }),
        providesTags: ["RolesPermissions"],
      }),
      rolesControllerUpdate: build.mutation<
        RolesControllerUpdateApiResponse,
        RolesControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles/${queryArg.id}`,
          method: "PUT",
          body: queryArg.roleRequest,
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      rolesControllerDelete: build.mutation<
        RolesControllerDeleteApiResponse,
        RolesControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      rolesControllerReplacePermissions: build.mutation<
        RolesControllerReplacePermissionsApiResponse,
        RolesControllerReplacePermissionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles/${queryArg.id}/permissions`,
          method: "PUT",
          body: queryArg.rolePermissionsRequest,
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      rolesControllerDuplicate: build.mutation<
        RolesControllerDuplicateApiResponse,
        RolesControllerDuplicateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles/${queryArg.id}/duplicate`,
          method: "POST",
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      rolesControllerAssign: build.mutation<
        RolesControllerAssignApiResponse,
        RolesControllerAssignApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.id}/roles`,
          method: "PUT",
          body: queryArg.userRoleRequest,
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      rolesControllerUnassign: build.mutation<
        RolesControllerUnassignApiResponse,
        RolesControllerUnassignApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.id}/roles`,
          method: "DELETE",
        }),
        invalidatesTags: ["RolesPermissions"],
      }),
      getApiV1ScheduledReports: build.query<
        GetApiV1ScheduledReportsApiResponse,
        GetApiV1ScheduledReportsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scheduled-reports`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            includeInactive: queryArg.includeInactive,
          },
        }),
        providesTags: ["ScheduledReports"],
      }),
      postApiV1ScheduledReports: build.mutation<
        PostApiV1ScheduledReportsApiResponse,
        PostApiV1ScheduledReportsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scheduled-reports`,
          method: "POST",
          body: queryArg.scheduledReportRequest,
        }),
        invalidatesTags: ["ScheduledReports"],
      }),
      getApiV1ScheduledReportsId: build.query<
        GetApiV1ScheduledReportsIdApiResponse,
        GetApiV1ScheduledReportsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scheduled-reports/${queryArg.id}`,
        }),
        providesTags: ["ScheduledReports"],
      }),
      putApiV1ScheduledReportsId: build.mutation<
        PutApiV1ScheduledReportsIdApiResponse,
        PutApiV1ScheduledReportsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scheduled-reports/${queryArg.id}`,
          method: "PUT",
          body: queryArg.scheduledReportRequest,
        }),
        invalidatesTags: ["ScheduledReports"],
      }),
      deleteApiV1ScheduledReportsId: build.mutation<
        DeleteApiV1ScheduledReportsIdApiResponse,
        DeleteApiV1ScheduledReportsIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scheduled-reports/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ScheduledReports"],
      }),
      frontendShellControllerSearch: build.query<
        FrontendShellControllerSearchApiResponse,
        FrontendShellControllerSearchApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/search`,
          params: {
            q: queryArg.q,
            types: queryArg.types,
          },
        }),
        providesTags: ["Search"],
      }),
      resourceLifecycleControllerDeleteSession: build.mutation<
        ResourceLifecycleControllerDeleteSessionApiResponse,
        ResourceLifecycleControllerDeleteSessionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/sessions/${queryArg.id}`,
          method: "DELETE",
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
        query: (queryArg) => ({
          url: `/api/v1/staff`,
          params: {
            page: queryArg.page,
            pageSize: queryArg.pageSize,
            search: queryArg.search,
            role: queryArg.role,
            includeInactive: queryArg.includeInactive,
            sort: queryArg.sort,
          },
        }),
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
      staffCrudControllerDetail: build.query<
        StaffCrudControllerDetailApiResponse,
        StaffCrudControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/staff/${queryArg.id}` }),
        providesTags: ["Staff"],
      }),
      staffCrudControllerUpdate: build.mutation<
        StaffCrudControllerUpdateApiResponse,
        StaffCrudControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff/${queryArg.id}`,
          method: "PUT",
          body: queryArg.staffEditRequest,
        }),
        invalidatesTags: ["Staff"],
      }),
      staffCrudControllerDelete: build.mutation<
        StaffCrudControllerDeleteApiResponse,
        StaffCrudControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff/${queryArg.id}`,
          method: "DELETE",
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
      staffAttendanceCrudControllerList: build.query<
        StaffAttendanceCrudControllerListApiResponse,
        StaffAttendanceCrudControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff-attendance`,
          params: {
            userId: queryArg.userId,
            date: queryArg.date,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["StaffAttendance"],
      }),
      staffAttendanceCrudControllerCreate: build.mutation<
        StaffAttendanceCrudControllerCreateApiResponse,
        StaffAttendanceCrudControllerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff-attendance`,
          method: "POST",
          body: queryArg.staffAttendanceRequest,
        }),
        invalidatesTags: ["StaffAttendance"],
      }),
      staffAttendanceCrudControllerDetail: build.query<
        StaffAttendanceCrudControllerDetailApiResponse,
        StaffAttendanceCrudControllerDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff-attendance/${queryArg.id}`,
        }),
        providesTags: ["StaffAttendance"],
      }),
      staffAttendanceCrudControllerUpdate: build.mutation<
        StaffAttendanceCrudControllerUpdateApiResponse,
        StaffAttendanceCrudControllerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff-attendance/${queryArg.id}`,
          method: "PUT",
          body: queryArg.staffAttendanceRequest,
        }),
        invalidatesTags: ["StaffAttendance"],
      }),
      staffAttendanceCrudControllerDelete: build.mutation<
        StaffAttendanceCrudControllerDeleteApiResponse,
        StaffAttendanceCrudControllerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/staff-attendance/${queryArg.id}`,
          method: "DELETE",
          params: {
            reason: queryArg.reason,
          },
        }),
        invalidatesTags: ["StaffAttendance"],
      }),
      printableDocumentsControllerCard: build.query<
        PrintableDocumentsControllerCardApiResponse,
        PrintableDocumentsControllerCardApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/card.pdf`,
        }),
        providesTags: ["Students"],
      }),
      printableDocumentsControllerSendCard: build.mutation<
        PrintableDocumentsControllerSendCardApiResponse,
        PrintableDocumentsControllerSendCardApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/${queryArg.id}/card/send`,
          method: "POST",
          body: queryArg.documentSendRequest,
        }),
        invalidatesTags: ["Students"],
      }),
      studentBatchControllerExport: build.query<
        StudentBatchControllerExportApiResponse,
        StudentBatchControllerExportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/export`,
          params: {
            format: queryArg.format,
            search: queryArg.search,
            gradeLevelId: queryArg.gradeLevelId,
            groupId: queryArg.groupId,
            status: queryArg.status,
            hasDebt: queryArg.hasDebt,
            sort: queryArg.sort,
            includeArchived: queryArg.includeArchived,
          },
        }),
        providesTags: ["Students"],
      }),
      studentBatchControllerBulkDelete: build.mutation<
        StudentBatchControllerBulkDeleteApiResponse,
        StudentBatchControllerBulkDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/bulk-delete`,
          method: "POST",
          body: queryArg.bulkDeleteRequest,
        }),
        invalidatesTags: ["Students"],
      }),
      studentBatchControllerPreview: build.mutation<
        StudentBatchControllerPreviewApiResponse,
        StudentBatchControllerPreviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/import/preview`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Students"],
      }),
      studentBatchControllerCommit: build.mutation<
        StudentBatchControllerCommitApiResponse,
        StudentBatchControllerCommitApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/students/import/commit`,
          method: "POST",
          body: queryArg.importCommitRequest,
        }),
        invalidatesTags: ["Students"],
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
            gradeLevelId: queryArg.gradeLevelId,
            groupId: queryArg.groupId,
            status: queryArg.status,
            hasDebt: queryArg.hasDebt,
            sort: queryArg.sort,
            includeArchived: queryArg.includeArchived,
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
      teacherSettlementsControllerList: build.query<
        TeacherSettlementsControllerListApiResponse,
        TeacherSettlementsControllerListApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settlements`,
          params: {
            month: queryArg.month,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["TeacherSettlements"],
      }),
      teacherSettlementsControllerDetail: build.query<
        TeacherSettlementsControllerDetailApiResponse,
        TeacherSettlementsControllerDetailApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/settlements/${queryArg.id}` }),
        providesTags: ["TeacherSettlements"],
      }),
      teacherSettlementsControllerGenerate: build.mutation<
        TeacherSettlementsControllerGenerateApiResponse,
        TeacherSettlementsControllerGenerateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settlements/generate`,
          method: "POST",
          params: {
            month: queryArg.month,
          },
        }),
        invalidatesTags: ["TeacherSettlements"],
      }),
      teacherSettlementsControllerPay: build.mutation<
        TeacherSettlementsControllerPayApiResponse,
        TeacherSettlementsControllerPayApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settlements/${queryArg.id}/pay`,
          method: "POST",
          body: queryArg.payrollPayRequest,
        }),
        invalidatesTags: ["TeacherSettlements"],
      }),
      teacherSettlementsControllerDispute: build.mutation<
        TeacherSettlementsControllerDisputeApiResponse,
        TeacherSettlementsControllerDisputeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/settlements/${queryArg.id}/dispute`,
          method: "POST",
          body: queryArg.actionReasonRequest,
        }),
        invalidatesTags: ["TeacherSettlements"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as backendApi };
export type GetApiV1SubjectsApiResponse =
  /** status 200 OK */ SubjectPagedResult;
export type GetApiV1SubjectsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1SubjectsApiResponse = /** status 201 Created */ Subject;
export type PostApiV1SubjectsApiArg = {
  subjectRequest: SubjectRequest;
};
export type GetApiV1SubjectsIdApiResponse = /** status 200 OK */ Subject;
export type GetApiV1SubjectsIdApiArg = {
  id: string;
};
export type PutApiV1SubjectsIdApiResponse = /** status 200 OK */ Subject;
export type PutApiV1SubjectsIdApiArg = {
  id: string;
  subjectRequest: SubjectRequest;
};
export type DeleteApiV1SubjectsIdApiResponse = unknown;
export type DeleteApiV1SubjectsIdApiArg = {
  id: string;
};
export type GetApiV1GradeLevelsApiResponse =
  /** status 200 OK */ GradeLevelPagedResult;
export type GetApiV1GradeLevelsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1GradeLevelsApiResponse =
  /** status 201 Created */ GradeLevel;
export type PostApiV1GradeLevelsApiArg = {
  gradeLevelRequest: GradeLevelRequest;
};
export type GetApiV1GradeLevelsIdApiResponse = /** status 200 OK */ GradeLevel;
export type GetApiV1GradeLevelsIdApiArg = {
  id: string;
};
export type PutApiV1GradeLevelsIdApiResponse = /** status 200 OK */ GradeLevel;
export type PutApiV1GradeLevelsIdApiArg = {
  id: string;
  gradeLevelRequest: GradeLevelRequest;
};
export type DeleteApiV1GradeLevelsIdApiResponse = unknown;
export type DeleteApiV1GradeLevelsIdApiArg = {
  id: string;
};
export type GetApiV1AcademicTermsApiResponse =
  /** status 200 OK */ AcademicTermPagedResult;
export type GetApiV1AcademicTermsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1AcademicTermsApiResponse =
  /** status 201 Created */ AcademicTerm;
export type PostApiV1AcademicTermsApiArg = {
  academicTermRequest: AcademicTermRequest;
};
export type GetApiV1AcademicTermsIdApiResponse =
  /** status 200 OK */ AcademicTerm;
export type GetApiV1AcademicTermsIdApiArg = {
  id: string;
};
export type PutApiV1AcademicTermsIdApiResponse =
  /** status 200 OK */ AcademicTerm;
export type PutApiV1AcademicTermsIdApiArg = {
  id: string;
  academicTermRequest: AcademicTermRequest;
};
export type DeleteApiV1AcademicTermsIdApiResponse = unknown;
export type DeleteApiV1AcademicTermsIdApiArg = {
  id: string;
};
export type AssignmentSubmissionsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type AssignmentSubmissionsControllerListApiArg = {
  id: string;
  page?: number;
  pageSize?: number;
};
export type AssignmentSubmissionsControllerGradeApiResponse =
  /** status 200 OK */ AssignmentSubmission;
export type AssignmentSubmissionsControllerGradeApiArg = {
  id: string;
  submissionGradeRequest: SubmissionGradeRequest;
};
export type AssignmentsControllerCloseApiResponse =
  /** status 200 OK */ Assignment;
export type AssignmentsControllerCloseApiArg = {
  id: string;
};
export type AssignmentsControllerOpenApiResponse =
  /** status 200 OK */ Assignment;
export type AssignmentsControllerOpenApiArg = {
  id: string;
};
export type GetApiV1AssignmentsApiResponse =
  /** status 200 OK */ AssignmentPagedResult;
export type GetApiV1AssignmentsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1AssignmentsApiResponse =
  /** status 201 Created */ Assignment;
export type PostApiV1AssignmentsApiArg = {
  assignmentRequest: AssignmentRequest;
};
export type GetApiV1AssignmentsIdApiResponse = /** status 200 OK */ Assignment;
export type GetApiV1AssignmentsIdApiArg = {
  id: string;
};
export type PutApiV1AssignmentsIdApiResponse = /** status 200 OK */ Assignment;
export type PutApiV1AssignmentsIdApiArg = {
  id: string;
  assignmentRequest: AssignmentRequest;
};
export type DeleteApiV1AssignmentsIdApiResponse = unknown;
export type DeleteApiV1AssignmentsIdApiArg = {
  id: string;
};
export type AttendanceControllerGetSessionsIdAttendanceApiResponse =
  /** status 200 OK */ ResponseAttendanceGetSessionsIdAttendance200Dto;
export type AttendanceControllerGetSessionsIdAttendanceApiArg = {
  id: string;
};
export type AttendanceControllerGetSessionsIdOfflinePackApiResponse =
  /** status 200 OK */ ResponseAttendanceGetSessionsIdOfflinePack200Dto;
export type AttendanceControllerGetSessionsIdOfflinePackApiArg = {
  id: string;
};
export type AttendanceControllerPostAttendanceScanApiResponse =
  /** status 200 OK */ ResponseAttendancePostAttendanceScan200Dto;
export type AttendanceControllerPostAttendanceScanApiArg = {
  scanItem: ScanItem;
};
export type AttendanceControllerPostSessionsIdCloseApiResponse =
  /** status 200 OK */ ResponseAttendancePostSessionsIdClose200Dto;
export type AttendanceControllerPostSessionsIdCloseApiArg = {
  id: string;
  closeSession: CloseSession;
};
export type AttendanceControllerPostAttendanceSyncApiResponse =
  /** status 200 OK */ ResponseAttendancePostAttendanceSync200Dto;
export type AttendanceControllerPostAttendanceSyncApiArg = {
  syncBatch: SyncBatch;
};
export type AttendanceManagementControllerManualApiResponse =
  /** status 201 Created */ Attendance;
export type AttendanceManagementControllerManualApiArg = {
  id: string;
  manualAttendanceRequest: ManualAttendanceRequest;
};
export type AttendanceManagementControllerCorrectApiResponse =
  /** status 200 OK */ Attendance;
export type AttendanceManagementControllerCorrectApiArg = {
  recordId: string;
  correctAttendanceRequest: CorrectAttendanceRequest;
};
export type AttendanceManagementControllerDeleteApiResponse = unknown;
export type AttendanceManagementControllerDeleteApiArg = {
  recordId: string;
  reason?: string;
};
export type SessionManagementControllerReopenApiResponse =
  /** status 200 OK */ ResponseGroupManagementPause200Dto;
export type SessionManagementControllerReopenApiArg = {
  id: string;
  cancelSessionRequest: CancelSessionRequest;
};
export type AuditControllerGetAuditLogsApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type AuditControllerGetAuditLogsApiArg = {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  sort?: string;
};
export type HistoryDetailControllerAuditDetailApiResponse =
  /** status 200 OK */ AuditEntry;
export type HistoryDetailControllerAuditDetailApiArg = {
  id: string;
};
export type AuthControllerLoginApiResponse = /** status 200 OK */ AuthTokens;
export type AuthControllerLoginApiArg = {
  loginV1: LoginV1Write;
};
export type AuthControllerRequestOtpApiResponse =
  /** status 202 Accepted */ OtpChallengeDto;
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
export type LegacyAuthControllerLoginApiResponse =
  /** status 200 OK */ ResponseLegacyAuthLogin200Dto;
export type LegacyAuthControllerLoginApiArg = {
  loginRequest: LoginRequestWrite;
};
export type LegacyAuthControllerCurrentTenantApiResponse =
  /** status 200 OK */ ResponseLegacyAuthCurrentTenant200Dto;
export type LegacyAuthControllerCurrentTenantApiArg = void;
export type PasswordControllerChangePasswordApiResponse = unknown;
export type PasswordControllerChangePasswordApiArg = {
  changePasswordRequest: ChangePasswordRequestWrite;
};
export type PasswordRecoveryControllerForgotApiResponse = unknown;
export type PasswordRecoveryControllerForgotApiArg = {
  forgotPasswordRequest: ForgotPasswordRequest;
};
export type PasswordRecoveryControllerResetApiResponse = unknown;
export type PasswordRecoveryControllerResetApiArg = {
  resetPasswordRequest: ResetPasswordRequestWrite;
};
export type AutomationRulesControllerActiveApiResponse =
  /** status 200 OK */ AutomationRule;
export type AutomationRulesControllerActiveApiArg = {
  id: string;
  activeRequest: ActiveRequest;
};
export type GetApiV1AutomationRulesApiResponse =
  /** status 200 OK */ AutomationRulePagedResult;
export type GetApiV1AutomationRulesApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1AutomationRulesApiResponse =
  /** status 201 Created */ AutomationRule;
export type PostApiV1AutomationRulesApiArg = {
  automationRequest: AutomationRequest;
};
export type GetApiV1AutomationRulesIdApiResponse =
  /** status 200 OK */ AutomationRule;
export type GetApiV1AutomationRulesIdApiArg = {
  id: string;
};
export type PutApiV1AutomationRulesIdApiResponse =
  /** status 200 OK */ AutomationRule;
export type PutApiV1AutomationRulesIdApiArg = {
  id: string;
  automationRequest: AutomationRequest;
};
export type DeleteApiV1AutomationRulesIdApiResponse = unknown;
export type DeleteApiV1AutomationRulesIdApiArg = {
  id: string;
};
export type BranchesControllerGetBranchesApiResponse =
  /** status 200 OK */ Branch[];
export type BranchesControllerGetBranchesApiArg = void;
export type BranchesControllerPostBranchesApiResponse =
  /** status 201 Created */ Branch;
export type BranchesControllerPostBranchesApiArg = {
  newBranch: NewBranch;
};
export type FacilityManagementControllerBranchApiResponse =
  /** status 200 OK */ Branch;
export type FacilityManagementControllerBranchApiArg = {
  id: string;
};
export type FacilityManagementControllerEditBranchApiResponse =
  /** status 200 OK */ Branch;
export type FacilityManagementControllerEditBranchApiArg = {
  id: string;
  editBranchRequest: EditBranchRequest;
};
export type ResourceLifecycleControllerDeleteBranchApiResponse = unknown;
export type ResourceLifecycleControllerDeleteBranchApiArg = {
  id: string;
};
export type CampaignsControllerPreviewApiResponse =
  /** status 200 OK */ ResponseCampaignsPreview200Dto;
export type CampaignsControllerPreviewApiArg = {
  id: string;
};
export type CampaignsControllerSendNowApiResponse =
  | /** status 200 OK */ ResponseCampaignsSendNow200Dto
  | /** status 202 Accepted */ ResponseCampaignsSendNow202Dto;
export type CampaignsControllerSendNowApiArg = {
  id: string;
};
export type CampaignsControllerCancelApiResponse =
  /** status 200 OK */ ResponseCampaignsCancel200Dto;
export type CampaignsControllerCancelApiArg = {
  id: string;
};
export type CampaignsControllerDuplicateApiResponse =
  /** status 201 Created */ CampaignDto;
export type CampaignsControllerDuplicateApiArg = {
  id: string;
};
export type GetApiV1CampaignsApiResponse =
  /** status 200 OK */ ResponseCampaignsCancel200DtoPagedResult;
export type GetApiV1CampaignsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1CampaignsApiResponse =
  /** status 201 Created */ ResponseCampaignsCancel200Dto;
export type PostApiV1CampaignsApiArg = {
  campaignRequest: CampaignRequest;
};
export type GetApiV1CampaignsIdApiResponse =
  /** status 200 OK */ ResponseCampaignsCancel200Dto;
export type GetApiV1CampaignsIdApiArg = {
  id: string;
};
export type PutApiV1CampaignsIdApiResponse =
  /** status 200 OK */ ResponseCampaignsCancel200Dto;
export type PutApiV1CampaignsIdApiArg = {
  id: string;
  campaignRequest: CampaignRequest;
};
export type DeleteApiV1CampaignsIdApiResponse = unknown;
export type DeleteApiV1CampaignsIdApiArg = {
  id: string;
};
export type CashShiftsControllerGetCashShiftsCurrentApiResponse =
  /** status 200 OK */ ResponseCashShiftsGetCashShiftsCurrent200Dto;
export type CashShiftsControllerGetCashShiftsCurrentApiArg = void;
export type CashShiftsControllerPostCashShiftsOpenApiResponse =
  /** status 201 Created */ CashShift;
export type CashShiftsControllerPostCashShiftsOpenApiArg = {
  openShift: OpenShift;
};
export type CashShiftsControllerPostCashShiftsIdCloseApiResponse =
  /** status 200 OK */ CashShift;
export type CashShiftsControllerPostCashShiftsIdCloseApiArg = {
  id: string;
  closeShift: CloseShift;
};
export type HistoryDetailControllerShiftsListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type HistoryDetailControllerShiftsListApiArg = {
  page?: number;
  pageSize?: number;
  userId?: string;
};
export type HistoryDetailControllerShiftApiResponse =
  /** status 200 OK */ ResponseHistoryDetailShift200Dto;
export type HistoryDetailControllerShiftApiArg = {
  id: string;
};
export type CenterTeachersControllerAgreementsApiResponse =
  /** status 200 OK */ TeacherAgreement[];
export type CenterTeachersControllerAgreementsApiArg = {
  id: string;
};
export type CenterTeachersControllerAgreementApiResponse =
  /** status 201 Created */ TeacherAgreement;
export type CenterTeachersControllerAgreementApiArg = {
  id: string;
  agreementRequest: AgreementRequest;
};
export type GetApiV1TeachersApiResponse =
  /** status 200 OK */ CenterTeacherPagedResult;
export type GetApiV1TeachersApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1TeachersApiResponse =
  /** status 201 Created */ CenterTeacher;
export type PostApiV1TeachersApiArg = {
  teacherRequest: TeacherRequest;
};
export type GetApiV1TeachersIdApiResponse = /** status 200 OK */ CenterTeacher;
export type GetApiV1TeachersIdApiArg = {
  id: string;
};
export type PutApiV1TeachersIdApiResponse = /** status 200 OK */ CenterTeacher;
export type PutApiV1TeachersIdApiArg = {
  id: string;
  teacherRequest: TeacherRequest;
};
export type DeleteApiV1TeachersIdApiResponse = unknown;
export type DeleteApiV1TeachersIdApiArg = {
  id: string;
};
export type VideosControllerHideApiResponse = /** status 200 OK */ Video;
export type VideosControllerHideApiArg = {
  id: string;
};
export type GetApiV1VideosApiResponse = /** status 200 OK */ VideoPagedResult;
export type GetApiV1VideosApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1VideosApiResponse = /** status 201 Created */ Video;
export type PostApiV1VideosApiArg = {
  videoRequest: VideoRequest;
};
export type GetApiV1VideosIdApiResponse = /** status 200 OK */ Video;
export type GetApiV1VideosIdApiArg = {
  id: string;
};
export type PutApiV1VideosIdApiResponse = /** status 200 OK */ Video;
export type PutApiV1VideosIdApiArg = {
  id: string;
  videoRequest: VideoRequest;
};
export type DeleteApiV1VideosIdApiResponse = unknown;
export type DeleteApiV1VideosIdApiArg = {
  id: string;
};
export type GetApiV1CoursesApiResponse =
  /** status 200 OK */ ResponseCoursesListDtoPagedResult;
export type GetApiV1CoursesApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1CoursesApiResponse =
  /** status 201 Created */ ResponseCoursesListDto;
export type PostApiV1CoursesApiArg = {
  courseRequest: CourseRequest;
};
export type GetApiV1CoursesIdApiResponse =
  /** status 200 OK */ ResponseCoursesListDto;
export type GetApiV1CoursesIdApiArg = {
  id: string;
};
export type PutApiV1CoursesIdApiResponse =
  /** status 200 OK */ ResponseCoursesListDto;
export type PutApiV1CoursesIdApiArg = {
  id: string;
  courseRequest: CourseRequest;
};
export type DeleteApiV1CoursesIdApiResponse = unknown;
export type DeleteApiV1CoursesIdApiArg = {
  id: string;
};
export type DashboardControllerSummaryApiResponse =
  /** status 200 OK */ DashboardSummaryDto;
export type DashboardControllerSummaryApiArg = {
  branchId?: string;
  date?: string;
};
export type DashboardControllerTodaySessionsApiResponse =
  /** status 200 OK */ TodaySessionDto[];
export type DashboardControllerTodaySessionsApiArg = {
  branchId?: string;
  date?: string;
};
export type DashboardControllerAlertsApiResponse =
  /** status 200 OK */ DashboardAlertDto[];
export type DashboardControllerAlertsApiArg = void;
export type DashboardControllerAlertStudentsApiResponse =
  /** status 200 OK */ StudentListItemDtoPagedResult;
export type DashboardControllerAlertStudentsApiArg = {
  type: string;
  page?: number;
  pageSize?: number;
};
export type DashboardControllerNotifyApiResponse =
  /** status 200 OK */ QueuedDto;
export type DashboardControllerNotifyApiArg = {
  type: string;
  alertNotifyRequest: AlertNotifyRequest;
};
export type DashboardControllerIncome7DaysApiResponse =
  /** status 200 OK */ IncomeDayDto[];
export type DashboardControllerIncome7DaysApiArg = void;
export type DiscountsControllerListApiResponse =
  /** status 200 OK */ Discount[];
export type DiscountsControllerListApiArg = void;
export type DiscountsControllerCreateApiResponse =
  /** status 201 Created */ Discount;
export type DiscountsControllerCreateApiArg = {
  discountRequest: DiscountRequest;
};
export type DiscountsControllerDetailApiResponse =
  /** status 200 OK */ Discount;
export type DiscountsControllerDetailApiArg = {
  id: string;
};
export type DiscountsControllerUpdateApiResponse =
  /** status 200 OK */ Discount;
export type DiscountsControllerUpdateApiArg = {
  id: string;
  discountRequest: DiscountRequest;
};
export type DiscountsControllerDeleteApiResponse = unknown;
export type DiscountsControllerDeleteApiArg = {
  id: string;
};
export type DiscountsControllerStudentDiscountsApiResponse =
  /** status 200 OK */ ResponseDiscountsStudentDiscounts200Item0Dto[];
export type DiscountsControllerStudentDiscountsApiArg = {
  id: string;
};
export type DiscountsControllerAssignApiResponse =
  /** status 201 Created */ StudentDiscount;
export type DiscountsControllerAssignApiArg = {
  id: string;
  studentDiscountRequest: StudentDiscountRequest;
};
export type DiscountsControllerApproveApiResponse =
  /** status 200 OK */ StudentDiscount;
export type DiscountsControllerApproveApiArg = {
  id: string;
  assignmentId: string;
};
export type DiscountsControllerRemoveApiResponse = unknown;
export type DiscountsControllerRemoveApiArg = {
  id: string;
  assignmentId: string;
};
export type ExcusesControllerPortalListApiResponse =
  /** status 200 OK */ AbsenceExcuse[];
export type ExcusesControllerPortalListApiArg = {
  id: string;
};
export type ExcusesControllerCreateApiResponse =
  /** status 201 Created */ AbsenceExcuse;
export type ExcusesControllerCreateApiArg = {
  id: string;
  excuseRequest: ExcuseRequest;
};
export type ExcusesControllerEditApiResponse =
  /** status 200 OK */ AbsenceExcuse;
export type ExcusesControllerEditApiArg = {
  id: string;
  excuseRequest: ExcuseRequest;
};
export type ExcusesControllerWithdrawApiResponse = unknown;
export type ExcusesControllerWithdrawApiArg = {
  id: string;
};
export type ExcusesControllerStaffListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type ExcusesControllerStaffListApiArg = {
  status?: string;
  page?: number;
  pageSize?: number;
};
export type ExcusesControllerApproveApiResponse =
  /** status 200 OK */ AbsenceExcuse;
export type ExcusesControllerApproveApiArg = {
  id: string;
};
export type ExcusesControllerRejectApiResponse =
  /** status 200 OK */ AbsenceExcuse;
export type ExcusesControllerRejectApiArg = {
  id: string;
};
export type GetApiV1ExpenseCategoriesApiResponse =
  /** status 200 OK */ ExpenseCategoryPagedResult;
export type GetApiV1ExpenseCategoriesApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1ExpenseCategoriesApiResponse =
  /** status 201 Created */ ExpenseCategory;
export type PostApiV1ExpenseCategoriesApiArg = {
  categoryRequest: CategoryRequest;
};
export type GetApiV1ExpenseCategoriesIdApiResponse =
  /** status 200 OK */ ExpenseCategory;
export type GetApiV1ExpenseCategoriesIdApiArg = {
  id: string;
};
export type PutApiV1ExpenseCategoriesIdApiResponse =
  /** status 200 OK */ ExpenseCategory;
export type PutApiV1ExpenseCategoriesIdApiArg = {
  id: string;
  categoryRequest: CategoryRequest;
};
export type DeleteApiV1ExpenseCategoriesIdApiResponse = unknown;
export type DeleteApiV1ExpenseCategoriesIdApiArg = {
  id: string;
};
export type ExpensesControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type ExpensesControllerListApiArg = {
  status?: string;
  page?: number;
  pageSize?: number;
};
export type ExpensesControllerCreateApiResponse =
  /** status 201 Created */ Expense;
export type ExpensesControllerCreateApiArg = {
  expenseRequest: ExpenseRequest;
};
export type ExpensesControllerDetailApiResponse = /** status 200 OK */ Expense;
export type ExpensesControllerDetailApiArg = {
  id: string;
};
export type ExpensesControllerEditApiResponse = /** status 200 OK */ Expense;
export type ExpensesControllerEditApiArg = {
  id: string;
  expenseRequest: ExpenseRequest;
};
export type ExpensesControllerDeleteApiResponse = unknown;
export type ExpensesControllerDeleteApiArg = {
  id: string;
};
export type ExpensesControllerApproveApiResponse = /** status 200 OK */ Expense;
export type ExpensesControllerApproveApiArg = {
  id: string;
};
export type ExpensesControllerRejectApiResponse = /** status 200 OK */ Expense;
export type ExpensesControllerRejectApiArg = {
  id: string;
};
export type ChargeManagementControllerDetailApiResponse =
  /** status 200 OK */ ResponseChargeManagementDetail200Dto;
export type ChargeManagementControllerDetailApiArg = {
  id: string;
};
export type ChargeManagementControllerUpdateApiResponse =
  /** status 200 OK */ Charge;
export type ChargeManagementControllerUpdateApiArg = {
  id: string;
  chargeEditRequest: ChargeEditRequest;
};
export type ChargeManagementControllerDeleteApiResponse = unknown;
export type ChargeManagementControllerDeleteApiArg = {
  id: string;
  reason: string;
};
export type ChargeManagementControllerWaiveApiResponse =
  /** status 200 OK */ Charge;
export type ChargeManagementControllerWaiveApiArg = {
  id: string;
  actionReasonRequest: ActionReasonRequest;
};
export type DuesControllerDuesApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type DuesControllerDuesApiArg = {
  groupId?: string;
  overdueDays?: number;
  page?: number;
  pageSize?: number;
};
export type DuesControllerRemindApiResponse =
  /** status 202 Accepted */ ResponseDuesRemind202Dto;
export type DuesControllerRemindApiArg = {
  studentId: string;
};
export type DuesControllerGenerateApiResponse =
  /** status 200 OK */ ResponseDuesGenerate200Dto;
export type DuesControllerGenerateApiArg = {
  period?: string;
};
export type FinanceControllerGetStudentsIdBalanceApiResponse =
  /** status 200 OK */ ResponseFinanceGetStudentsIdBalance200Dto;
export type FinanceControllerGetStudentsIdBalanceApiArg = {
  id: string;
};
export type FinanceControllerGetChargesApiResponse =
  /** status 200 OK */ Charge[];
export type FinanceControllerGetChargesApiArg = {
  studentId?: string;
};
export type FinanceControllerPostChargesApiResponse =
  /** status 201 Created */ Charge;
export type FinanceControllerPostChargesApiArg = {
  newChargeV1: NewChargeV1;
};
export type FinanceControllerPostPaymentsApiResponse =
  | /** status 200 OK */ ResponseFinancePostPayments200Dto
  | /** status 201 Created */ ResponseFinancePostPayments201Dto;
export type FinanceControllerPostPaymentsApiArg = {
  newPaymentV1: NewPaymentV1;
};
export type FinanceControllerGetPaymentsApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type FinanceControllerGetPaymentsApiArg = {
  page?: number;
  pageSize?: number;
  studentId?: string;
  date?: string;
  shiftId?: string;
  method?: string;
  status?: string;
  sort?: string;
};
export type FinanceControllerGetPaymentsIdApiResponse =
  /** status 200 OK */ ResponseFinanceGetPaymentsId200Dto;
export type FinanceControllerGetPaymentsIdApiArg = {
  id: string;
};
export type PaymentManagementControllerUpdateApiResponse =
  /** status 200 OK */ ResponsePaymentManagementUpdate200Dto;
export type PaymentManagementControllerUpdateApiArg = {
  id: string;
  paymentEditRequest: PaymentEditRequest;
};
export type FinanceControllerPostPaymentsIdVoidApiResponse =
  /** status 200 OK */ Payment;
export type FinanceControllerPostPaymentsIdVoidApiArg = {
  id: string;
  voidPayment: VoidPayment;
};
export type PrintableDocumentsControllerReceiptApiResponse =
  /** status 200 OK */ Blob;
export type PrintableDocumentsControllerReceiptApiArg = {
  id: string;
};
export type PrintableDocumentsControllerSendReceiptApiResponse = unknown;
export type PrintableDocumentsControllerSendReceiptApiArg = {
  id: string;
  documentSendRequest: DocumentSendRequest;
};
export type EnrollmentWorkflowControllerWaitlistApiResponse =
  /** status 200 OK */ ResponseEnrollmentWorkflowWaitlist200Item0Dto[];
export type EnrollmentWorkflowControllerWaitlistApiArg = {
  id: string;
};
export type EnrollmentWorkflowControllerJoinWaitlistApiResponse =
  /** status 201 Created */ WaitlistEntry;
export type EnrollmentWorkflowControllerJoinWaitlistApiArg = {
  id: string;
  waitlistRequest: WaitlistRequest;
};
export type EnrollmentWorkflowControllerRemoveWaitlistApiResponse = unknown;
export type EnrollmentWorkflowControllerRemoveWaitlistApiArg = {
  id: string;
  entryId: string;
};
export type EnrollmentWorkflowControllerTransferApiResponse =
  /** status 200 OK */ ResponseEnrollmentWorkflowTransfer200Dto;
export type EnrollmentWorkflowControllerTransferApiArg = {
  id: string;
  transferEnrollmentRequest: TransferEnrollmentRequest;
};
export type EnrollmentWorkflowControllerWithdrawApiResponse = unknown;
export type EnrollmentWorkflowControllerWithdrawApiArg = {
  id: string;
};
export type GroupManagementControllerDetailApiResponse =
  /** status 200 OK */ StudyGroup;
export type GroupManagementControllerDetailApiArg = {
  id: string;
};
export type ResourceLifecycleControllerDeleteGroupApiResponse = unknown;
export type ResourceLifecycleControllerDeleteGroupApiArg = {
  id: string;
};
export type SchedulingWorkflowControllerUpdateGroupApiResponse =
  /** status 200 OK */ StudyGroup;
export type SchedulingWorkflowControllerUpdateGroupApiArg = {
  id: string;
  updateGroupRequest: UpdateGroupRequest;
};
export type GroupManagementControllerPauseApiResponse =
  /** status 200 OK */ ResponseGroupManagementPause200Dto;
export type GroupManagementControllerPauseApiArg = {
  id: string;
};
export type GroupManagementControllerResumeApiResponse =
  /** status 200 OK */ ResponseGroupManagementPause200Dto;
export type GroupManagementControllerResumeApiArg = {
  id: string;
};
export type GroupManagementControllerScheduleApiResponse =
  /** status 200 OK */ GroupSchedule[];
export type GroupManagementControllerScheduleApiArg = {
  id: string;
};
export type GroupManagementControllerReplaceScheduleApiResponse =
  /** status 200 OK */ WeeklySlot[];
export type GroupManagementControllerReplaceScheduleApiArg = {
  id: string;
  body: WeeklySlot[];
};
export type GroupsControllerGetGroupsApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type GroupsControllerGetGroupsApiArg = {
  page?: number;
  pageSize?: number;
  search?: string;
  gradeLevelId?: string;
  status?: string;
  teacherId?: string;
  sort?: string;
};
export type GroupsControllerPostGroupsApiResponse =
  /** status 201 Created */ StudyGroup;
export type GroupsControllerPostGroupsApiArg = {
  newGroup: NewGroup;
};
export type GroupsControllerGetGroupsIdStudentsApiResponse =
  /** status 200 OK */ ResponseGroupsGetGroupsIdStudents200Item0Dto[];
export type GroupsControllerGetGroupsIdStudentsApiArg = {
  id: string;
};
export type ResourceLifecycleControllerDuplicateGroupApiResponse =
  /** status 201 Created */ StudyGroup;
export type ResourceLifecycleControllerDuplicateGroupApiArg = {
  id: string;
};
export type GuardianManagementControllerDetailApiResponse =
  /** status 200 OK */ ResponseGuardianManagementDetail200Dto;
export type GuardianManagementControllerDetailApiArg = {
  id: string;
};
export type GuardianManagementControllerUpdateApiResponse =
  /** status 200 OK */ Guardian;
export type GuardianManagementControllerUpdateApiArg = {
  id: string;
  guardianRequest: GuardianRequest;
};
export type GuardianManagementControllerDeleteApiResponse = unknown;
export type GuardianManagementControllerDeleteApiArg = {
  id: string;
};
export type GuardianManagementControllerCreateApiResponse =
  /** status 201 Created */ Guardian;
export type GuardianManagementControllerCreateApiArg = {
  guardianRequest: GuardianRequest;
};
export type GuardiansControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type GuardiansControllerListApiArg = {
  phone?: string;
  page?: number;
  pageSize?: number;
};
export type HallBookingsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type HallBookingsControllerListApiArg = {
  hallId?: string;
  page?: number;
  pageSize?: number;
};
export type HallBookingsControllerCreateApiResponse =
  /** status 201 Created */ HallBooking;
export type HallBookingsControllerCreateApiArg = {
  bookingRequest: BookingRequest;
};
export type HallBookingsControllerDetailApiResponse =
  /** status 200 OK */ HallBooking;
export type HallBookingsControllerDetailApiArg = {
  id: string;
};
export type HallBookingsControllerUpdateApiResponse =
  /** status 200 OK */ HallBooking;
export type HallBookingsControllerUpdateApiArg = {
  id: string;
  bookingRequest: BookingRequest;
};
export type HallBookingsControllerDeleteApiResponse = unknown;
export type HallBookingsControllerDeleteApiArg = {
  id: string;
  reason: string;
};
export type FacilityManagementControllerHallApiResponse =
  /** status 200 OK */ Hall;
export type FacilityManagementControllerHallApiArg = {
  id: string;
};
export type FacilityManagementControllerEditHallApiResponse =
  /** status 200 OK */ Hall;
export type FacilityManagementControllerEditHallApiArg = {
  id: string;
  editHallRequest: EditHallRequest;
};
export type ResourceLifecycleControllerDeleteHallApiResponse = unknown;
export type ResourceLifecycleControllerDeleteHallApiArg = {
  id: string;
};
export type HallsControllerGetHallsApiResponse = /** status 200 OK */ Hall[];
export type HallsControllerGetHallsApiArg = {
  branchId?: string;
};
export type HallsControllerPostHallsApiResponse =
  /** status 201 Created */ Hall;
export type HallsControllerPostHallsApiArg = {
  newHall: NewHall;
};
export type SchedulingWorkflowControllerAvailabilityApiResponse =
  /** status 200 OK */ ResponseSchedulingWorkflowAvailability200Dto;
export type SchedulingWorkflowControllerAvailabilityApiArg = {
  branchId?: string;
  fromUtc?: string;
  toUtc?: string;
};
export type GetHealthLiveApiResponse = /** status 200 OK */ HealthLiveDto;
export type GetHealthLiveApiArg = void;
export type FrontendLookupsControllerGradesApiResponse =
  /** status 200 OK */ GradeLevelLookupDto[];
export type FrontendLookupsControllerGradesApiArg = void;
export type MaterialsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type MaterialsControllerListApiArg = {
  search?: string;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type MaterialsControllerCreateApiResponse =
  /** status 201 Created */ ResponseMaterialsDetail200Dto;
export type MaterialsControllerCreateApiArg = {
  materialRequest: MaterialRequest;
};
export type MaterialsControllerDetailApiResponse =
  /** status 200 OK */ ResponseMaterialsDetail200Dto;
export type MaterialsControllerDetailApiArg = {
  id: string;
};
export type MaterialsControllerUpdateApiResponse =
  /** status 200 OK */ ResponseMaterialsDetail200Dto;
export type MaterialsControllerUpdateApiArg = {
  id: string;
  materialRequest: MaterialRequest;
};
export type MaterialsControllerDeleteApiResponse = unknown;
export type MaterialsControllerDeleteApiArg = {
  id: string;
};
export type MaterialsControllerDuplicateApiResponse =
  /** status 201 Created */ ResponseMaterialsDetail200Dto;
export type MaterialsControllerDuplicateApiArg = {
  id: string;
};
export type StockMovementsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type StockMovementsControllerListApiArg = {
  materialId?: string;
  page?: number;
  pageSize?: number;
};
export type StockMovementsControllerCreateApiResponse =
  /** status 201 Created */ StockMovement;
export type StockMovementsControllerCreateApiArg = {
  movementRequest: MovementRequest;
};
export type StockMovementsControllerDetailApiResponse =
  /** status 200 OK */ StockMovement;
export type StockMovementsControllerDetailApiArg = {
  id: string;
};
export type StockMovementsControllerUpdateApiResponse =
  /** status 200 OK */ StockMovement;
export type StockMovementsControllerUpdateApiArg = {
  id: string;
  movementRequest: MovementRequest;
};
export type StockMovementsControllerDeleteApiResponse = unknown;
export type StockMovementsControllerDeleteApiArg = {
  id: string;
  reason: string;
};
export type MaterialDeliveriesControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type MaterialDeliveriesControllerListApiArg = {
  studentId?: string;
  materialId?: string;
  page?: number;
  pageSize?: number;
};
export type MaterialDeliveriesControllerCreateApiResponse =
  /** status 201 Created */ MaterialDelivery;
export type MaterialDeliveriesControllerCreateApiArg = {
  deliveryRequest: DeliveryRequest;
};
export type MaterialDeliveriesControllerDetailApiResponse =
  /** status 200 OK */ ResponseMaterialDeliveriesDetail200Dto;
export type MaterialDeliveriesControllerDetailApiArg = {
  id: string;
};
export type MaterialDeliveriesControllerUpdateApiResponse =
  /** status 200 OK */ MaterialDelivery;
export type MaterialDeliveriesControllerUpdateApiArg = {
  id: string;
  deliveryRequest: DeliveryRequest;
};
export type MaterialDeliveriesControllerDeleteApiResponse = unknown;
export type MaterialDeliveriesControllerDeleteApiArg = {
  id: string;
  reason: string;
};
export type MaterialDeliveriesControllerCollectApiResponse =
  | /** status 200 OK */ ResponseFinancePostPayments200Dto
  | /** status 201 Created */ ResponseFinancePostPayments201Dto;
export type MaterialDeliveriesControllerCollectApiArg = {
  id: string;
  newPaymentV1: NewPaymentV1;
};
export type HistoryDetailControllerMessageApiResponse =
  /** status 200 OK */ MessageOutbox;
export type HistoryDetailControllerMessageApiArg = {
  id: string;
};
export type MessagesControllerGetMessagesApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type MessagesControllerGetMessagesApiArg = {
  page?: number;
  pageSize?: number;
};
export type MessageTemplatesControllerDuplicateApiResponse =
  /** status 201 Created */ MessageTemplate;
export type MessageTemplatesControllerDuplicateApiArg = {
  id: string;
};
export type GetApiV1MessageTemplatesApiResponse =
  /** status 200 OK */ MessageTemplatePagedResult;
export type GetApiV1MessageTemplatesApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1MessageTemplatesApiResponse =
  /** status 201 Created */ MessageTemplate;
export type PostApiV1MessageTemplatesApiArg = {
  templateRequest: TemplateRequest;
};
export type GetApiV1MessageTemplatesIdApiResponse =
  /** status 200 OK */ MessageTemplate;
export type GetApiV1MessageTemplatesIdApiArg = {
  id: string;
};
export type PutApiV1MessageTemplatesIdApiResponse =
  /** status 200 OK */ MessageTemplate;
export type PutApiV1MessageTemplatesIdApiArg = {
  id: string;
  templateRequest: TemplateRequest;
};
export type DeleteApiV1MessageTemplatesIdApiResponse = unknown;
export type DeleteApiV1MessageTemplatesIdApiArg = {
  id: string;
};
export type FrontendShellControllerNotificationsApiResponse =
  /** status 200 OK */ NotificationsDto;
export type FrontendShellControllerNotificationsApiArg = {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
};
export type FrontendShellControllerReadAllApiResponse = unknown;
export type FrontendShellControllerReadAllApiArg = void;
export type FrontendShellControllerReadApiResponse = unknown;
export type FrontendShellControllerReadApiArg = {
  id: string;
};
export type OnlineExamsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type OnlineExamsControllerListApiArg = {
  groupId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};
export type OnlineExamsControllerCreateApiResponse =
  /** status 201 Created */ ResponseOnlineExamsDetail200Dto;
export type OnlineExamsControllerCreateApiArg = {
  onlineExamRequest: OnlineExamRequest;
};
export type OnlineExamsControllerDetailApiResponse =
  /** status 200 OK */ ResponseOnlineExamsDetail200Dto;
export type OnlineExamsControllerDetailApiArg = {
  id: string;
};
export type OnlineExamsControllerUpdateApiResponse =
  /** status 200 OK */ ResponseOnlineExamsDetail200Dto;
export type OnlineExamsControllerUpdateApiArg = {
  id: string;
  onlineExamRequest: OnlineExamRequest;
};
export type OnlineExamsControllerDeleteApiResponse = unknown;
export type OnlineExamsControllerDeleteApiArg = {
  id: string;
};
export type OnlineExamsControllerPublishApiResponse =
  /** status 200 OK */ ResponseOnlineExamsDetail200Dto;
export type OnlineExamsControllerPublishApiArg = {
  id: string;
};
export type OnlineExamsControllerUnpublishApiResponse =
  /** status 200 OK */ ResponseOnlineExamsDetail200Dto;
export type OnlineExamsControllerUnpublishApiArg = {
  id: string;
};
export type OnlineExamsControllerResultsListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type OnlineExamsControllerResultsListApiArg = {
  id: string;
  page?: number;
  pageSize?: number;
};
export type ExamGradingControllerGradeApiResponse =
  /** status 200 OK */ ResponseExamGradingGrade200Dto;
export type ExamGradingControllerGradeApiArg = {
  id: string;
  questionId: string;
  essayGradeRequest: EssayGradeRequest;
};
export type PayrollsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type PayrollsControllerListApiArg = {
  month?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
};
export type PayrollsControllerCreateApiResponse =
  /** status 201 Created */ ResponsePayrollsDetail200Dto;
export type PayrollsControllerCreateApiArg = {
  payrollRequest: PayrollRequest;
};
export type PayrollsControllerDetailApiResponse =
  /** status 200 OK */ ResponsePayrollsDetail200Dto;
export type PayrollsControllerDetailApiArg = {
  id: string;
};
export type PayrollsControllerUpdateApiResponse =
  /** status 200 OK */ ResponsePayrollsDetail200Dto;
export type PayrollsControllerUpdateApiArg = {
  id: string;
  payrollRequest: PayrollRequest;
};
export type PayrollsControllerDeleteApiResponse = unknown;
export type PayrollsControllerDeleteApiArg = {
  id: string;
};
export type PayrollsControllerPayApiResponse =
  /** status 200 OK */ ResponsePayrollsDetail200Dto;
export type PayrollsControllerPayApiArg = {
  id: string;
  payrollPayRequest: PayrollPayRequest;
};
export type PlatformControllerCreateTenantApiResponse =
  /** status 201 Created */ ResponsePlatformCreateTenant201Dto;
export type PlatformControllerCreateTenantApiArg = {
  provisionTenant: ProvisionTenantWrite;
};
export type PortalControllerMeApiResponse =
  /** status 200 OK */ ResponsePortalMe200Dto;
export type PortalControllerMeApiArg = void;
export type PortalControllerOverviewApiResponse =
  /** status 200 OK */ ResponsePortalOverview200Dto;
export type PortalControllerOverviewApiArg = {
  id: string;
};
export type PortalControllerSessionsApiResponse =
  /** status 200 OK */ ResponsePortalSessions200Dto;
export type PortalControllerSessionsApiArg = {
  id: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};
export type PortalControllerBalanceApiResponse =
  /** status 200 OK */ ResponsePortalBalance200Dto;
export type PortalControllerBalanceApiArg = {
  id: string;
};
export type PortalControllerCardApiResponse =
  /** status 200 OK */ ResponsePortalCard200Dto;
export type PortalControllerCardApiArg = void;
export type PortalControllerScheduleApiResponse =
  /** status 200 OK */ ResponsePortalSchedule200Item0Dto[];
export type PortalControllerScheduleApiArg = void;
export type PortalAssignmentsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type PortalAssignmentsControllerListApiArg = {
  page?: number;
  pageSize?: number;
};
export type PortalAssignmentsControllerDetailApiResponse =
  /** status 200 OK */ AssignmentSubmission;
export type PortalAssignmentsControllerDetailApiArg = {
  id: string;
};
export type PortalAssignmentsControllerSubmitApiResponse =
  | /** status 200 OK */ AssignmentSubmission
  | /** status 201 Created */ AssignmentSubmission;
export type PortalAssignmentsControllerSubmitApiArg = {
  id: string;
  submissionRequest: SubmissionRequest;
};
export type PortalAssignmentsControllerUpdateApiResponse =
  /** status 200 OK */ AssignmentSubmission;
export type PortalAssignmentsControllerUpdateApiArg = {
  id: string;
  submissionRequest: SubmissionRequest;
};
export type PortalAssignmentsControllerWithdrawApiResponse = unknown;
export type PortalAssignmentsControllerWithdrawApiArg = {
  id: string;
};
export type PortalExamsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalExamsList200Item0Dto[];
export type PortalExamsControllerListApiArg = void;
export type PortalExamsControllerStartApiResponse =
  | /** status 200 OK */ ResponsePortalExamsStart200Dto
  | /** status 201 Created */ ResponsePortalExamsStart200Dto;
export type PortalExamsControllerStartApiArg = {
  id: string;
};
export type PortalExamsControllerDetailApiResponse =
  /** status 200 OK */ ResponsePortalExamsStart200Dto;
export type PortalExamsControllerDetailApiArg = {
  id: string;
};
export type PortalExamsControllerAnswerApiResponse =
  /** status 200 OK */ ResponsePortalExamsAnswer200Dto;
export type PortalExamsControllerAnswerApiArg = {
  id: string;
  questionId: string;
  examAnswerRequest: ExamAnswerRequest;
};
export type PortalExamsControllerSubmitApiResponse =
  /** status 200 OK */ ResponsePortalExamsSubmit200Dto;
export type PortalExamsControllerSubmitApiArg = {
  id: string;
};
export type PortalExamsControllerReviewApiResponse =
  /** status 200 OK */ ResponsePortalExamsReview200Dto;
export type PortalExamsControllerReviewApiArg = {
  id: string;
};
export type ProfileControllerGetMeApiResponse = /** status 200 OK */ MeDto;
export type ProfileControllerGetMeApiArg = void;
export type GetApiV1UnitsApiResponse =
  /** status 200 OK */ AcademicUnitPagedResult;
export type GetApiV1UnitsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1UnitsApiResponse = /** status 201 Created */ AcademicUnit;
export type PostApiV1UnitsApiArg = {
  unitRequest: UnitRequest;
};
export type GetApiV1UnitsIdApiResponse = /** status 200 OK */ AcademicUnit;
export type GetApiV1UnitsIdApiArg = {
  id: string;
};
export type PutApiV1UnitsIdApiResponse = /** status 200 OK */ AcademicUnit;
export type PutApiV1UnitsIdApiArg = {
  id: string;
  unitRequest: UnitRequest;
};
export type DeleteApiV1UnitsIdApiResponse = unknown;
export type DeleteApiV1UnitsIdApiArg = {
  id: string;
};
export type GetApiV1LessonsApiResponse =
  /** status 200 OK */ AcademicLessonPagedResult;
export type GetApiV1LessonsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1LessonsApiResponse =
  /** status 201 Created */ AcademicLesson;
export type PostApiV1LessonsApiArg = {
  lessonRequest: LessonRequest;
};
export type GetApiV1LessonsIdApiResponse = /** status 200 OK */ AcademicLesson;
export type GetApiV1LessonsIdApiArg = {
  id: string;
};
export type PutApiV1LessonsIdApiResponse = /** status 200 OK */ AcademicLesson;
export type PutApiV1LessonsIdApiArg = {
  id: string;
  lessonRequest: LessonRequest;
};
export type DeleteApiV1LessonsIdApiResponse = unknown;
export type DeleteApiV1LessonsIdApiArg = {
  id: string;
};
export type QuestionsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type QuestionsControllerListApiArg = {
  unitId?: string;
  lessonId?: string;
  type?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};
export type QuestionsControllerCreateApiResponse =
  /** status 201 Created */ ResponseQuestionsDetail200Dto;
export type QuestionsControllerCreateApiArg = {
  questionRequest: QuestionRequest;
};
export type QuestionsControllerDetailApiResponse =
  /** status 200 OK */ ResponseQuestionsDetail200Dto;
export type QuestionsControllerDetailApiArg = {
  id: string;
};
export type QuestionsControllerUpdateApiResponse =
  /** status 200 OK */ ResponseQuestionsDetail200Dto;
export type QuestionsControllerUpdateApiArg = {
  id: string;
  questionRequest: QuestionRequest;
};
export type QuestionsControllerDeleteApiResponse = unknown;
export type QuestionsControllerDeleteApiArg = {
  id: string;
};
export type QuestionsControllerDuplicateApiResponse =
  /** status 201 Created */ ResponseQuestionsDetail200Dto;
export type QuestionsControllerDuplicateApiArg = {
  id: string;
};
export type QuizAnalyticsControllerDistributionApiResponse =
  /** status 200 OK */ ResponseQuizAnalyticsDistribution200Dto;
export type QuizAnalyticsControllerDistributionApiArg = {
  id: string;
};
export type QuizAnalyticsControllerTopApiResponse =
  /** status 200 OK */ ResponseQuizAnalyticsTop200Item0Dto[];
export type QuizAnalyticsControllerTopApiArg = {
  id: string;
  limit?: number;
};
export type QuizAnalyticsControllerMakeupsApiResponse =
  /** status 200 OK */ QuizMakeup[];
export type QuizAnalyticsControllerMakeupsApiArg = {
  id: string;
};
export type QuizAnalyticsControllerScheduleMakeupApiResponse =
  /** status 201 Created */ QuizMakeup;
export type QuizAnalyticsControllerScheduleMakeupApiArg = {
  id: string;
  quizMakeupRequest: QuizMakeupRequest;
};
export type QuizAnalyticsControllerCancelMakeupApiResponse = unknown;
export type QuizAnalyticsControllerCancelMakeupApiArg = {
  id: string;
  makeupId: string;
};
export type QuizManagementControllerUpdateApiResponse =
  /** status 200 OK */ SessionQuiz;
export type QuizManagementControllerUpdateApiArg = {
  id: string;
  quizEditRequest: QuizEditRequest;
};
export type QuizManagementControllerDeleteApiResponse = unknown;
export type QuizManagementControllerDeleteApiArg = {
  id: string;
};
export type QuizzesControllerGetQuizzesIdApiResponse =
  /** status 200 OK */ ResponseQuizzesGetQuizzesId200Dto;
export type QuizzesControllerGetQuizzesIdApiArg = {
  id: string;
};
export type QuizManagementControllerGradeApiResponse =
  /** status 200 OK */ ResponseQuizManagementGrade200Dto;
export type QuizManagementControllerGradeApiArg = {
  id: string;
  studentId: string;
  singleGradeRequest: SingleGradeRequest;
};
export type QuizzesControllerGetQuizzesApiResponse =
  /** status 200 OK */ SessionQuiz[];
export type QuizzesControllerGetQuizzesApiArg = {
  groupId?: string;
};
export type QuizzesControllerPostQuizzesApiResponse =
  /** status 201 Created */ SessionQuiz;
export type QuizzesControllerPostQuizzesApiArg = {
  newQuizV1: NewQuizV1;
};
export type QuizzesControllerPutQuizzesIdGradesApiResponse =
  /** status 200 OK */ ResponseQuizManagementGrade200Dto;
export type QuizzesControllerPutQuizzesIdGradesApiArg = {
  id: string;
  body: GradeInputV1[];
};
export type QuizzesControllerPostQuizzesIdPublishApiResponse =
  /** status 200 OK */ SessionQuiz;
export type QuizzesControllerPostQuizzesIdPublishApiArg = {
  id: string;
};
export type ReportsControllerAttendanceReportApiResponse =
  /** status 200 OK */ ResponseReportsAttendanceReport200Item0Dto[];
export type ReportsControllerAttendanceReportApiArg = {
  fromUtc?: string;
  toUtc?: string;
  groupId?: string;
};
export type ReportsControllerFinancialReportApiResponse =
  /** status 200 OK */ ResponseReportsFinancialReport200Dto;
export type ReportsControllerFinancialReportApiArg = {
  fromUtc?: string;
  toUtc?: string;
  branchId?: string;
};
export type ReportsControllerStudentsCsvApiResponse = /** status 200 OK */ Blob;
export type ReportsControllerStudentsCsvApiArg = void;
export type RolesControllerPermissionsApiResponse =
  /** status 200 OK */ ResponseRolesPermissions200Item0Dto[];
export type RolesControllerPermissionsApiArg = void;
export type RolesControllerSystemRolesApiResponse =
  /** status 200 OK */ ResponseRolesSystemRoles200Item0Dto[];
export type RolesControllerSystemRolesApiArg = void;
export type RolesControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type RolesControllerListApiArg = {
  page?: number;
  pageSize?: number;
};
export type RolesControllerCreateApiResponse =
  /** status 201 Created */ ResponseRolesDetail200Dto;
export type RolesControllerCreateApiArg = {
  roleRequest: RoleRequest;
};
export type RolesControllerDetailApiResponse =
  /** status 200 OK */ ResponseRolesDetail200Dto;
export type RolesControllerDetailApiArg = {
  id: string;
};
export type RolesControllerUpdateApiResponse =
  /** status 200 OK */ ResponseRolesDetail200Dto;
export type RolesControllerUpdateApiArg = {
  id: string;
  roleRequest: RoleRequest;
};
export type RolesControllerDeleteApiResponse = unknown;
export type RolesControllerDeleteApiArg = {
  id: string;
};
export type RolesControllerReplacePermissionsApiResponse =
  /** status 200 OK */ ResponseRolesDetail200Dto;
export type RolesControllerReplacePermissionsApiArg = {
  id: string;
  rolePermissionsRequest: RolePermissionsRequest;
};
export type RolesControllerDuplicateApiResponse =
  /** status 201 Created */ ResponseRolesDetail200Dto;
export type RolesControllerDuplicateApiArg = {
  id: string;
};
export type RolesControllerAssignApiResponse =
  /** status 200 OK */ ResponseRolesAssign200Dto;
export type RolesControllerAssignApiArg = {
  id: string;
  userRoleRequest: UserRoleRequest;
};
export type RolesControllerUnassignApiResponse = unknown;
export type RolesControllerUnassignApiArg = {
  id: string;
};
export type GetApiV1ScheduledReportsApiResponse =
  /** status 200 OK */ ResponseScheduledReportsListDtoPagedResult;
export type GetApiV1ScheduledReportsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};
export type PostApiV1ScheduledReportsApiResponse =
  /** status 201 Created */ ResponseScheduledReportsListDto;
export type PostApiV1ScheduledReportsApiArg = {
  scheduledReportRequest: ScheduledReportRequest;
};
export type GetApiV1ScheduledReportsIdApiResponse =
  /** status 200 OK */ ResponseScheduledReportsListDto;
export type GetApiV1ScheduledReportsIdApiArg = {
  id: string;
};
export type PutApiV1ScheduledReportsIdApiResponse =
  /** status 200 OK */ ResponseScheduledReportsListDto;
export type PutApiV1ScheduledReportsIdApiArg = {
  id: string;
  scheduledReportRequest: ScheduledReportRequest;
};
export type DeleteApiV1ScheduledReportsIdApiResponse = unknown;
export type DeleteApiV1ScheduledReportsIdApiArg = {
  id: string;
};
export type FrontendShellControllerSearchApiResponse =
  /** status 200 OK */ SearchItemDto[];
export type FrontendShellControllerSearchApiArg = {
  q?: string;
  types?: string;
};
export type ResourceLifecycleControllerDeleteSessionApiResponse = unknown;
export type ResourceLifecycleControllerDeleteSessionApiArg = {
  id: string;
};
export type SessionManagementControllerDetailApiResponse =
  /** status 200 OK */ ResponseSessionManagementDetail200Dto;
export type SessionManagementControllerDetailApiArg = {
  id: string;
};
export type SessionManagementControllerEditApiResponse =
  /** status 200 OK */ LessonSession;
export type SessionManagementControllerEditApiArg = {
  id: string;
  editSessionRequest: EditSessionRequest;
};
export type SchedulingWorkflowControllerGenerateApiResponse =
  /** status 200 OK */ ResponseSchedulingWorkflowGenerate200Dto;
export type SchedulingWorkflowControllerGenerateApiArg = {
  id: string;
  generateSessionsRequest: GenerateSessionsRequest;
};
export type SchedulingWorkflowControllerPostponeApiResponse =
  /** status 200 OK */ ResponseSchedulingWorkflowPostpone200Dto;
export type SchedulingWorkflowControllerPostponeApiArg = {
  id: string;
  postponeSessionRequest: PostponeSessionRequest;
};
export type SessionManagementControllerCancelApiResponse =
  /** status 200 OK */ ResponseSessionManagementCancel200Dto;
export type SessionManagementControllerCancelApiArg = {
  id: string;
  cancelSessionRequest: CancelSessionRequest;
};
export type SessionsControllerGetSessionsApiResponse =
  /** status 200 OK */ LessonSession[];
export type SessionsControllerGetSessionsApiArg = {
  from?: string;
  to?: string;
  groupId?: string;
};
export type SessionsControllerPostSessionsApiResponse =
  /** status 201 Created */ LessonSession;
export type SessionsControllerPostSessionsApiArg = {
  newSession: NewSession;
};
export type SettingsControllerTenantSettingsApiResponse =
  /** status 200 OK */ ResponseSettingsTenantSettings200Dto;
export type SettingsControllerTenantSettingsApiArg = void;
export type SettingsControllerUpdateTenantApiResponse =
  /** status 200 OK */ ResponseSettingsUpdateTenant200Dto;
export type SettingsControllerUpdateTenantApiArg = {
  tenantSettingsRequest: TenantSettingsRequest;
};
export type SettingsControllerPoliciesApiResponse = /** status 200 OK */ {
  [key: string]: any;
};
export type SettingsControllerPoliciesApiArg = void;
export type SettingsControllerUpdatePoliciesApiResponse = /** status 200 OK */ {
  [key: string]: any;
};
export type SettingsControllerUpdatePoliciesApiArg = {
  body: {
    [key: string]: any;
  };
};
export type StaffControllerGetStaffApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type StaffControllerGetStaffApiArg = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  includeInactive?: boolean;
  sort?: string;
};
export type StaffControllerPostStaffApiResponse =
  /** status 201 Created */ ResponseStaffPostStaff201Dto;
export type StaffControllerPostStaffApiArg = {
  newStaffV1: NewStaffV1Write;
};
export type StaffCrudControllerDetailApiResponse =
  /** status 200 OK */ ResponseStaffCrudDetail200Dto;
export type StaffCrudControllerDetailApiArg = {
  id: string;
};
export type StaffCrudControllerUpdateApiResponse =
  /** status 200 OK */ ResponseStaffCrudDetail200Dto;
export type StaffCrudControllerUpdateApiArg = {
  id: string;
  staffEditRequest: StaffEditRequest;
};
export type StaffCrudControllerDeleteApiResponse = unknown;
export type StaffCrudControllerDeleteApiArg = {
  id: string;
};
export type StaffManagementControllerSuspendApiResponse =
  /** status 200 OK */ ResponseStaffManagementSuspend200Dto;
export type StaffManagementControllerSuspendApiArg = {
  id: string;
};
export type StaffManagementControllerActivateApiResponse =
  /** status 200 OK */ ResponseStaffManagementSuspend200Dto;
export type StaffManagementControllerActivateApiArg = {
  id: string;
};
export type StaffAttendanceCrudControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type StaffAttendanceCrudControllerListApiArg = {
  userId?: string;
  date?: string;
  page?: number;
  pageSize?: number;
};
export type StaffAttendanceCrudControllerCreateApiResponse =
  /** status 201 Created */ StaffAttendanceRecord;
export type StaffAttendanceCrudControllerCreateApiArg = {
  staffAttendanceRequest: StaffAttendanceRequest;
};
export type StaffAttendanceCrudControllerDetailApiResponse =
  /** status 200 OK */ StaffAttendanceRecord;
export type StaffAttendanceCrudControllerDetailApiArg = {
  id: string;
};
export type StaffAttendanceCrudControllerUpdateApiResponse =
  /** status 200 OK */ StaffAttendanceRecord;
export type StaffAttendanceCrudControllerUpdateApiArg = {
  id: string;
  staffAttendanceRequest: StaffAttendanceRequest;
};
export type StaffAttendanceCrudControllerDeleteApiResponse = unknown;
export type StaffAttendanceCrudControllerDeleteApiArg = {
  id: string;
  reason: string;
};
export type PrintableDocumentsControllerCardApiResponse =
  /** status 200 OK */ Blob;
export type PrintableDocumentsControllerCardApiArg = {
  id: string;
};
export type PrintableDocumentsControllerSendCardApiResponse = unknown;
export type PrintableDocumentsControllerSendCardApiArg = {
  id: string;
  documentSendRequest: DocumentSendRequest;
};
export type StudentBatchControllerExportApiResponse = /** status 200 OK */ Blob;
export type StudentBatchControllerExportApiArg = {
  format?: string;
  search?: string;
  gradeLevelId?: string;
  groupId?: string;
  status?: string;
  hasDebt?: boolean;
  sort?: string;
  includeArchived?: boolean;
};
export type StudentBatchControllerBulkDeleteApiResponse =
  /** status 200 OK */ BulkDeleteResultDto[];
export type StudentBatchControllerBulkDeleteApiArg = {
  bulkDeleteRequest: BulkDeleteRequest;
};
export type StudentBatchControllerPreviewApiResponse =
  /** status 200 OK */ ImportPreviewDto;
export type StudentBatchControllerPreviewApiArg = {
  body: {
    file?: Blob;
  };
};
export type StudentBatchControllerCommitApiResponse =
  /** status 200 OK */ ImportResultDto;
export type StudentBatchControllerCommitApiArg = {
  importCommitRequest: ImportCommitRequest;
};
export type StudentHistoryControllerAttendanceApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type StudentHistoryControllerAttendanceApiArg = {
  id: string;
  page?: number;
  pageSize?: number;
};
export type StudentHistoryControllerGradesApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type StudentHistoryControllerGradesApiArg = {
  id: string;
  page?: number;
  pageSize?: number;
};
export type StudentHistoryControllerArchiveApiResponse = unknown;
export type StudentHistoryControllerArchiveApiArg = {
  id: string;
};
export type StudentsControllerGetStudentsIdApiResponse =
  /** status 200 OK */ StudentDetailsDto;
export type StudentsControllerGetStudentsIdApiArg = {
  id: string;
};
export type StudentsControllerPutStudentsIdApiResponse =
  /** status 200 OK */ StudentDetailsDto;
export type StudentsControllerPutStudentsIdApiArg = {
  id: string;
  editStudent: EditStudent;
};
export type StudentHistoryControllerRotateQrApiResponse =
  /** status 200 OK */ ResponseStudentHistoryRotateQr200Dto;
export type StudentHistoryControllerRotateQrApiArg = {
  id: string;
};
export type StudentsControllerGetStudentsApiResponse =
  /** status 200 OK */ StudentListItemDtoPagedResult;
export type StudentsControllerGetStudentsApiArg = {
  search?: string;
  page?: number;
  pageSize?: number;
  gradeLevelId?: string;
  groupId?: string;
  status?: string;
  hasDebt?: boolean;
  sort?: string;
  includeArchived?: boolean;
};
export type StudentsControllerPostStudentsApiResponse =
  /** status 201 Created */ StudentDetailsDto;
export type StudentsControllerPostStudentsApiArg = {
  newStudent: NewStudent;
};
export type StudentsControllerPatchStudentsIdStatusApiResponse =
  /** status 200 OK */ ResponseGroupManagementPause200Dto;
export type StudentsControllerPatchStudentsIdStatusApiArg = {
  id: string;
  studentStatusChange: StudentStatusChange;
};
export type StudentsControllerPostStudentsIdEnrollmentsApiResponse =
  /** status 201 Created */ GroupEnrollment;
export type StudentsControllerPostStudentsIdEnrollmentsApiArg = {
  id: string;
  enrollV1: EnrollV1;
};
export type TeacherSettlementsControllerListApiResponse =
  /** status 200 OK */ ResponsePortalAssignmentsList200Dto;
export type TeacherSettlementsControllerListApiArg = {
  month?: string;
  page?: number;
  pageSize?: number;
};
export type TeacherSettlementsControllerDetailApiResponse =
  /** status 200 OK */ TeacherSettlement;
export type TeacherSettlementsControllerDetailApiArg = {
  id: string;
};
export type TeacherSettlementsControllerGenerateApiResponse =
  /** status 200 OK */ ResponseTeacherSettlementsGenerate200Dto;
export type TeacherSettlementsControllerGenerateApiArg = {
  month: string;
};
export type TeacherSettlementsControllerPayApiResponse =
  /** status 200 OK */ TeacherSettlement;
export type TeacherSettlementsControllerPayApiArg = {
  id: string;
  payrollPayRequest: PayrollPayRequest;
};
export type TeacherSettlementsControllerDisputeApiResponse =
  /** status 200 OK */ TeacherSettlement;
export type TeacherSettlementsControllerDisputeApiArg = {
  id: string;
  actionReasonRequest: ActionReasonRequest;
};
export type Subject = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  defaultPrice?: number | null;
};
export type SubjectPagedResult = {
  items?: Subject[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
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
export type SubjectRequest = {
  name: string | null;
  defaultPrice?: number | null;
  isActive?: boolean;
};
export type GradeLevel = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  stage?: string | null;
  sortOrder?: number;
};
export type GradeLevelPagedResult = {
  items?: GradeLevel[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type GradeLevelRequest = {
  name: string | null;
  stage:
    ("Primary" | "Prep" | "Secondary" | "University" | "International") | null;
  sortOrder?: number;
  isActive?: boolean;
};
export type AcademicTerm = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  status?: string | null;
};
export type AcademicTermPagedResult = {
  items?: AcademicTerm[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type AcademicTermRequest = {
  name: string | null;
  startDate?: string;
  endDate?: string;
  status: ("Upcoming" | "Current" | "Finished") | null;
  isActive?: boolean;
};
export type ResponsePortalAssignmentsList200Dto = {
  items?: any[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type AssignmentSubmission = {
  id?: string;
  tenantId?: string;
  assignmentId?: string;
  studentId?: string;
  note?: string | null;
  status?: string | null;
  submittedAtUtc?: string;
  score?: number | null;
  feedback?: string | null;
  gradedById?: string | null;
};
export type SubmissionGradeRequest = {
  score?: number | null;
  feedback?: string | null;
};
export type Assignment = {
  id?: string;
  tenantId?: string;
  title?: string | null;
  isActive?: boolean;
  groupId?: string;
  kind?: string | null;
  description?: string | null;
  dueAtUtc?: string | null;
  maxScore?: number | null;
  status?: string | null;
};
export type AssignmentPagedResult = {
  items?: Assignment[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type AssignmentRequest = {
  title: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  kind: ("Homework" | "Pdf" | "Worksheet") | null;
  description: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  dueAtUtc?: string | null;
  maxScore?: number | null;
};
export type Attendance = {
  id?: string;
  tenantId?: string;
  sessionId?: string;
  studentId?: string;
  status?: string | null;
  recordedAtUtc?: string;
  recordedById?: string;
  method?: string | null;
  clientRecordId?: string | null;
  deviceId?: string | null;
  blockOverride?: boolean;
  overrideReason?: string | null;
};
export type ResponseAttendanceGetSessionsIdAttendance200Dto = {
  records?: Attendance[] | null;
  expected?: number;
  present?: number;
  absent?: number;
  missingStudentIds?: string[] | null;
};
export type ResponseAttendanceGetSessionsIdOfflinePack200RosterItem0Dto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  status?: string | null;
  qrTokenHash?: string | null;
};
export type ResponseAttendanceGetSessionsIdOfflinePack200Dto = {
  sessionId?: string;
  roster?: ResponseAttendanceGetSessionsIdOfflinePack200RosterItem0Dto[] | null;
};
export type ResponseAttendancePostAttendanceScan200RecordDto = {
  id?: string;
  status?: string | null;
  checkedInAt?: string;
};
export type ResponseAttendancePostAttendanceScan200StudentDto = {
  id?: string;
  name?: string | null;
  code?: string | null;
};
export type ResponseAttendancePostAttendanceScan200CountersDto = {
  present?: number;
  late?: number;
  guests?: number;
  absent?: number;
  expected?: number;
};
export type ResponseAttendancePostAttendanceScan200Dto = {
  result?: string | null;
  recordId?: string | null;
  alreadyRecorded?: boolean;
  record?: ResponseAttendancePostAttendanceScan200RecordDto;
  student?: ResponseAttendancePostAttendanceScan200StudentDto;
  messagesQueued?: string[] | null;
  counters?: ResponseAttendancePostAttendanceScan200CountersDto;
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
export type ResponseAttendancePostSessionsIdClose200Dto = {
  id?: string;
  absent?: number;
  excused?: number;
  expected?: number;
};
export type CloseSession = {
  notifyAbsent?: boolean;
};
export type ResponseAttendancePostAttendanceSync200Dto = {
  results?: any[] | null;
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
export type ResponseGroupManagementPause200Dto = {
  id?: string;
  status?: string | null;
};
export type CancelSessionRequest = {
  reason: string | null;
  notify?: boolean;
};
export type AuditEntry = {
  id?: string;
  tenantId?: string;
  actorId?: string;
  action?: string | null;
  entityType?: string | null;
  entityId?: string;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  occurredAtUtc?: string;
};
export type RoleRefDto = {
  id?: string | null;
  name?: string | null;
};
export type TenantProfileDto = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  plan?: string | null;
};
export type BranchRefDto = {
  id?: string;
  name?: string | null;
};
export type MeDto = {
  id?: string;
  fullName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  kind?: string | null;
  isOwner?: boolean;
  roles?: RoleRefDto[] | null;
  tenant?: TenantProfileDto;
  branches?: BranchRefDto[] | null;
  permissions?: string[] | null;
  dataScope?: string | null;
  hidePhones?: boolean;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  branchId?: string | null;
  plan?: string | null;
};
export type AuthTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresInSeconds?: number;
  refreshExpiresAtUtc?: string;
  profile?: MeDto;
  tenant?: TenantProfileDto;
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
export type OtpChallengeDto = {
  challengeId?: string;
  resendAfterSeconds?: number;
  maskedDestination?: string | null;
  expiresInSeconds?: number;
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
export type ResponseLegacyAuthLogin200Dto = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresInSeconds?: number;
  id?: string;
  name?: string | null;
  role?: string | null;
  tenant?: string | null;
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
export type ResponseLegacyAuthCurrentTenant200Dto = {
  id?: string;
  slug?: string | null;
  name?: string | null;
  plan?: string | null;
};
export type ChangePasswordRequest = {};
export type ChangePasswordRequestWrite = {
  currentPassword: string | null;
  newPassword: string | null;
};
export type ForgotPasswordRequest = {
  tenantSlug: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
};
export type ResetPasswordRequest = {
  tenantSlug: string | null;
  token: string | null;
};
export type ResetPasswordRequestWrite = {
  tenantSlug: string | null;
  token: string | null;
  newPassword: string | null;
};
export type AutomationRule = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  event?: string | null;
  templateId?: string;
  timing?: string | null;
};
export type ActiveRequest = {
  isActive: boolean;
};
export type AutomationRulePagedResult = {
  items?: AutomationRule[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type AutomationRequest = {
  name: string | null;
  event:
    | (
        | "AttendanceRecorded"
        | "SessionClosedAbsent"
        | "GradePublished"
        | "PaymentOverdue7d"
        | "ConsecutiveAbsences2"
        | "SessionCancelled"
        | "SessionPostponed"
        | "PaymentReceived"
      )
    | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  templateId?: string;
  timing: ("Immediate" | "After1Hour" | "At21") | null;
  isActive?: boolean;
};
export type Branch = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  isOpen?: boolean;
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
export type ResponseCampaignsPreview200StudentsItem0Dto = {
  id?: string;
  fullName?: string | null;
  code?: string | null;
};
export type ResponseCampaignsPreview200Dto = {
  count?: number;
  students?: ResponseCampaignsPreview200StudentsItem0Dto[] | null;
};
export type ResponseCampaignsSendNow200Dto = {
  id?: string;
  status?: string | null;
  recipientCount?: number;
  alreadyQueued?: boolean;
};
export type ResponseCampaignsSendNow202Dto = {
  id?: string;
  status?: string | null;
  recipientCount?: number;
  delivered?: boolean;
};
export type ResponseCampaignsCancel200Dto = {
  id?: string;
  title?: string | null;
  body?: string | null;
  channel?: string | null;
  status?: string | null;
  isActive?: boolean;
  scheduledAtUtc?: string | null;
  recipientCount?: number;
  studentIds?: string[] | null;
};
export type CampaignDto = {
  id?: string;
  title?: string | null;
  body?: string | null;
  channel?: string | null;
  status?: string | null;
  isActive?: boolean;
  scheduledAtUtc?: string | null;
  recipientCount?: number;
  studentIds?: string[] | null;
};
export type ResponseCampaignsCancel200DtoPagedResult = {
  items?: ResponseCampaignsCancel200Dto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type CampaignRequest = {
  title: string | null;
  body: string | null;
  channel: ("WhatsApp" | "Sms" | "Push") | null;
  studentIds: string[] | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  scheduledAtUtc?: string | null;
};
export type ResponseCashShiftsGetCashShiftsCurrent200Dto = {
  id?: string;
  branchId?: string;
  openedAtUtc?: string;
  openingBalance?: number;
  expectedCash?: number;
};
export type CashShift = {
  id?: string;
  tenantId?: string;
  branchId?: string;
  userId?: string;
  openedAtUtc?: string;
  openingBalance?: number;
  closedAtUtc?: string | null;
  expectedCash?: number | null;
  countedCash?: number | null;
  variance?: number | null;
  varianceReason?: string | null;
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
export type ResponseHistoryDetailShift200Dto = {
  shift?: CashShift;
  expectedCash?: number;
};
export type TeacherAgreement = {
  id?: string;
  tenantId?: string;
  teacherId?: string;
  type?: string | null;
  value?: number;
  effectiveFrom?: string;
  effectiveTo?: string | null;
};
export type AgreementRequest = {
  type: ("Percentage" | "HourlyRent" | "PerStudent" | "FixedMonthly") | null;
  value?: number;
  effectiveFrom?: string;
};
export type CenterTeacher = {
  id?: string;
  tenantId?: string;
  fullName?: string | null;
  isActive?: boolean;
  userId?: string | null;
  subjectId?: string;
  phone?: string | null;
};
export type CenterTeacherPagedResult = {
  items?: CenterTeacher[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type TeacherRequest = {
  fullName: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  subjectId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  userId?: string | null;
  isActive?: boolean;
};
export type Video = {
  id?: string;
  tenantId?: string;
  title?: string | null;
  isActive?: boolean;
  groupId?: string;
  providerVideoId?: string | null;
  durationSeconds?: number;
  maxViewsPerStudent?: number;
  price?: number | null;
  watermark?: boolean;
  status?: string | null;
};
export type VideoPagedResult = {
  items?: Video[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type VideoRequest = {
  title: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  providerVideoId?: string | null;
  durationSeconds?: number;
  maxViewsPerStudent?: number;
  price?: number | null;
  watermark?: boolean;
};
export type ResponseCoursesListDto = {
  id?: string;
  title?: string | null;
  groupId?: string;
  price?: number;
  accessDuration?: string | null;
  status?: string | null;
  isActive?: boolean;
  videoIds?: string[] | null;
  assignmentIds?: string[] | null;
};
export type ResponseCoursesListDtoPagedResult = {
  items?: ResponseCoursesListDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type CourseRequest = {
  title: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  price?: number;
  accessDuration: ("Month" | "ThreeMonths" | "UntilTermEnd") | null;
  videoIds: string[] | null;
  assignmentIds: string[] | null;
  status: ("Available" | "Stopped") | null;
};
export type SessionCountsDto = {
  total?: number;
  live?: number;
  upcoming?: number;
  done?: number;
  cancelled?: number;
};
export type OpenDuesDto = {
  total?: number;
  count?: number;
};
export type DashboardSummaryDto = {
  incomeToday?: number;
  incomeYesterday?: number;
  sessionsToday?: SessionCountsDto;
  monthlyAttendanceRate?: number;
  openDues?: OpenDuesDto;
  activeStudents?: number;
  openDuesTotal?: number;
};
export type TodaySessionDto = {
  id?: string;
  groupName?: string | null;
  subject?: string | null;
  teacherName?: string | null;
  hallName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
  expected?: number;
  present?: number;
  groupId?: string;
  startsAtUtc?: string;
  durationMinutes?: number;
};
export type DashboardAlertDto = {
  type?: string | null;
  count?: number;
};
export type StudentListItemDto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  phone?: string | null;
  grade?: string | null;
  status?: string | null;
  guardianName?: string | null;
  balance?: number;
  createdAt?: string;
  branchId?: string | null;
  parentPhone?: string | null;
  gradeLevelId?: string | null;
};
export type StudentListItemDtoPagedResult = {
  items?: StudentListItemDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type QueuedDto = {
  queued?: number;
};
export type AlertNotifyRequest = {
  studentIds: string[] | null;
};
export type IncomeDayDto = {
  date?: string;
  amount?: number;
};
export type Discount = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  type?: string | null;
  value?: number;
  requiresApproval?: boolean;
  isActive?: boolean;
};
export type DiscountRequest = {
  name: string | null;
  type: ("Percent" | "Fixed") | null;
  value: number;
  requiresApproval?: boolean;
};
export type ResponseDiscountsStudentDiscounts200Item0DiscountDto = {
  name?: string | null;
  type?: string | null;
  value?: number;
  requiresApproval?: boolean;
  isActive?: boolean;
};
export type ResponseDiscountsStudentDiscounts200Item0Dto = {
  id?: string;
  discountId?: string;
  groupId?: string | null;
  validFromUtc?: string;
  validToUtc?: string | null;
  approvedById?: string | null;
  discount?: ResponseDiscountsStudentDiscounts200Item0DiscountDto;
};
export type StudentDiscount = {
  id?: string;
  tenantId?: string;
  studentId?: string;
  discountId?: string;
  groupId?: string | null;
  validFromUtc?: string;
  validToUtc?: string | null;
  approvedById?: string | null;
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
export type AbsenceExcuse = {
  id?: string;
  tenantId?: string;
  studentId?: string;
  sessionId?: string | null;
  dateUtc?: string;
  reason?: string | null;
  wantsMakeup?: boolean;
  status?: string | null;
  requestedById?: string;
  decidedById?: string | null;
  decidedAtUtc?: string | null;
  createdAtUtc?: string;
};
export type ExcuseRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  sessionId?: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  dateUtc?: string;
  reason: string | null;
  wantsMakeup?: boolean;
};
export type ExpenseCategory = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
};
export type ExpenseCategoryPagedResult = {
  items?: ExpenseCategory[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type CategoryRequest = {
  name: string | null;
  isActive?: boolean;
};
export type Expense = {
  id?: string;
  tenantId?: string;
  branchId?: string;
  cashShiftId?: string | null;
  category?: string | null;
  description?: string | null;
  amount?: number;
  status?: string | null;
  createdAtUtc?: string;
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
export type Charge = {
  id?: string;
  tenantId?: string;
  studentId?: string;
  groupId?: string;
  period?: string | null;
  amount?: number;
  createdAtUtc?: string;
};
export type ResponseChargeManagementDetail200Dto = {
  charge?: Charge;
  paid?: number;
  balance?: number;
};
export type ChargeEditRequest = {
  amount?: number;
  reason: string | null;
};
export type ActionReasonRequest = {
  reason: string | null;
};
export type ResponseDuesRemind202Dto = {
  id?: string;
  status?: string | null;
  delivered?: boolean;
};
export type ResponseDuesGenerate200Dto = {
  period?: string | null;
  created?: number;
  skipped?: number;
};
export type ResponseFinanceGetStudentsIdBalance200Dto = {
  due?: number;
  paid?: number;
  balance?: number;
  charges?: Charge[] | null;
};
export type NewChargeV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  period: string | null;
  amount?: number;
};
export type ResponseFinancePostPayments200Dto = {
  id?: string;
  receiptNumber?: string | null;
  amount?: number;
  status?: string | null;
  alreadyProcessed?: boolean;
};
export type AllocationInput = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  feeChargeId?: string;
  amount?: number;
};
export type ResponseFinancePostPayments201Dto = {
  id?: string;
  receiptNumber?: string | null;
  amount?: number;
  allocations?: AllocationInput[] | null;
};
export type NewPaymentV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  amount?: number;
  method: ("Cash" | "VodafoneCash" | "InstaPay" | "Card" | "Fawry") | null;
  allocations?: AllocationInput[] | null;
  idempotencyKey?: string | null;
  referenceNo?: string | null;
  notes?: string | null;
};
export type Payment = {
  id?: string;
  tenantId?: string;
  referenceNo?: string | null;
  notes?: string | null;
  chargeId?: string;
  amount?: number;
  method?: string | null;
  receiptNumber?: string | null;
  collectedById?: string;
  collectedAtUtc?: string;
  status?: string | null;
  voidReason?: string | null;
  voidedAtUtc?: string | null;
  cashShiftId?: string | null;
  idempotencyKey?: string | null;
};
export type PaymentAllocation = {
  id?: string;
  tenantId?: string;
  paymentId?: string;
  chargeId?: string;
  amount?: number;
};
export type ResponseFinanceGetPaymentsId200Dto = {
  payment?: Payment;
  studentId?: string;
  allocations?: PaymentAllocation[] | null;
};
export type ResponsePaymentManagementUpdate200Dto = {
  payment?: Payment;
  allocations?: AllocationInput[] | null;
};
export type PaymentEditRequest = {
  amount?: number;
  method: ("Cash" | "VodafoneCash" | "InstaPay" | "Card" | "Fawry") | null;
  referenceNo?: string | null;
  notes?: string | null;
  reason: string | null;
};
export type VoidPayment = {
  reason: string | null;
};
export type DocumentSendRequest = {
  to: ("student" | "guardian") | null;
};
export type ResponseEnrollmentWorkflowWaitlist200Item0StudentDto = {
  fullName?: string | null;
  code?: string | null;
};
export type ResponseEnrollmentWorkflowWaitlist200Item0Dto = {
  id?: string;
  studentId?: string;
  position?: number;
  status?: string | null;
  offeredAtUtc?: string | null;
  offerExpiresAtUtc?: string | null;
  student?: ResponseEnrollmentWorkflowWaitlist200Item0StudentDto;
};
export type WaitlistEntry = {
  id?: string;
  tenantId?: string;
  groupId?: string;
  studentId?: string;
  position?: number;
  status?: string | null;
  createdAtUtc?: string;
  offeredAtUtc?: string | null;
  offerExpiresAtUtc?: string | null;
};
export type WaitlistRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
};
export type ResponseEnrollmentWorkflowTransfer200Dto = {
  enrollmentId?: string;
  groupId?: string;
  studentId?: string;
};
export type TransferEnrollmentRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  toGroupId?: string;
  reason: string | null;
};
export type StudyGroup = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  subject?: string | null;
  grade?: string | null;
  teacherId?: string;
  capacity?: number;
  monthlyPrice?: number;
  branchId?: string | null;
  hallId?: string | null;
  status?: string | null;
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
export type GroupSchedule = {
  id?: string;
  tenantId?: string;
  groupId?: string;
  hallId?: string;
  dayOfWeek?: number;
  startTime?: string;
  durationMinutes?: number;
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
export type ResponseGroupsGetGroupsIdStudents200Item0Dto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  status?: string | null;
};
export type Guardian = {
  id?: string;
  tenantId?: string;
  fullName?: string | null;
  phone?: string | null;
};
export type ResponseGuardianManagementDetail200StudentsItem0Dto = {
  studentId?: string;
  relation?: string | null;
};
export type ResponseGuardianManagementDetail200Dto = {
  guardian?: Guardian;
  students?: ResponseGuardianManagementDetail200StudentsItem0Dto[] | null;
};
export type GuardianRequest = {
  fullName: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
};
export type HallBooking = {
  id?: string;
  tenantId?: string;
  hallId?: string;
  teacherId?: string;
  groupId?: string | null;
  startsAtUtc?: string;
  endsAtUtc?: string;
  status?: string | null;
};
export type BookingRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  teacherId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  startsAtUtc?: string;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  endsAtUtc?: string;
};
export type Hall = {
  id?: string;
  tenantId?: string;
  branchId?: string;
  name?: string | null;
  capacity?: number;
  equipment?: string | null;
  isAvailable?: boolean;
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
export type ResponseSchedulingWorkflowAvailability200BookingsItem0Dto = {
  id?: string;
  hallId?: string | null;
  groupId?: string;
  startsAtUtc?: string;
  durationMinutes?: number;
  status?: string | null;
};
export type ResponseSchedulingWorkflowAvailability200Dto = {
  halls?: Hall[] | null;
  bookings?: ResponseSchedulingWorkflowAvailability200BookingsItem0Dto[] | null;
};
export type HealthLiveDto = {
  status?: string | null;
};
export type GradeLevelLookupDto = {
  id?: string;
  name?: string | null;
  stage?: string | null;
  sortOrder?: number;
};
export type ResponseMaterialsDetail200Dto = {
  id?: string;
  name?: string | null;
  gradeLevelId?: string | null;
  price?: number;
  stockQty?: number;
  minStockAlert?: number;
  includedInSubscription?: boolean;
  isActive?: boolean;
  status?: string | null;
};
export type MaterialRequest = {
  name: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  gradeLevelId?: string | null;
  price?: number;
  minStockAlert?: number;
  includedInSubscription?: boolean;
};
export type StockMovement = {
  id?: string;
  tenantId?: string;
  materialId?: string;
  type?: string | null;
  quantity?: number;
  note?: string | null;
  materialDeliveryId?: string | null;
  createdById?: string;
  createdAtUtc?: string;
};
export type MovementRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  materialId?: string;
  type: ("In" | "Out" | "Damaged" | "Adjustment") | null;
  quantity?: number;
  note: string | null;
};
export type MaterialDelivery = {
  id?: string;
  tenantId?: string;
  materialId?: string;
  studentId?: string;
  deliveredById?: string;
  deliveredAtUtc?: string;
  status?: string | null;
  paymentStatus?: string | null;
  chargeId?: string | null;
};
export type DeliveryRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  materialId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  paymentStatus: ("Free" | "Owed") | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string | null;
};
export type ResponseMaterialDeliveriesDetail200Dto = {
  delivery?: MaterialDelivery;
  amount?: number;
  paid?: number;
  balance?: number;
  paymentStatus?: string | null;
};
export type MessageOutbox = {
  id?: string;
  tenantId?: string;
  campaignId?: string | null;
  channel?: string | null;
  kind?: string | null;
  studentId?: string;
  recipientPhone?: string | null;
  body?: string | null;
  status?: string | null;
  createdAtUtc?: string;
};
export type MessageTemplate = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  type?: string | null;
  channel?: string | null;
  body?: string | null;
  whatsAppTemplateName?: string | null;
  language?: string | null;
  isSystem?: boolean;
};
export type MessageTemplatePagedResult = {
  items?: MessageTemplate[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type TemplateRequest = {
  name: string | null;
  type:
    ("Attendance" | "Absence" | "Grade" | "Payment" | "General" | "Otp") | null;
  channel: ("WhatsApp" | "Sms" | "Push") | null;
  body: string | null;
  whatsAppTemplateName?: string | null;
  language: ("ar" | "en") | null;
  isActive?: boolean;
};
export type NotificationDto = {
  id?: string;
  title?: string | null;
  body?: string | null;
  type?: string | null;
  isRead?: boolean;
  createdAt?: string;
  link?: string | null;
};
export type NotificationsDto = {
  items?: NotificationDto[] | null;
  unreadCount?: number;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type QuestionOptionRequest = {
  label: string | null;
  text: string | null;
};
export type ExamQuestionSnapshot = {
  id?: string;
  text?: string | null;
  type?: string | null;
  options?: QuestionOptionRequest[] | null;
  correctLabel?: string | null;
  explanation?: string | null;
  points?: number;
};
export type ResponseOnlineExamsDetail200Dto = {
  id?: string;
  title?: string | null;
  groupId?: string;
  opensAtUtc?: string;
  closesAtUtc?: string;
  durationMinutes?: number;
  showAnswersAfterClose?: boolean;
  status?: string | null;
  questions?: ExamQuestionSnapshot[] | null;
};
export type ExamQuestionInput = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  questionId?: string;
  points?: number;
};
export type OnlineExamRequest = {
  title: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  opensAtUtc?: string;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  closesAtUtc?: string;
  durationMinutes?: number;
  showAnswersAfterClose?: boolean;
  questions: ExamQuestionInput[] | null;
};
export type ResponseExamGradingGrade200Dto = {
  id?: string;
  status?: string | null;
  score?: number | null;
};
export type EssayGradeRequest = {
  pointsAwarded?: number;
};
export type ResponsePayrollsDetail200Dto = {
  id?: string;
  userId?: string;
  month?: string | null;
  baseSalary?: number;
  bonus?: number;
  deductions?: number;
  net?: number;
  status?: string | null;
  paidAtUtc?: string | null;
  expenseId?: string | null;
};
export type PayrollRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  userId?: string;
  month: string | null;
  baseSalary?: number;
  bonus?: number;
  deductions?: number;
};
export type PayrollPayRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  cashShiftId?: string | null;
};
export type ResponsePlatformCreateTenant201Dto = {
  tenantId?: string;
  slug?: string | null;
  ownerId?: string;
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
export type ResponsePortalMe200StudentsItem0Dto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  grade?: string | null;
  branchId?: string | null;
};
export type ResponsePortalMe200Dto = {
  id?: string;
  role?: string | null;
  students?: ResponsePortalMe200StudentsItem0Dto[] | null;
};
export type ResponsePortalOverview200StudentDto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  grade?: string | null;
};
export type ResponsePortalOverview200NextSessionDto = {
  id?: string;
  groupId?: string;
  startsAtUtc?: string;
  durationMinutes?: number;
  hallId?: string | null;
  topic?: string | null;
};
export type ResponsePortalOverview200Dto = {
  student?: ResponsePortalOverview200StudentDto;
  attendancePercent?: number | null;
  averageScore?: number | null;
  nextSession?: ResponsePortalOverview200NextSessionDto;
  balance?: any | null;
};
export type ResponsePortalSessions200ItemsItem0QuizzesItem0Dto = {
  id?: string;
  title?: string | null;
  maxScore?: number;
  score?: number | null;
};
export type ResponsePortalSessions200ItemsItem0Dto = {
  id?: string;
  groupId?: string;
  startsAtUtc?: string;
  durationMinutes?: number;
  kind?: string | null;
  topic?: string | null;
  status?: string | null;
  attendance?: string | null;
  quizzes?: ResponsePortalSessions200ItemsItem0QuizzesItem0Dto[] | null;
};
export type ResponsePortalSessions200Dto = {
  items?: ResponsePortalSessions200ItemsItem0Dto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type ResponsePortalBalance200ChargesItem0Dto = {
  id?: string;
  groupId?: string;
  period?: string | null;
  amount?: number;
  paid?: number;
  remaining?: number;
};
export type ResponsePortalBalance200Dto = {
  charges?: ResponsePortalBalance200ChargesItem0Dto[] | null;
  totalDue?: number;
};
export type ResponsePortalCard200Dto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  grade?: string | null;
  qrToken?: string | null;
};
export type ResponsePortalSchedule200Item0Dto = {
  groupId?: string;
  hallId?: string;
  dayOfWeek?: number;
  startTime?: string;
  durationMinutes?: number;
};
export type SubmissionRequest = {
  note: string | null;
};
export type ResponsePortalExamsList200Item0Dto = {
  id?: string;
  title?: string | null;
  groupId?: string;
  opensAtUtc?: string;
  closesAtUtc?: string;
  durationMinutes?: number;
};
export type ResponsePortalExamsStart200QuestionsItem0Dto = {
  id?: string;
  text?: string | null;
  type?: string | null;
  options?: QuestionOptionRequest[] | null;
  points?: number;
};
export type ResponsePortalExamsStart200AnswersItem0Dto = {
  questionId?: string;
  selectedLabel?: string | null;
  essayText?: string | null;
  isFlagged?: boolean;
};
export type ResponsePortalExamsStart200Dto = {
  id?: string;
  onlineExamId?: string;
  expiresAtUtc?: string;
  status?: string | null;
  score?: number | null;
  questions?: ResponsePortalExamsStart200QuestionsItem0Dto[] | null;
  answers?: ResponsePortalExamsStart200AnswersItem0Dto[] | null;
};
export type ResponsePortalExamsAnswer200Dto = {
  saved?: boolean;
  questionId?: string;
};
export type ExamAnswerRequest = {
  selectedLabel?: string | null;
  essayText?: string | null;
  isFlagged?: boolean;
};
export type ResponsePortalExamsSubmit200Dto = {
  id?: string;
  status?: string | null;
  score?: number | null;
  submittedAtUtc?: string | null;
};
export type ExamAnswer = {
  questionId?: string;
  selectedLabel?: string | null;
  essayText?: string | null;
  isFlagged?: boolean;
  pointsAwarded?: number | null;
};
export type ResponsePortalExamsReview200Dto = {
  id?: string;
  score?: number | null;
  questions?: ExamQuestionSnapshot[] | null;
  answers?: ExamAnswer[] | null;
};
export type AcademicUnit = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  subjectId?: string;
  gradeLevelId?: string;
  sortOrder?: number;
};
export type AcademicUnitPagedResult = {
  items?: AcademicUnit[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type UnitRequest = {
  name: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  subjectId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  gradeLevelId?: string;
  sortOrder?: number;
  isActive?: boolean;
};
export type AcademicLesson = {
  id?: string;
  tenantId?: string;
  name?: string | null;
  isActive?: boolean;
  unitId?: string;
  sortOrder?: number;
};
export type AcademicLessonPagedResult = {
  items?: AcademicLesson[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type LessonRequest = {
  name: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  unitId?: string;
  sortOrder?: number;
  isActive?: boolean;
};
export type ResponseQuestionsDetail200Dto = {
  id?: string;
  unitId?: string;
  lessonId?: string | null;
  createdById?: string;
  type?: string | null;
  difficulty?: string | null;
  text?: string | null;
  explanation?: string | null;
  options?: QuestionOptionRequest[] | null;
  correctLabel?: string | null;
  isActive?: boolean;
};
export type QuestionRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  unitId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  lessonId?: string | null;
  type: ("Mcq" | "TrueFalse" | "Essay") | null;
  difficulty: ("Easy" | "Medium" | "Hard") | null;
  text: string | null;
  explanation?: string | null;
  options: QuestionOptionRequest[] | null;
  correctLabel?: string | null;
};
export type ResponseQuizAnalyticsDistribution200DistributionDto = {
  excellent?: number;
  good?: number;
  pass?: number;
  belowPass?: number;
};
export type ResponseQuizAnalyticsDistribution200Dto = {
  gradedCount?: number;
  maxScore?: number;
  average?: number | null;
  distribution?: ResponseQuizAnalyticsDistribution200DistributionDto;
};
export type ResponseQuizAnalyticsTop200Item0StudentDto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
};
export type ResponseQuizAnalyticsTop200Item0Dto = {
  studentId?: string;
  score?: number;
  rank?: number;
  student?: ResponseQuizAnalyticsTop200Item0StudentDto;
};
export type QuizMakeup = {
  id?: string;
  tenantId?: string;
  quizId?: string;
  studentId?: string;
  scheduledAtUtc?: string;
  status?: string | null;
};
export type QuizMakeupRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  studentId?: string;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  scheduledAtUtc?: string;
};
export type SessionQuiz = {
  id?: string;
  tenantId?: string;
  sessionId?: string;
  title?: string | null;
  maxScore?: number;
  isPublished?: boolean;
};
export type QuizEditRequest = {
  title: string | null;
  maxScore?: number;
};
export type QuizGrade = {
  id?: string;
  tenantId?: string;
  quizId?: string;
  studentId?: string;
  score?: number | null;
  recordedById?: string;
};
export type ResponseQuizzesGetQuizzesId200Dto = {
  quiz?: SessionQuiz;
  grades?: QuizGrade[] | null;
  gradedCount?: number;
  average?: number;
};
export type ResponseQuizManagementGrade200Dto = {
  updated?: number;
};
export type SingleGradeRequest = {
  score?: number | null;
  reason?: string | null;
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
export type ResponseReportsAttendanceReport200Item0Dto = {
  student?: ResponseQuizAnalyticsTop200Item0StudentDto;
  present?: number;
  late?: number;
  guest?: number;
  absent?: number;
  excused?: number;
  attendancePercent?: number;
};
export type ResponseReportsFinancialReport200ByMethodItem0Dto = {
  method?: string | null;
  amount?: number;
  count?: number;
};
export type ResponseReportsFinancialReport200Dto = {
  fromUtc?: string;
  toUtc?: string;
  charged?: number;
  collected?: number;
  expenses?: number;
  netCashFlow?: number;
  byMethod?: ResponseReportsFinancialReport200ByMethodItem0Dto[] | null;
};
export type ResponseRolesPermissions200Item0PermissionsItem0Dto = {
  code?: string | null;
  action?: string | null;
};
export type ResponseRolesPermissions200Item0Dto = {
  module?: string | null;
  permissions?: ResponseRolesPermissions200Item0PermissionsItem0Dto[] | null;
};
export type ResponseRolesSystemRoles200Item0Dto = {
  name?: string | null;
  isSystem?: boolean;
  dataScope?: string | null;
  isOwner?: boolean;
};
export type ResponseRolesDetail200Dto = {
  id?: string;
  name?: string | null;
  description?: string | null;
  baseRole?: string | null;
  dataScope?: string | null;
  codes?: string[] | null;
  isActive?: boolean;
  isSystem?: boolean;
  restrictsBuiltInRole?: boolean;
};
export type RoleRequest = {
  name: string | null;
  description?: string | null;
  baseRole:
    | (
        | "BranchManager"
        | "Teacher"
        | "Assistant"
        | "Receptionist"
        | "Accountant"
      )
    | null;
  codes: string[] | null;
  isActive?: boolean;
};
export type RolePermissionsRequest = {
  codes: string[] | null;
};
export type ResponseRolesAssign200Dto = {
  id?: string;
  role?: string | null;
  branchId?: string | null;
  customRole?: any | null;
};
export type UserRoleRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  roleId?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string | null;
};
export type ResponseScheduledReportsListDto = {
  id?: string;
  name?: string | null;
  reportType?: string | null;
  frequency?: string | null;
  channel?: string | null;
  nextRunAtUtc?: string;
  isActive?: boolean;
  recipientUserIds?: string[] | null;
  workerConfigured?: boolean;
};
export type ResponseScheduledReportsListDtoPagedResult = {
  items?: ResponseScheduledReportsListDto[] | null;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};
export type ScheduledReportRequest = {
  name: string | null;
  reportType:
    | (
        | "DailySummary"
        | "MonthlyIncome"
        | "WeeklyAttendance"
        | "ParentMonthly"
        | "Debts"
      )
    | null;
  frequency: ("Daily" | "Weekly" | "Monthly") | null;
  channel: ("WhatsAppPdf" | "Email" | "InApp") | null;
  recipientUserIds: string[] | null;
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  nextRunAtUtc?: string;
  isActive?: boolean;
};
export type SearchItemDto = {
  type?: string | null;
  id?: string;
  label?: string | null;
  subtitle?: string | null;
};
export type LessonSession = {
  id?: string;
  tenantId?: string;
  groupId?: string;
  startsAtUtc?: string;
  status?: string | null;
  closedAtUtc?: string | null;
  branchId?: string | null;
  hallId?: string | null;
  durationMinutes?: number;
  kind?: string | null;
  topic?: string | null;
};
export type ResponseSessionManagementDetail200GroupDto = {
  id?: string;
  name?: string | null;
  subject?: string | null;
  grade?: string | null;
  teacherId?: string;
};
export type ResponseSessionManagementDetail200HallDto = {
  id?: string;
  name?: string | null;
};
export type ResponseSessionManagementDetail200AttendanceDto = {
  recorded?: number;
  present?: number;
  absent?: number;
  excused?: number;
};
export type ResponseSessionManagementDetail200Dto = {
  session?: LessonSession;
  group?: ResponseSessionManagementDetail200GroupDto;
  hall?: ResponseSessionManagementDetail200HallDto;
  attendance?: ResponseSessionManagementDetail200AttendanceDto;
};
export type EditSessionRequest = {
  /** UTC ISO-8601 ending in Z; years 2020–2100. */
  startsAtUtc?: string;
  /** Non-empty UUID; all-zero UUID is invalid. */
  hallId?: string | null;
  durationMinutes?: number;
  topic?: string | null;
};
export type ResponseSchedulingWorkflowGenerate200Dto = {
  created?: number;
  skipped?: number;
  conflicts?: any[] | null;
  sessions?: LessonSession[] | null;
};
export type GenerateSessionsRequest = {
  fromDate?: string;
  days?: number;
};
export type ResponseSchedulingWorkflowPostpone200Dto = {
  originalId?: string;
  session?: LessonSession;
  messagesQueued?: boolean;
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
export type ResponseSessionManagementCancel200Dto = {
  id?: string;
  status?: string | null;
  messagesQueued?: boolean;
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
export type ResponseSettingsTenantSettings200Dto = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  plan?: string | null;
  timeZone?: string | null;
};
export type ResponseSettingsUpdateTenant200Dto = {
  id?: string;
  name?: string | null;
  slug?: string | null;
};
export type TenantSettingsRequest = {
  name: string | null;
};
export type ResponseStaffPostStaff201Dto = {
  id?: string;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  branchId?: string | null;
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
export type ResponseStaffCrudDetail200Dto = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  branchId?: string | null;
  isActive?: boolean;
};
export type StaffEditRequest = {
  name: string | null;
  email: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone: string | null;
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
export type ResponseStaffManagementSuspend200Dto = {
  id?: string;
  isActive?: boolean;
};
export type StaffAttendanceRecord = {
  id?: string;
  tenantId?: string;
  userId?: string;
  date?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status?: string | null;
};
export type StaffAttendanceRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  userId?: string;
  date?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: ("Present" | "Late" | "Absent" | "Leave") | null;
};
export type BulkDeleteResultDto = {
  id?: string;
  ok?: boolean;
  code?: string | null;
};
export type BulkDeleteRequest = {
  ids: string[] | null;
};
export type ImportRowDto = {
  rowNumber?: number;
  values?: {
    [key: string]: string;
  } | null;
  errors?: string[] | null;
};
export type ImportPreviewDto = {
  previewId?: string;
  columns?: string[] | null;
  rows?: ImportRowDto[] | null;
};
export type ImportErrorDto = {
  rowNumber?: number;
  code?: string | null;
  message?: string | null;
};
export type ImportResultDto = {
  created?: number;
  skipped?: number;
  errors?: ImportErrorDto[] | null;
};
export type ImportCommitRequest = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  previewId?: string;
  mapping: {
    [key: string]: string;
  } | null;
  guardianConsent?: boolean;
  confirmSibling?: boolean;
  /** Non-empty UUID; all-zero UUID is invalid. */
  branchId?: string | null;
};
export type GuardianLinkDto = {
  id?: string;
  fullName?: string | null;
  phone?: string | null;
  relation?: string | null;
};
export type StudentDetailsDto = {
  id?: string;
  code?: string | null;
  fullName?: string | null;
  phone?: string | null;
  grade?: string | null;
  status?: string | null;
  guardianName?: string | null;
  balance?: number;
  createdAt?: string;
  branchId?: string | null;
  parentPhone?: string | null;
  gradeLevelId?: string | null;
  guardians?: GuardianLinkDto[] | null;
  attendanceRate?: number | null;
  averageGrade?: number | null;
  groups?: string[] | null;
  qrToken?: string | null;
};
export type EditStudent = {
  /** Student name containing at least three words. */
  fullName: string | null;
  /** Egyptian mobile, e.g. 01012345678 or +201012345678. */
  phone?: string | null;
  grade?: string | null;
  /** Non-empty UUID; all-zero UUID is invalid. */
  gradeLevelId?: string | null;
};
export type ResponseStudentHistoryRotateQr200Dto = {
  id?: string;
  qrToken?: string | null;
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
  /** Non-empty UUID; all-zero UUID is invalid. */
  gradeLevelId?: string | null;
};
export type StudentStatusChange = {
  status: ("Active" | "Suspended" | "Withdrawn" | "Graduated") | null;
  reason: string | null;
};
export type GroupEnrollment = {
  id?: string;
  tenantId?: string;
  groupId?: string;
  studentId?: string;
  isActive?: boolean;
  joinedAtUtc?: string;
};
export type EnrollV1 = {
  /** Non-empty UUID; all-zero UUID is invalid. */
  groupId?: string;
};
export type TeacherSettlement = {
  id?: string;
  tenantId?: string;
  teacherId?: string;
  month?: string | null;
  grossCollected?: number;
  centerShare?: number;
  netToTeacher?: number;
  agreementSnapshotJson?: string | null;
  status?: string | null;
  disputeNote?: string | null;
  expenseId?: string | null;
  paidAtUtc?: string | null;
};
export type ResponseTeacherSettlementsGenerate200Dto = {
  created?: number;
  skippedWithoutAgreement?: string[] | null;
};
