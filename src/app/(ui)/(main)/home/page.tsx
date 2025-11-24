'use client'

import { UserCard } from '@/components/UserCard'
import { OrganizationCard } from '@/components/OrganizationCard'
import type { UserCardDto, TeamCardDto } from '@/services/dtos/common.dto'
import useHomeStore from '@/data/homeStore'
import clsx from 'clsx'
import { useState, useEffect, useRef } from 'react'

const ITEMS_PER_PAGE = 9

// 컨텐츠 영역 넓이에 따른 그리드 컬럼 클래스 결정
const getGridColsClass = (width: number) => {
  if (width >= 1024) {
    // xl: 1024px 이상 -> 3열
    return 'grid-cols-3'
  } else if (width >= 768) {
    // lg: 768px 이상 -> 2열
    return 'grid-cols-2'
  } else if (width >= 640) {
    // md: 640px 이상 -> 2열
    return 'grid-cols-2'
  } else {
    // 기본: 1열
    return 'grid-cols-1'
  }
}

export default function Home() {
  const { cardResult, isLoading } = useHomeStore()
  const [userCardsVisible, setUserCardsVisible] = useState(ITEMS_PER_PAGE)
  const [teamCardsVisible, setTeamCardsVisible] = useState(ITEMS_PER_PAGE)
  const prevCardResultRef = useRef(cardResult)
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridCols, setGridCols] = useState('grid-cols-1')

  useEffect(() => {
    if (prevCardResultRef.current !== cardResult) {
      prevCardResultRef.current = cardResult
      const timeoutId = setTimeout(() => {
        setUserCardsVisible(ITEMS_PER_PAGE)
        setTeamCardsVisible(ITEMS_PER_PAGE)
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [cardResult])

  // 컨텐츠 영역 넓이에 따라 그리드 컬럼 동적 조정
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateGridCols = () => {
      const width = container.offsetWidth
      setGridCols(getGridColsClass(width))
    }

    // 초기 설정
    updateGridCols()

    // ResizeObserver로 넓이 변경 감지
    const resizeObserver = new ResizeObserver(() => {
      updateGridCols()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const displayUserCards: UserCardDto[] = cardResult ? cardResult.userCards : []
  const displayTeamCards: TeamCardDto[] = cardResult ? cardResult.teamCards : []

  const hasResults = displayUserCards.length > 0 || displayTeamCards.length > 0

  const visibleUserCards = displayUserCards.slice(0, userCardsVisible)
  const visibleTeamCards = displayTeamCards.slice(0, teamCardsVisible)

  const hasMoreUserCards = displayUserCards.length > userCardsVisible
  const hasMoreTeamCards = displayTeamCards.length > teamCardsVisible

  const handleLoadMoreUsers = () => {
    setUserCardsVisible(prev => prev + ITEMS_PER_PAGE)
  }

  const handleLoadMoreTeams = () => {
    setTeamCardsVisible(prev => prev + ITEMS_PER_PAGE)
  }

  return (
    <div className={clsx('min-h-screen p-6')}>
      <div ref={containerRef} className={clsx('mx-auto max-w-7xl space-y-8')}>
        {isLoading ? (
          <div
            className={clsx(
              'flex min-h-[60vh] flex-col items-center',
              'justify-center',
            )}
          >
            <span
              className={clsx(
                'loading loading-spinner',
                'text-base-content/50',
                'h-16 w-16',
              )}
            />
          </div>
        ) : !hasResults ? (
          <div
            className={clsx(
              'flex min-h-[60vh] flex-col items-center',
              'justify-center',
            )}
          >
            <div
              className={clsx(
                'flex flex-col items-center gap-4',
                'text-center',
              )}
            >
              <svg
                className={clsx('text-base-content/30 h-16 w-16')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className={clsx('text-base-content/70 text-lg font-medium')}>
                검색 결과가 없어요
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 사용자 리스트 섹션 */}
            {displayUserCards.length > 0 && (
              <section className={clsx('my-4 space-y-4')}>
                <h2 className={clsx('text-2xl font-bold')}>임직원</h2>
                <div className={clsx('grid gap-4', gridCols)}>
                  {visibleUserCards.map((userCard, index) => (
                    <UserCard
                      key={`user-${userCard.user_id}-${index}`}
                      userCard={userCard}
                      size="md"
                    />
                  ))}
                </div>
                {hasMoreUserCards && (
                  <div className={clsx('flex justify-center pt-4')}>
                    <button
                      onClick={handleLoadMoreUsers}
                      className={clsx(
                        'btn btn-outline btn-primary',
                        'min-w-32',
                      )}
                    >
                      더보기
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 조직 리스트 섹션 */}
            {displayTeamCards.length > 0 && (
              <section className={clsx('my-4 space-y-4')}>
                <h2 className={clsx('text-2xl font-bold')}>팀</h2>
                <div className={clsx('grid gap-4', gridCols)}>
                  {visibleTeamCards.map(teamCard => (
                    <OrganizationCard
                      key={teamCard.org_id}
                      teamCard={teamCard}
                      size="md"
                    />
                  ))}
                </div>
                {hasMoreTeamCards && (
                  <div className={clsx('flex justify-center pt-4')}>
                    <button
                      onClick={handleLoadMoreTeams}
                      className={clsx(
                        'btn btn-outline btn-primary',
                        'min-w-32',
                      )}
                    >
                      더보기
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
