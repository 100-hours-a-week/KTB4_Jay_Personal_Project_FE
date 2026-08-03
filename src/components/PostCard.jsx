import { formatDateOnly, getAuthorName } from '../utils/format'
import { getProfileImageUrl } from '../utils/profileImage'

function getPostImage(post) {
  return post?.thumbnailUrl ?? post?.imageUrl ?? post?.coverImage ?? post?.postImage ?? ''
}

function getPostAuthorImage(post) {
  return (
    post?.authorProfileImage ??
    post?.profileImage ??
    post?.authorProfileImageUrl ??
    post?.userProfileImage ??
    ''
  )
}

function PostCard({ post, onClick }) {
  const postImage = getPostImage(post)

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
      <div className="post-card-image">
        {postImage ? (
          <img src={postImage} alt="" />
        ) : (
          <div className="post-card-image-placeholder" aria-hidden="true">
            <span>{String(post.title ?? '글').slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="post-card-top">
        <h3>{post.title}</h3>
        <div className="post-card-meta">
          <p className="post-counts">
            <span aria-label="도움돼요">⭐️ 도움돼요</span> {post.likeCount ?? 0}
            <span aria-label="댓글수">💬 댓글수</span> {post.commentCount ?? 0}
            <span aria-label="조회수">👀 조회수</span> {post.viewCount ?? 0}
          </p>
          <p className="post-date">{formatDateOnly(post.createdAt)}</p>
        </div>
      </div>
      <div className="post-author">
        <img
          className="post-author-image"
          src={getProfileImageUrl(getPostAuthorImage(post))}
          alt=""
        />
        <p>{getAuthorName(post)}</p>
      </div>
    </div>
  )
}

export default PostCard
