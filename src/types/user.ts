import type { PK, TimestampString, DateString } from './common'

/**
 * 사용자 기본 정보
 * - 사번, SSO ID, 이름, 이메일, 연락처, 프로필 이미지 등
 */
export interface User {
  userId: PK // SERIAL PK
  employeeId: string // VARCHAR(50) UK
  ssoId: string // VARCHAR(100) UK
  name: string // VARCHAR(50)
  email: string // VARCHAR(100)
  phone: string // VARCHAR(20)
  profileImagePath: string // VARCHAR(500)
  isActive: boolean // BOOLEAN
  isLeader: boolean // BOOLEAN
  createdAt: TimestampString // TIMESTAMP
  updatedAt: TimestampString // TIMESTAMP
}

/**
 * 사용자별 담당 업무 설명 (1:1)
 * - 원문/정규화 본문, 마지막 업데이트 일시
 */
export interface UserResponsibility {
  id: PK // SERIAL PK
  userId: PK // INT FK -> users.user_id (UK)
  originalDescription: string // TEXT
  normalizedDescription: string // TEXT
  summary: string | null // VARCHAR(500)
  lastUpdatedAt: TimestampString // TIMESTAMP
  createdAt: TimestampString // TIMESTAMP
}

