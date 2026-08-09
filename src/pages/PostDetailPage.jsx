import { useCallback, useEffect, useState } from 'react'
import { createComment, deleteComment, updateComment } from '../api/commentApi'
import {
  deletePost,
  getPostDetail,
  reportPost,
  starPost,
  unstarPost,
} from '../api/postApi'
import ChatBox from '../components/ChatBox'
import CommentList from '../components/CommentList'
import ConfirmModal from '../components/ConfirmModal'
import MarkdownContent from '../components/MarkdownContent'
import { useAuth } from '../context/AuthContext'
import { formatDateOnly, getAuthorName } from '../utils/format'

function PostDetailPage({
  navigate,
  showMessage,
  requireLogin,
  currentPostId,
  setCurrentPostId,
  currentPage,
}) {
  const { currentUser } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userId = Number(currentUser?.userId ?? currentUser?.id)
  const isOwner = post !== null && Number(post.userId) === userId

  const loadDetail = useCallback(async (showError = true) => {
    if (currentPostId === null) {
      showMessage('게시글 상세 조회에 실패했습니다.', 'error')
      navigate('list')
      return
    }

    try {
      const result = await getPostDetail(currentPostId)
      const nextPost = result?.data ?? null
      setPost(nextPost)
      setComments(nextPost?.comments ?? [])
      setIsReportModalOpen(false)
      setReportReason('')
    } catch (error) {
      if (showError) {
        showMessage(error.message, 'error')
      }
    }
  }, [currentPostId, navigate, showMessage])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail()
  }, [loadDetail])

  async function handleStar() {
    if (!requireLogin()) {
      return
    }

    if (post === null || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      if (post.liked === true) {
        const result = await unstarPost(post.postId)

        setPost((prev) => ({
          ...prev,
          liked: false,
          likeCount: result.data.likeCount
        }))
      } else {
        const result = await starPost(post.postId)

        setPost((prev) => ({
          ...prev,
          liked: true,
          likeCount: result.data.likeCount
        }))
      }
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openDeletePostModal() {
    if (!requireLogin()) {
      return
    }

    if (post === null) {
      showMessage('삭제할 게시글이 없습니다.', 'error')
      return
    }

    setIsDeleteModalOpen(true)
  }

  async function handleDeletePost() {
    if (post === null || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await deletePost(post.postId)
      setIsDeleteModalOpen(false)
      setCurrentPostId(null)
      navigate('list', { page: currentPage })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openReportModal() {
    if (!requireLogin()) {
      return
    }

    if (post === null) {
      showMessage('신고할 게시글이 없습니다.', 'error')
      return
    }

    setIsReportModalOpen(true)
  }

  async function handleReport(event) {
    event.preventDefault()

    if (post === null || isSubmitting) {
      return
    }

    if (reportReason.trim() === '') {
      showMessage('신고 사유를 입력해주세요.', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await reportPost(post.postId, { reason: reportReason })
      setReportReason('')
      setIsReportModalOpen(false)

      if (result?.data?.blinded === true) {
        navigate('list', { page: 0 })
        return
      }

      await loadDetail(false)
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateComment(event) {
    event.preventDefault()

    if (!requireLogin()) {
      return
    }

    if (post === null) {
      showMessage('댓글을 남길 게시글이 없습니다.', 'error')
      return
    }

    if (commentInput.trim() === '') {
      showMessage('댓글 내용을 입력해주세요.', 'error')
      return
    }

    try {
      await createComment(post.postId, { comment: commentInput })
      setCommentInput('')
      showMessage('댓글을 남겼습니다.', 'success')
      await loadDetail(false)
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  async function handleDeleteComment(commentId) {
    if (!requireLogin()) {
      return
    }

    try {
      await deleteComment(commentId)
      showMessage('댓글을 삭제했습니다.', 'success')
      await loadDetail(false)
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  async function handleUpdateComment(commentId, comment) {
    if (!requireLogin()) {
      return
    }

    if (comment.trim() === '') {
      showMessage('수정할 댓글 내용을 입력해주세요.', 'error')
      return
    }

    try {
      await updateComment(commentId, { comment })
      showMessage('댓글을 수정했습니다.', 'success')
      await loadDetail(false)
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  if (post === null) {
    return (
      <section id="post-detail-section" className="section post-detail-section">
        <p className="helper-text">게시글을 불러오는 중입니다...</p>
      </section>
    )
  }

  return (
    <section id="post-detail-section" className="section post-detail-section">
      <div className="post-detail-main">
        <div className="section-header">
          <div className="detail-title-group">
            <p className="detail-page-label">리뷰 세션</p>
            <p className="detail-page-subtitle">코드에 대한 피드백을 작성해주세요!</p>
            <h2 id="detail-title">{post.title}</h2>
          </div>

        </div>

        <div className="meta">
          <span id="detail-author">{getAuthorName(post)}</span>
          <span aria-hidden="true">·</span>
          <span id="detail-created-at">{formatDateOnly(post.createdAt)}</span>
          <span id="detail-edited" className={post.edited ? '' : 'hidden'}>
            {post.edited ? '수정됨' : ''}
          </span>
        </div>

        <div id="detail-content" className="detail-content">
          {post.blinded ? '신고로 숨김 처리된 게시글입니다.' : <MarkdownContent content={post.content} />}
        </div>

        <div className="count-row">
          <span>
            <span className="count-label" aria-label="조회수">👀</span>
            <strong id="detail-view-count">{post.viewCount ?? '-'}</strong>
          </span>
          <span>
            <span className="count-label" aria-label="도움돼요">⭐️</span>
            <strong id="detail-like-count">{post.likeCount ?? '-'}</strong>
          </span>
          <span>
            <span className="count-label" aria-label="댓글수">💬</span>
            <strong id="detail-comment-count">{post.commentCount ?? '-'}</strong>
          </span>
        </div>
      </div>

      <aside className="post-detail-chat-sidebar">
        <div className="chat-sidebar-nav">
          <button id="back-to-list-button" type="button" onClick={() => navigate('list')}>
            목록으로 돌아가기
          </button>
        </div>
        <ChatBox postId={post.postId} />
      </aside>

      <div className="post-detail-lower">
        <div className="detail-bottom-nav">
          {isOwner && (
            <button id="show-edit-button" type="button" onClick={() => navigate('edit')}>
              수정
            </button>
          )}
          {isOwner && (
            <button id="delete-post-button" className="danger" type="button" onClick={openDeletePostModal}>
              삭제
            </button>
          )}
          <button id="bottom-back-to-list-button" type="button" onClick={() => navigate('list')}>
            목록으로 돌아가기
          </button>
        </div>

        <div className="detail-action-row">
          <div className="detail-like-group">
            <button
              id="like-post-button"
              type="button"
              aria-label={post.liked ? '도움돼요 취소' : '도움돼요'}
              disabled={isSubmitting}
              onClick={handleStar}
            >
              {post.liked ? '⭐️' : '☆'}
            </button>
            <div className="detail-like-copy">
              <strong>도움이 됐다면 눌러주세요</strong>
              <span>{post.likeCount ?? 0}명이 도움을 받았어요</span>
            </div>
          </div>
          {!isOwner && (
            <button
              id="show-report-button"
              className="danger"
              type="button"
              onClick={openReportModal}
            >
              신고하기
            </button>
          )}
        </div>

        <div className="comment-box">
          <h3>라이브 리뷰</h3>
          <CommentList
            comments={comments}
            currentUserId={userId}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
          />

          <form className="comment-form" onSubmit={handleCreateComment}>
            <input
              id="comment-input"
              type="text"
              placeholder="라이브 리뷰를 입력해주세요"
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
            />
            <button id="create-comment-button" type="submit">
              전송
            </button>
          </form>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        modalId="delete-post-modal"
        title="게시글을 삭제할까요?"
        message="삭제한 게시글은 다시 복구할 수 없습니다."
        confirmText="삭제하기"
        isSubmitting={isSubmitting}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
      />
      {isReportModalOpen && (
        <div id="report-modal" className="modal-overlay">
          <form className="report-modal" onSubmit={handleReport}>
            <h2>게시글 신고하기</h2>
            <p>신고 사유를 입력해주세요.</p>
            <input
              id="report-reason-input"
              type="text"
              placeholder="예: 부적절한 내용, 스팸 등"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            />
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-cancel-button"
                onClick={() => {
                  setIsReportModalOpen(false)
                  setReportReason('')
                }}
              >
                취소
              </button>
              <button
                id="report-post-button"
                className="confirm-submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                신고 접수
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default PostDetailPage
