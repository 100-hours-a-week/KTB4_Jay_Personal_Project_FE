import CommentItem from './CommentItem'

function CommentList({ comments = [], currentUserId, onDelete, onUpdate }) {
  if (comments.length === 0) {
    return <div id="comment-list">아직 댓글이 없습니다.</div>
  }

  return (
    <div id="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          currentUserId={currentUserId}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export default CommentList
