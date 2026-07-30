import { MESSAGE_MAP } from '../constants/messageMap'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

let authTokens = {
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
}

export function setAuthTokens(tokens) {
  authTokens = {
    accessToken: tokens.accessToken ?? null,
    refreshToken: tokens.refreshToken ?? null,
  }

  if (authTokens.accessToken) {
    localStorage.setItem('accessToken', authTokens.accessToken)
  } else {
    localStorage.removeItem('accessToken')
  }

  if (authTokens.refreshToken) {
    localStorage.setItem('refreshToken', authTokens.refreshToken)
  } else {
    localStorage.removeItem('refreshToken')
  }
}

export function getAuthTokens() {
  return authTokens
}

export function clearAuthTokens() {
  setAuthTokens({ accessToken: null, refreshToken: null })
  localStorage.removeItem('userId')
}

export async function apiRequest(path, options = {}) {
  return apiRequestInternal(path, options, true)
}

async function apiRequestInternal(path, options = {}, canRetry) {
  const headers = {
    ...(options.headers ?? {}),
  }

  if (options.skipAuth !== true && authTokens.accessToken !== null) {
    headers.Authorization = `Bearer ${authTokens.accessToken}`
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(API_BASE_URL + path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.ok) {
    return parseApiResponse(response)
  }

  const code = await getErrorMessage(response, options.errorMessage ?? '요청에 실패했습니다.')

  if (response.status === 401 && code === 'expired_access_token' && canRetry === true) {
    await refreshAccessToken()
    return apiRequestInternal(path, options, false)
  }

  throw new ApiError(code, MESSAGE_MAP[code] ?? code)
}

async function refreshAccessToken() {
  if (authTokens.refreshToken === null) {
    throw new Error('Login이 필요합니다.')
  }

  const response = await fetch(`${API_BASE_URL}/users/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: authTokens.refreshToken,
    }),
  })

  if (!response.ok) {
    clearAuthTokens()
    throw new Error('세션이 만료되었습니다.')
  }

  const result = await response.json()
  const accessToken = result.data?.accessToken ?? result.data?.access_token ?? null

  setAuthTokens({
    accessToken,
    refreshToken: authTokens.refreshToken,
  })

  return accessToken
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const errorResult = await response.json()
    return errorResult.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

async function parseApiResponse(response) {
  if (response.status === 204) {
    return null
  }

  const responseText = await response.text()

  if (responseText.trim() === '') {
    return null
  }

  const contentType = response.headers.get('Content-Type') ?? ''

  if (contentType.includes('application/json')) {
    return JSON.parse(responseText)
  }

  return responseText
}
