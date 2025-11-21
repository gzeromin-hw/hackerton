'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useLayoutEffect } from 'react'
import clsx from 'clsx'
import type { UserCardDto } from '@/services/dtos/common.dto'
import { HashtagBadge } from './HashtagBadge'
import { HashtagTooltip } from './HashtagTooltip'

export interface UserCardProps {
  /** 사용자 카드 정보 */
  userCard: UserCardDto
  /** 카드 클릭 핸들러 */
  onClick?: () => void
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 컴팩트 모드 (간소화된 정보 표시) */
  compact?: boolean
  /** 카드 클래스 */
  className?: string
}

/**
 * 사용자 정보를 카드 형태로 표시하는 컴포넌트
 */
export const UserCard = ({
  userCard,
  onClick,
  size = 'md',
  compact = false,
  className,
}: UserCardProps) => {
  const router = useRouter()
  const hashtagContainerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const [maxVisibleCount, setMaxVisibleCount] = useState(5)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/home/user?id=${userCard.user_id}`)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/home/user?id=${userCard.user_id}&edit=true`)
  }

  // 해시태그 컨테이너의 남은 공간을 계산하여 표시 가능한 개수 결정
  // summary 길이에 따라 동적으로 조정
  useLayoutEffect(() => {
    if (
      !hashtagContainerRef.current ||
      !userCard.hashtags ||
      userCard.hashtags.length === 0
    ) {
      setMaxVisibleCount(userCard.hashtags?.length || 5)
      return
    }

    const calculateMaxVisibleCount = () => {
      const container = hashtagContainerRef.current
      const contentContainer = contentContainerRef.current
      if (!container || !contentContainer) return

      const containerWidth = container.clientWidth
      if (containerWidth === 0) {
        return
      }

      // summary의 실제 높이 측정
      const summaryHeight = summaryRef.current?.offsetHeight || 0
      const contentHeight = contentContainer.clientHeight
      const availableHeight = contentHeight - summaryHeight

      // summary가 짧으면 해시태그를 더 많이 표시할 수 있도록 가중치 적용
      // summary가 길면 해시태그를 적게 표시
      const summaryRatio = summaryHeight / contentHeight
      // summary가 전체의 30% 미만이면 짧은 것으로 간주
      const isShortSummary = summaryRatio < 0.3
      // summary가 전체의 60% 이상이면 긴 것으로 간주
      const isLongSummary = summaryRatio > 0.6

      // 실제 스타일을 적용한 임시 컨테이너로 측정
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.visibility = 'hidden'
      tempContainer.style.top = '-9999px'
      tempContainer.style.left = '-9999px'
      tempContainer.style.display = 'flex'
      tempContainer.style.flexWrap = 'nowrap'
      tempContainer.style.gap = '4px'
      tempContainer.style.width = `${containerWidth}px`
      document.body.appendChild(tempContainer)

      // 각 해시태그의 실제 너비 측정
      const badgeElements: HTMLSpanElement[] = []
      for (const hashtag of userCard.hashtags) {
        const tempBadge = document.createElement('span')
        tempBadge.className = 'badge badge-sm badge-soft badge-neutral'
        tempBadge.textContent = `#${hashtag.tag_name}`
        tempContainer.appendChild(tempBadge)
        badgeElements.push(tempBadge)
      }

      // "+N개 더" 버튼 너비 측정
      const tempTooltip = document.createElement('span')
      tempTooltip.className = 'badge badge-soft badge-sm cursor-pointer'
      tempTooltip.textContent = `+${userCard.hashtags.length}개 더`
      tempContainer.appendChild(tempTooltip)
      const tooltipWidth = tempTooltip.offsetWidth

      // 공간에 맞는 최대 개수 계산
      let count = 0
      let currentWidth = 0

      for (let i = 0; i < badgeElements.length; i++) {
        const badgeWidth = badgeElements[i].offsetWidth
        const needsTooltip = i < badgeElements.length - 1
        const requiredWidth =
          currentWidth + badgeWidth + (needsTooltip ? tooltipWidth + 4 : 0)

        if (requiredWidth <= containerWidth) {
          currentWidth += badgeWidth + 4
          count++
        } else {
          // tooltip이 필요 없는 경우 (마지막 해시태그) 다시 체크
          if (!needsTooltip && currentWidth + badgeWidth <= containerWidth) {
            count++
          }
          break
        }
      }

      document.body.removeChild(tempContainer)

      // summary 길이에 따라 가중치 적용
      let adjustedCount = count
      if (isShortSummary && availableHeight > 50) {
        // summary가 짧고 공간이 충분하면 더 많이 표시
        adjustedCount = Math.min(
          count + Math.floor((userCard.hashtags.length - count) * 0.5),
          userCard.hashtags.length,
        )
      } else if (isLongSummary) {
        // summary가 길면 적게 표시
        adjustedCount = Math.max(1, Math.floor(count * 0.7))
      }

      // 최소 1개는 표시하되, 실제 계산된 값 사용
      setMaxVisibleCount(Math.max(1, adjustedCount || userCard.hashtags.length))
    }

    // 초기 계산
    calculateMaxVisibleCount()

    // ResizeObserver로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      calculateMaxVisibleCount()
    })

    resizeObserver.observe(hashtagContainerRef.current)
    if (contentContainerRef.current) {
      resizeObserver.observe(contentContainerRef.current)
    }
    if (summaryRef.current) {
      resizeObserver.observe(summaryRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [userCard.hashtags, userCard.summary])
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const avatarSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
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
        {/* 프로필 이미지 */}
        <div className="avatar">
          <div
            className={clsx(
              'bg-base-300 flex items-center justify-center rounded-full',
              'overflow-hidden',
              avatarSizeClasses[size],
            )}
          >
            <img
              src={
                'https://img.daisyui.com/images/profile/demo/yellingcat@192.webp'
              }
              alt={userCard.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1">
          {/* 프로필 정보 */}
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3
              className={clsx(
                'text-base-content truncate font-semibold',
                textSizeClasses[size],
              )}
            >
              {userCard.name}
            </h3>
            <div className={clsx('flex items-center gap-2')}>
              {userCard.is_leader && (
                <span
                  className={clsx(
                    'badge badge-sm badge-neutral',
                    textSizeClasses[size],
                  )}
                >
                  팀장
                </span>
              )}
              {userCard.can_edit && (
                <button
                  onClick={handleEditClick}
                  className={clsx('btn btn-neutral btn-xs', 'shrink-0')}
                >
                  수정하기
                </button>
              )}
            </div>
          </div>
          {/* 소속팀 */}
          <div className="mb-2">
            <span
              className={clsx(
                'text-primary font-medium',
                textSizeClasses[size],
              )}
            >
              {userCard.team_name}
            </span>
          </div>
        </div>
      </div>

      <div ref={contentContainerRef} className="flex min-w-0 flex-1 flex-col">
        {/* 요약정보 */}
        {userCard.summary && (
          <div className="mb-2">
            <p
              ref={summaryRef}
              className={clsx(
                'text-base-content/70 line-clamp-7',
                'whitespace-pre-wrap',
                textSizeClasses[size],
              )}
            >
              {userCard.summary}
            </p>
          </div>
        )}

        {/* 카테고리(해시태그) */}
        {userCard.hashtags && userCard.hashtags.length > 0 && (
          <div
            ref={hashtagContainerRef}
            className="relative mt-auto flex flex-wrap gap-1 pt-2"
          >
            {userCard.hashtags.slice(0, maxVisibleCount).map(hashtag => (
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
            {maxVisibleCount < userCard.hashtags.length && (
              <HashtagTooltip
                hashtags={userCard.hashtags.map(h => ({
                  hashtagId: h.hashtag_id,
                  tagName: h.tag_name,
                  createdAt: new Date().toISOString(),
                }))}
                maxCount={maxVisibleCount}
              />
            )}
          </div>
        )}

        {compact && (
          <div className="text-base-content/60 mt-auto pt-1 text-xs">
            {userCard.team_name}
          </div>
        )}
      </div>
    </div>
  )
}
