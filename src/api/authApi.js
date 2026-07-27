import { apiRequest } from './client'

export function registerUser(body) {
  return apiRequest('/users/register', {
    method: 'POST',
    body,
    skipAuth: true,
    errorMessage: 'Join에 실패하였습니다.',
  })
}

export function loginUser(body) {
  return apiRequest('/users/login', {
    method: 'POST',
    body,
    skipAuth: true,
    errorMessage: 'Login에 실패했습니다.',
  })
}

export function getCurrentUser() {
  return apiRequest('/users/me', {
    errorMessage: 'Profile 조회에 실패했습니다.',
  })
}

export function updateCurrentUser(body) {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body,
    errorMessage: 'Profile config 저장에 실패했습니다.',
  })
}

export function updateCurrentPassword(body) {
  return apiRequest('/users/me/password', {
    method: 'PATCH',
    body,
    errorMessage: 'Secret rotation에 실패했습니다.',
  })
}

export function deleteCurrentUser() {
  return apiRequest('/users/me', {
    method: 'DELETE',
    errorMessage: 'Account delete에 실패했습니다.',
  })
}
