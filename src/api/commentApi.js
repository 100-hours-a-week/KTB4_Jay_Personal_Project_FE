import { apiRequest } from './client'

export function createComment(postId, body) {
  return apiRequest(`/posts/${postId}/comments`, {
    method: 'POST',
    body,
    errorMessage: 'Code review 작성에 실패했습니다.',
  })
}

export function updateComment(commentId, body) {
  return apiRequest(`/comments/${commentId}`, {
    method: 'PATCH',
    body,
    errorMessage: 'Code Review 수정에 실패했습니다.',
  })
}

export function deleteComment(commentId) {
  return apiRequest(`/comments/${commentId}`, {
    method: 'DELETE',
    errorMessage: 'Thread Drop에 실패했습니다.',
  })
}
