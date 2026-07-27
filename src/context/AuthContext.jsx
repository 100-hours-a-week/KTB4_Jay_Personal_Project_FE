/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser } from '../api/authApi'
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isRestoring, setIsRestoring] = useState(true)

  const isLoggedIn = currentUser !== null && getAuthTokens().accessToken !== null

  const login = useCallback(async ({ email, password }) => {
    const result = await loginUser({
      email: email.trim(),
      password: password.trim(),
    })
    const data = result?.data ?? {}
    const accessToken = data.accessToken ?? data.access_token ?? null
    const refreshToken = data.refreshToken ?? data.refresh_token ?? null

    if (accessToken === null || refreshToken === null) {
      throw new Error('login_failed')
    }

    setAuthTokens({ accessToken, refreshToken })

    const userResult = await getCurrentUser()
    const user = userResult?.data ?? null
    setCurrentUser(user)

    return user
  }, [])

  const logout = useCallback(() => {
    clearAuthTokens()
    setCurrentUser(null)
  }, [])

  const loadCurrentUser = useCallback(async () => {
    const result = await getCurrentUser()
    const user = result?.data ?? null
    setCurrentUser(user)
    return user
  }, [])

  useEffect(() => {
    async function restoreLoginState() {
      if (getAuthTokens().accessToken === null) {
        setCurrentUser(null)
        setIsRestoring(false)
        return
      }

      try {
        await loadCurrentUser()
      } catch {
        clearAuthTokens()
        setCurrentUser(null)
      } finally {
        setIsRestoring(false)
      }
    }

    restoreLoginState()
  }, [loadCurrentUser])

  const value = useMemo(
    () => ({
      currentUser,
      isLoggedIn,
      isRestoring,
      login,
      logout,
      loadCurrentUser,
      setCurrentUser,
    }),
    [currentUser, isLoggedIn, isRestoring, loadCurrentUser, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.')
  }

  return context
}
