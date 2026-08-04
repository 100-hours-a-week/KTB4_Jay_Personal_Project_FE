import { formatDate } from '../utils/format'

function ChatMessageItem({ message }) {
  return (
    <li className="chat-message-item">
      <div className="chat-message-meta">
        <strong>{message.nickname}</strong>
        <span>{formatDate(message.createdAt)}</span>
      </div>
      <p className="chat-message-content">{message.content}</p>
    </li>
  )
}

export default ChatMessageItem
