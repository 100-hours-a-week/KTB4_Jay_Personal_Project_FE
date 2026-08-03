import { apiRequest } from './client'

export function registerUser(body) {
  return apiRequest('/users/register', {
    method: 'POST',
    body,
    skipAuth: true,
    errorMessage: '회원가입에 실패했습니다.',
  })
}

export function loginUser(body) {
  return apiRequest('/users/login', {
    method: 'POST',
    body,
    skipAuth: true,
    errorMessage: '로그인에 실패했습니다.',
  })
}

export function getCurrentUser() {
  return apiRequest('/users/me', {
    errorMessage: '프로필 조회에 실패했습니다.',
  })
}

export function updateCurrentUser(body) {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body,
    errorMessage: '프로필 설정 저장에 실패했습니다.',
  })
}

export function updateCurrentPassword(body) {
  return apiRequest('/users/me/password', {
    method: 'PATCH',
    body,
    errorMessage: '비밀번호 변경에 실패했습니다.',
  })
}

export function deleteCurrentUser() {
  return apiRequest('/users/me', {
    method: 'DELETE',
    errorMessage: '계정 삭제에 실패했습니다.',
  })
}
