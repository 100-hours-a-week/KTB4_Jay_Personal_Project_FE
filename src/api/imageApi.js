import { API_BASE_URL, getAuthTokens } from './client'

export async function uploadImage(file) {
  const accessToken = getAuthTokens().accessToken

  if (accessToken === null) {
    throw new Error('로그인 후 이미지를 업로드할 수 있어요.')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  const result = await parseImageUploadResponse(response)

  if (!response.ok) {
    throw new Error(result?.message ?? '이미지 업로드에 실패했습니다.')
  }

  return result
}

async function parseImageUploadResponse(response) {
  const responseText = await response.text()

  if (responseText.trim() === '') {
    return null
  }

  return JSON.parse(responseText)
}
