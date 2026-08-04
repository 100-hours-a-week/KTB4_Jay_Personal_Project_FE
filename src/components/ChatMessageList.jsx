import { useEffect, useRef } from 'react'
import ChatMessageItem from './ChatMessageItem'

function ChatMessageList({ messages }) {
  const listRef = useRef(null)

  useEffect(() => {
    const listElement = listRef.current

    if (listElement === null) {
      return
    }

    listElement.scrollTop = listElement.scrollHeight
  }, [messages.length])

  if (messages.length === 0) {
    return <p className="chat-empty">아직 채팅 메시지가 없습니다.</p>
  }

  return (
    <ul ref={listRef} className="chat-message-list" aria-label="채팅 메시지 목록">
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}
    </ul>
  )
}

export default ChatMessageList
