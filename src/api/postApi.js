import { apiRequest } from './client'

export function getPosts(page = 0, size = 5) {
  return apiRequest(`/posts?page=${page}&size=${size}`, {
    errorMessage: 'Feed를 불러오지 못했습니다.',
  })
}

export function getRankPosts(page = 0, size = 5, period = 'WEEKLY') {
  return apiRequest(`/posts/rank?page=${page}&size=${size}&period=${period}`, {
    errorMessage: `Feed를 불러오지 못했습니다.`,
  })
}

export function getPostDetail(postId) {
  return apiRequest(`/posts/${postId}`, {
    errorMessage: 'Log 상세 조회에 실패했습니다.',
  })
}

export function createPost(body) {
  return apiRequest('/posts', {
    method: 'POST',
    body,
    errorMessage: 'Commit 배포에 실패했습니다.',
  })
}

export function updatePost(postId, body) {
  return apiRequest(`/posts/${postId}`, {
    method: 'PATCH',
    body,
    errorMessage: 'Commit amend에 실패했습니다.',
  })
}

export function deletePost(postId) {
  return apiRequest(`/posts/${postId}`, {
    method: 'DELETE',
    errorMessage: 'Commit Drop에 실패했습니다.',
  })
}

export function starPost(postId) {
  return apiRequest(`/posts/${postId}/likes`, {
    method: 'POST',
    errorMessage: 'Star 처리에 실패했습니다.',
  })
}

export function unstarPost(postId) {
  return apiRequest(`/posts/${postId}/likes`, {
    method: 'DELETE',
    errorMessage: 'Star 처리에 실패했습니다.',
  })
}

export function reportPost(postId, body) {
  return apiRequest(`/posts/${postId}/reports`, {
    method: 'POST',
    body,
    errorMessage: 'Issue 생성에 실패했습니다.',
  })
}

export function saveDraft(body) {
  return apiRequest('/posts/draft', {
    method: 'POST',
    body,
    errorMessage: 'Stash 저장에 실패했습니다.',
  })
}

export function getDraft() {
  return apiRequest('/posts/draft', {
    errorMessage: 'Stash를 불러오지 못했습니다.',
  })
}
