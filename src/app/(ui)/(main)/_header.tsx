'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/data/authStore'
import clsx from 'clsx'

export default function Header() {
  const router = useRouter()
  const { cleverseAuth, clearCleverseAuth } = useAuthStore()
  const user = cleverseAuth.user
  const isAuthenticated = cleverseAuth.isAuthenticated
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    clearCleverseAuth()
    router.push('/login')
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <div className="navbar bg-base-100 border-base-300 fixed top-0 right-0 left-0 z-50 h-16 border-b px-8">
      <div className="flex-1">
        <Link href="/">
          <h1
            className={clsx(
              'cursor-pointer text-2xl font-bold hover:opacity-80',
              'inline-block bg-clip-text leading-[140%] text-transparent',
            )}
            style={{
              backgroundImage:
                'linear-gradient(90deg, #000000 0%, var(--color-primary) 60%, var(--color-secondary) 100%)',
            }}
          >
            Roltimate
          </h1>
        </Link>
      </div>
      <div className="flex-none gap-2">
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              className="avatar cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="mask mask-heart w-9">
                <img
                  src={
                    user.profileImage && typeof user.profileImage === 'string'
                      ? user.profileImage
                      : 'https://img.daisyui.com/images/profile/demo/yellingcat@192.webp'
                  }
                  alt={user.userName || 'User'}
                />
              </div>
            </button>
            {isMenuOpen && (
              <div
                className={clsx(
                  'bg-base-100 absolute right-0 mt-2 w-48 rounded-lg',
                  'border-base-300 z-50 border shadow-lg',
                )}
              >
                <div className="border-base-300 border-b p-4">
                  <div className="text-base-content text-sm font-medium">
                    {user.userName}
                  </div>
                  <div className="text-base-content/60 mt-1 text-xs">
                    {user.deptName || user.companyName || '로그인됨'}
                  </div>
                </div>
                <div className="p-2">
                  <button
                    className={clsx(
                      'btn btn-primary btn-sm w-full',
                      'justify-start',
                    )}
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-base-content/60 text-sm">로그인 필요</div>
        )}
      </div>
    </div>
  )
}
