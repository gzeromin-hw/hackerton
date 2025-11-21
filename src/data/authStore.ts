import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CleverseUser {
  userId?: number
  ssoId?: string
  userName?: string
  email?: string
  employeeNo?: string
  deptName?: string
  companyName?: string
  jobPositionName?: string
  profileImagePath?: string | null
  [key: string]: unknown
}

interface CleverseAuth {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  cookieToken: string | null
  user: CleverseUser | null
}

interface AuthState {
  cleverseAuth: CleverseAuth
  isHydrated: boolean
  setCleverseAuth: (auth: CleverseAuth) => void
  clearCleverseAuth: () => void
  setHydrated: () => void
}

const initialState: CleverseAuth = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  cookieToken: null,
  user: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      cleverseAuth: initialState,
      isHydrated: false,
      setCleverseAuth: (auth: CleverseAuth) => set({ cleverseAuth: auth }),
      clearCleverseAuth: () => set({ cleverseAuth: initialState }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        cleverseAuth: state.cleverseAuth,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.setHydrated()
        }
      },
    },
  ),
)
