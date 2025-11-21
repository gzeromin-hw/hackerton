import type { TeamCardDto, UserCardDto } from './common.dto'

/**
 * 채팅 검색 요청 DTO
 */
export interface ChatSearchRequestDto {
  user_id: number
  query: string
}

/**
 * 채팅 검색 응답 DTO
 */
export interface ChatSearchResponseDto {
  log_id: number
  question: string
  llm_answer: string
  card_result: {
    team_cards: Array<TeamCardDto>
    user_cards: Array<UserCardDto>
  }
}
