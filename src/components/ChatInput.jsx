import { useState } from 'react'

function ChatInput({ disabled = false, errorMessage = '', onSend }) {
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (disabled) {
      return
    }

    const trimmedMessage = message.trim()

    if (trimmedMessage === '') {
      return
    }

    if (onSend(trimmedMessage)) {
      setMessage('')
    }
  }

  return (
    <>
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          placeholder={disabled ? '로그인 후 채팅에 참여할 수 있어요' : '  채팅 메시지를 입력해주세요'}
          value={message}
          disabled={disabled}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button className="chat-send-button" type="submit" disabled={disabled || message.trim() === ''}>
          전송
        </button>
      </form>
      {errorMessage && <p className="chat-error" role="alert">{errorMessage}</p>}
    </>
  )
}

export default ChatInput
