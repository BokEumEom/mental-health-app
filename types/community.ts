export type PostCategory = "일상" | "고민" | "질문" | "정보" | "극복담" | "응원" | "기타"

export interface Post {
  id: string
  title: string
  content: string
  category: PostCategory
  tags: string[]
  authorId: string
  authorName: string
  authorJob?: string
  authorLevel?: string
  createdAt: number
  updatedAt: number
  likeCount: number
  commentCount: number
  viewCount: number
  images?: string[] // 이미지 URL 배열 추가
}

export interface Comment {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  authorJob?: string
  authorLevel?: string
  createdAt: number
  updatedAt: number
  likeCount: number
  parentId?: string
  replies?: Comment[]
}

export interface Like {
  id: string
  userId: string
  targetId: string
  targetType: "post" | "comment"
  createdAt: number
}

export interface Bookmark {
  id: string
  userId: string
  postId: string
  createdAt: number
}

export interface PostFilter {
  category?: PostCategory
  searchQuery?: string
  sortBy?: "recent" | "popular" | "comments" | "views"
  authorId?: string
  tags?: string[]
}
