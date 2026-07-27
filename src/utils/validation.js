export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/.test(password)
}

export function validateLogin({ email, password }) {
  const errors = {}

  if (email.trim() === '') {
    errors.email = '* email is required.'
  } else if (!isValidEmail(email.trim())) {
    errors.email = '* valid email format required. (ex: dev@example.com)'
  }

  if (password.trim() === '') {
    errors.password = '* secret is required.'
  } else if (!isValidPassword(password.trim())) {
    errors.password = '* secret must be 8-20 chars with lowercase, number, and special char.'
  }

  return errors
}

export function validateSignup({ email, password, passwordCheck, nickname }) {
  const errors = {}

  if (!isValidEmail(email.trim())) {
    errors.email = '* valid email format required. (ex: dev@example.com)'
  }

  if (!isValidPassword(password)) {
    errors.password = '* secret must be 8-20 chars with lowercase, number, and special char.'
  }

  if (passwordCheck.trim() === '') {
    errors.passwordCheck = '* confirm secret is required.'
  } else if (password !== passwordCheck) {
    errors.passwordCheck = '* secret does not match.'
  }

  if (nickname.trim() === '') {
    errors.nickname = '* handle is required.'
  } else if (nickname.trim().length > 10) {
    errors.nickname = '* handle can be up to 10 chars.'
  }

  return errors
}

export function validatePostForm({ title, content }) {
  if (title.trim() === '') {
    return 'commit.title을 입력하세요.'
  }

  if (content.trim() === '') {
    return 'commit.body를 입력하세요.'
  }

  return ''
}

export function validateProfile({ nickname }) {
  if (nickname.trim() === '') {
    return '* handle is required.'
  }

  if (nickname.trim().length > 10) {
    return '* handle can be up to 10 chars.'
  }

  return ''
}

export function validatePasswordEdit({ currentPassword, newPassword, newPasswordCheck }) {
  const errors = {}

  if (currentPassword.trim() === '') {
    errors.currentPassword = '* current secret is required.'
  }

  if (!isValidPassword(newPassword)) {
    errors.newPassword = '* secret must be 8-20 chars with lowercase, number, and special char.'
  }

  if (newPasswordCheck.trim() === '') {
    errors.newPasswordCheck = '* confirm secret is required.'
  } else if (newPassword !== newPasswordCheck) {
    errors.newPasswordCheck = '* secret does not match.'
  }

  return errors
}
