import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { validateLogin } from '../utils/validation'

function LoginPage({ navigate, showMessage }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [helperText, setHelperText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(() => validateLogin({ email, password }), [email, password])
  const isValid = Object.keys(errors).length === 0

  function markTouched(key) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({ email: true, password: true })
    setHelperText('')

    if (!isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      await login({ email, password })
      setEmail('')
      setPassword('')
      navigate('list', { page: 0 })
    } catch {
      setHelperText('* email 또는 secret을 확인해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="login-section" className="login-section">
      <h2 className="login-title">Login</h2>

      <form className="login-card" onSubmit={handleSubmit}>
        <label htmlFor="login-email-input">email</label>
        <input
          id="login-email-input"
          type="email"
          placeholder="dev@example.com"
          value={email}
          onBlur={() => markTouched('email')}
          onChange={(event) => {
            markTouched('email')
            setEmail(event.target.value)
          }}
          className={touched.email && errors.email ? 'input-error' : ''}
        />
        <p id="login-email-input-error" className="field-error">
          {touched.email ? errors.email : ''}
        </p>

        <label htmlFor="login-password-input">secret</label>
        <input
          id="login-password-input"
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
        <p id="login-password-input-error" className="field-error">
          {touched.password ? errors.password : ''}
        </p>

        <p id="login-helper-text" className="helper-text">
          {helperText}
        </p>

        <button
          id="login-button"
          className="login-submit-button"
          type="submit"
          disabled={!isValid || isSubmitting}
        >
          Login
        </button>
        <button
          id="go-signup-button"
          className="text-button"
          type="button"
          onClick={() => {
            showMessage('', '')
            navigate('signup')
          }}
        >
          Join workspace
        </button>
      </form>
    </section>
  )
}

export default LoginPage
