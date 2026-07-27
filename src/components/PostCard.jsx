import { formatDate, getAuthorName } from '../utils/format'

function PostCard({ post, onClick }) {
  return (
    <div
      className={`post-card${post.blinded ? ' blinded' : ''}`}
      data-post-id={post.postId}
      onClick={post.blinded ? undefined : onClick}
      role={post.blinded ? undefined : 'button'}
      tabIndex={post.blinded ? undefined : 0}
      onKeyDown={(event) => {
        if (!post.blinded && (event.key === 'Enter' || event.key === ' ')) {
          onClick()
        }
      }}
    >
      <div className="post-card-top">
        <h3>{post.title}</h3>
        <div className="post-card-meta">
          <p className="post-counts">
            ★ Star {post.likeCount ?? 0} Thread {post.commentCount ?? 0} View{' '}
            {post.viewCount ?? 0}
          </p>
          <p className="post-date">{formatDate(post.createdAt)}</p>
        </div>
      </div>
      <p className="post-author">{getAuthorName(post)}</p>
    </div>
  )
}

export default PostCard
