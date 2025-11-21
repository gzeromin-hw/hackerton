import type { PK, TimestampString } from './common'

/**
 * 해시태그 마스터
 */
export interface Hashtag {
  hashtagId: PK // SERIAL PK
  tagName: string // VARCHAR(100) UK
  createdAt: TimestampString // TIMESTAMP
}
