"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Heart, Reply, Edit, Trash2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
  getCurrentUser,
  toggleLike,
  isLiked,
} from "@/utils/community-storage"
import type { Comment } from "@/types/community"

interface CommentSectionProps {
  postId: string
  onCommentCountChange?: (count: number) => void
}

export function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState("")
  const [editText, setEditText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const currentUserId = getCurrentUser()

  // 댓글 로드
  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = () => {
    try {
      const allComments = getCommentsByPostId(postId)

      // 좋아요 상태 로드
      const likeStatus: Record<string, boolean> = {}
      allComments.forEach((comment) => {
        likeStatus[comment.id] = isLiked(currentUserId, comment.id, "comment")
      })
      setLikedComments(likeStatus)

      // 댓글 구조화 (부모 댓글과 답글)
      const parentComments = allComments.filter((comment) => !comment.parentId)
      const childComments = allComments.filter((comment) => comment.parentId)

      // 부모 댓글에 답글 추가
      const structuredComments = parentComments.map((parent) => {
        const replies = childComments.filter((child) => child.parentId === parent.id)
        return {
          ...parent,
          replies: replies.sort((a, b) => a.createdAt - b.createdAt),
        }
      })

      // 최신순 정렬
      structuredComments.sort((a, b) => b.createdAt - a.createdAt)

      setComments(structuredComments)

      // 댓글 수 업데이트
      if (onCommentCountChange) {
        onCommentCountChange(allComments.length)
      }
    } catch (error) {
      console.error("댓글 로드 중 오류:", error)
      toast({
        title: "댓글 로드 실패",
        description: "댓글을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 댓글 작성
  const handleSubmitComment = () => {
    if (!commentText.trim()) return

    setIsSubmitting(true)

    try {
      createComment({
        postId,
        content: commentText,
        authorId: currentUserId,
        authorName: "익명의 직장인", // 실제 구현에서는 사용자 정보 사용
        authorJob: "IT기업", // 실제 구현에서는 사용자 정보 사용
        authorLevel: "사원급", // 실제 구현에서는 사용자 정보 사용
      })

      setCommentText("")
      loadComments()

      toast({
        title: "댓글이 작성되었습니다",
        variant: "default",
      })
    } catch (error) {
      console.error("댓글 작성 중 오류:", error)
      toast({
        title: "댓글 작성 실패",
        description: "댓글을 작성하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 답글 작성
  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return

    setIsSubmitting(true)

    try {
      createComment({
        postId,
        content: replyText,
        authorId: currentUserId,
        authorName: "익명의 직장인", // 실제 구현에서는 사용자 정보 사용
        authorJob: "IT기업", // 실제 구현에서는 사용자 정보 사용
        authorLevel: "사원급", // 실제 구현에서는 사용자 정보 사용
        parentId,
      })

      setReplyText("")
      setReplyingTo(null)
      loadComments()

      toast({
        title: "답글이 작성되었습니다",
        variant: "default",
      })
    } catch (error) {
      console.error("답글 작성 중 오류:", error)
      toast({
        title: "답글 작성 실패",
        description: "답글을 작성하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 댓글 수정
  const handleUpdateComment = (commentId: string) => {
    if (!editText.trim()) return

    try {
      updateComment(commentId, {
        content: editText,
      })

      setEditingId(null)
      setEditText("")
      loadComments()

      toast({
        title: "댓글이 수정되었습니다",
        variant: "default",
      })
    } catch (error) {
      console.error("댓글 수정 중 오류:", error)
      toast({
        title: "댓글 수정 실패",
        description: "댓글을 수정하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 댓글 삭제
  const handleDeleteComment = () => {
    if (!deletingId) return

    try {
      deleteComment(deletingId)

      setDeletingId(null)
      loadComments()

      toast({
        title: "댓글이 삭제되었습니다",
        variant: "default",
      })
    } catch (error) {
      console.error("댓글 삭제 중 오류:", error)
      toast({
        title: "댓글 삭제 실패",
        description: "댓글을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 좋아요 토글
  const handleLikeToggle = (commentId: string) => {
    try {
      const isLiked = toggleLike(currentUserId, commentId, "comment")

      // 좋아요 상태 업데이트
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: isLiked,
      }))

      // 댓글 목록 새로고침
      loadComments()
    } catch (error) {
      console.error("좋아요 토글 중 오류:", error)
      toast({
        title: "좋아요 실패",
        description: "좋아요를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
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

  // 댓글 렌더링
  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingId === comment.id
    const isReplying = replyingTo === comment.id
    const isAuthor = comment.authorId === currentUserId

    return (
      <div key={comment.id} className={`${isReply ? "ml-8 mt-2" : "mt-4"}`}>
        <div className="flex">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-teal-100 text-teal-800">{comment.authorName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{comment.authorName}</div>
                  {comment.authorJob && (
                    <div className="text-xs text-slate-500">
                      {comment.authorJob} • {comment.authorLevel}
                    </div>
                  )}
                </div>

                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditText(comment.content)
                        }}
                      >
                        <Edit size={16} className="mr-2" />
                        수정하기
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500" onClick={() => setDeletingId(comment.id)}>
                        <Trash2 size={16} className="mr-2" />
                        삭제하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="댓글을 수정하세요"
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                      수정
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm mt-1">{comment.content}</p>
              )}
            </div>

            <div className="flex items-center text-xs text-slate-500 mt-1">
              <span className="mr-3">{formatDate(comment.createdAt)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleLikeToggle(comment.id)}
              >
                <Heart size={14} className={`mr-1 ${likedComments[comment.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                {comment.likeCount > 0 && comment.likeCount}
              </Button>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                >
                  <Reply size={14} className="mr-1" />
                  답글
                </Button>
              )}
            </div>

            {isReplying && (
              <div className="mt-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="답글을 작성하세요"
                  className="min-h-[80px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={isSubmitting}>
                    {isSubmitting ? "작성 중..." : "답글 작성"}
                  </Button>
                </div>
              </div>
            )}

            {/* 답글 렌더링 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">{comment.replies.map((reply) => renderComment(reply, true))}</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-medium mb-4">댓글 {comments.length > 0 ? `${comments.length}개` : ""}</h3>

      {/* 댓글 작성 폼 */}
      <div className="mb-6">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글을 작성하세요"
          className="min-h-[100px]"
        />
        <div className="flex justify-end mt-2">
          <Button onClick={handleSubmitComment} disabled={!commentText.trim() || isSubmitting}>
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </Button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div>
        {comments.length === 0 ? (
          <p className="text-center text-slate-500 py-4">첫 번째 댓글을 작성해보세요!</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* 댓글 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 댓글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
