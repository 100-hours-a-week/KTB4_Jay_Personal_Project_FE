import { useCallback, useEffect, useState } from 'react'
import { getPosts, getRankPosts } from '../api/postApi'
import Pagination from '../components/Pagination'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 5

function PostListPage({
  navigate,
  showMessage,
  requireLogin,
  currentPage,
  setCurrentPage,
  setCurrentPostId,
}) {
  const { isLoggedIn } = useAuth()
  const [posts, setPosts] = useState([])
  const [pageData, setPageData] = useState(null)
  const [sortType, setSortType] = useState('latest')
  const [rankPeriod, setRankPeriod] = useState('WEEKLY')
  const [isHotMenuOpen, setIsHotMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadPosts = useCallback(async (page = 0, nextSortType = 'latest', nextRankPeriod = 'WEEKLY') => {
    setIsLoading(true)
    
    try {
      const result = 
      nextSortType === 'latest' 
        ? await getPosts(page, PAGE_SIZE)
        : await getRankPosts(page, PAGE_SIZE, nextRankPeriod)
      
      const data = result?.data ?? {}
      setPosts(data.content ?? [])
      setPageData(data)
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showMessage])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts(currentPage, sortType, rankPeriod)
  }, [currentPage, loadPosts, rankPeriod, refreshKey, sortType])

  return (
    <section id="post-list-section" className="section">
      <div className="post-list-intro">
        <p>
          개발자들을 위한 익명 대나무숲 게시판
          <br />
          게시글을 클릭하여 다양한 코드리뷰를 남겨보세요!
        </p>
        <div className="post-list-actions">
          <button
            id="show-list-login-button"
            className={`list-login-button${isLoggedIn ? ' hidden' : ''}`}
            type="button"
            onClick={() => navigate('login')}
          >
            Login
          </button>
          <button
            id="show-create-button"
            type="button"
            onClick={() => {
              if (requireLogin()) {
                navigate('create')
              }
            }}
          >
            Commit
          </button>
        </div>
      </div>

      <div className="post-list-toolbar">
        <div className="sort-toggle" aria-label="Feed sort">
          <button
            id="sort-latest-button"
            className={`sort-button${sortType === 'latest' ? ' active' : ''}`}
            type="button"
            onClick={() => {
              setSortType('latest')
              setIsHotMenuOpen(false)
              setCurrentPage(0)
            }}
          >
            Latest
          </button>
          <div className="hot-sort-wrapper">
            <button
              id="sort-popular-button"
              className={`sort-button${sortType === 'popular' ? ' active' : ''}`}
              type="button"
              aria-expanded={isHotMenuOpen}
              onClick={() => setIsHotMenuOpen((prev) => !prev)}
            >
              Hot
            </button>
            {isHotMenuOpen && (
              <div className="hot-period-menu" aria-label="Hot period">
                <button
                  className={rankPeriod === 'DAILY' ? 'active' : ''}
                  type="button"
                  onClick={() => {
                    setSortType('popular')
                    setRankPeriod('DAILY')
                    setIsHotMenuOpen(false)
                    setCurrentPage(0)
                  }}
                >
                  Daily
                </button>
                <button
                  className={rankPeriod === 'WEEKLY' ? 'active' : ''}
                  type="button"
                  onClick={() => {
                    setSortType('popular')
                    setRankPeriod('WEEKLY')
                    setIsHotMenuOpen(false)
                    setCurrentPage(0)
                  }}
                >
                  Weekly
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        id="refresh-posts-button"
        type="button"
        onClick={() => setRefreshKey((prev) => prev + 1)}
      >
        Refresh
      </button>
      <div id="post-list" className="post-list">
        {isLoading && <p className="post-empty">Loading feed...</p>}
        {!isLoading && posts.length === 0 && (
          <p className="post-empty">No logs yet. Push the first anonymous commit.</p>
        )}
        {!isLoading &&
          posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              onClick={() => {
                setCurrentPostId(post.postId)
                navigate('detail', { postId: post.postId })
              }}
            />
          ))}
      </div>

      <Pagination
        currentPage={currentPage}
        pageData={pageData}
        onPageChange={setCurrentPage}
      />
    </section>
  )
}

export default PostListPage
