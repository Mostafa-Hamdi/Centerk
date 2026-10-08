import { api } from '@/services/api';
import { meLoaded, type AuthState } from '@/store/authSlice';
import { BFF } from './constants';
import { normalizeMe } from './normalizeMe';
import type {
  ClientSession,
  ForgotPasswordRequest,
  LoginRequest,
  MeDto,
  OtpRequest,
  OtpRequestResult,
  OtpVerifyRequest,
  ResetPasswordRequest,
} from './types';

/** backend-spec §10.1. Token-issuing calls go through the BFF so the refresh token stays in a cookie. */
export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<ClientSession, LoginRequest>({
      query: (body) => ({ url: BFF.login, method: 'POST', body }),
      extraOptions: { bff: true },
    }),
    verifyOtp: build.mutation<ClientSession, OtpVerifyRequest>({
      query: (body) => ({ url: BFF.otpVerify, method: 'POST', body }),
      extraOptions: { bff: true },
    }),
    logout: build.mutation<undefined, undefined>({
      query: () => ({ url: BFF.logout, method: 'POST' }),
      extraOptions: { bff: true },
    }),
    requestOtp: build.mutation<OtpRequestResult | null, OtpRequest>({
      query: (body) => ({ url: '/auth/otp/request', method: 'POST', body }),
    }),
    forgotPassword: build.mutation<undefined, ForgotPasswordRequest>({
      query: (body) => ({ url: '/auth/password/forgot', method: 'POST', body }),
    }),
    resetPassword: build.mutation<undefined, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/password/reset', method: 'POST', body }),
    }),
    getMe: build.query<MeDto, undefined>({
      // Live /me is untyped and differs from the spec — normalized (token claims as fallback).
      async queryFn(_arg, queryApi, _extraOptions, baseQuery) {
        const { accessToken, loginHint } = (queryApi.getState() as { auth: AuthState }).auth;
        const result = await baseQuery('/me');
        // /me unavailable but the tokens came with profile/tenant → still build the account.
        if (result.error) {
          return loginHint && result.error.status !== 401
            ? { data: normalizeMe(null, accessToken, loginHint) }
            : { error: result.error };
        }
        return { data: normalizeMe(result.data, accessToken, loginHint) };
      },
      providesTags: ['Me'],
      keepUnusedDataFor: 60 * 60,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(meLoaded(data));
        } catch {
          // Error state is exposed by the query itself.
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useRequestOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
} = authApi;
