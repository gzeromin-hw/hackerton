'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/data/authStore'
import { ChatInput } from '@/components/ChatInput'
import { TrendingSearchPanel } from '@/components/TrendingSearchPanel'
import { PopularUsersPanel } from '@/components/PopularUsersPanel'
import { PopularTeamsPanel } from '@/components/PopularTeamsPanel'
import { UserCard } from '@/components/UserCard'
import { OrganizationCard } from '@/components/OrganizationCard'
import type { UserCardDto, TeamCardDto } from '@/services/dtos/common.dto'
import hallucinationsClient from '@/services/apis/hallucinations.client'
import type { HomeResponseDto } from '@/services/dtos/hallucinations.dto'
import clsx from 'clsx'
import useChatStore from '@/data/chatStore'
import useHomeStore from '@/data/homeStore'

export default function MainPage() {
  const router = useRouter()
  const { clearCardResult } = useHomeStore()
  const { setQuestion } = useChatStore()
  const { cleverseAuth, isHydrated } = useAuthStore()
  const isAuthenticated = cleverseAuth.isAuthenticated

  const [homeData, setHomeData] = useState<HomeResponseDto | null>(null)

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [isHydrated, isAuthenticated, router])

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!isAuthenticated) return

      try {
        const data = await hallucinationsClient.getHome()
        setHomeData(data)
      } catch (err) {
        console.error('데이터를 불러오는데 실패했습니다', err)
      }
    }

    fetchHomeData()
  }, [isAuthenticated])

  const handleMessageSubmit = (content: string) => {
    clearCardResult()
    setQuestion(content)
    router.push('/home')
  }

  // API 데이터가 있으면 사용, 없으면 fallback
  const currentUserCard: UserCardDto | null = homeData
    ? {
        user_id: homeData.my_profile_card.user_id,
        name: homeData.my_profile_card.name,
        team_name: homeData.my_profile_card.team_name,
        org_path: homeData.my_profile_card.org_path,
        summary: homeData.my_profile_card.summary,
        hashtags: homeData.my_profile_card.hashtags,
        is_leader: homeData.my_profile_card.is_leader,
        can_edit: homeData.my_profile_card.can_edit,
        profile_image_path: homeData.my_profile_card.profile_image_path,
      }
    : null

  const currentTeamCard: TeamCardDto | null = homeData
    ? {
        org_id: homeData.my_team_card.org_id,
        team_name: homeData.my_team_card.team_name,
        org_path: homeData.my_team_card.org_path,
        summary: homeData.my_team_card.summary,
        hashtags: homeData.my_team_card.hashtags,
        leader_id: homeData.my_team_card.leader_id,
        leader_name: homeData.my_team_card.leader_name,
        can_edit: homeData.my_team_card.can_edit,
      }
    : null

  const trendingHashtags =
    homeData?.trending_hashtags.map(item => ({
      hashtagId: item.hashtag_id,
      tagName: item.tag_name,
    })) || []

  return (
    <div
      className={clsx(
        'min-h-screen',
        'flex flex-col items-center',
        'pt-36 pb-8',
      )}
    >
      <div className="flex w-full flex-col items-center gap-5">
        <h2
          className={clsx(
            'text-base-content text-4xl font-bold',
            'tracking-tight',
          )}
        >
          어떤 업무를 찾고 계신가요?
        </h2>
        <ChatInput onSubmit={handleMessageSubmit} />
      </div>
      <div
        className={clsx(
          'flex flex-nowrap items-stretch justify-center gap-5',
          'mt-12 w-full max-w-6xl px-4',
        )}
      >
        {/* Section 1 실시간 검색어 나타내주는 패널 */}
        <TrendingSearchPanel
          className="w-1/3"
          maxItems={5}
          trendingHashtags={trendingHashtags}
        />

        {/* Section 2 인기 급상승 임직원 패널 */}
        <PopularUsersPanel
          popularUsers={homeData?.popular_users}
          className="w-1/3"
        />

        {/* Section 3 인기 급상승 팀 패널 */}
        <PopularTeamsPanel
          popularTeams={homeData?.popular_teams}
          className="w-1/3"
        />
      </div>
      {(currentUserCard || currentTeamCard) && (
        <div
          className={clsx(
            'mt-2 w-full max-w-6xl px-4',
            'flex flex-col gap-4',
            'md:flex-row',
          )}
        >
          {currentUserCard && (
            <div className="w-full md:w-1/2">
              <UserCard userCard={currentUserCard} variant="home" />
            </div>
          )}
          {currentTeamCard && (
            <div className="w-full md:w-1/2">
              <OrganizationCard teamCard={currentTeamCard} variant="home" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
