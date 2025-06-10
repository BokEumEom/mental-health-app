"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Plus, ImageIcon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createPost, updatePost, getCurrentUser } from "@/utils/community-storage"
import {
  fileToBase64,
  resizeImage,
  validateImage,
  recommendQuality,
  formatFileSize,
  compareImageFormats,
  type ImageFormat,
} from "@/utils/image-utils"
import { ImageCompressionSettings } from "@/components/image-compression-settings"
import type { Post, PostCategory } from "@/types/community"
import { useToast } from "@/hooks/use-toast"

interface PostCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: (post: Post) => void
  editPost?: Post
}

interface ImageData {
  id: string
  data: string
  originalSize: number
  compressedSize: number
  width: number
  height: number
  quality: number
  format: ImageFormat
  file?: File
}

export function PostCreationModal({ isOpen, onClose, onPostCreated, editPost }: PostCreationModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<PostCategory>("고민")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [imageData, setImageData] = useState<ImageData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [compressionQuality, setCompressionQuality] = useState(0.8)
  const [useAutoCompression, setUseAutoCompression] = useState(true)
  const [targetSize, setTargetSize] = useState(200) // 기본 목표 크기 200KB
  const [imageFormat, setImageFormat] = useState<ImageFormat>("webp") // 기본 포맷은 WebP
  const [formatSavings, setFormatSavings] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 수정 모드일 경우 기존 데이터 로드
  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title)
      setContent(editPost.content)
      setCategory(editPost.category)
      setTags(editPost.tags)
      setIsAnonymous(true) // 익명 설정은 항상 기본값으로

      // 기존 이미지 데이터 로드
      if (editPost.images && editPost.images.length > 0) {
        const loadedImages = editPost.images.map((img, index) => ({
          id: `existing-${index}`,
          data: img,
          originalSize: 0, // 기존 이미지는 원본 크기 정보가 없음
          compressedSize: 0, // 기존 이미지는 압축 크기 정보가 없음
          width: 0,
          height: 0,
          quality: 0.8,
          format: "jpeg" as ImageFormat, // 기존 이미지는 포맷 정보가 없으므로 기본값 설정
        }))
        setImageData(loadedImages)
      } else {
        setImageData([])
      }
    } else {
      resetForm()
    }
  }, [editPost, isOpen])

  // 이미지 선택 시 포맷 비교 분석
  useEffect(() => {
    const compareFormats = async () => {
      if (selectedImageIndex === null) return

      const image = imageData[selectedImageIndex]
      if (!image) return

      try {
        const comparison = await compareImageFormats(image.data, compressionQuality)
        setFormatSavings(comparison.savingsPercent)
      } catch (error) {
        console.error("이미지 포맷 비교 중 오류:", error)
      }
    }

    compareFormats()
  }, [selectedImageIndex, imageData, compressionQuality])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCategory("고민")
    setTagInput("")
    setTags([])
    setIsAnonymous(true)
    setImageData([])
    setErrors({})
    setSelectedImageIndex(null)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요."
    } else if (title.length > 100) {
      newErrors.title = "제목은 100자 이내로 입력해주세요."
    }

    if (!content.trim()) {
      newErrors.content = "내용을 입력해주세요."
    }

    if (!category) {
      newErrors.category = "카테고리를 선택해주세요."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const currentUser = getCurrentUser()
      const userData = {
        authorId: currentUser,
        authorName: isAnonymous ? "익명의 직장인" : "사용자", // 실제 구현에서는 사용자 정보 사용
        authorJob: "IT기업", // 실제 구현에서는 사용자 정보 사용
        authorLevel: "사원급", // 실제 구현에서는 사용자 정보 사용
      }

      // 이미지 데이터만 추출
      const images = imageData.map((img) => img.data)

      let post: Post

      if (editPost) {
        // 게시물 수정
        const updatedPost = updatePost(editPost.id, {
          title,
          content,
          category,
          tags,
          images,
          updatedAt: Date.now(),
        })

        if (!updatedPost) {
          throw new Error("게시물 수정에 실패했습니다.")
        }

        post = updatedPost
      } else {
        // 새 게시물 작성
        post = createPost({
          title,
          content,
          category,
          tags,
          images,
          ...userData,
        })
      }

      onPostCreated(post)
      resetForm()
    } catch (error) {
      console.error("게시물 저장 중 오류:", error)
      toast({
        title: "게시물 저장 실패",
        description: "게시물을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return

    // 중복 태그 방지
    if (!tags.includes(trimmedTag)) {
      // 최대 5개 태그 제한
      if (tags.length < 5) {
        setTags([...tags, trimmedTag])
      }
    }

    setTagInput("")
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 최대 5개 이미지 제한
    if (imageData.length + files.length > 5) {
      toast({
        title: "이미지 개수 초과",
        description: "이미지는 최대 5개까지 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const newImages: ImageData[] = [...imageData]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 이미지 유효성 검사
        const validation = validateImage(file)
        if (!validation.valid) {
          toast({
            title: "이미지 업로드 실패",
            description: validation.message,
            variant: "destructive",
          })
          continue
        }

        // 이미지를 Base64로 변환
        const base64 = await fileToBase64(file)

        // 파일 크기에 따른 최적 품질 설정
        const recommendedQuality = recommendQuality(file.size / 1024)

        // 이미지 리사이징 및 압축
        const compressOptions = {
          ...(useAutoCompression ? { targetSize } : { quality: compressionQuality }),
          format: imageFormat,
        }

        const result = await resizeImage(base64, compressOptions)

        newImages.push({
          id: `upload-${Date.now()}-${i}`,
          data: result.data,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          width: result.width,
          height: result.height,
          quality: result.quality,
          format: result.format,
          file,
        })
      }

      setImageData(newImages)

      // 압축 결과 알림
      if (newImages.length > imageData.length) {
        const lastImage = newImages[newImages.length - 1]
        const compressionRate = Math.round(100 - (lastImage.compressedSize / lastImage.originalSize) * 100)

        if (compressionRate > 10) {
          toast({
            title: "이미지 압축 완료",
            description: `원본 ${formatFileSize(lastImage.originalSize * 1024)}에서 ${formatFileSize(lastImage.compressedSize * 1024)}로 ${compressionRate}% 압축되었습니다.`,
          })
        }
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error)
      toast({
        title: "이미지 업로드 실패",
        description: "이미지를 업로드하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageData(imageData.filter((_, i) => i !== index))
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null)
    }
  }

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleQualityChange = (quality: number) => {
    setCompressionQuality(quality)
  }

  const handleFormatChange = (format: ImageFormat) => {
    setImageFormat(format)
  }

  const handleAutoCompress = async () => {
    if (selectedImageIndex === null) return

    setIsCompressing(true)

    try {
      const image = imageData[selectedImageIndex]

      // 이미지 재압축
      const compressOptions = {
        ...(useAutoCompression ? { targetSize } : { quality: compressionQuality }),
        format: imageFormat,
      }

      const result = await resizeImage(image.data, compressOptions)

      // 이미지 데이터 업데이트
      const updatedImageData = [...imageData]
      updatedImageData[selectedImageIndex] = {
        ...image,
        data: result.data,
        compressedSize: result.compressedSize,
        quality: result.quality,
        format: result.format,
      }

      setImageData(updatedImageData)

      // 압축 결과 알림
      const compressionRate = Math.round(100 - (result.compressedSize / result.originalSize) * 100)
      toast({
        title: "이미지 압축 완료",
        description: `${result.format.toUpperCase()} 포맷으로 ${formatFileSize(result.originalSize * 1024)}에서 ${formatFileSize(result.compressedSize * 1024)}로 ${compressionRate}% 압축되었습니다.`,
      })
    } catch (error) {
      console.error("이미지 압축 중 오류:", error)
      toast({
        title: "이미지 압축 실패",
        description: "이미지를 압축하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPost ? "게시물 수정" : "새 게시물 작성"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as PostCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="일상">일상</SelectItem>
                <SelectItem value="고민">고민</SelectItem>
                <SelectItem value="질문">질문</SelectItem>
                <SelectItem value="정보">정보</SelectItem>
                <SelectItem value="극복담">극복담</SelectItem>
                <SelectItem value="응원">응원</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              className="min-h-[150px]"
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>이미지 첨부 (최대 5개)</Label>

              {selectedImageIndex !== null && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Info size={12} />
                        <span>이미지를 선택하여 압축 설정을 변경할 수 있습니다</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>이미지를 클릭하여 선택한 후 압축 설정을 조정할 수 있습니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* 이미지 미리보기 */}
              {imageData.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative w-20 h-20 rounded overflow-hidden border cursor-pointer ${
                    selectedImageIndex === index ? "ring-2 ring-teal-500" : ""
                  }`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img
                    src={image.data || "/placeholder.svg"}
                    alt={`첨부 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage(index)
                    }}
                    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-bl"
                  >
                    <X size={14} />
                  </button>

                  {/* 압축률 및 포맷 표시 */}
                  {image.originalSize > 0 && image.compressedSize > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center py-0.5">
                      {Math.round(100 - (image.compressedSize / image.originalSize) * 100)}% 압축
                      <Badge variant="outline" className="ml-1 text-[8px] py-0 px-1 border-white text-white">
                        {image.format.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}

              {/* 이미지 추가 버튼 */}
              {imageData.length < 5 && (
                <label
                  htmlFor="image-upload"
                  className="w-20 h-20 border border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-teal-500 rounded-full animate-spin"></div>
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </label>
              )}
            </div>

            {/* 이미지 압축 설정 */}
            {selectedImageIndex !== null && (
              <div className="flex justify-end mt-2">
                <ImageCompressionSettings
                  quality={compressionQuality}
                  onQualityChange={handleQualityChange}
                  onAutoCompress={handleAutoCompress}
                  fileSize={imageData[selectedImageIndex]?.originalSize * 1024}
                  compressedSize={imageData[selectedImageIndex]?.compressedSize * 1024}
                  isCompressing={isCompressing}
                  useAutoCompression={useAutoCompression}
                  onAutoCompressionChange={setUseAutoCompression}
                  targetSize={targetSize}
                  onTargetSizeChange={setTargetSize}
                  format={imageFormat}
                  onFormatChange={handleFormatChange}
                  formatSavings={formatSavings}
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">태그 (최대 5개)</Label>
            <div className="flex">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="태그를 입력하고 Enter 또는 추가 버튼을 누르세요"
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                <Plus size={16} />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full hover:bg-gray-200 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            <Label htmlFor="anonymous">익명으로 게시</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading || isCompressing}>
            {isSubmitting ? "저장 중..." : editPost ? "수정하기" : "게시하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
