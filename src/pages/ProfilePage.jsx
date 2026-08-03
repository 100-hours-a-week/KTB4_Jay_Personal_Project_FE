import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfileImageUrl } from '../utils/profileImage'

function ProfilePage({ navigate, showMessage }) {
  const { currentUser, loadCurrentUser } = useAuth()

  useEffect(() => {
    async function loadProfile() {
      try {
        await loadCurrentUser()
      } catch (error) {
        showMessage(error.message, 'error')
      }
    }

    loadProfile()
  }, [loadCurrentUser, showMessage])

  return (
    <section id="profile-view-section" className="section">
      <div className="section-header">
        <h2>프로필</h2>
        <button id="profile-view-edit-button" type="button" onClick={() => navigate('profileEdit')}>
          설정
        </button>
      </div>

      <div className="profile-view">
        <img
          id="profile-view-image"
          className="profile-image"
          src={getProfileImageUrl(currentUser?.profileImage)}
          alt="프로필 이미지"
        />

        <div className="profile-info">
          <p>
            <strong>사용자 ID</strong>{' '}
            <span id="profile-view-user-id">{currentUser?.userId ?? currentUser?.id ?? '-'}</span>
          </p>
          <p>
            <strong>이메일</strong>{' '}
            <span id="profile-view-email">{currentUser?.email ?? '-'}</span>
          </p>
          <p>
            <strong>닉네임</strong>{' '}
            <span id="profile-view-nickname">{currentUser?.nickname ?? '-'}</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
