/** Estado mutável de `useAuthStatus` para testes que o simulam com `vi.mock`. */
export const AuthStatusContextForTest = {
  current: { isLoggedIn: true as boolean | null, isLoading: false },
}
