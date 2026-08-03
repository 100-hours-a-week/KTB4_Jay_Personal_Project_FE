function ConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
  isSubmitting = false,
  title = '계정을 삭제할까요?',
  message = '작성한 게시글과 댓글이 모두 삭제됩니다.',
  cancelText = '취소',
  confirmText = '확인',
  modalId = 'confirm-modal',
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div id={modalId} className="modal-overlay">
      <div className="confirm-modal">
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            id={`${modalId}-cancel-button`}
            className="confirm-cancel-button"
            type="button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            id={`${modalId}-confirm-button`}
            className="confirm-submit-button"
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
