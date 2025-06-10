"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Search, MessageSquare, Heart, Eye, Bookmark, Calendar } from "lucide-react"
import { getBookmarkedPosts, getCurrentUser } from "@/utils/community-storage"
import type { Post } from "@/types/community"
import { useToast } from "@/hooks/use-toast"

export function SavedPostsScreen({ onBack, onViewPost }: { onBack: () => void; onViewPost: (postId: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // 저장한 글 로드
  useEffect(() => {
    loadSavedPosts()
  }, [])

  const loadSavedPosts = () => {
    setIsLoading(true)
    try {
      const userId = getCurrentUser()
      const savedPosts = getBookmarkedPosts(userId)
      setPosts(savedPosts)
    } catch (error) {
      console.error("저장한 글 로드 중 오류:", error)
      toast({
        title: "저장한 글 로드 실패",
        description: "저장한 글을 불러오는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 필터링된 게시물
  const filteredPosts = posts.filter((post) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }
    return true
  })

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-medium ml-2">저장한 글</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="저장한 글 검색..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>저장한 글을 불러오는 중...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40">
            <p className="text-slate-500 mb-2">저장한 글이 없습니다.</p>
            <Button variant="outline" size="sm" onClick={onBack}>
              커뮤니티로 이동하기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewPost(post.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <h3 className="font-medium text-lg mb-2">{post.title}</h3>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{post.content}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <MessageSquare size={12} className="mr-1" />
                        <span>{post.commentCount}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart size={12} className="mr-1" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        <span>{post.viewCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Bookmark size={12} className="mr-1 fill-current text-teal-500" />
                      <span className="text-teal-500">저장됨</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
