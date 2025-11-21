'use client'

import { UserCard } from '@/components/UserCard'
import { OrganizationCard } from '@/components/OrganizationCard'
import type { UserCardDto, TeamCardDto } from '@/services/dtos/common.dto'
import useHomeStore from '@/data/homeStore'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

const ITEMS_PER_PAGE = 6

export default function Home() {
  const { cardResult, isLoading } = useHomeStore()
  const [userCardsVisible, setUserCardsVisible] = useState(ITEMS_PER_PAGE)
  const [teamCardsVisible, setTeamCardsVisible] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    setUserCardsVisible(ITEMS_PER_PAGE)
    setTeamCardsVisible(ITEMS_PER_PAGE)
  }, [cardResult])

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
      <div className={clsx('mx-auto max-w-7xl space-y-8')}>
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
                <h2 className={clsx('text-2xl font-bold')}>사용자</h2>
                <div
                  className={clsx(
                    'grid grid-cols-1 gap-4',
                    'md:grid-cols-2 lg:grid-cols-3',
                  )}
                >
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
                <h2 className={clsx('text-2xl font-bold')}>조직</h2>
                <div
                  className={clsx(
                    'grid grid-cols-1 gap-4',
                    'lg:grid-cols-2 2xl:grid-cols-3',
                  )}
                >
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
