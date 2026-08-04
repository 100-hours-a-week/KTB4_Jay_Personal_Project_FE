import ChatInput from './ChatInput'
import ChatMessageList from './ChatMessageList'

const TEMP_CHAT_MESSAGES = [
  {
    id: 1,
    nickname: 'jay',
    content: '이 부분은 useEffect 의존성을 한번 확인해보면 좋을 것 같습니다.',
    createdAt: '2026-08-03T10:00:00'
  },
  {
    id: 2,
    nickname: 'mini',
    content: '좋아요. 그리고 API 호출 위치도 분리하면 더 읽기 쉬울 것 같습니다.',
    createdAt: '2026-08-03T10:01:00'
  }
]

function ChatBox() {
  return (
    <section className="chat-box" aria-labelledby="chat-box-title">
      <div className="chat-header">
        <h3 id="chat-box-title">실시간 채팅</h3>
        <p>코드리뷰 흐름을 가볍게 이어가보세요.</p>
      </div>
      <ChatMessageList messages={TEMP_CHAT_MESSAGES} />
      <ChatInput />
    </section>
  )
}

export default ChatBox
