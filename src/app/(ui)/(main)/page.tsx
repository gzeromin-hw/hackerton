'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/data/authStore'
import { ChatInput } from '@/components/ChatInput'
import { TrendingSearchPanel } from '@/components/TrendingSearchPanel'
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
      }
    : null

  const currentTeamCard: TeamCardDto | null = homeData
    ? {
        org_id: homeData.my_team_card.org_id,
        team_name: homeData.my_team_card.team_name,
        org_path: homeData.my_team_card.org_path,
        summary: homeData.my_team_card.summary,
        hashtags: homeData.my_team_card.hashtags,
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
        'bg-base-100 min-h-screen',
        'flex flex-col items-center justify-center',
      )}
    >
      <ChatInput onSubmit={handleMessageSubmit} />
      <div
        className={clsx(
          'flex flex-nowrap items-stretch justify-center gap-4',
          'mt-8 w-full max-w-6xl overflow-x-auto px-4',
        )}
      >
        {/* Section 1 실시간 검색어 나타내주는 패널 */}
        <TrendingSearchPanel
          className="w-1/5"
          maxItems={5}
          trendingHashtags={trendingHashtags}
        />

        {/* Section 2 내 정보 나타내주는 카드 UserCard */}
        {currentUserCard && (
          <UserCard className="w-2/5" userCard={currentUserCard} size="md" />
        )}

        {/* Section 3 팀 정보 나타내주는 카드 OrganizationCard */}
        {currentTeamCard && (
          <OrganizationCard
            className="w-2/5"
            teamCard={currentTeamCard}
            size="md"
          />
        )}
      </div>
    </div>
  )
}
