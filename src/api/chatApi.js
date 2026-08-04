import { apiRequest } from './client'

export function getChatMessages(postId, page = 0, size = 30) {
  return apiRequest(`/posts/${postId}/chat/messages?page=${page}&size=${size}`, {
    errorMessage: '채팅 메시지를 불러오지 못했습니다.',
  })
}
