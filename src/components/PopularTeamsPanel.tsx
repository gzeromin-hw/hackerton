'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import type { HomeResponseDto } from '@/services/dtos/hallucinations.dto'

type ChangeType = 'up' | 'down' | 'new' | 'same'

export interface PopularTeamsPanelProps {
  /** 인기 급상승 팀 목록 */
  popularTeams?: HomeResponseDto['popular_teams']
  className?: string
}

/**
 * 인기 급상승 팀을 표시하는 패널 컴포넌트
 */
export const PopularTeamsPanel = ({
  popularTeams,
  className,
}: PopularTeamsPanelProps) => {
  const router = useRouter()

  if (!popularTeams || popularTeams.length === 0) {
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
          인기 급상승 팀
        </h3>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ul className="flex-1 space-y-2 overflow-y-auto">
          {popularTeams.map((team, index) => {
            const change = changeTypes[
              Math.floor(Math.random() * changeTypes.length)
            ] as ChangeType
            return (
              <li
                key={`${team.org_id}-${index}`}
                onClick={() => router.push(`/home/org?id=${team.org_id}`)}
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
                <div
                  className={clsx(
                    'bg-primary/10 text-primary flex h-8 w-8',
                    'shrink-0 items-center justify-center rounded-lg',
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.003.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.059 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                </div>
                <span className="text-base-content flex-1 truncate text-sm">
                  {team.team_name}
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
