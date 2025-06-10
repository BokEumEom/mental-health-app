import { v4 as uuidv4 } from "uuid"
import type { Post, Comment, Like, Bookmark, PostFilter, PostCategory } from "@/types/community"

// 로컬 스토리지 키
const POSTS_KEY = "workplace_emotion_app_posts"
const COMMENTS_KEY = "workplace_emotion_app_comments"
const LIKES_KEY = "workplace_emotion_app_likes"
const BOOKMARKS_KEY = "workplace_emotion_app_bookmarks"
const CURRENT_USER_KEY = "workplace_emotion_app_current_user"

// 현재 사용자 ID 가져오기 (실제 인증 시스템 구현 전까지 임시로 사용)
export const getCurrentUser = (): string => {
  if (typeof window === "undefined") return "anonymous"

  let userId = localStorage.getItem(CURRENT_USER_KEY)

  if (!userId) {
    userId = uuidv4()
    localStorage.setItem(CURRENT_USER_KEY, userId)
  }

  return userId
}

// 샘플 데이터 생성
const generateSamplePosts = (): Post[] => {
  const categories: PostCategory[] = ["일상", "고민", "질문", "정보", "극복담", "응원", "기타"]
  const titles = [
    "모호한 업무 지시에 책임만 떠안게 됐어요",
    "팀원과의 갈등, 어떻게 해결해야 할까요?",
    "업무 스트레스 해소법 공유합니다",
    "퇴사를 고민 중인데 조언 부탁드려요",
    "상사의 부당한 요구, 어떻게 대처해야 할까요?",
    "번아웃을 극복한 경험을 나눕니다",
    "재택근무 효율적으로 하는 팁",
    "직장 내 인간관계 개선 방법",
    "업무 효율을 높이는 방법들",
    "이직 준비, 어떻게 시작해야 할까요?",
  ]

  const contents = [
    '상사가 "적당히 알아서 해봐"라고 지시한 후, 결과물이 마음에 안 든다며 책임을 떠넘기는 상황이 반복돼요. 어떻게 대처해야 할까요?',
    "함께 일하는 팀원과 업무 방식 차이로 자주 충돌하게 됩니다. 대화를 시도해봤지만 개선되지 않아요. 어떻게 해결하는 것이 좋을까요?",
    "업무 스트레스가 심할 때 저만의 해소법을 공유합니다. 퇴근 후 30분 산책, 주말 취미활동, 명상 등이 큰 도움이 되었어요.",
    "현재 회사에서 성장 가능성이 보이지 않아 퇴사를 고민 중입니다. 경력 2년 차인데, 이직이 좋을지 더 경력을 쌓아야 할지 조언 부탁드려요.",
    "상사가 업무 시간 외 연락과 과도한 업무량을 요구합니다. 거절하기도 어려운 상황인데, 어떻게 대처하는 것이 좋을까요?",
    "6개월 전 심한 번아웃으로 휴직까지 고민했었는데, 이를 극복한 경험을 공유합니다. 가장 중요한 것은 자기 자신을 돌보는 시간을 확보하는 것이었어요.",
    "재택근무 1년 차입니다. 처음에는 집중하기 어려웠지만, 업무 공간 분리, 시간 관리, 규칙적인 휴식 등으로 효율을 높일 수 있었어요.",
    "직장에서 인간관계로 스트레스 받는 분들께 도움이 될 만한 방법들을 공유합니다. 경계 설정의 중요성을 깨달았어요.",
    "업무 효율을 높이기 위해 시도해본 방법들입니다. 뽀모도로 기법, 업무 시간 블록화, 투두리스트 작성 등이 큰 도움이 되었어요.",
    "현재 회사에서 2년 정도 일했고, 이직을 준비하려고 합니다. 포트폴리오 준비, 이력서 작성 등 어떻게 시작해야 할지 조언 부탁드려요.",
  ]

  const tags = [
    ["업무갈등", "책임", "상사"],
    ["팀워크", "갈등", "의사소통"],
    ["스트레스", "자기관리", "힐링"],
    ["퇴사", "이직", "커리어"],
    ["직장생활", "상사", "스트레스"],
    ["번아웃", "회복", "자기관리"],
    ["재택근무", "업무효율", "팁"],
    ["인간관계", "직장생활", "소통"],
    ["생산성", "업무효율", "시간관리"],
    ["이직", "커리어", "자기개발"],
  ]

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  return Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    title: titles[i],
    content: contents[i],
    category: categories[i % categories.length],
    tags: tags[i],
    authorId: `user_${i + 1}`,
    authorName: `익명의 직장인 ${i + 1}`,
    authorJob: ["IT기업", "금융업", "서비스업", "제조업", "공기업"][i % 5],
    authorLevel: ["사원급", "대리급", "과장급", "차장급", "부장급"][i % 5],
    createdAt: now - i * day,
    updatedAt: now - i * day,
    likeCount: Math.floor(Math.random() * 50),
    commentCount: Math.floor(Math.random() * 20),
    viewCount: Math.floor(Math.random() * 100) + 50,
  }))
}

// 샘플 댓글 생성
const generateSampleComments = (posts: Post[]): Comment[] => {
  const comments: Comment[] = []
  const commentContents = [
    "공감합니다. 저도 비슷한 경험이 있어요.",
    "이런 상황에서는 명확한 업무 범위를 문서화하는 것이 도움이 될 수 있어요.",
    "정말 힘드셨겠네요. 응원합니다!",
    "저는 이런 방식으로 해결했어요. 참고가 되길 바랍니다.",
    "좋은 정보 감사합니다. 많은 도움이 되었어요.",
    "질문이 있는데요, 구체적으로 어떤 방법을 사용하셨나요?",
    "저도 비슷한 고민을 하고 있어요. 좋은 글 감사합니다.",
    "정말 유용한 팁이네요. 바로 적용해봐야겠어요.",
    "이 부분에 대해 더 자세히 알려주실 수 있나요?",
    "경험을 공유해주셔서 감사합니다. 큰 도움이 되었어요.",
  ]

  posts.forEach((post) => {
    const commentCount = Math.floor(Math.random() * 5) + 1

    for (let i = 0; i < commentCount; i++) {
      const commentId = uuidv4()
      const comment: Comment = {
        id: commentId,
        postId: post.id,
        content: commentContents[Math.floor(Math.random() * commentContents.length)],
        authorId: `user_${Math.floor(Math.random() * 10) + 1}`,
        authorName: `익명의 직장인 ${Math.floor(Math.random() * 20) + 1}`,
        authorJob: ["IT기업", "금융업", "서비스업", "제조업", "공기업"][Math.floor(Math.random() * 5)],
        authorLevel: ["사원급", "대리급", "과장급", "차장급", "부장급"][Math.floor(Math.random() * 5)],
        createdAt: post.createdAt + Math.floor(Math.random() * 86400000),
        updatedAt: post.createdAt + Math.floor(Math.random() * 86400000),
        likeCount: Math.floor(Math.random() * 10),
      }

      comments.push(comment)

      // 답글 추가
      if (Math.random() > 0.5) {
        const replyCount = Math.floor(Math.random() * 3) + 1

        for (let j = 0; j < replyCount; j++) {
          comments.push({
            id: uuidv4(),
            postId: post.id,
            content: `@${comment.authorName} ${commentContents[Math.floor(Math.random() * commentContents.length)]}`,
            authorId: `user_${Math.floor(Math.random() * 10) + 1}`,
            authorName: `익명의 직장인 ${Math.floor(Math.random() * 20) + 1}`,
            authorJob: ["IT기업", "금융업", "서비스업", "제조업", "공기업"][Math.floor(Math.random() * 5)],
            authorLevel: ["사원급", "대리급", "과장급", "차장급", "부장급"][Math.floor(Math.random() * 5)],
            createdAt: comment.createdAt + Math.floor(Math.random() * 86400000),
            updatedAt: comment.createdAt + Math.floor(Math.random() * 86400000),
            likeCount: Math.floor(Math.random() * 5),
            parentId: commentId,
          })
        }
      }
    }
  })

  return comments
}

// 커뮤니티 데이터 초기화
export const initializeCommunityData = (): void => {
  if (typeof window === "undefined") return

  // 이미 데이터가 있는지 확인
  const existingPosts = localStorage.getItem(POSTS_KEY)

  if (!existingPosts) {
    // 샘플 데이터 생성
    const posts = generateSamplePosts()
    const comments = generateSampleComments(posts)

    // 댓글 수 업데이트
    posts.forEach((post) => {
      post.commentCount = comments.filter((comment) => comment.postId === post.id).length
    })

    // 로컬 스토리지에 저장
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
    localStorage.setItem(LIKES_KEY, JSON.stringify([]))
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]))
  }
}

// 게시물 관련 함수
export const getAllPosts = (): Post[] => {
  if (typeof window === "undefined") return []

  const postsJson = localStorage.getItem(POSTS_KEY)
  return postsJson ? JSON.parse(postsJson) : []
}

export const getPostById = (id: string): Post | null => {
  const posts = getAllPosts()
  return posts.find((post) => post.id === id) || null
}

export const createPost = (
  postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "likeCount" | "commentCount" | "viewCount">,
): Post => {
  const posts = getAllPosts()

  const newPost: Post = {
    ...postData,
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  }

  posts.unshift(newPost)
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

  return newPost
}

export const updatePost = (id: string, postData: Partial<Post>): Post | null => {
  const posts = getAllPosts()
  const postIndex = posts.findIndex((post) => post.id === id)

  if (postIndex === -1) return null

  const updatedPost = {
    ...posts[postIndex],
    ...postData,
    updatedAt: Date.now(),
  }

  posts[postIndex] = updatedPost
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

  return updatedPost
}

export const deletePost = (id: string): boolean => {
  const posts = getAllPosts()
  const filteredPosts = posts.filter((post) => post.id !== id)

  if (filteredPosts.length === posts.length) return false

  localStorage.setItem(POSTS_KEY, JSON.stringify(filteredPosts))

  // 관련 댓글 삭제
  const comments = getAllComments()
  const filteredComments = comments.filter((comment) => comment.postId !== id)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filteredComments))

  // 관련 좋아요 삭제
  const likes = getAllLikes()
  const filteredLikes = likes.filter((like) => !(like.targetType === "post" && like.targetId === id))
  localStorage.setItem(LIKES_KEY, JSON.stringify(filteredLikes))

  // 관련 북마크 삭제
  const bookmarks = getAllBookmarks()
  const filteredBookmarks = bookmarks.filter((bookmark) => bookmark.postId !== id)
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks))

  return true
}

export const incrementPostView = (id: string): void => {
  const posts = getAllPosts()
  const postIndex = posts.findIndex((post) => post.id === id)

  if (postIndex !== -1) {
    posts[postIndex].viewCount += 1
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  }
}

export const filterPosts = (filter: PostFilter): Post[] => {
  let posts = getAllPosts()

  // 카테고리 필터링
  if (filter.category) {
    posts = posts.filter((post) => post.category === filter.category)
  }

  // 작성자 필터링
  if (filter.authorId) {
    posts = posts.filter((post) => post.authorId === filter.authorId)
  }

  // 태그 필터링
  if (filter.tags && filter.tags.length > 0) {
    posts = posts.filter((post) => filter.tags!.some((tag) => post.tags.includes(tag)))
  }

  // 검색어 필터링
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase()
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // 정렬
  if (filter.sortBy) {
    switch (filter.sortBy) {
      case "recent":
        posts.sort((a, b) => b.createdAt - a.createdAt)
        break
      case "popular":
        posts.sort((a, b) => b.likeCount - a.likeCount)
        break
      case "comments":
        posts.sort((a, b) => b.commentCount - a.commentCount)
        break
      case "views":
        posts.sort((a, b) => b.viewCount - a.viewCount)
        break
    }
  } else {
    // 기본 정렬: 최신순
    posts.sort((a, b) => b.createdAt - a.createdAt)
  }

  return posts
}

// 댓글 관련 함수
export const getAllComments = (): Comment[] => {
  if (typeof window === "undefined") return []

  const commentsJson = localStorage.getItem(COMMENTS_KEY)
  return commentsJson ? JSON.parse(commentsJson) : []
}

export const getCommentsByPostId = (postId: string): Comment[] => {
  const comments = getAllComments()
  return comments.filter((comment) => comment.postId === postId)
}

export const createComment = (commentData: Omit<Comment, "id" | "createdAt" | "updatedAt" | "likeCount">): Comment => {
  const comments = getAllComments()

  const newComment: Comment = {
    ...commentData,
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    likeCount: 0,
  }

  comments.push(newComment)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))

  // 게시물의 댓글 수 증가
  const posts = getAllPosts()
  const postIndex = posts.findIndex((post) => post.id === commentData.postId)

  if (postIndex !== -1) {
    posts[postIndex].commentCount += 1
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  }

  return newComment
}

export const updateComment = (id: string, commentData: Partial<Comment>): Comment | null => {
  const comments = getAllComments()
  const commentIndex = comments.findIndex((comment) => comment.id === id)

  if (commentIndex === -1) return null

  const updatedComment = {
    ...comments[commentIndex],
    ...commentData,
    updatedAt: Date.now(),
  }

  comments[commentIndex] = updatedComment
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))

  return updatedComment
}

export const deleteComment = (id: string): boolean => {
  const comments = getAllComments()
  const comment = comments.find((c) => c.id === id)

  if (!comment) return false

  // 답글도 함께 삭제
  const filteredComments = comments.filter((c) => c.id !== id && c.parentId !== id)

  // 삭제된 댓글 수 계산 (본 댓글 + 답글)
  const deletedCount = comments.length - filteredComments.length

  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filteredComments))

  // 게시물의 댓글 수 감소
  const posts = getAllPosts()
  const postIndex = posts.findIndex((post) => post.id === comment.postId)

  if (postIndex !== -1) {
    posts[postIndex].commentCount -= deletedCount
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  }

  // 관련 좋아요 삭제
  const likes = getAllLikes()
  const filteredLikes = likes.filter(
    (like) =>
      !(
        like.targetType === "comment" &&
        (like.targetId === id || comments.some((c) => c.parentId === id && c.id === like.targetId))
      ),
  )
  localStorage.setItem(LIKES_KEY, JSON.stringify(filteredLikes))

  return true
}

// 좋아요 관련 함수
export const getAllLikes = (): Like[] => {
  if (typeof window === "undefined") return []

  const likesJson = localStorage.getItem(LIKES_KEY)
  return likesJson ? JSON.parse(likesJson) : []
}

export const isLiked = (userId: string, targetId: string, targetType: "post" | "comment"): boolean => {
  const likes = getAllLikes()
  return likes.some((like) => like.userId === userId && like.targetId === targetId && like.targetType === targetType)
}

export const toggleLike = (userId: string, targetId: string, targetType: "post" | "comment"): boolean => {
  const likes = getAllLikes()
  const existingLikeIndex = likes.findIndex(
    (like) => like.userId === userId && like.targetId === targetId && like.targetType === targetType,
  )

  let isLiked = false

  if (existingLikeIndex === -1) {
    // 좋아요 추가
    likes.push({
      id: uuidv4(),
      userId,
      targetId,
      targetType,
      createdAt: Date.now(),
    })
    isLiked = true
  } else {
    // 좋아요 취소
    likes.splice(existingLikeIndex, 1)
    isLiked = false
  }

  localStorage.setItem(LIKES_KEY, JSON.stringify(likes))

  // 게시물/댓글의 좋아요 수 업데이트
  if (targetType === "post") {
    const posts = getAllPosts()
    const postIndex = posts.findIndex((post) => post.id === targetId)

    if (postIndex !== -1) {
      const likeCount = likes.filter((like) => like.targetType === "post" && like.targetId === targetId).length
      posts[postIndex].likeCount = likeCount
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
    }
  } else {
    const comments = getAllComments()
    const commentIndex = comments.findIndex((comment) => comment.id === targetId)

    if (commentIndex !== -1) {
      const likeCount = likes.filter((like) => like.targetType === "comment" && like.targetId === targetId).length
      comments[commentIndex].likeCount = likeCount
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
    }
  }

  return isLiked
}

// 북마크 관련 함수
export const getAllBookmarks = (): Bookmark[] => {
  if (typeof window === "undefined") return []

  const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY)
  return bookmarksJson ? JSON.parse(bookmarksJson) : []
}

export const isBookmarked = (userId: string, postId: string): boolean => {
  const bookmarks = getAllBookmarks()
  return bookmarks.some((bookmark) => bookmark.userId === userId && bookmark.postId === postId)
}

export const toggleBookmark = (userId: string, postId: string): boolean => {
  const bookmarks = getAllBookmarks()
  const existingBookmarkIndex = bookmarks.findIndex(
    (bookmark) => bookmark.userId === userId && bookmark.postId === postId,
  )

  let isBookmarked = false

  if (existingBookmarkIndex === -1) {
    // 북마크 추가
    bookmarks.push({
      id: uuidv4(),
      userId,
      postId,
      createdAt: Date.now(),
    })
    isBookmarked = true
  } else {
    // 북마크 취소
    bookmarks.splice(existingBookmarkIndex, 1)
    isBookmarked = false
  }

  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))

  return isBookmarked
}

export const getBookmarkedPosts = (userId: string): Post[] => {
  const bookmarks = getAllBookmarks()
  const userBookmarks = bookmarks.filter((bookmark) => bookmark.userId === userId)

  const posts = getAllPosts()
  return posts.filter((post) => userBookmarks.some((bookmark) => bookmark.postId === post.id))
}
