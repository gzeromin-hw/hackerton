import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TeamCardDto, UserCardDto } from '@/services/dtos/common.dto'

interface HomeState {
  cardResult: {
    teamCards: Array<TeamCardDto>
    userCards: Array<UserCardDto>
  } | null
  isLoading: boolean
  setCardResult: (
    teamCards: Array<TeamCardDto>,
    userCards: Array<UserCardDto>,
  ) => void
  clearCardResult: () => void
  setIsLoading: (loading: boolean) => void
}

const useHomeStore = create<HomeState>()(
  persist(
    set => ({
      cardResult: null,
      isLoading: false,
      setCardResult: (teamCards, userCards) =>
        set({
          cardResult: {
            teamCards,
            userCards,
          },
        }),
      clearCardResult: () => set({ cardResult: null }),
      setIsLoading: loading => set({ isLoading: loading }),
    }),
    {
      name: 'home-storage',
      partialize: state => ({ cardResult: state.cardResult }),
    },
  ),
)

export default useHomeStore
