export function formatDate(dateText) {
  if (!dateText) {
    return ''
  }

  return String(dateText).replace('T', ' ').slice(0, 19)
}

export function getAuthorName(post) {
  if (post?.blinded === true) {
    return '블라인드 처리된 사용자입니다.'
  }

  if (post?.authorDeleted === true) {
    return '알 수 없음'
  }

  return post?.authorNickname ?? '알 수 없음'
}
