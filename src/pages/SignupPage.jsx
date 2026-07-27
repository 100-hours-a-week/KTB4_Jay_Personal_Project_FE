import { useMemo, useState } from 'react'
import { registerUser } from '../api/authApi'
import { resizeProfileImage, saveProfileImage } from '../utils/profileImage'
import { validateSignup } from '../utils/validation'

function SignupPage({ navigate, showMessage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')
  const [nickname, setNickname] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profileImageError, setProfileImageError] = useState('optional')
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(
    () => validateSignup({ email, password, passwordCheck, nickname }),
    [email, password, passwordCheck, nickname],
  )
  const isValid = Object.keys(errors).length === 0
  const emailErrorMessage = serverErrors.email || (touched.email ? errors.email : '')
  const nicknameErrorMessage = serverErrors.nickname || (touched.nickname ? errors.nickname : '')

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function clearServerError(key) {
    setServerErrors((prev) => ({ ...prev, [key]: '' }))
  }

  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0]
    markTouched('profileImage')

    if (!file) {
      setProfileImage('')
      setProfileImageError('optional')
      return
    }

    if (!file.type.startsWith('image/')) {
      setProfileImage('')
      setProfileImageError('* 이미지 파일만 선택할 수 있습니다.')
      return
    }

    try {
      const imageData = await resizeProfileImage(file)
      setProfileImage(imageData)
      setProfileImageError('')
    } catch {
      setProfileImage('')
      setProfileImageError('* 프로필 사진을 읽지 못했습니다.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({
      profileImage: true,
      email: true,
      password: true,
      passwordCheck: true,
      nickname: true,
    })
    setServerErrors({})

    if (!isValid) {
      showMessage('Join 정보를 다시 확인하세요.', 'error')
      return
    }

    const profileImageKey = `signup-profile-image-${email.trim()}`

    setIsSubmitting(true)

    try {
      await registerUser({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        profileImage: profileImageKey,
      })

      if (profileImage.trim() !== '') {
        saveProfileImage(profileImageKey, profileImage)
      }

      setEmail('')
      setPassword('')
      setPasswordCheck('')
      setNickname('')
      setProfileImage('')
      setProfileImageError('optional')
      showMessage('Join 완료. Login 해주세요.', 'success')
      navigate('login', { keepMessage: true })
    } catch (error) {
      const message = error.message.toLowerCase()
      if (
        error.message.includes('이메일') ||
        error.message.includes('email') ||
        error.message.includes('이미 사용 중인 email') ||
        message.includes('email') ||
        message.includes('already_exist_email')
      ) {
        setTouched((prev) => ({ ...prev, email: true }))
        setServerErrors((prev) => ({ ...prev, email: '* duplicated email.' }))
        showMessage('', '')
      } else if (
        error.message.includes('닉네임') ||
        error.message.includes('handle') ||
        error.message.includes('이미 사용 중인 handle') ||
        message.includes('nickname') ||
        message.includes('handle') ||
        message.includes('already_exist_nickname')
      ) {
        setTouched((prev) => ({ ...prev, nickname: true }))
        setServerErrors((prev) => ({ ...prev, nickname: '* duplicated handle.' }))
        showMessage('', '')
      } else {
        showMessage(error.message, 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="signup-section" className="section signup-section">
      <button
        id="signup-back-button"
        className="signup-back-button"
        type="button"
        aria-label="welcome으로 돌아가기"
        onClick={() => navigate('welcome')}
      >
        ‹
      </button>
      <h2>Join</h2>

      <form onSubmit={handleSubmit}>
        <div className="signup-profile-field">
          <label htmlFor="signup-profile-image-input">avatar</label>
          <p id="signup-profile-image-error" className="field-error">
            {profileImageError}
          </p>
          <label className="signup-profile-uploader" htmlFor="signup-profile-image-input">
            <img
              id="signup-profile-preview"
              className={`signup-profile-preview${profileImage ? '' : ' hidden'}`}
              src={profileImage}
              alt="프로필 사진 미리보기"
            />
            {!profileImage && (
              <span id="signup-profile-plus" className="signup-profile-plus">
                +
              </span>
            )}
          </label>
        </div>
        <input
          id="signup-profile-image-input"
          className="hidden-file-input"
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
        />

        <label htmlFor="signup-email-input">email*</label>
        <input
          id="signup-email-input"
          type="email"
          placeholder="dev@example.com"
          value={email}
          onBlur={() => markTouched('email')}
          onChange={(event) => {
            markTouched('email')
            clearServerError('email')
            setEmail(event.target.value)
          }}
          className={emailErrorMessage ? 'input-error' : ''}
        />
        <p id="signup-email-error" className="field-error">
          {emailErrorMessage}
        </p>

        <label htmlFor="signup-password-input">secret*</label>
        <input
          id="signup-password-input"
          type="password"
          placeholder="enter secret"
          value={password}
          onBlur={() => markTouched('password')}
          onChange={(event) => {
            markTouched('password')
            setPassword(event.target.value)
          }}
          className={touched.password && errors.password ? 'input-error' : ''}
        />
        <p id="signup-password-error" className="field-error">
          {touched.password ? errors.password : ''}
        </p>

        <label htmlFor="signup-password-check-input">confirm secret*</label>
        <input
          id="signup-password-check-input"
          type="password"
          placeholder="confirm secret"
          value={passwordCheck}
          onBlur={() => markTouched('passwordCheck')}
          onChange={(event) => {
            markTouched('passwordCheck')
            setPasswordCheck(event.target.value)
          }}
          className={touched.passwordCheck && errors.passwordCheck ? 'input-error' : ''}
        />
        <p id="signup-password-check-error" className="field-error">
          {touched.passwordCheck ? errors.passwordCheck : ''}
        </p>

        <label htmlFor="signup-nickname-input">handle*</label>
        <input
          id="signup-nickname-input"
          type="text"
          placeholder="anonymous handle"
          value={nickname}
          onBlur={() => markTouched('nickname')}
          onChange={(event) => {
            markTouched('nickname')
            clearServerError('nickname')
            setNickname(event.target.value)
          }}
          className={nicknameErrorMessage ? 'input-error' : ''}
        />
        <p id="signup-nickname-error" className="field-error">
          {nicknameErrorMessage}
        </p>

        <div className="button-row">
          <button
            id="signup-button"
            className="signup-submit-button"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            Create Account
          </button>
          <button
            id="cancel-signup-button"
            className="text-button"
            type="button"
            onClick={() => navigate('login')}
          >
            already have access? Login
          </button>
        </div>
      </form>
    </section>
  )
}

export default SignupPage
