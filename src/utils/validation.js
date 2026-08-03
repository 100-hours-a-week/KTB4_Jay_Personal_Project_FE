export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/.test(password)
}

export function validateLogin({ email, password }) {
  const errors = {}

  if (email.trim() === '') {
    errors.email = '* 이메일을 입력해주세요.'
  } else if (!isValidEmail(email.trim())) {
    errors.email = '* 이메일 형식으로 입력해주세요. (예: dev@example.com)'
  }

  if (password.trim() === '') {
    errors.password = '* 비밀번호를 입력해주세요.'
  } else if (!isValidPassword(password.trim())) {
    errors.password = '* 비밀번호는 영문 소문자, 숫자, 특수문자를 포함해 8~20자로 입력해주세요.'
  }

  return errors
}

export function validateSignup({ email, password, passwordCheck, nickname }) {
  const errors = {}

  if (!isValidEmail(email.trim())) {
    errors.email = '* 이메일 형식으로 입력해주세요. (예: dev@example.com)'
  }

  if (!isValidPassword(password)) {
    errors.password = '* 비밀번호는 영문 소문자, 숫자, 특수문자를 포함해 8~20자로 입력해주세요.'
  }

  if (passwordCheck.trim() === '') {
    errors.passwordCheck = '* 비밀번호를 한 번 더 입력해주세요.'
  } else if (password !== passwordCheck) {
    errors.passwordCheck = '* 비밀번호가 일치하지 않아요.'
  }

  if (nickname.trim() === '') {
    errors.nickname = '* 닉네임을 입력해주세요.'
  } else if (nickname.trim().length > 10) {
    errors.nickname = '* 닉네임은 10자 이내로 입력해주세요.'
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
    return '* 닉네임을 입력해주세요.'
  }

  if (nickname.trim().length > 10) {
    return '* 닉네임은 10자 이내로 입력해주세요.'
  }

  return ''
}

export function validatePasswordEdit({ currentPassword, newPassword, newPasswordCheck }) {
  const errors = {}

  if (currentPassword.trim() === '') {
    errors.currentPassword = '* 현재 비밀번호를 입력해주세요.'
  }

  if (!isValidPassword(newPassword)) {
    errors.newPassword = '* 새 비밀번호는 영문 소문자, 숫자, 특수문자를 포함해 8~20자로 입력해주세요.'
  }

  if (newPasswordCheck.trim() === '') {
    errors.newPasswordCheck = '* 새 비밀번호를 한 번 더 입력해주세요.'
  } else if (newPassword !== newPasswordCheck) {
    errors.newPasswordCheck = '* 새 비밀번호가 일치하지 않아요.'
  }

  return errors
}
