import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import GlobalMessage from './components/GlobalMessage'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import PasswordEditPage from './pages/PasswordEditPage'
import PostCreatePage from './pages/PostCreatePage'
import PostDetailPage from './pages/PostDetailPage'
import PostEditPage from './pages/PostEditPage'
import PostListPage from './pages/PostListPage'
import ProfileEditPage from './pages/ProfileEditPage'
import ProfilePage from './pages/ProfilePage'
import SignupPage from './pages/SignupPage'
import WelcomePage from './pages/WelcomePage'
import './App.css'

function AppContent() {
  const { isLoggedIn, isRestoring, loadCurrentUser } = useAuth()
  const [view, setView] = useState('welcome')
  const [currentPage, setCurrentPage] = useState(0)
  const [currentPostId, setCurrentPostId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const showMessage = useCallback((text, type = 'error') => {
    setMessage({ text, type })
  }, [])

  const clearMessage = useCallback(() => {
    setMessage({ text: '', type: '' })
  }, [])

  const navigate = useCallback((nextView, options = {}) => {
    if (options.keepMessage !== true) {
      clearMessage()
    }

    if (options.postId !== undefined) {
      setCurrentPostId(options.postId)
    }

    if (options.page !== undefined) {
      setCurrentPage(options.page)
    }

    setView(nextView)
  }, [clearMessage])

  const requireLogin = useCallback((nextView = 'login') => {
    if (!isLoggedIn) {
      loadCurrentUser()
        .catch(() => {
          setView(nextView)
          showMessage('Login이 필요합니다.', 'error')
        })
      return false
    }

    return true
  }, [isLoggedIn, loadCurrentUser, showMessage])

  useEffect(() => {
    if (!isRestoring && isLoggedIn && view === 'welcome') {
      queueMicrotask(() => setView('list'))
    }
  }, [isRestoring, isLoggedIn, view])

  if (isRestoring) {
    return (
      <main className="container">
        <p className="helper-text">Loading...</p>
      </main>
    )
  }

  const pageProps = {
    navigate,
    showMessage,
    clearMessage,
    requireLogin,
    currentPage,
    setCurrentPage,
    currentPostId,
    setCurrentPostId,
  }

  let content

  if (view === 'welcome') {
    content = <WelcomePage navigate={navigate} />
  } else if (view === 'login') {
    content = <LoginPage navigate={navigate} showMessage={showMessage} />
  } else if (view === 'signup') {
    content = <SignupPage navigate={navigate} showMessage={showMessage} />
  } else if (view === 'create') {
    content = <PostCreatePage {...pageProps} />
  } else if (view === 'detail') {
    content = <PostDetailPage {...pageProps} />
  } else if (view === 'edit') {
    content = <PostEditPage {...pageProps} />
  } else if (view === 'profileView') {
    content = <ProfilePage {...pageProps} />
  } else if (view === 'profileEdit') {
    content = <ProfileEditPage {...pageProps} />
  } else if (view === 'passwordEdit') {
    content = <PasswordEditPage {...pageProps} />
  } else {
    content = <PostListPage {...pageProps} />
  }

  const showHeader = view !== 'welcome' && view !== 'login' && view !== 'signup' && isLoggedIn

  return (
    <>
      {showHeader && <Header navigate={navigate} showMessage={showMessage} />}
      <main className="container">
        <GlobalMessage message={message} />
        {content}
      </main>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
