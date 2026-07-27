import { useMemo, useState } from 'react'
import { updateCurrentPassword } from '../api/authApi'
import { validatePasswordEdit } from '../utils/validation'

function PasswordEditPage({ navigate, showMessage, requireLogin }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordCheck, setNewPasswordCheck] = useState('')
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(
    () => validatePasswordEdit({ currentPassword, newPassword, newPasswordCheck }),
    [currentPassword, newPassword, newPasswordCheck],
  )

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!requireLogin()) {
      return
    }

    setTouched({
      currentPassword: true,
      newPassword: true,
      newPasswordCheck: true,
    })

    if (Object.keys(errors).length > 0) {
      showMessage('Secret rotation 정보를 다시 확인하세요.', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      await updateCurrentPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        newPasswordCheck: newPasswordCheck.trim(),
      })
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordCheck('')
      setTouched({})
      showMessage('Secret을 rotation 했습니다.', 'success')
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="password-edit-section" className="section password-edit-section">
      <button
        id="password-back-to-list-button"
        className="profile-back-button"
        type="button"
        onClick={() => navigate('list')}
      >
        Back to Feed
      </button>

      <form className="password-edit-form" onSubmit={handleSubmit}>
        <h2>Rotate Secret</h2>

        <label htmlFor="current-password-input">current secret</label>
        <input
          id="current-password-input"
          type="password"
          placeholder="current secret"
          value={currentPassword}
          onBlur={() => markTouched('currentPassword')}
          onChange={(event) => {
            markTouched('currentPassword')
            setCurrentPassword(event.target.value)
          }}
          className={touched.currentPassword && errors.currentPassword ? 'input-error' : ''}
        />
        <p id="current-password-error" className="field-error">
          {touched.currentPassword ? errors.currentPassword : ''}
        </p>

        <label htmlFor="new-password-input">new secret</label>
        <input
          id="new-password-input"
          type="password"
          placeholder="new secret"
          value={newPassword}
          onBlur={() => markTouched('newPassword')}
          onChange={(event) => {
            markTouched('newPassword')
            setNewPassword(event.target.value)
          }}
          className={touched.newPassword && errors.newPassword ? 'input-error' : ''}
        />
        <p id="new-password-error" className="field-error">
          {touched.newPassword ? errors.newPassword : ''}
        </p>

        <label htmlFor="new-password-check-input">confirm new secret</label>
        <input
          id="new-password-check-input"
          type="password"
          placeholder="confirm new secret"
          value={newPasswordCheck}
          onBlur={() => markTouched('newPasswordCheck')}
          onChange={(event) => {
            markTouched('newPasswordCheck')
            setNewPasswordCheck(event.target.value)
          }}
          className={touched.newPasswordCheck && errors.newPasswordCheck ? 'input-error' : ''}
        />
        <p id="new-password-check-error" className="field-error">
          {touched.newPasswordCheck ? errors.newPasswordCheck : ''}
        </p>

        <button
          id="update-password-button"
          className="profile-submit-button"
          type="submit"
          disabled={isSubmitting}
        >
          Rotate
        </button>
      </form>
    </section>
  )
}

export default PasswordEditPage
