import { useState } from 'react'

function ChatInput() {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        className="chat-input"
        type="text"
        placeholder="채팅 메시지를 입력해주세요"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button className="chat-send-button" type="submit">
        전송
      </button>
    </form>
  )
}

export default ChatInput
