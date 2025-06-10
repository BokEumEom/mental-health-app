"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CommentSection } from "@/components/comment-section"
import { PostCreationModal } from "@/components/post-creation-modal"
import { useToast } from "@/hooks/use-toast"
import {
  getPostById,
  incrementPostView,
  getCurrentUser,
  toggleLike,
  isLiked,
  toggleBookmark,
  isBookmarked,
  deletePost,
} from "@/utils/community-storage"
import type { Post } from "@/types/community"

type PostDetailScreenProps = {
  postId: string
  onBack: () => void
  onPostDeleted: () => void
}

export function PostDetailScreen({ postId, onBack, onPostDeleted }: PostDetailScreenProps) {
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLikedByUser, setIsLikedByUser] = useState(false)
  const [isBookmarkedByUser, setIsBookmarkedByUser] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const currentUserId = getCurrentUser()

  // 게시물 로드
  useEffect(() => {
    loadPost()

    // 조회수 증가
    incrementPostView(postId)
  }, [postId])

  const loadPost = () => {
    setIsLoading(true)
    try {
      const postData = getPostById(postId)
      setPost(postData)

      if (postData) {
        // 좋아요 상태 확인
        setIsLikedByUser(isLiked(currentUserId, postId, "post"))

        // 북마크 상태 확인
        setIsBookmarkedByUser(isBookmarked(currentUserId, postId))
      }
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

  // 좋아요 토글
  const handleLikeToggle = () => {
    if (!post) return

    try {
      const isLiked = toggleLike(currentUserId, postId, "post")
      setIsLikedByUser(isLiked)

      // 게시물 다시 로드하여 좋아요 수 업데이트
      loadPost()
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
  const handleBookmarkToggle = () => {
    if (!post) return

    try {
      const isBookmarked = toggleBookmark(currentUserId, postId)
      setIsBookmarkedByUser(isBookmarked)

      toast({
        title: isBookmarked ? "게시물을 저장했습니다" : "게시물 저장을 취소했습니다",
        variant: "default",
      })
    } catch (error) {
      console.error("북마크 토글 중 오류:", error)
      toast({
        title: "저장 실패",
        description: "게시물 저장을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 게시물 삭제
  const handleDeletePost = () => {
    setShowDeleteAlert(true)
  }

  // 게시물 삭제 확인
  const confirmDeletePost = () => {
    try {
      const success = deletePost(postId)

      if (success) {
        toast({
          title: "게시물이 삭제되었습니다",
          variant: "default",
        })

        // 삭제 후 목록으로 이동
        onPostDeleted()
      } else {
        toast({
          title: "게시물 삭제 실패",
          description: "게시물을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("게시물 삭제 중 오류:", error)
      toast({
        title: "게시물 삭제 실패",
        description: "게시물을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteAlert(false)
    }
  }

  // 게시물 수정
  const handleEditPost = () => {
    setShowEditModal(true)
  }

  // 게시물 수정 완료
  const handlePostUpdated = (updatedPost: Post) => {
    setPost(updatedPost)
    setShowEditModal(false)

    toast({
      title: "게시물이 수정되었습니다",
      variant: "default",
    })
  }

  // 댓글 수 업데이트
  const handleCommentCountChange = (count: number) => {
    if (post) {
      setPost({
        ...post,
        commentCount: count,
      })
    }
  }

  // 이미지 클릭 처리
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  // 이미지 모달 닫기
  const handleCloseImageModal = () => {
    setSelectedImageIndex(null)
  }

  // 이미지 모달에서 이전/다음 이미지 보기
  const handlePrevImage = () => {
    if (selectedImageIndex === null || !post?.images) return
    setSelectedImageIndex((selectedImageIndex - 1 + post.images.length) % post.images.length)
  }

  const handleNextImage = () => {
    if (selectedImageIndex === null || !post?.images) return
    setSelectedImageIndex((selectedImageIndex + 1) % post.images.length)
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

  // 공유하기
  const handleShare = () => {
    // 실제 구현에서는 공유 기능 추가
    toast({
      title: "공유 링크가 복사되었습니다",
      variant: "default",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col pb-20">
        <div className="p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
        </div>
        <div className="p-4 flex justify-center items-center h-[50vh]">
          <p>게시물을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col pb-20">
        <div className="p-4 border-b">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
        </div>
        <div className="p-4 flex flex-col justify-center items-center h-[50vh]">
          <p className="text-lg font-medium mb-2">게시물을 찾을 수 없습니다</p>
          <p className="text-slate-500 mb-4">삭제되었거나 존재하지 않는 게시물입니다.</p>
          <Button onClick={onBack}>목록으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-medium ml-2">게시물</h2>
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            {/* 게시물 헤더 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-teal-100 text-teal-800">{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{post.authorName}</div>
                  {post.authorJob && (
                    <div className="text-xs text-slate-500">
                      {post.authorJob} • {post.authorLevel}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="text-xs text-slate-500 mr-2">{formatDate(post.createdAt)}</div>

                {post.authorId === currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEditPost}>
                        <Edit size={16} className="mr-2" />
                        수정하기
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500" onClick={handleDeletePost}>
                        <Trash2 size={16} className="mr-2" />
                        삭제하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* 게시물 카테고리 및 제목 */}
            <div className="mb-4">
              <Badge className="mb-2">{post.category}</Badge>
              <h1 className="text-xl font-bold">{post.title}</h1>
            </div>

            {/* 게시물 내용 */}
            <div className="mb-6">
              <p className="whitespace-pre-line">{post.content}</p>
            </div>

            {/* 이미지 갤러리 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`게시물 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* 게시물 정보 */}
            <div className="flex items-center text-sm text-slate-500 mb-4">
              <div className="flex items-center mr-4">
                <Heart size={16} className="mr-1" />
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center mr-4">
                <MessageSquare size={16} className="mr-1" />
                <span>{post.commentCount}</span>
              </div>
              <div className="flex items-center">
                <span>조회 {post.viewCount}</span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex border-t border-b py-2 mb-6">
              <Button variant="ghost" className="flex-1" onClick={handleLikeToggle}>
                <Heart size={18} className={`mr-2 ${isLikedByUser ? "fill-rose-500 text-rose-500" : ""}`} />
                좋아요
              </Button>
              <Button variant="ghost" className="flex-1" onClick={handleBookmarkToggle}>
                <Bookmark size={18} className={`mr-2 ${isBookmarkedByUser ? "fill-amber-500 text-amber-500" : ""}`} />
                저장
              </Button>
              <Button variant="ghost" className="flex-1" onClick={handleShare}>
                <Share2 size={18} className="mr-2" />
                공유
              </Button>
            </div>

            {/* 댓글 섹션 */}
            <CommentSection postId={post.id} onCommentCountChange={handleCommentCountChange} />
          </CardContent>
        </Card>
      </div>

      {/* 게시물 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 게시물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 댓글도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePost} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 게시물 수정 모달 */}
      {post && (
        <PostCreationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onPostCreated={handlePostUpdated}
          editPost={post}
        />
      )}

      {/* 이미지 확대 모달 */}
      {selectedImageIndex !== null && post.images && (
        <Dialog open={selectedImageIndex !== null} onOpenChange={handleCloseImageModal}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="absolute top-0 right-0 z-10">
              <DialogTitle className="sr-only">이미지 보기</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[80vh] bg-black flex items-center justify-center">
              <img
                src={post.images[selectedImageIndex] || "/placeholder.svg"}
                alt={`게시물 이미지 ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={handlePrevImage}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={handleNextImage}
              >
                <ChevronLeft size={24} className="rotate-180" />
              </Button>
            </div>
            <div className="p-4 text-center text-sm text-slate-500">
              {selectedImageIndex + 1} / {post.images.length}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
