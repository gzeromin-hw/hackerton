/**
 * 해시태그 정보 DTO
 */
export interface HashtagDto {
  hashtag_id: number
  tag_name: string
}

/**
 * 팀 카드 DTO
 */
export interface TeamCardDto {
  org_id: number
  team_name: string
  org_path: string
  summary: string
  hashtags: Array<HashtagDto>
  leader_id?: number
  leader_name?: string
  can_edit?: boolean
}

/**
 * 사용자 카드 DTO
 */
export interface UserCardDto {
  user_id: number
  name: string
  team_name: string
  org_path: string
  summary: string
  hashtags: Array<HashtagDto>
  is_leader: boolean
  can_edit: boolean
}
