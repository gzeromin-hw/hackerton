'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import type { HomeResponseDto } from '@/services/dtos/hallucinations.dto'

type ChangeType = 'up' | 'down' | 'new' | 'same'

export interface PopularUsersPanelProps {
  /** 인기 급상승 임직원 목록 */
  popularUsers?: HomeResponseDto['popular_users']
  className?: string
}

/**
 * 인기 급상승 임직원을 표시하는 패널 컴포넌트
 */
export const PopularUsersPanel = ({
  popularUsers,
  className,
}: PopularUsersPanelProps) => {
  const router = useRouter()

  if (!popularUsers || popularUsers.length === 0) {
    return null
  }

  const changeTypes: ChangeType[] = ['up', 'down', 'new', 'same']

  const getChangeIcon = (change: ChangeType) => {
    switch (change) {
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      case 'new':
        return 'NEW'
      case 'same':
        return '—'
    }
  }

  const getChangeColor = (change: ChangeType) => {
    switch (change) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-error'
      case 'new':
        return 'text-primary'
      case 'same':
        return 'text-base-content/40'
    }
  }

  return (
    <div
      className={clsx(
        'card bg-base-100 border-base-300 border shadow-md',
        'flex min-w-[280px] flex-col p-4',
        'h-(--home-panel-height)',
        className,
      )}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h3 className="text-base-content text-base font-semibold">
          인기 급상승 임직원
        </h3>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ul className="flex-1 space-y-2 overflow-y-auto">
          {popularUsers.map((user, index) => {
            const change = changeTypes[
              Math.floor(Math.random() * changeTypes.length)
            ] as ChangeType
            return (
              <li
                key={`${user.user_id}-${index}`}
                onClick={() => router.push(`/home/user?id=${user.user_id}`)}
                className={clsx(
                  'flex items-center gap-2',
                  'hover:bg-base-200 rounded p-2 transition-colors',
                  'cursor-pointer',
                )}
              >
                <span
                  className={clsx(
                    'text-base-content/60 font-semibold',
                    'w-6 text-center',
                  )}
                >
                  {index + 1}
                </span>
                <div className="avatar shrink-0">
                  <div
                    className={clsx(
                      'bg-base-300 flex items-center justify-center',
                      'h-8 w-8 overflow-hidden rounded-full',
                    )}
                  >
                    <img
                      src={
                        user.profile_image_path ||
                        'https://img.daisyui.com/images/profile/demo/yellingcat@192.webp'
                      }
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-base-content flex-1 truncate text-sm">
                  {user.name}
                </span>
                <span
                  className={clsx(
                    'text-xs font-medium',
                    getChangeColor(change),
                  )}
                >
                  {getChangeIcon(change)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
