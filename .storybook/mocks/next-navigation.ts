// next/navigation 모킹
const createMockFn = () => {
  const fn = (...args: unknown[]) => {
    console.log('Mock function called with:', args)
  }
  fn.mockImplementation = (impl: unknown) => {
    return impl
  }
  return fn
}

export const useRouter = () => ({
  push: createMockFn(),
  replace: createMockFn(),
  refresh: createMockFn(),
  back: createMockFn(),
  forward: createMockFn(),
  prefetch: createMockFn(),
})

export const usePathname = () => '/'

export const useSearchParams = () => {
  return new URLSearchParams()
}

