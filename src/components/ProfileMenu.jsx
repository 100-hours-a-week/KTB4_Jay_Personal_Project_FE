import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { useAuth } from '../context/AuthContext'
import { getProfileImageUrl } from '../utils/profileImage'

export const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%23e5e7eb'/%3E%3Ccircle cx='80' cy='62' r='30' fill='%239ca3af'/%3E%3Cpath d='M32 137c7-29 27-44 48-44s41 15 48 44' fill='%239ca3af'/%3E%3C/svg%3E"

function ProfileMenu({ navigate, showMessage }) {
  const { currentUser, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  function handleLogout() {
    logout()
    setIsLogoutModalOpen(false)
    setShowDropdown(false)
    showMessage('로그아웃 되었습니다.', 'success')
    navigate('welcome')
  }

  return (
    <div id="profile-menu" className="profile-menu">
      <button
        id="profile-toggle-button"
        className="profile-avatar-button"
        type="button"
        aria-label="프로필 메뉴 열기"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <img
          id="profile-toggle-image"
          className="profile-avatar-image"
          src={getProfileImageUrl(currentUser?.profileImage)}
          alt="프로필 이미지"
        />
      </button>
      <div id="profile-dropdown" className={`profile-dropdown${showDropdown ? '' : ' hidden'}`}>
        <button
          id="show-profile-edit-button"
          type="button"
          onClick={() => {
            setShowDropdown(false)
            navigate('profileEdit')
          }}
        >
          프로필 설정
        </button>
        <button
          id="show-password-edit-button"
          type="button"
          onClick={() => {
            setShowDropdown(false)
            navigate('passwordEdit')
          }}
        >
          비밀번호 변경
        </button>
        <button
          id="logout-button"
          type="button"
          onClick={() => {
            setShowDropdown(false)
            setIsLogoutModalOpen(true)
          }}
        >
          로그아웃
        </button>
      </div>
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        modalId="logout-modal"
        title="로그아웃할까요?"
        message="현재 계정에서 로그아웃됩니다."
        cancelText="아니요"
        confirmText="로그아웃"
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  )
}

export default ProfileMenu
