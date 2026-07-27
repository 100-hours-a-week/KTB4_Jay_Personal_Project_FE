import { DEFAULT_PROFILE_IMAGE } from '../components/ProfileMenu'

export const DEFAULT_PROFILE_IMAGE_KEY = 'default-profile-image'

export function getProfileImageUrl(profileImage) {
  if (!profileImage || profileImage.trim() === '') {
    return DEFAULT_PROFILE_IMAGE
  }

  if (profileImage === DEFAULT_PROFILE_IMAGE_KEY) {
    return DEFAULT_PROFILE_IMAGE
  }

  if (
    profileImage.startsWith('local-profile-image-') ||
    profileImage.startsWith('signup-profile-image-')
  ) {
    return localStorage.getItem(profileImage) || DEFAULT_PROFILE_IMAGE
  }

  return profileImage
}

export function resizeProfileImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const maxSize = 240
        const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1)
        const width = Math.round(image.width * ratio)
        const height = Math.round(image.height * ratio)
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        canvas.width = width
        canvas.height = height
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
        context.drawImage(image, 0, 0, width, height)

        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }

      image.onerror = reject
      image.src = String(reader.result)
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function saveProfileImage(key, imageData) {
  try {
    localStorage.removeItem(key)
    localStorage.setItem(key, imageData)
    return true
  } catch {
    removeOldSignupProfileImages(key)
  }

  try {
    localStorage.setItem(key, imageData)
    return true
  } catch {
    return false
  }
}

function removeOldSignupProfileImages(currentKey) {
  Object.keys(localStorage).forEach((key) => {
    if (key !== currentKey && key.startsWith('signup-profile-image-')) {
      localStorage.removeItem(key)
    }
  })
}
