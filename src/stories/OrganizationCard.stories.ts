import type { Meta, StoryObj } from '@storybook/nextjs'
import { OrganizationCard } from '@/components/OrganizationCard'
import type { TeamCardDto } from '@/services/dtos/common.dto'
import type { Hashtag } from '@/types/hashtag'

const meta = {
  title: 'Components/OrganizationCard',
  component: OrganizationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '카드 크기',
    },
    compact: {
      control: 'boolean',
      description: '간소화된 정보 표시',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof OrganizationCard>

export default meta
type Story = StoryObj<typeof meta>

// 샘플 해시태그 데이터
const sampleHashtags: Hashtag[] = [
  {
    hashtagId: 1,
    tagName: '개발',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    hashtagId: 2,
    tagName: '프론트엔드',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    hashtagId: 3,
    tagName: '백엔드',
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// 샘플 팀 카드 데이터
const sampleTeamCard: TeamCardDto = {
  org_id: 1,
  team_name: '개발팀',
  org_path: '/개발팀',
  summary: '프론트엔드와 백엔드 개발을 담당하는 핵심 개발 조직입니다.',
  hashtags: [],
}

const departmentTeamCard: TeamCardDto = {
  ...sampleTeamCard,
  org_id: 2,
  team_name: '기술본부',
  org_path: '/기술본부',
  summary: '기술 전략 수립 및 개발 조직 관리를 담당하는 본부입니다.',
}

const inactiveTeamCard: TeamCardDto = {
  ...sampleTeamCard,
  org_id: 3,
  team_name: '구 개발팀',
  org_path: '/구개발팀',
  summary: '프로젝트 종료로 인해 비활성화된 조직입니다.',
}

const teamWithoutDescription: TeamCardDto = {
  ...sampleTeamCard,
  org_id: 4,
  team_name: '디자인팀',
  org_path: '/디자인팀',
  summary: 'UI/UX 디자인 및 브랜드 아이덴티티를 담당합니다.',
}

export const Default: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: false,
  },
}

export const Department: Story = {
  args: {
    teamCard: {
      ...departmentTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: false,
  },
}

export const Inactive: Story = {
  args: {
    teamCard: {
      ...inactiveTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: false,
  },
}

export const WithoutDescription: Story = {
  args: {
    teamCard: {
      ...teamWithoutDescription,
      hashtags: [
        {
          hashtag_id: 4,
          tag_name: '디자인',
        },
        {
          hashtag_id: 5,
          tag_name: 'UI/UX',
        },
      ],
    },
    size: 'md',
    compact: false,
  },
}

export const Small: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'sm',
    compact: false,
  },
}

export const Large: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'lg',
    compact: false,
  },
}

export const Compact: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: true,
  },
}

export const Clickable: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: false,
    onClick: () => {
      console.log('Organization card clicked')
    },
  },
}

export const LongName: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      team_name: '아주긴이름을가진조직입니다',
      org_path: '/VERY_LONG_ORG_CODE_001',
      summary:
        '이것은 매우 긴 요약 정보입니다. 여러 줄에 걸쳐서 표시될 수 있는 긴 요약 텍스트입니다. 실제로는 더 많은 내용이 들어갈 수 있습니다.',
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: false,
  },
}

export const WithoutOptionalFields: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      summary: '',
    },
    size: 'md',
    compact: false,
  },
}

export const WithSummaryOnly: Story = {
  args: {
    teamCard: sampleTeamCard,
    size: 'md',
    compact: false,
  },
}

export const WithHashtagsOnly: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      summary: '',
      hashtags: sampleHashtags.map(h => ({
        hashtag_id: h.hashtagId,
        tag_name: h.tagName,
      })),
    },
    size: 'md',
    compact: false,
  },
}

export const WithManyHashtags: Story = {
  args: {
    teamCard: {
      ...sampleTeamCard,
      hashtags: [
        ...sampleHashtags.map(h => ({
          hashtag_id: h.hashtagId,
          tag_name: h.tagName,
        })),
        {
          hashtag_id: 6,
          tag_name: 'DevOps',
        },
        {
          hashtag_id: 7,
          tag_name: 'CI/CD',
        },
        {
          hashtag_id: 8,
          tag_name: '인프라',
        },
      ],
    },
    size: 'md',
    compact: false,
  },
}

