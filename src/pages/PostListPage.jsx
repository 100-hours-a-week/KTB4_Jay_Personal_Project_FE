import { useCallback, useEffect, useState } from 'react'
import { getPosts, getRankPosts } from '../api/postApi'
import Pagination from '../components/Pagination'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 6

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
          코드를 올리고 실시간으로 리뷰를 나눠보세요!
        </p>
      </div>

      <div className="post-list-heading">
        <div className="post-list-heading-main">
          <h2>코드리뷰 보드</h2>
          <div className="post-list-toolbar">
            <div className="sort-toggle" aria-label="게시글 정렬">
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
                최신순
              </button>
              <div className="hot-sort-wrapper">
                <button
                  id="sort-popular-button"
                  className={`sort-button${sortType === 'popular' ? ' active' : ''}`}
                  type="button"
                  aria-expanded={isHotMenuOpen}
                  onClick={() => setIsHotMenuOpen((prev) => !prev)}
                >
                  인기순
                </button>
                {isHotMenuOpen && (
                  <div className="hot-period-menu" aria-label="인기순 기간">
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
                      일간 랭킹
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
                      주간 랭킹
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="post-list-actions">
          <button
            id="show-list-login-button"
            className={`list-login-button${isLoggedIn ? ' hidden' : ''}`}
            type="button"
            onClick={() => navigate('login')}
          >
            로그인
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
            코드 올리기
          </button>
        </div>
      </div>

      <button
        id="refresh-posts-button"
        className="hidden"
        type="button"
        onClick={() => setRefreshKey((prev) => prev + 1)}
      >
        새로고침
      </button>
      <div id="post-list" className="post-list">
        {isLoading && <p className="post-empty">코드리뷰 보드를 불러오는 중입니다...</p>}
        {!isLoading && posts.length === 0 && (
          <p className="post-empty">아직 올라온 코드가 없습니다. 첫 리뷰를 요청해보세요.</p>
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
