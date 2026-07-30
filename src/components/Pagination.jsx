function Pagination({ currentPage, pageData, onPageChange }) {
  const current = (pageData?.number ?? currentPage) + 1
  const total = pageData?.totalPages === 0 ? 1 : (pageData?.totalPages ?? 1)

  return (
    <div className="pagination">
      <button
        id="prev-page-button"
        type="button"
        disabled={pageData?.first ?? true}
        onClick={() => {
          if (currentPage > 0) {
            onPageChange(currentPage - 1)
          }
        }}
      >
        이전
      </button>
      <span id="page-info">
        {current} / {total}
      </span>
      <button
        id="next-page-button"
        type="button"
        disabled={pageData?.last ?? true}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음
      </button>
    </div>
  )
}

export default Pagination
