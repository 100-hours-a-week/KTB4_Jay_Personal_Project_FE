import { Client } from '@stomp/stompjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getChatMessages } from '../api/chatApi'
import { getApiWebSocketUrl, getAuthTokens } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ChatInput from './ChatInput'
import ChatMessageList from './ChatMessageList'

function extractMessageList(result) {
  const data = result?.data ?? result

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  if (Array.isArray(data?.messages)) {
    return data.messages
  }

  return []
}

function normalizeMessage(message) {
  return {
    id: message.messageId ?? message.id,
    nickname: message.senderNickname ?? message.nickname ?? '알 수 없음',
    content: message.content ?? '',
    createdAt: message.createdAt ?? '',
    isLocalPending: message.isLocalPending ?? false,
  }
}

function getMessageKey(message) {
  return message.id ?? `${message.nickname}-${message.createdAt}-${message.content}`
}

function sortMessagesByTime(messages) {
  return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

function isSamePendingMessage(message, nextMessage) {
  return (
    message.isLocalPending === true
    && message.content === nextMessage.content
    && message.nickname === nextMessage.nickname
  )
}

function appendMessage(prevMessages, nextMessage) {
  const normalizedMessage = normalizeMessage(nextMessage)
  const nextKey = getMessageKey(normalizedMessage)

  if (prevMessages.some((message) => getMessageKey(message) === nextKey)) {
    return prevMessages
  }

  const messagesWithoutPendingDuplicate = prevMessages.filter(
    (message) => !isSamePendingMessage(message, normalizedMessage),
  )

  return sortMessagesByTime([...messagesWithoutPendingDuplicate, normalizedMessage])
}

function getConnectionStatusText(status, isLoggedIn) {
  if (!isLoggedIn) {
    return '로그인하면 채팅에 참여할 수 있어요.'
  }

  if (status === 'connecting') {
    return '채팅에 연결하는 중입니다.'
  }

  if (status === 'connected') {
    return '채팅에 연결되었습니다.'
  }

  if (status === 'error') {
    return '채팅 연결에 실패했습니다.'
  }

  return '채팅 연결이 끊어졌습니다.'
}

function setStatusAfterEffect(setConnectionStatus, status) {
  queueMicrotask(() => setConnectionStatus(status))
}

function getCurrentUserNickname(currentUser) {
  return currentUser?.nickname ?? currentUser?.handle ?? '나'
}

function ChatBox({ postId }) {
  const { currentUser, isLoggedIn } = useAuth()
  const stompClientRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [loadError, setLoadError] = useState('')
  const [sendError, setSendError] = useState('')

  const statusText = useMemo(
    () => getConnectionStatusText(connectionStatus, isLoggedIn),
    [connectionStatus, isLoggedIn],
  )

  useEffect(() => {
    let isCancelled = false

    async function loadMessages() {
      if (postId === null || postId === undefined) {
        return
      }

      try {
        setLoadError('')
        const result = await getChatMessages(postId)
        const nextMessages = sortMessagesByTime(extractMessageList(result).map(normalizeMessage))

        if (!isCancelled) {
          setMessages(nextMessages)
        }
      } catch {
        if (!isCancelled) {
          setLoadError('이전 채팅을 불러오지 못했습니다.')
        }
      }
    }

    loadMessages()

    return () => {
      isCancelled = true
    }
  }, [postId])

  useEffect(() => {
    if (postId === null || postId === undefined || !isLoggedIn) {
      setStatusAfterEffect(setConnectionStatus, 'disconnected')
      return undefined
    }

    const accessToken = getAuthTokens().accessToken

    if (accessToken === null) {
      setStatusAfterEffect(setConnectionStatus, 'disconnected')
      return undefined
    }

    setStatusAfterEffect(setConnectionStatus, 'connecting')

    const client = new Client({
      brokerURL: getApiWebSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        setConnectionStatus('connected')
        client.subscribe(`/topic/posts/${postId}/chat`, (frame) => {
          const nextMessage = JSON.parse(frame.body)
          setMessages((prevMessages) => appendMessage(prevMessages, nextMessage))
        })
      },
      onStompError: () => {
        setConnectionStatus('error')
      },
      onWebSocketError: () => {
        setConnectionStatus('error')
      },
      onWebSocketClose: () => {
        setConnectionStatus((prevStatus) => (prevStatus === 'error' ? 'error' : 'disconnected'))
      },
    })

    stompClientRef.current = client
    client.activate()

    return () => {
      stompClientRef.current = null
      void client.deactivate()
    }
  }, [isLoggedIn, postId])

  function handleSendMessage(content) {
    const trimmedContent = content.trim()
    const accessToken = getAuthTokens().accessToken

    if (trimmedContent === '') {
      setSendError('메시지를 입력해주세요.')
      return false
    }

    if (!isLoggedIn) {
      setSendError('로그인 후 채팅에 참여할 수 있어요.')
      return false
    }

    if (stompClientRef.current?.connected !== true) {
      setSendError('채팅 연결 후 다시 전송해주세요.')
      return false
    }

    try {
      stompClientRef.current.publish({
        destination: `/app/posts/${postId}/chat/messages`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      })
      setMessages((prevMessages) => appendMessage(prevMessages, {
        id: `local-${Date.now()}`,
        nickname: getCurrentUserNickname(currentUser),
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        isLocalPending: true,
      }))
      setSendError('')
      return true
    } catch {
      setSendError('메시지 전송에 실패했습니다.')
      return false
    }
  }

  return (
    <section className="chat-box" aria-labelledby="chat-box-title">
      <div className="chat-header">
        <h3 id="chat-box-title">실시간 채팅</h3>
        <p>코드리뷰 흐름을 가볍게 이어가보세요.</p>
      </div>
      <p className="chat-status" aria-live="polite">{statusText}</p>
      {loadError && <p className="chat-error" role="alert">{loadError}</p>}
      <ChatMessageList messages={messages} />
      <ChatInput
        disabled={!isLoggedIn || connectionStatus !== 'connected'}
        errorMessage={sendError}
        onSend={handleSendMessage}
      />
    </section>
  )
}

export default ChatBox
