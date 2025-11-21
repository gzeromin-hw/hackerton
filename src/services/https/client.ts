import axios, { AxiosInstance } from 'axios'
import { useAuthStore } from '@/data/authStore'

// 토큰 만료 시간 체크 함수 (10분 전에 refresh)
// const shouldRefreshToken = (): boolean => {
//   const { exp } = useAuthStore.getState()
//   if (!exp) return false

//   const currentTime = Math.floor(Date.now() / 1000) // 현재 시간 (초)
//   const timeUntilExpiry = exp - currentTime // 만료까지 남은 시간 (초)
//   const tenMinutes = 10 * 60 // 10분 (초)

//   return timeUntilExpiry <= tenMinutes && timeUntilExpiry > 0
// }

function addInterceptor(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use(
    async config => {
      // 토큰이 만료되기 10분 전이면 refresh 요청
      // if (!config.url?.includes('/auth/user/refresh') && shouldRefreshToken()) {
      //   const { refreshToken } = useAuthStore.getState()
      //   const refreshSuccess = await refreshToken()

      //   if (!refreshSuccess) {
      //     // refresh 실패 시 로그아웃 처리
      //     const { logout } = useAuthStore.getState()
      //     logout()
      //     return Promise.reject(new Error('토큰 갱신 실패'))
      //   }
      // }

      const { cleverseAuth } = useAuthStore.getState()

      if (cleverseAuth?.user?.ssoId) {
        config.headers['X-User-Id'] = cleverseAuth.user.ssoId.toString()
      }

      if (
        config.method === 'get' ||
        config.method === 'post' ||
        config.method === 'put'
      ) {
        config.timeout = 600000
      }
      return config
    },
    error => Promise.reject(error),
  )

  instance.interceptors.response.use(
    response => response,
    error => {
      // errorHandle 속성이 false로 설정된 경우 에러 핸들링 스킵
      if (
        error?.config &&
        Object.prototype.hasOwnProperty.call(error.config, 'errorHandle') &&
        !error.config.errorHandle
      ) {
        return Promise.reject(error)
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        // const { logout } = useAuthStore.getState()
        // logout()
      } else if (error.code === 'ECONNABORTED') {
        // CORS 가 처리된 외부 요청인데 타임아웃이 발생된 경우
        if (error.config && !error.config.withCredentials) {
          //
        }
        // 400 - BAD_REQUEST(명시적 에러)
        // 402 - BLOCKCHAIN ERROR
        // 500 - INTERNAL_SERVER_ERROR
      } else if (
        error.response?.status === 400 ||
        error.response?.status === 402 ||
        error.response?.status === 412 ||
        error.response?.status === 500 ||
        error.response?.status === 503
      ) {
        return Promise.reject(error)
      } else {
        // 그 외의 에러는 무시
      }
      return Promise.reject(error)
    },
  )
  return instance
}

const httpClient: AxiosInstance = addInterceptor(
  axios.create({
    withCredentials: true,
    headers: {
      Accept: '*/*',
      'Content-type': 'application/json',
    },
  }),
)

export { httpClient }
