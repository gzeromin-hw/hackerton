import type { Meta, StoryObj } from '@storybook/nextjs'
import { UserCard } from '@/components/UserCard'
import type { UserCardDto } from '@/services/dtos/common.dto'

const meta = {
  title: 'Components/UserCard',
  component: UserCard,
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
} satisfies Meta<typeof UserCard>

export default meta
type Story = StoryObj<typeof meta>

// 샘플 해시태그 데이터
const sampleHashtags = [
  {
    hashtag_id: 1,
    tag_name: '프론트엔드',
  },
  {
    hashtag_id: 2,
    tag_name: 'React',
  },
  {
    hashtag_id: 3,
    tag_name: 'TypeScript',
  },
]

const sampleSummary =
  '프론트엔드 개발을 담당하며 React와 TypeScript를 활용한 웹 애플리케이션 개발에 전문성을 가지고 있습니다.'

// 샘플 사용자 카드 데이터
const sampleUserCard: UserCardDto = {
  user_id: 1,
  name: '홍길동',
  team_name: '개발팀',
  org_path: '/개발팀',
  summary: sampleSummary,
  hashtags: sampleHashtags,
  is_leader: false,
}

const sampleUserCardWithImage: UserCardDto = {
  ...sampleUserCard,
  user_id: 2,
}

const leaderUserCard: UserCardDto = {
  ...sampleUserCard,
  user_id: 3,
  name: '김철수',
  is_leader: true,
}

export const Default: Story = {
  args: {
    userCard: sampleUserCard,
    size: 'md',
    compact: false,
  },
}

export const WithProfileImage: Story = {
  args: {
    userCard: sampleUserCardWithImage,
    size: 'md',
    compact: false,
  },
}

export const Leader: Story = {
  args: {
    userCard: leaderUserCard,
    size: 'md',
    compact: false,
  },
}

export const Small: Story = {
  args: {
    userCard: sampleUserCard,
    size: 'sm',
    compact: false,
  },
}

export const Large: Story = {
  args: {
    userCard: sampleUserCardWithImage,
    size: 'lg',
    compact: false,
  },
}

export const Compact: Story = {
  args: {
    userCard: sampleUserCard,
    size: 'md',
    compact: true,
  },
}

export const Clickable: Story = {
  args: {
    userCard: sampleUserCard,
    size: 'md',
    compact: false,
    onClick: () => {
      console.log('User card clicked')
    },
  },
}

export const LongName: Story = {
  args: {
    userCard: {
      ...sampleUserCard,
      name: '아주긴이름을가진사용자입니다',
    },
    size: 'md',
    compact: false,
  },
}

export const WithoutOptionalFields: Story = {
  args: {
    userCard: {
      ...sampleUserCard,
      summary: '',
      hashtags: [],
    },
    size: 'md',
    compact: false,
  },
}

export const WithOrganizationOnly: Story = {
  args: {
    userCard: {
      ...sampleUserCard,
      summary: '',
      hashtags: [],
    },
    size: 'md',
    compact: false,
  },
}

export const WithSummaryOnly: Story = {
  args: {
    userCard: {
      ...sampleUserCard,
      hashtags: [],
    },
    size: 'md',
    compact: false,
  },
}

export const WithHashtagsOnly: Story = {
  args: {
    userCard: {
      ...sampleUserCard,
      summary: '',
    },
    size: 'md',
    compact: false,
  },
}

export const WithManyHashtags: Story = {
  args: {
    userCard: {
      ...sampleUserCard,
      hashtags: [
        ...sampleHashtags,
        {
          hashtag_id: 4,
          tag_name: 'Next.js',
        },
        {
          hashtag_id: 5,
          tag_name: 'TailwindCSS',
        },
        {
          hashtag_id: 6,
          tag_name: 'UI/UX',
        },
      ],
    },
    size: 'md',
    compact: false,
  },
}

