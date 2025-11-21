import type { PK, TimestampString } from './common'

/**
 * 조직 정보
 * - 조직 코드, 조직명, 조직 타입, 상위 조직, 팀장 등
 */
export interface Organization {
  orgId: PK // SERIAL PK
  orgCode: string // VARCHAR(50) UK
  orgName: string // VARCHAR(100)
  orgType: string // VARCHAR(20)
  parentOrgId: number | null // INT FK (self-join)
  teamLeaderId: number | null // INT FK -> users.user_id
  teamDescriptionOriginal: string | null // TEXT
  teamDescriptionNormalized: string | null // TEXT
  teamSummary: string | null // VARCHAR(500)
  isActive: boolean // BOOLEAN
  createdAt: TimestampString // TIMESTAMP
  updatedAt: TimestampString // TIMESTAMP
}

