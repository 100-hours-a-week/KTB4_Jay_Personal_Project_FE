import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfileImageUrl } from '../utils/profileImage'

export const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%23e5e7eb'/%3E%3Ccircle cx='80' cy='62' r='30' fill='%239ca3af'/%3E%3Cpath d='M32 137c7-29 27-44 48-44s41 15 48 44' fill='%239ca3af'/%3E%3C/svg%3E"

function ProfileMenu({ navigate, showMessage }) {
  const { currentUser, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  function handleLogout() {
    logout()
    setShowDropdown(false)
    showMessage('Logout 되었습니다.', 'success')
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
          Profile Config
        </button>
        <button
          id="show-password-edit-button"
          type="button"
          onClick={() => {
            setShowDropdown(false)
            navigate('passwordEdit')
          }}
        >
          Rotate Secret
        </button>
        <button id="logout-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfileMenu
