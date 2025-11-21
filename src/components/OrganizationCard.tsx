'use client'

import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import type { TeamCardDto } from '@/services/dtos/common.dto'
import { HashtagBadge } from './HashtagBadge'
import { HashtagTooltip } from './HashtagTooltip'
import { useAuthStore } from '@/data/authStore'

export interface OrganizationCardProps {
  /** 팀 카드 정보 */
  teamCard: TeamCardDto
  /** 카드 클릭 핸들러 */
  onClick?: () => void
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 컴팩트 모드 (간소화된 정보 표시) */
  compact?: boolean
  className?: string
}

/**
 * 조직 정보를 카드 형태로 표시하는 컴포넌트
 */
export const OrganizationCard = ({
  teamCard,
  onClick,
  size = 'md',
  compact = false,
  className,
}: OrganizationCardProps) => {
  const router = useRouter()
  const { cleverseAuth } = useAuthStore()
  const currentUserId = cleverseAuth.user?.userId
  const canEdit =
    teamCard.leader_id !== undefined &&
    currentUserId !== undefined &&
    teamCard.leader_id === currentUserId

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/home/org?id=${teamCard.org_id}`)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/home/org?id=${teamCard.org_id}&edit=true`)
  }
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const iconSizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div
      className={clsx(
        'card bg-base-100 border-base-300 border shadow-md',
        'flex flex-col justify-between gap-4',
        'h-(--card-height) transition-shadow hover:shadow-lg',
        'cursor-pointer',
        sizeClasses[size],
        className,
      )}
      onClick={handleClick}
    >
      <div className={clsx('flex items-center gap-4')}>
        {/* 조직 아이콘 */}
        <div className="avatar">
          <div
            className={clsx(
              'bg-primary/10 flex items-center justify-center rounded-lg',
              'text-primary',
              iconSizeClasses[size],
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.003.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.059 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </div>
        </div>
        {/* 조직 정보 */}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3
              className={clsx(
                'text-base-content truncate font-semibold',
                textSizeClasses[size],
              )}
            >
              {teamCard.team_name}
            </h3>
            {canEdit && (
              <button
                onClick={handleEditClick}
                className={clsx('btn btn-accent btn-xs', 'shrink-0')}
              >
                수정하기
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 요약정보 */}
        {teamCard.summary && (
          <div className="mb-2">
            <p
              className={clsx(
                'text-base-content/70 line-clamp-7',
                'whitespace-pre-wrap',
                textSizeClasses[size],
              )}
            >
              {teamCard.summary}
            </p>
          </div>
        )}

        {/* 카테고리(해시태그) */}
        {teamCard.hashtags && teamCard.hashtags.length > 0 && (
          <div className="relative mt-auto flex flex-wrap gap-1 pt-2">
            {teamCard.hashtags.slice(0, 5).map(hashtag => (
              <HashtagBadge
                key={hashtag.hashtag_id}
                hashtag={{
                  hashtagId: hashtag.hashtag_id,
                  tagName: hashtag.tag_name,
                  createdAt: new Date().toISOString(),
                }}
                variant="soft"
                color="neutral"
              />
            ))}
            <HashtagTooltip
              hashtags={teamCard.hashtags.map(h => ({
                hashtagId: h.hashtag_id,
                tagName: h.tag_name,
                createdAt: new Date().toISOString(),
              }))}
              maxCount={5}
            />
          </div>
        )}

        {compact && (
          <div className="text-base-content/60 mt-auto pt-1 text-xs">
            {teamCard.summary}
          </div>
        )}
      </div>
    </div>
  )
}
