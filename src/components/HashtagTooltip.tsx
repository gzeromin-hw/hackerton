'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { Hashtag } from '@/types/hashtag'
import { HashtagBadge } from './HashtagBadge'

export interface HashtagTooltipProps {
  /** 표시할 해시태그 목록 */
  hashtags: Hashtag[]
  /** 최대 표시 개수 */
  maxCount?: number
}

/**
 * 해시태그가 많을 때 툴팁으로 나머지를 표시하는 컴포넌트
 */
export const HashtagTooltip = ({
  hashtags,
  maxCount = 5,
}: HashtagTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!hashtags || hashtags.length <= maxCount) {
    return null
  }

  const remainingHashtags = hashtags.slice(maxCount)
  const remainingCount = hashtags.length - maxCount

  return (
    <div className="relative">
      <span
        className="badge badge-soft badge-sm cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        +{remainingCount}개 더
      </span>
      {showTooltip && (
        <div
          className={clsx(
            'absolute top-full left-0 z-50 mt-2',
            'rounded-lg border border-neutral-700 bg-neutral-800',
            'max-w-[300px] min-w-[200px] p-2 shadow-lg',
            'flex flex-wrap gap-1',
          )}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {remainingHashtags.map((hashtag, index) => (
            <HashtagBadge
              key={`${hashtag.hashtagId}-${hashtag.tagName}-${index}`}
              hashtag={hashtag}
              className="border-neutral-600 bg-neutral-700 text-neutral-100"
            />
          ))}
        </div>
      )}
    </div>
  )
}

