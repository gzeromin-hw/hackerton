/**
 * 공통: PK/타임스탬프 타입
 * 날짜/시간은 전부 ISO 문자열 기준으로 string 처리.
 */

export type PK = number

export type TimestampString = string // e.g. "2025-11-20T12:34:56Z"

export type DateString = string // e.g. "2025-11-20"

