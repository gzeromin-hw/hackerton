'use client'

import clsx from 'clsx'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import hallucinationsClient from '@/services/apis/hallucinations.client'
import useHomeStore from '@/data/homeStore'

interface TrendingKeyword {
  hashtagId: number
  tagName: string
  rank: number
  change: 'up' | 'down' | 'new' | 'same'
}

export interface TrendingSearchPanelProps {
  /** 최대 표시할 검색어 개수 */
  maxItems?: number
  /** 자동 새로고침 간격 (ms) */
  refreshInterval?: number
  /** 트렌딩 해시태그 목록 (API에서 받은 데이터) */
  trendingHashtags?: Array<{ hashtagId: number; tagName: string }>
  className?: string
}

/**
 * 실시간 검색어를 표시하는 패널 컴포넌트
 */
export const TrendingSearchPanel = ({
  maxItems = 10,
  refreshInterval = 60000, // 1분
  trendingHashtags,
  className,
}: TrendingSearchPanelProps) => {
  const router = useRouter()
  const { setCardResult } = useHomeStore()
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingKeywords = async () => {
      try {
        setIsLoading(true)

        // API에서 받은 해시태그가 있으면 사용
        if (trendingHashtags && trendingHashtags.length > 0) {
          const changeTypes: Array<'up' | 'down' | 'new' | 'same'> = [
            'up',
            'down',
            'new',
            'same',
          ]
          const convertedKeywords: TrendingKeyword[] = trendingHashtags.map(
            (item, index) => {
              return {
                hashtagId: item.hashtagId,
                tagName: item.tagName,
                rank: index + 1,
                change:
                  changeTypes[Math.floor(Math.random() * changeTypes.length)],
              }
            },
          )
          setKeywords(convertedKeywords.slice(0, maxItems))
        } else {
          // Mock 데이터 (fallback)
          const mockKeywords: TrendingKeyword[] = [
            {
              hashtagId: 1,
              tagName: '프로젝트 관리',
              rank: 1,
              change: 'up',
            },
            { hashtagId: 2, tagName: '팀 협업', rank: 2, change: 'new' },
            { hashtagId: 3, tagName: '문서 작성', rank: 3, change: 'down' },
            { hashtagId: 4, tagName: '회의록', rank: 4, change: 'same' },
            { hashtagId: 5, tagName: '일정 관리', rank: 5, change: 'up' },
          ]
          setKeywords(mockKeywords.slice(0, maxItems))
        }
      } catch (error) {
        console.error('Failed to fetch trending keywords:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingKeywords()

    if (refreshInterval > 0 && !trendingHashtags) {
      // trendingHashtags가 prop으로 전달되면 자동 새로고침 비활성화
      const interval = setInterval(fetchTrendingKeywords, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [maxItems, refreshInterval, trendingHashtags])

  const getChangeIcon = (change: TrendingKeyword['change']) => {
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

  const getChangeColor = (change: TrendingKeyword['change']) => {
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

  const handleKeywordClick = async (keyword: number) => {
    try {
      const result = await hallucinationsClient.getHashtagsSearch(keyword)
      setCardResult(result.team_cards, result.user_cards)
      router.push('/home')
    } catch (error) {
      console.error('해시태그 검색 실패:', error)
    }
  }

  return (
    <div
      className={clsx(
        'card bg-base-100 border-base-300 border shadow-md',
        'flex min-w-[280px] flex-col p-4',
        'h-(--card-height)',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base-content text-base font-semibold">
          실시간 검색어
        </h3>
        {isLoading && <span className="loading loading-spinner loading-xs" />}
      </div>

      <div className="flex flex-1 flex-col">
        {isLoading && keywords.length === 0 ? (
          <div className="text-base-content/60 flex flex-1 items-center justify-center py-4 text-center text-sm">
            검색어를 불러오는 중...
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-base-content/60 flex flex-1 items-center justify-center py-4 text-center text-sm">
            검색어가 없습니다
          </div>
        ) : (
          <ul className="flex-1 space-y-2">
            {keywords.map(item => (
              <li
                key={item.rank}
                onClick={() => handleKeywordClick(item.hashtagId)}
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
                  {item.rank}
                </span>
                <span className="text-base-content flex-1 truncate text-sm">
                  {item.tagName}
                </span>
                <span
                  className={clsx(
                    'text-xs font-medium',
                    getChangeColor(item.change),
                  )}
                >
                  {getChangeIcon(item.change)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
