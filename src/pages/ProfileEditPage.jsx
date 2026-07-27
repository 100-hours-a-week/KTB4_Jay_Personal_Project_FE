import { useEffect, useState } from 'react'
import { deleteCurrentUser, updateCurrentUser } from '../api/authApi'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../context/AuthContext'
import {
  DEFAULT_PROFILE_IMAGE_KEY,
  getProfileImageUrl,
  resizeProfileImage,
  saveProfileImage,
} from '../utils/profileImage'
import { validateProfile } from '../utils/validation'

function ProfileEditPage({ navigate, showMessage }) {
  const { currentUser, loadCurrentUser, logout, setCurrentUser } = useAuth()
  const [nickname, setNickname] = useState('')
  const [selectedProfileImage, setSelectedProfileImage] = useState(DEFAULT_PROFILE_IMAGE_KEY)
  const [selectedProfileImageChanged, setSelectedProfileImageChanged] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await loadCurrentUser()
        setNickname(user?.nickname ?? '')
        setSelectedProfileImage(user?.profileImage || DEFAULT_PROFILE_IMAGE_KEY)
        setSelectedProfileImageChanged(false)
      } catch (error) {
        showMessage(error.message, 'error')
      }
    }

    loadProfile()
  }, [loadCurrentUser, showMessage])

  async function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      showMessage('이미지 파일만 선택할 수 있습니다.', 'error')
      event.target.value = ''
      return
    }

    try {
      const imageData = await resizeProfileImage(file)
      setSelectedProfileImage(imageData)
      setSelectedProfileImageChanged(true)
    } catch {
      showMessage('Avatar 이미지를 읽지 못했습니다.', 'error')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextNicknameError = validateProfile({ nickname })
    setNicknameError(nextNicknameError)

    if (nextNicknameError) {
      return
    }

    let profileImageKey = selectedProfileImage
    const userId = currentUser?.userId ?? currentUser?.id

    if (selectedProfileImageChanged || selectedProfileImage.startsWith('data:image/')) {
      profileImageKey = `local-profile-image-${userId}`

      if (!saveProfileImage(profileImageKey, selectedProfileImage)) {
        showMessage('Avatar 저장 공간이 부족합니다. 더 작은 이미지를 선택해주세요.', 'error')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const result = await updateCurrentUser({
        nickname,
        profileImage: profileImageKey,
      })
      const updatedUser = {
        ...(currentUser ?? {}),
        userId,
        nickname: result?.data?.nickname ?? nickname,
        profileImage: result?.data?.profileImage ?? profileImageKey,
      }

      setCurrentUser(updatedUser)
      showMessage('Profile config를 저장했습니다.', 'success')
      navigate('profileView', { keepMessage: true })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteUser() {
    setIsSubmitting(true)

    try {
      await deleteCurrentUser()
      setIsDeleteModalOpen(false)
      logout()
      showMessage('Account delete가 완료되었습니다.', 'success')
      navigate('welcome', { keepMessage: true })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="profile-edit-section" className="section profile-edit-section">
      <button
        id="profile-back-to-list-button"
        className="profile-back-button"
        type="button"
        onClick={() => navigate('list')}
      >
        Back to Feed
      </button>

      <form onSubmit={handleSubmit}>
        <h2>Profile Config</h2>

        <label>avatar</label>
        <label className="profile-edit-image-uploader" htmlFor="profile-image-input">
          <img
            id="profile-edit-preview"
            className="profile-image"
            src={getProfileImageUrl(selectedProfileImage)}
            alt="프로필 이미지 미리보기"
          />
          <span className="profile-image-change-text">change</span>
        </label>
        <input
          id="profile-image-input"
          className="hidden-file-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        <div className="profile-edit-form">
          <label>email</label>
          <p id="profile-edit-email" className="readonly-text">
            {currentUser?.email ?? '-'}
          </p>

          <label htmlFor="profile-nickname-input">handle</label>
          <input
            id="profile-nickname-input"
            type="text"
            placeholder="anonymous handle"
            value={nickname}
            onChange={(event) => {
              setNickname(event.target.value)
              setNicknameError('')
            }}
            className={nicknameError ? 'input-error' : ''}
          />
          <p id="profile-nickname-error" className="field-error">
            {nicknameError}
          </p>

          <button
            id="update-profile-button"
            className="profile-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            Save Config
          </button>
          <button
            id="delete-user-button"
            className="profile-delete-button"
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        isSubmitting={isSubmitting}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
      />
    </section>
  )
}

export default ProfileEditPage
