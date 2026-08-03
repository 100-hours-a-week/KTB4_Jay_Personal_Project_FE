import { apiRequest } from './client'

export function getPosts(page = 0, size = 5) {
  return apiRequest(`/posts?page=${page}&size=${size}`, {
    errorMessage: '게시글 목록을 불러오지 못했습니다.',
  })
}

export function getRankPosts(page = 0, size = 5, period = 'WEEKLY') {
  return apiRequest(`/posts/rank?page=${page}&size=${size}&period=${period}`, {
    errorMessage: '게시글 목록을 불러오지 못했습니다.',
  })
}

export function getPostDetail(postId) {
  return apiRequest(`/posts/${postId}`, {
    errorMessage: '게시글 상세 조회에 실패했습니다.',
  })
}

export function createPost(body) {
  return apiRequest('/posts', {
    method: 'POST',
    body,
    errorMessage: '게시글 작성에 실패했습니다.',
  })
}

export function updatePost(postId, body) {
  return apiRequest(`/posts/${postId}`, {
    method: 'PATCH',
    body,
    errorMessage: '게시글 수정에 실패했습니다.',
  })
}

export function deletePost(postId) {
  return apiRequest(`/posts/${postId}`, {
    method: 'DELETE',
    errorMessage: '게시글 삭제에 실패했습니다.',
  })
}

export function starPost(postId) {
  return apiRequest(`/posts/${postId}/likes`, {
    method: 'POST',
    errorMessage: '좋아요 처리에 실패했습니다.',
  })
}

export function unstarPost(postId) {
  return apiRequest(`/posts/${postId}/likes`, {
    method: 'DELETE',
    errorMessage: '좋아요 처리에 실패했습니다.',
  })
}

export function reportPost(postId, body) {
  return apiRequest(`/posts/${postId}/reports`, {
    method: 'POST',
    body,
    errorMessage: '신고 접수에 실패했습니다.',
  })
}

export function saveDraft(body) {
  return apiRequest('/posts/draft', {
    method: 'POST',
    body,
    errorMessage: '임시저장에 실패했습니다.',
  })
}

export function getDraft() {
  return apiRequest('/posts/draft', {
    errorMessage: '임시저장 글을 불러오지 못했습니다.',
  })
}
