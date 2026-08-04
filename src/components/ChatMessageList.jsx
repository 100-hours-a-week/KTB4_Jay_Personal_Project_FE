import ChatMessageItem from './ChatMessageItem'

function ChatMessageList({ messages }) {
  return (
    <ul className="chat-message-list" aria-label="채팅 메시지 목록">
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}
    </ul>
  )
}

export default ChatMessageList
