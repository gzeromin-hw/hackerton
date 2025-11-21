'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/data/authStore'
import { useToastStore } from '@/data/toastStore'
import hallucinationsClient from '@/services/apis/hallucinations.client'
import clsx from 'clsx'

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
          profileImagePath: loginData.profile_image_path || undefined,
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
      <div
        className={clsx(
          'flex min-h-screen flex-col items-center',
          'justify-center px-4 py-8',
        )}
      >
        <div
          className={clsx(
            'w-full max-w-md rounded-2xl',
            'bg-base-100/80 p-8 shadow-2xl',
            'backdrop-blur-xl transition-all duration-300',
          )}
        >
          <div className="mb-8 text-center">
            <div
              className={clsx(
                'mb-4 inline-flex h-16 w-16 items-center',
                'bg-success justify-center rounded-full',
                'shadow-lg transition-transform hover:scale-110',
              )}
            >
              <svg
                className="text-success-content h-8 w-8"
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
            <h2 className={clsx('text-base-content mb-2 text-2xl font-bold')}>
              로그인 완료
            </h2>
            <p className="text-base-content/70 text-sm">
              {cleverseUser.userName || cleverseUser.userId}님 환영합니다
            </p>
          </div>
          <button
            className={clsx(
              'btn btn-primary w-full rounded-xl',
              'transition-all duration-200 hover:scale-[1.02]',
            )}
            onClick={() => router.push('/')}
          >
            메인으로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'relative flex min-h-screen flex-col items-center',
        'justify-center overflow-hidden px-4 py-8',
      )}
    >
      {/* 메인 로그인 카드 */}
      <div
        className={clsx(
          'relative z-10 w-full max-w-md rounded-2xl',
          'bg-base-100/90 p-8 shadow-2xl',
          'backdrop-blur-xl transition-all duration-300',
        )}
        style={{
          animation: 'fadeInUp 0.5s ease-out',
        }}
      >
        <div className="mb-10 text-center">
          <div
            className={clsx(
              'mb-6 inline-flex h-14 w-14 items-center',
              'justify-center rounded-2xl bg-linear-to-br',
              'from-primary to-primary/80 shadow-lg',
            )}
          >
            <svg
              className="text-primary-content h-7 w-7"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className={clsx('text-base-content mb-2 text-3xl font-bold')}>
            로그인
          </h1>
          <p className="text-base-content/60 mb-1 text-sm">
            AI 기반 조직 정보 검색 플랫폼
          </p>
          <p className="text-primary text-xs font-medium">
            자연어로 찾는 스마트 검색
          </p>
        </div>

        <div className="space-y-6">
          <div className="form-control">
            <label htmlFor="ssoId" className={clsx('label pb-2')}>
              <span
                className={clsx(
                  'label-text text-sm font-medium',
                  'text-base-content/80',
                )}
              >
                ID
              </span>
            </label>
            <input
              id="ssoId"
              type="text"
              placeholder="SSO ID를 입력하세요"
              value={login.ssoId}
              onChange={e =>
                setLogin({
                  ...login,
                  ssoId: e.target.value,
                })
              }
              className={clsx(
                'input input-bordered h-12 w-full rounded-xl',
                'border-base-300 bg-base-100 transition-all',
                'focus:border-primary duration-200 focus:outline-none',
                'focus:ring-primary/20 focus:ring-2',
              )}
            />
          </div>

          <div className="form-control">
            <label htmlFor="password" className={clsx('label pb-2')}>
              <span
                className={clsx(
                  'label-text text-sm font-medium',
                  'text-base-content/80',
                )}
              >
                비밀번호
              </span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
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
              className={clsx(
                'input input-bordered h-12 w-full rounded-xl',
                'border-base-300 bg-base-100 transition-all',
                'focus:border-primary duration-200 focus:outline-none',
                'focus:ring-primary/20 focus:ring-2',
              )}
            />
          </div>

          <button
            className={clsx(
              'btn btn-primary h-12 w-full rounded-xl',
              'text-base font-semibold shadow-lg',
              'transition-all duration-200 hover:scale-[1.02]',
              'hover:shadow-xl disabled:opacity-50',
            )}
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              '로그인'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
