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
  const [profileImageError, setProfileImageError] = useState('나중에 설정해도 괜찮아요')
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
      setProfileImageError('')
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
      showMessage('회원가입 정보를 다시 확인해주세요.', 'error')
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
      setProfileImageError('나중에 설정해도 괜찮아요')
      showMessage('회원가입 완료~ 로그인 해주세요!', 'success')
      navigate('login', { keepMessage: true })
    } catch (error) {
      if (error.code === 'already_exist_email') {
        setTouched((prev) => ({ ...prev, email: true }))
        setServerErrors((prev) => ({ ...prev, email: '* 이미 사용 중인 이메일이에요.' }))
        showMessage('', '')
      } else if (error.code === 'already_exist_nickname') {
        setTouched((prev) => ({ ...prev, nickname: true }))
        setServerErrors((prev) => ({ ...prev, nickname: '* 이미 사용 중인 닉네임이에요.' }))
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
      <h2>회원가입</h2>

      <form onSubmit={handleSubmit}>
        <div className="signup-profile-field">
          <label htmlFor="signup-profile-image-input">프로필 이미지를 추가해볼까요?</label>
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

        <label htmlFor="signup-email-input">이메일*</label>
        <input
          id="signup-email-input"
          type="email"
          placeholder="이메일을 입력해주세요"
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

        <label htmlFor="signup-password-input">비밀번호*</label>
        <input
          id="signup-password-input"
          type="password"
          placeholder="비밀번호를 입력해주세요"
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

        <label htmlFor="signup-password-check-input">비밀번호 확인*</label>
        <input
          id="signup-password-check-input"
          type="password"
          placeholder="비밀번호를 한 번 더 입력해주세요"
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

        <label htmlFor="signup-nickname-input">닉네임*</label>
        <input
          id="signup-nickname-input"
          type="text"
          placeholder="사용할 닉네임을 입력해주세요"
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
            가입하기
          </button>
          <button
            id="cancel-signup-button"
            className="text-button"
            type="button"
            onClick={() => navigate('login')}
          >
            이미 계정이 있으신가요? 로그인하기
          </button>
        </div>
      </form>
    </section>
  )
}

export default SignupPage
