"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Heart, MessageSquare, Bookmark, Plus, X, ImageIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { PostCreationModal } from "@/components/post-creation-modal"
import { PostDetailScreen } from "@/components/post-detail-screen"
import { useToast } from "@/hooks/use-toast"
import {
  filterPosts,
  getCurrentUser,
  isLiked,
  isBookmarked,
  toggleLike,
  toggleBookmark,
  initializeCommunityData,
} from "@/utils/community-storage"
import type { Post, PostCategory, PostFilter } from "@/types/community"

export function CommunityScreen() {
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | undefined>(undefined)
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "comments" | "views">("recent")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({})
  const currentUserId = getCurrentUser()

  // 초기 데이터 로드
  useEffect(() => {
    // 커뮤니티 데이터 초기화 (첫 실행 시에만 기본 데이터 생성)
    initializeCommunityData()

    // 게시물 로드
    loadPosts()
  }, [])

  // 필터 변경 시 게시물 다시 로드
  useEffect(() => {
    loadPosts()
  }, [activeTab, selectedCategory, sortBy])

  const loadPosts = () => {
    setIsLoading(true)
    try {
      // 필터 설정
      const filter: PostFilter = {
        sortBy,
        searchQuery: searchQuery.trim(),
      }

      // 카테고리 필터
      if (selectedCategory) {
        filter.category = selectedCategory
      }

      // 탭에 따른 필터 설정
      switch (activeTab) {
        case "popular":
          filter.sortBy = "popular"
          break
        case "similar":
          // 실제 구현에서는 사용자 직무/관심사 기반 필터링
          break
        case "success":
          filter.category = "극복담"
          break
      }

      // 게시물 필터링
      const filteredPosts = filterPosts(filter)
      setPosts(filteredPosts)

      // 좋아요 및 북마크 상태 로드
      const likeStatus: Record<string, boolean> = {}
      const bookmarkStatus: Record<string, boolean> = {}

      filteredPosts.forEach((post) => {
        likeStatus[post.id] = isLiked(currentUserId, post.id, "post")
        bookmarkStatus[post.id] = isBookmarked(currentUserId, post.id)
      })

      setLikedPosts(likeStatus)
      setBookmarkedPosts(bookmarkStatus)
    } catch (error) {
      console.error("게시물 로드 중 오류:", error)
      toast({
        title: "게시물 로드 실패",
        description: "게시물을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 검색 처리
  const handleSearch = () => {
    loadPosts()
  }

  // 검색어 입력 중 엔터키 처리
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // 검색어 초기화
  const clearSearch = () => {
    setSearchQuery("")
    loadPosts()
  }

  // 게시물 생성 완료
  const handlePostCreated = (post: Post) => {
    // 게시물 목록 새로고침
    loadPosts()

    // 모달 닫기
    setShowCreateModal(false)
  }

  // 게시물 클릭
  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
  }

  // 게시물 상세에서 뒤로가기
  const handleBackFromDetail = () => {
    setSelectedPostId(null)
  }

  // 게시물 삭제 후 처리
  const handlePostDeleted = () => {
    setSelectedPostId(null)
    loadPosts()
  }

  // 좋아요 토글
  const handleLikeToggle = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation() // 게시물 클릭 이벤트 전파 방지

    try {
      const isLiked = toggleLike(currentUserId, postId, "post")

      // 좋아요 상태 업데이트
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: isLiked,
      }))

      // 게시물 목록 새로고침
      loadPosts()
    } catch (error) {
      console.error("좋아요 토글 중 오류:", error)
      toast({
        title: "좋아요 실패",
        description: "좋아요를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 북마크 토글
  const handleBookmarkToggle = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation() // 게시물 클릭 이벤트 전파 방지

    try {
      const isBookmarked = toggleBookmark(currentUserId, postId)

      // 북마크 상태 업데이트
      setBookmarkedPosts((prev) => ({
        ...prev,
        [postId]: isBookmarked,
      }))
    } catch (error) {
      console.error("북마크 토글 중 오류:", error)
      toast({
        title: "저장 실패",
        description: "게시물 저장을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return "방금 전"
    if (diffMin < 60) return `${diffMin}분 전`
    if (diffHour < 24) return `${diffHour}시간 전`
    if (diffDay < 7) return `${diffDay}일 전`

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 게시물 상세 화면 표시
  if (selectedPostId) {
    return <PostDetailScreen postId={selectedPostId} onBack={handleBackFromDetail} onPostDeleted={handlePostDeleted} />
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="키워드, 상황, 감정으로 검색"
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                onClick={clearSearch}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <Filter size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>필터</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs">카테고리</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedCategory(undefined)}>전체</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("일상")}>일상</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("고민")}>고민</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("질문")}>질문</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("정보")}>정보</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("극복담")}>극복담</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("응원")}>응원</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("기타")}>기타</DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">정렬</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <DropdownMenuRadioItem value="recent">최신순</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popular">인기순</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="comments">댓글순</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="views">조회순</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              전체
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-1">
              인기
            </TabsTrigger>
            <TabsTrigger value="similar" className="flex-1">
              비슷한 상황
            </TabsTrigger>
            <TabsTrigger value="success" className="flex-1">
              극복담
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="divide-y">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>게시물을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 mb-4">게시물이 없습니다.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={16} className="mr-2" />새 게시물 작성하기
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4" onClick={() => handlePostClick(post.id)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarFallback className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white text-xs font-medium">
                      {post.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-medium">{post.authorName}</div>
                    {post.authorJob && (
                      <div className="text-xs text-slate-500">
                        {post.authorJob} • {post.authorLevel}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-400">{formatDate(post.createdAt)}</div>
              </div>

              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <Badge variant="outline" className="mr-2 text-xs">
                    {post.category}
                  </Badge>
                  <h3 className="font-medium">{post.title}</h3>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>
              </div>

              {/* 이미지 썸네일 표시 */}
              {post.images && post.images.length > 0 && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                  {post.images.map((image, index) => (
                    <div key={index} className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`게시물 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center text-sm text-slate-500">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => handleLikeToggle(post.id, e)}>
                  <Heart size={16} className={`mr-1 ${likedPosts[post.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                  {post.likeCount}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MessageSquare size={16} className="mr-1" />
                  {post.commentCount}
                </Button>
                {post.images && post.images.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ImageIcon size={16} className="mr-1" />
                    {post.images.length}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 ml-auto"
                  onClick={(e) => handleBookmarkToggle(post.id, e)}
                >
                  <Bookmark size={16} className={bookmarkedPosts[post.id] ? "fill-amber-500 text-amber-500" : ""} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 새 게시물 작성 버튼 */}
      <Button
        className="fixed bottom-20 right-4 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700"
        size="icon"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus size={24} />
      </Button>

      {/* 게시물 작성 모달 */}
      <PostCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
