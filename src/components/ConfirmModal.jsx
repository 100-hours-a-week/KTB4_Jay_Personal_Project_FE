function ConfirmModal({ isOpen, onCancel, onConfirm, isSubmitting = false }) {
  if (!isOpen) {
    return null
  }

  return (
    <div id="delete-user-modal" className="modal-overlay">
      <div className="confirm-modal">
        <h2>Delete Account?</h2>
        <p>All commits and threads will be removed.</p>

        <div className="confirm-modal-actions">
          <button
            id="cancel-delete-user-button"
            className="confirm-cancel-button"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-user-button"
            className="confirm-submit-button"
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
