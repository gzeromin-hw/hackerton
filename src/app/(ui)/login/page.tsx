'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/data/authStore'
import { useToastStore } from '@/data/toastStore'
import hallucinationsClient from '@/services/apis/hallucinations.client'

export default function LoginPage() {
  const router = useRouter()
  const { cleverseAuth, isHydrated } = useAuthStore()
  const isAuthenticated = cleverseAuth.isAuthenticated
  const setCleverseAuth = useAuthStore(state => state.setCleverseAuth)
  const cleverseUser = cleverseAuth.user
  const showToast = useToastStore(state => state.showToast)

  const [login, setLogin] = useState({
    ssoId: '',
    password: '',
  })
  const [loginLoading, setLoginLoading] = useState(false)

  // 이미 인증된 사용자 리다이렉트
  useEffect(() => {
    // hydration이 완료된 후에만 인증 상태를 확인
    if (isHydrated && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isHydrated, router])

  const handleLogin = async () => {
    if (!login.ssoId) {
      showToast('SSO ID를 입력해주세요.', 'warning')
      return
    }

    setLoginLoading(true)
    try {
      const loginData = await hallucinationsClient.login(login.ssoId)

      setCleverseAuth({
        isAuthenticated: true,
        accessToken: null,
        refreshToken: null,
        cookieToken: null,
        user: {
          userId: loginData.user_id,
          ssoId: loginData.sso_id,
          userName: loginData.userName,
          email: loginData.email,
          employeeNo: loginData.employeeNo,
          deptName: loginData.deptName,
          companyName: loginData.companyName || undefined,
          jobPositionName: loginData.jobPositionName || undefined,
        },
      })
      showToast('로그인 성공! 사용자 정보가 저장되었습니다.', 'success')
      router.push('/')
    } catch (error) {
      showToast(
        `로그인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        'error',
      )
    } finally {
      setLoginLoading(false)
    }
  }

  if (cleverseAuth.isAuthenticated && cleverseUser) {
    return (
      <div className="bg-base-100 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="bg-success mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
              <svg
                className="text-success-content h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base-content mb-2 text-xl font-semibold">
              로그인 완료
            </h2>
            <p className="text-base-content/60 text-sm">
              {cleverseUser.userName || cleverseUser.userId}님 환영합니다
            </p>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => router.push('/')}
          >
            메인으로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-base-100 flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-base-content mb-2 text-2xl font-semibold">
            Log in to your account
          </h1>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label htmlFor="ssoId" className="label">
              <span className="label-text">SSO ID</span>
            </label>
            <input
              id="ssoId"
              type="text"
              placeholder="Enter your SSO ID"
              value={login.ssoId}
              onChange={e =>
                setLogin({
                  ...login,
                  ssoId: e.target.value,
                })
              }
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label htmlFor="password" className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={login.password}
              onChange={e =>
                setLogin({
                  ...login,
                  password: e.target.value,
                })
              }
              onKeyDown={e => {
                if (e.key === 'Enter' && !loginLoading) {
                  handleLogin()
                }
              }}
              className="input input-bordered w-full"
            />
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Log In'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
