import type { HashtagDto, TeamCardDto, UserCardDto } from './common.dto'

/**
 * 로그인 API 응답 DTO
 */
export interface LoginResponseDto {
  user_id: number
  sso_id: string
  userName: string
  email: string
  employeeNo: string
  deptName: string
  companyName: string | null
  jobPositionName: string | null
}

/**
 * 홈 API 응답 DTO
 */
export interface HomeResponseDto {
  user: {
    user_id: number
    sso_id: string
    name: string
    email: string
    phone: string
    profile_image_path: string | null
  }
  my_team_card: TeamCardDto
  my_profile_card: UserCardDto
  trending_hashtags: Array<{
    hashtag_id: number
    tag_name: string
  }>
}

/**
 * 팀 정보 API 응답 DTO
 */
export interface TeamResponseDto {
  team: {
    org_id: number
    team_name: string
    org_path: string
    org_type: string
    team_summary: string
    team_description: string
    hashtags: Array<HashtagDto>
    leader: {
      user_id: number
      sso_id: string
      name: string
      email: string
      profile_image_path: string | null
    }
  }
  organization_hierarchy: Array<{
    org_id: number
    org_code: string
    org_name: string
    org_type: string
    parent_org_id: number | null
    team_leader_id: number | null
    team_description_original: string | null
    team_description_normalized: string | null
    team_summary: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }>
  members: Array<{
    user_id: number
    sso_id: string
    name: string
    email: string
    profile_image_path: string | null
    team_name: string
    org_path: string
    summary: string
    hashtags: Array<HashtagDto>
  }>
  can_edit: boolean
}

/**
 * 사용자 정보 API 응답 DTO
 */
export interface UserResponseDto {
  user: {
    user_id: number
    sso_id: string
    name: string
    email: string
    phone: string
    profile_image_path: string | null
    is_leader: boolean
  }
  organization: {
    org_id: number
    team_name: string
    org_path: string
    org_type: string
  }
  organization_hierarchy: Array<{
    org_id: number
    org_code: string
    org_name: string
    org_type: string
    parent_org_id: number | null
    team_leader_id: number | null
    team_description_original: string | null
    team_description_normalized: string | null
    team_summary: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }>
  responsibility: {
    summary: string
    detail: string
  }
  hashtags: Array<HashtagDto>
  can_edit: boolean
}

/**
 * 해시태그 검색 API 응답 DTO
 */
export interface HashtagSearchResponseDto {
  team_cards: Array<TeamCardDto>
  user_cards: Array<UserCardDto>
}

/**
 * 팀 수정 요청 DTO
 */
export interface PatchTeamRequestDto {
  team_summary: string
  team_description: string
}

/**
 * 팀 수정 API 응답 DTO
 */
export interface PatchTeamResponseDto {
  org_id: number
  team_name: string
  org_path: string
  org_type: string
  team_summary: string
  team_description: string
  updated_at: string
}

/**
 * 사용자 수정 요청 DTO
 */
export interface PatchUserRequestDto {
  phone: string
  summary: string
  detail: string
  hashtags: Array<{
    hashtag_id: number
    tag_name: string
  }>
}

/**
 * 사용자 수정 API 응답 DTO
 */
export interface PatchUserResponseDto {
  user_id: number
  sso_id: string
  name: string
  email: string
  phone: string
  profile_image_path: string
  organization: {
    org_id: number
    team_name: string
    org_path: string
    org_type: string
  }
  responsibility: {
    summary: string
    detail: string
  }
  hashtags: Array<HashtagDto>
  updated_at: string
}

/**
 * 해시태그 목록 API 응답 DTO
 */
export interface HashtagResponseDto {
  hashtags: Array<HashtagDto>
}

/**
 * 해시태그 생성 요청 DTO
 */
export interface PostHashtagsRequestDto {
  tag_name: string
}

/**
 * 해시태그 생성 API 응답 DTO
 */
export interface PostHashtagsResponseDto {
  hashtag_id: number
  tag_name: string
}
