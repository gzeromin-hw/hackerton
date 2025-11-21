'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { UserCard } from '@/components/UserCard'
import { OrganizationBreadcrumb } from '@/components/OrganizationBreadcrumb'
import { HashtagBadge } from '@/components/HashtagBadge'
import { HashtagTooltip } from '@/components/HashtagTooltip'
import { EditButton } from '@/components/EditButton'
import type { Organization } from '@/types/organization'
import type { Hashtag } from '@/types/hashtag'
import type { UserCardDto } from '@/services/dtos/common.dto'
import hallucinationsClient from '@/services/apis/hallucinations.client'
import type { TeamResponseDto } from '@/services/dtos/hallucinations.dto'
import { useAuthStore } from '@/data/authStore'
import clsx from 'clsx'

function OrgDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orgId = searchParams?.get('id')
  const editParam = searchParams?.get('edit') === 'true'
  const { cleverseAuth } = useAuthStore()
  const currentUserId = cleverseAuth.user?.userId

  const [teamData, setTeamData] = useState<TeamResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isEditing, setIsEditing] = useState(editParam)
  const [isSaving, setIsSaving] = useState(false)

  // 수정 모드용 상태
  const [editSummary, setEditSummary] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    if (!orgId) {
      setLoading(false)
      return
    }

    const fetchTeamData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await hallucinationsClient.getTeam(orgId)
        setTeamData(data)

        // 현재 사용자가 팀장인지 확인
        const isLeader =
          currentUserId !== undefined &&
          data.team?.leader?.user_id === currentUserId
        setCanEdit(isLeader || data.can_edit || false)

        // 수정 모드용 초기값 설정
        setEditSummary(data.team?.team_summary || '')
        setEditDescription(data.team?.team_description || '')
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는데 실패했습니다.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [orgId, currentUserId])

  // URL 쿼리 파라미터 변경 시 수정 모드 동기화
  useEffect(() => {
    setIsEditing(editParam)
  }, [editParam])

  // API 응답을 Organization[]로 변환
  const organizations: Organization[] = teamData
    ? (teamData.organization_hierarchy || []).map(org => ({
        orgId: org.org_id,
        orgCode: org.org_code,
        orgName: org.org_name,
        orgType: org.org_type,
        parentOrgId: org.parent_org_id,
        teamLeaderId: org.team_leader_id,
        teamDescriptionOriginal: org.team_description_original,
        teamDescriptionNormalized: org.team_description_normalized,
        teamSummary: org.team_summary,
        isActive: org.is_active,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
      }))
    : []

  // 현재 조직은 배열의 마지막 항목
  const organization: Organization | null =
    organizations[organizations.length - 1] || null

  // 해시태그 변환
  const hashtags: Hashtag[] =
    teamData?.team?.hashtags?.map((item, index) => {
      let tagName = ''
      let hashtagId = index + 1

      if (typeof item === 'string') {
        tagName = item
        // tagName 기반 고유 ID 생성
        const hashValue = tagName
          .split('')
          .reduce(
            (acc, char, idx) =>
              acc + char.charCodeAt(0) * Math.pow(31, idx + 1),
            0,
          )
        hashtagId = hashValue + index * 1000000
      } else if (typeof item === 'object' && item !== null) {
        tagName =
          (item as { tag_name?: string }).tag_name ||
          (item as { tagName?: string }).tagName ||
          ''
        // 서버에서 제공하는 hashtag_id가 있으면 우선 사용
        if ((item as { hashtag_id?: number }).hashtag_id) {
          hashtagId = (item as { hashtag_id?: number }).hashtag_id!
        } else if (tagName) {
          // tagName 기반 고유 ID 생성
          const hashValue = tagName
            .split('')
            .reduce(
              (acc, char, idx) =>
                acc + char.charCodeAt(0) * Math.pow(31, idx + 1),
              0,
            )
          hashtagId = hashValue + index * 1000000
        }
      }

      return {
        hashtagId,
        tagName,
        createdAt: new Date().toISOString(),
      }
    }) || []

  // 팀원 데이터를 UserCardDto로 변환
  const teamMemberCards: UserCardDto[] =
    teamData?.members?.map(member => ({
      user_id: member.user_id,
      name: member.name,
      team_name: member.team_name,
      org_path: member.org_path,
      summary: member.summary,
      hashtags: member.hashtags,
      is_leader: member.user_id === teamData?.team?.leader?.user_id || false,
      can_edit: teamData?.can_edit || false,
      profile_image_path: member.profile_image_path || null,
    })) || []

  const handleEdit = () => {
    setIsEditing(true)
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('edit', 'true')
    router.replace(`/home/org?${params.toString()}`)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // 원래 값으로 복원
    if (teamData?.team) {
      setEditSummary(teamData.team.team_summary || '')
      setEditDescription(teamData.team.team_description || '')
    }
    // URL 쿼리 파라미터에서 edit 제거
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('edit')
    router.replace(`/home/org?${params.toString()}`)
  }

  const handleSave = async () => {
    if (!orgId || !teamData) return

    try {
      setIsSaving(true)
      setError(null)

      // 팀 정보 업데이트
      const response = await hallucinationsClient.patchTeam(orgId, {
        team_summary: editSummary,
        team_description: editDescription,
      })

      // 응답 데이터로 상태 업데이트
      const updatedTeamData: TeamResponseDto = {
        ...teamData,
        team: {
          ...teamData.team,
          team_summary: response.team_summary,
          team_description: response.team_description,
        },
        organization_hierarchy: teamData.organization_hierarchy.map(org =>
          org.org_id === response.org_id
            ? {
                ...org,
                team_summary: response.team_summary,
                team_description_normalized: response.team_description,
                updated_at: response.updated_at,
              }
            : org,
        ),
      }
      setTeamData(updatedTeamData)

      setIsEditing(false)
      // URL 쿼리 파라미터에서 edit 제거
      const params = new URLSearchParams(searchParams?.toString() || '')
      params.delete('edit')
      router.replace(`/home/org?${params.toString()}`)
    } catch (err) {
      setError('팀 정보 수정 중 오류가 발생했습니다.')
      console.error('Failed to update team:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={clsx('min-h-screen p-6')}>
        <div className={clsx('mx-auto max-w-4xl')}>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={clsx('min-h-screen p-6')}>
        <div className={clsx('mx-auto max-w-4xl')}>
          <p className={clsx('text-error')}>{error}</p>
        </div>
      </div>
    )
  }

  if (!orgId || !organization || !teamData) {
    return (
      <div className={clsx('min-h-screen p-6')}>
        <div className={clsx('mx-auto max-w-4xl')}>
          <p>조직 ID가 제공되지 않았습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('min-h-screen p-6')}>
      <div className={clsx('mx-auto max-w-4xl space-y-6')}>
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className={clsx('btn btn-ghost btn-sm mb-4')}
        >
          ← 뒤로가기
        </button>

        {/* 조직 breadcrumb 및 수정 버튼 */}
        <div className={clsx('mb-4 flex items-center justify-between gap-4')}>
          <div className={clsx('flex-1 [&_.breadcrumbs]:mb-0')}>
            <OrganizationBreadcrumb organizations={organizations} />
          </div>
          {canEdit && (
            <div className={clsx('flex shrink-0 gap-2')}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className={clsx('btn btn-ghost btn-sm')}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={clsx('btn btn-neutral btn-sm')}
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                </>
              ) : (
                <EditButton onClick={handleEdit} size="sm" variant="neutral" />
              )}
            </div>
          )}
        </div>

        {/* 조직 헤더 섹션 */}
        <section
          className={clsx(
            'card bg-base-100 border-base-300 border p-6',
            'flex flex-row items-start justify-between gap-10',
          )}
        >
          <div className={clsx('flex w-1/2 flex-col items-center gap-4')}>
            {/* 조직 아이콘 */}
            <div className="avatar">
              <div
                className={clsx(
                  'bg-primary/10 flex items-center justify-center rounded-lg',
                  'text-primary h-32 w-32',
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.003.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.059 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
            </div>

            {/* 조직명 */}
            <h1 className={clsx('text-3xl font-bold')}>
              {organization.orgName}
            </h1>
          </div>
          {/* 카테고리 */}
          {hashtags && hashtags.length > 0 && (
            <div className={clsx('flex flex-col gap-2')}>
              <h3
                className={clsx('text-base-content/70 text-sm font-semibold')}
              >
                카테고리
              </h3>
              <div className={clsx('relative flex flex-wrap gap-2')}>
                {hashtags.slice(0, 5).map((hashtag, index) => (
                  <HashtagBadge
                    key={`badge-${hashtag.tagName}-${hashtag.hashtagId}-${index}`}
                    hashtag={hashtag}
                    color="neutral"
                  />
                ))}
                <HashtagTooltip hashtags={hashtags} maxCount={5} />
              </div>
            </div>
          )}
        </section>

        {/* 요약 정보 섹션 */}
        {(organization.teamSummary || isEditing) && (
          <section
            className={clsx('card bg-base-100 border-base-300 border p-6')}
          >
            <h2 className={clsx('mb-3 text-xl font-semibold')}>요약 정보</h2>
            {isEditing ? (
              <textarea
                value={editSummary}
                onChange={e => setEditSummary(e.target.value)}
                className={clsx('textarea textarea-bordered min-h-24 w-full')}
                placeholder="요약 정보를 입력하세요"
              />
            ) : (
              <p className={clsx('text-base-content/80 leading-relaxed')}>
                {organization.teamSummary || ''}
              </p>
            )}
          </section>
        )}

        {/* 상세 정보 (teamDescriptionNormalized) 섹션 */}
        {(organization.teamDescriptionNormalized || isEditing) && (
          <section
            className={clsx('card bg-base-100 border-base-300 border p-6')}
          >
            <h2 className={clsx('mb-3 text-xl font-semibold')}>상세 정보</h2>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className={clsx('textarea textarea-bordered min-h-48 w-full')}
                placeholder="상세 정보를 입력하세요"
              />
            ) : (
              <p
                className={clsx(
                  'text-base-content/80 leading-relaxed whitespace-pre-wrap',
                )}
              >
                {organization.teamDescriptionNormalized || ''}
              </p>
            )}
          </section>
        )}

        {/* 소속 팀원 섹션 */}
        {teamMemberCards && teamMemberCards.length > 0 && (
          <section>
            <h2 className={clsx('mb-4 text-2xl font-bold')}>소속 팀원</h2>
            <div
              className={clsx(
                'grid grid-cols-1 gap-4',
                'md:grid-cols-2 lg:grid-cols-3',
              )}
            >
              {teamMemberCards.map((memberCard, index) => (
                <UserCard
                  key={`member-${memberCard.user_id}-${index}`}
                  userCard={memberCard}
                  size="md"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default function OrgPage() {
  return (
    <Suspense
      fallback={
        <div className={clsx('min-h-screen p-6')}>
          <div className={clsx('mx-auto max-w-4xl')}>
            <p>로딩 중...</p>
          </div>
        </div>
      }
    >
      <OrgDetailContent />
    </Suspense>
  )
}
