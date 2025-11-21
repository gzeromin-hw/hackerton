'use client'

import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import type { Hashtag } from '@/types/hashtag'
import hallucinationsClient from '@/services/apis/hallucinations.client'
import useHomeStore from '@/data/homeStore'

export interface HashtagBadgeProps {
  /** 해시태그 정보 */
  hashtag: Hashtag
  /** 배지 스타일 (style) */
  variant?: 'outline' | 'dash' | 'soft' | 'ghost'
  /** 배지 색상 (color) */
  color?:
    | 'neutral'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
  /** 추가 클래스명 */
  className?: string
}

/**
 * 해시태그를 뱃지 형태로 표시하는 컴포넌트
 */
export const HashtagBadge = ({
  hashtag,
  variant,
  color = 'primary',
  className,
}: HashtagBadgeProps) => {
  const router = useRouter()
  const { setCardResult } = useHomeStore()

  const variantClasses = {
    outline: 'badge-outline',
    dash: 'badge-dash',
    soft: 'badge-soft',
    ghost: 'badge-ghost',
  }

  const colorClasses = {
    neutral: 'badge-neutral',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  }

  const handleClick = async () => {
    try {
      const result = await hallucinationsClient.getHashtagsSearch(
        hashtag.hashtagId,
      )
      setCardResult(result.team_cards, result.user_cards)
      router.push('/home')
    } catch (error) {
      console.error('해시태그 검색 실패:', error)
    }
  }

  return (
    <span
      onClick={handleClick}
      title={hashtag.tagName}
      className={clsx(
        'badge badge-sm cursor-pointer',
        'inline-block max-w-[200px] truncate text-left',
        variant && variantClasses[variant],
        colorClasses[color],
        className,
      )}
    >
      #{hashtag.tagName}
    </span>
  )
}
