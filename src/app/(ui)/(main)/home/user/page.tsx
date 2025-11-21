'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { OrganizationBreadcrumb } from '@/components/OrganizationBreadcrumb'
import { HashtagBadge } from '@/components/HashtagBadge'
import { HashtagTooltip } from '@/components/HashtagTooltip'
import { EditButton } from '@/components/EditButton'
import type { User, UserResponsibility } from '@/types/user'
import type { Organization } from '@/types/organization'
import type { Hashtag } from '@/types/hashtag'
import clsx from 'clsx'
import hallucinationsClient from '@/services/apis/hallucinations.client'

function UserDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = parseInt(searchParams?.get('id') || '0')
  const editParam = searchParams?.get('edit') === 'true'

  const [user, setUser] = useState<User | null>(null)
  const [userResponsibility, setUserResponsibility] =
    useState<UserResponsibility | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [availableHashtags, setAvailableHashtags] = useState<Hashtag[]>([])
  const [orgId, setOrgId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isEditing, setIsEditing] = useState(editParam)
  const [isSaving, setIsSaving] = useState(false)

  // 수정 모드용 상태
  const [editPhone, setEditPhone] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editDetail, setEditDetail] = useState('')
  const [editHashtags, setEditHashtags] = useState<string[]>([])
  const [newHashtagInput, setNewHashtagInput] = useState('')
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowHashtagDropdown(false)
      }
    }

    if (showHashtagDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showHashtagDropdown])

  useEffect(() => {
    const fetchAvailableHashtags = async () => {
      try {
        const response = await hallucinationsClient.getHashtags()
        const hashtagData: Hashtag[] = response.hashtags.map(h => ({
          hashtagId: h.hashtag_id,
          tagName: h.tag_name,
          createdAt: new Date().toISOString(),
        }))
        setAvailableHashtags(hashtagData)
      } catch (err) {
        console.error('Failed to fetch available hashtags:', err)
      }
    }

    fetchAvailableHashtags()
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await hallucinationsClient.getUser(userId)

        // can_edit 값 저장
        setCanEdit(response.can_edit || false)

        // organization.org_id 저장
        setOrgId(response.organization.org_id)

        // User 타입으로 변환
        const userData: User = {
          userId: response.user.user_id,
          employeeId: `EMP${response.user.user_id.toString().padStart(3, '0')}`,
          ssoId: response.user.sso_id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          profileImagePath: response.user.profile_image_path || '',
          isActive: true,
          isLeader: response.user.is_leader,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setUser(userData)

        // 수정 모드용 초기값 설정
        setEditPhone(response.user.phone)
        setEditSummary(response.responsibility?.summary || '')
        setEditDetail(response.responsibility?.detail || '')
        setEditHashtags(
          response.hashtags.map(h =>
            typeof h === 'string' ? h : h.tag_name || '',
          ),
        )

        // UserResponsibility 타입으로 변환
        if (response.responsibility) {
          const responsibilityData: UserResponsibility = {
            id: response.user.user_id,
            userId: response.user.user_id,
            originalDescription: response.responsibility.detail,
            normalizedDescription: response.responsibility.detail,
            summary: response.responsibility.summary || null,
            lastUpdatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }
          setUserResponsibility(responsibilityData)
        }

        // Organization[] 타입으로 변환
        // organization_hierarchy는 객체 배열이므로, 각 항목을 Organization으로 변환
        const orgData: Organization[] = response.organization_hierarchy.map(
          org => ({
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
          }),
        )
        setOrganizations(orgData)

        // Hashtag[] 타입으로 변환
        const hashtagData: Hashtag[] = response.hashtags.map((item, index) => {
          let tagName = ''
          let hashtagId = index + 1

          if (typeof item === 'string') {
            tagName = item
            // 서버에서 제공하는 ID가 없으므로 tagName 기반 고유 ID 생성
            // tagName + index를 조합하여 완전히 고유한 값 생성
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
        })
        setHashtags(hashtagData)
      } catch (err) {
        setError('사용자 데이터를 불러오는 중 오류가 발생했습니다.')
        console.error('Failed to fetch user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  // URL 쿼리 파라미터 변경 시 수정 모드 동기화
  useEffect(() => {
    setIsEditing(editParam)
  }, [editParam])

  const handleEdit = () => {
    setIsEditing(true)
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('edit', 'true')
    router.replace(`/home/user?${params.toString()}`)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // 원래 값으로 복원
    if (user) {
      setEditPhone(user.phone)
    }
    if (userResponsibility) {
      setEditSummary(userResponsibility.summary || '')
      setEditDetail(userResponsibility.normalizedDescription)
    }
    setEditHashtags(hashtags.map(h => h.tagName))
    setNewHashtagInput('')
    setShowHashtagDropdown(false)
    // URL 쿼리 파라미터에서 edit 제거
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('edit')
    router.replace(`/home/user?${params.toString()}`)
  }

  const handleRemoveHashtag = (tagName: string) => {
    setEditHashtags(prev => prev.filter(tag => tag !== tagName))
  }

  const handleSelectHashtag = (tagName: string) => {
    if (!editHashtags.includes(tagName)) {
      setEditHashtags(prev => [...prev, tagName])
    }
    setShowHashtagDropdown(false)
  }

  const handleAddNewHashtag = async () => {
    if (!newHashtagInput.trim()) return

    const tagName = newHashtagInput.trim()
    if (editHashtags.includes(tagName)) {
      setNewHashtagInput('')
      return
    }

    try {
      // 새로운 해시태그를 DB에 추가
      const response = await hallucinationsClient.postHashtags({
        tag_name: tagName,
      })
      // 로컬 상태에 추가
      setEditHashtags(prev => [...prev, tagName])
      // 사용 가능한 해시태그 목록 업데이트
      const newHashtag: Hashtag = {
        hashtagId: response.hashtag_id,
        tagName: response.tag_name,
        createdAt: new Date().toISOString(),
      }
      setAvailableHashtags(prev => [...prev, newHashtag])
      setNewHashtagInput('')
    } catch (err) {
      setError('해시태그 추가 중 오류가 발생했습니다.')
      console.error('Failed to add hashtag:', err)
    }
  }

  const handleSave = async () => {
    if (!userId || !orgId) return

    try {
      setIsSaving(true)
      setError(null)

      // 새로운 해시태그가 있는지 확인하고 추가
      const existingTagNames = availableHashtags.map(h => h.tagName)
      const newTagNames = editHashtags.filter(
        tag => !existingTagNames.includes(tag),
      )

      // 새로운 해시태그들을 먼저 DB에 추가하고 availableHashtags 업데이트
      const updatedAvailableHashtags = [...availableHashtags]
      for (const tagName of newTagNames) {
        try {
          const response = await hallucinationsClient.postHashtags({
            tag_name: tagName,
          })
          const newHashtag: Hashtag = {
            hashtagId: response.hashtag_id,
            tagName: response.tag_name,
            createdAt: new Date().toISOString(),
          }
          updatedAvailableHashtags.push(newHashtag)
        } catch (err) {
          console.error(`Failed to add hashtag ${tagName}:`, err)
          // 계속 진행 (이미 존재할 수도 있음)
        }
      }

      // 해시태그를 객체 배열로 변환
      const hashtagsPayload = editHashtags.map(tagName => {
        const hashtag = updatedAvailableHashtags.find(
          h => h.tagName === tagName,
        )
        if (hashtag) {
          return {
            hashtag_id: hashtag.hashtagId,
            tag_name: hashtag.tagName,
          }
        }
        // 만약 찾지 못한 경우 (이론적으로는 발생하지 않아야 함)
        throw new Error(`Hashtag not found: ${tagName}`)
      })

      // 사용자 정보 업데이트
      const response = await hallucinationsClient.patchUser(userId, {
        phone: editPhone,
        summary: editSummary,
        detail: editDetail,
        org_id: orgId,
        hashtags: hashtagsPayload,
      })

      // 응답 데이터로 상태 업데이트
      const updatedUser: User = {
        userId: response.user_id,
        employeeId: `EMP${response.user_id.toString().padStart(3, '0')}`,
        ssoId: response.sso_id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        profileImagePath: response.profile_image_path || '',
        isActive: true,
        isLeader: user?.isLeader || false,
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: response.updated_at,
      }
      setUser(updatedUser)

      const updatedResponsibility: UserResponsibility = {
        id: response.user_id,
        userId: response.user_id,
        originalDescription: response.responsibility.detail,
        normalizedDescription: response.responsibility.detail,
        summary: response.responsibility.summary || null,
        lastUpdatedAt: response.updated_at,
        createdAt: userResponsibility?.createdAt || new Date().toISOString(),
      }
      setUserResponsibility(updatedResponsibility)

      const updatedHashtags: Hashtag[] = response.hashtags.map((h, index) => {
        let hashtagId = index + 1
        if (h.hashtag_id) {
          hashtagId = h.hashtag_id
        } else if (h.tag_name) {
          // tagName 기반 고유 ID 생성
          const hashValue = h.tag_name
            .split('')
            .reduce(
              (acc, char, idx) =>
                acc + char.charCodeAt(0) * Math.pow(31, idx + 1),
              0,
            )
          hashtagId = hashValue + index * 1000000
        }
        return {
          hashtagId,
          tagName: h.tag_name,
          createdAt: new Date().toISOString(),
        }
      })
      setHashtags(updatedHashtags)

      // 수정 모드용 상태도 응답 데이터로 업데이트
      setEditPhone(response.phone)
      setEditSummary(response.responsibility.summary || '')
      setEditDetail(response.responsibility.detail)
      setEditHashtags(response.hashtags.map(h => h.tag_name))

      setIsEditing(false)
      setNewHashtagInput('')
      setShowHashtagDropdown(false)

      // URL 쿼리 파라미터에서 edit 제거
      const params = new URLSearchParams(searchParams?.toString() || '')
      params.delete('edit')
      router.replace(`/home/user?${params.toString()}`)

      // 사용 가능한 해시태그 목록 다시 가져오기
      try {
        const hashtagsResponse = await hallucinationsClient.getHashtags()
        const hashtagData: Hashtag[] = hashtagsResponse.hashtags.map(h => ({
          hashtagId: h.hashtag_id,
          tagName: h.tag_name,
          createdAt: new Date().toISOString(),
        }))
        setAvailableHashtags(hashtagData)
      } catch (err) {
        console.error('Failed to refresh hashtags:', err)
      }
    } catch (err) {
      setError('사용자 정보 수정 중 오류가 발생했습니다.')
      console.error('Failed to update user:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={clsx('bg-base-100 min-h-screen p-6')}>
        <div className={clsx('mx-auto max-w-4xl')}>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={clsx('bg-base-100 min-h-screen p-6')}>
        <div className={clsx('mx-auto max-w-4xl')}>
          <p className={clsx('text-error')}>{error}</p>
        </div>
      </div>
    )
  }

  if (!userId || !user) {
    return (
      <div className={clsx('bg-base-100 min-h-screen p-6')}>
        <div className={clsx('mx-auto max-w-4xl')}>
          <p>사용자 ID가 제공되지 않았습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-base-100 min-h-screen p-6')}>
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
            <OrganizationBreadcrumb
              organizations={organizations}
              currentItem={user.name}
            />
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

        {/* 프로필 헤더 섹션 */}
        <section
          className={clsx(
            'card bg-base-100 border-base-300 border p-6',
            'flex flex-row items-start justify-between gap-6',
          )}
        >
          <div className={clsx('flex items-center gap-6')}>
            {/* 프로필 이미지 */}
            <div className="avatar">
              <div
                className={clsx(
                  'bg-base-300 flex items-center justify-center rounded-full',
                  'h-32 w-32 overflow-hidden',
                )}
              >
                <img
                  src={
                    user.profileImagePath ||
                    'https://img.daisyui.com/images/profile/demo/yellingcat@192.webp'
                  }
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* 기본 정보 */}
            <div className={clsx('flex-1')}>
              <div className={clsx('mb-4 flex items-center gap-3')}>
                <h1 className={clsx('text-3xl font-bold')}>{user.name}</h1>
                {user.isLeader && (
                  <span className="badge badge-sm badge-neutral text-xs">
                    팀장
                  </span>
                )}
              </div>

              {/* 연락처 정보 */}
              <div className={clsx('space-y-2')}>
                <div className={clsx('flex items-center gap-2')}>
                  <span className={clsx('text-base-content/70')}>📧</span>
                  <span>{user.email}</span>
                </div>
                <div className={clsx('flex items-center gap-2')}>
                  <span className={clsx('text-base-content/70')}>📞</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className={clsx(
                        'input input-bordered input-sm w-full max-w-xs',
                      )}
                    />
                  ) : (
                    <span>{user.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 카테고리 */}
          {((hashtags && hashtags.length > 0) || isEditing) && (
            <div className={clsx('flex flex-col gap-2')}>
              <h3
                className={clsx('text-base-content/70 text-sm font-semibold')}
              >
                카테고리
              </h3>
              {isEditing ? (
                <div className={clsx('flex flex-col gap-2')}>
                  {/* 선택된 해시태그 표시 */}
                  {editHashtags.length > 0 && (
                    <div className={clsx('flex flex-wrap gap-2')}>
                      {editHashtags.map(tagName => (
                        <div
                          key={tagName}
                          className={clsx(
                            'badge badge-neutral badge-sm flex items-center gap-1',
                          )}
                        >
                          #{tagName}
                          <button
                            type="button"
                            onClick={() => handleRemoveHashtag(tagName)}
                            className={clsx(
                              'btn btn-ghost btn-xs h-4 min-h-0 w-4 p-0',
                            )}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 해시태그 추가 UI */}
                  <div className={clsx('relative flex flex-col gap-2')}>
                    {/* 기존 해시태그 선택 드롭다운 */}
                    <div className={clsx('relative')} ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setShowHashtagDropdown(!showHashtagDropdown)
                        }
                        className={clsx(
                          'btn btn-outline btn-sm w-full justify-start',
                        )}
                      >
                        기존 해시태그 선택
                        <svg
                          className={clsx('ml-auto h-4 w-4')}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {showHashtagDropdown && (
                        <div
                          className={clsx(
                            'absolute z-10 mt-1 max-h-60 w-full overflow-auto',
                            'bg-base-100 border-base-300 rounded-lg border shadow-lg',
                          )}
                        >
                          {availableHashtags
                            .filter(h => !editHashtags.includes(h.tagName))
                            .map((hashtag, index) => (
                              <button
                                key={`dropdown-${hashtag.tagName}-${hashtag.hashtagId}-${index}`}
                                type="button"
                                onClick={() =>
                                  handleSelectHashtag(hashtag.tagName)
                                }
                                className={clsx(
                                  'hover:bg-base-200 w-full px-4 py-2 text-left',
                                )}
                              >
                                #{hashtag.tagName}
                              </button>
                            ))}
                          {availableHashtags.filter(
                            h => !editHashtags.includes(h.tagName),
                          ).length === 0 && (
                            <div
                              className={clsx(
                                'text-base-content/50 px-4 py-2 text-sm',
                              )}
                            >
                              선택 가능한 해시태그가 없습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 새로운 해시태그 추가 */}
                    <div className={clsx('flex gap-2')}>
                      <input
                        type="text"
                        value={newHashtagInput}
                        onChange={e => setNewHashtagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewHashtag()
                          }
                        }}
                        placeholder="새 해시태그 입력"
                        className={clsx('input input-bordered input-sm flex-1')}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewHashtag}
                        disabled={!newHashtagInput.trim()}
                        className={clsx('btn btn-primary btn-sm')}
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}
        </section>

        {/* 요약 정보 섹션 */}
        {(userResponsibility?.summary || isEditing) && (
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
                {userResponsibility?.summary || ''}
              </p>
            )}
          </section>
        )}

        {/* 상세 정보 (normalized_description) 섹션 */}
        {(userResponsibility?.normalizedDescription || isEditing) && (
          <section
            className={clsx('card bg-base-100 border-base-300 border p-6')}
          >
            <h2 className={clsx('mb-3 text-xl font-semibold')}>상세 정보</h2>
            {isEditing ? (
              <textarea
                value={editDetail}
                onChange={e => setEditDetail(e.target.value)}
                className={clsx('textarea textarea-bordered min-h-48 w-full')}
                placeholder="상세 정보를 입력하세요"
              />
            ) : (
              <p
                className={clsx(
                  'text-base-content/80 leading-relaxed whitespace-pre-wrap',
                )}
              >
                {userResponsibility?.normalizedDescription || ''}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default function UserPage() {
  return (
    <Suspense
      fallback={
        <div className={clsx('bg-base-100 min-h-screen p-6')}>
          <div className={clsx('mx-auto max-w-4xl')}>
            <p>로딩 중...</p>
          </div>
        </div>
      }
    >
      <UserDetailContent />
    </Suspense>
  )
}
