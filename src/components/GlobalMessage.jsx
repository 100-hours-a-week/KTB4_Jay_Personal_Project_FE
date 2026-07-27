function GlobalMessage({ message }) {
  if (!message?.text) {
    return null
  }

  return (
    <p id="global-message" className={`global-message ${message.type}`}>
      {message.text}
    </p>
  )
}

export default GlobalMessage
