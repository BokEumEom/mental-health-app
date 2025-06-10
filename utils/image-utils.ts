/**
 * 이미지 파일을 Base64 문자열로 변환
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Base64 이미지의 대략적인 크기 계산 (KB 단위)
 */
export const calculateBase64Size = (base64: string): number => {
  // Base64 문자열에서 헤더 부분 제거
  const base64Data = base64.split(",")[1] || base64
  // Base64 인코딩은 원본 데이터보다 약 33% 더 큼
  // 4/3은 Base64 인코딩의 오버헤드 비율
  return Math.round((base64Data.length * 3) / 4 / 1024)
}

/**
 * 브라우저의 WebP 지원 여부 확인
 */
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.width > 0 && img.height > 0)
    img.onerror = () => resolve(false)
    img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="
  })
}

// WebP 지원 여부를 캐시
let webpSupportCache: boolean | null = null

/**
 * 브라우저의 WebP 지원 여부를 확인하고 결과를 캐시
 */
export const isWebPSupported = async (): Promise<boolean> => {
  if (webpSupportCache === null) {
    webpSupportCache = await checkWebPSupport()
  }
  return webpSupportCache
}

/**
 * 이미지 포맷 타입
 */
export type ImageFormat = "jpeg" | "webp"

/**
 * 이미지 압축 옵션
 */
export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  targetSize?: number
  format?: ImageFormat
}

/**
 * 이미지 압축 결과
 */
export interface ImageCompressionResult {
  data: string
  originalSize: number
  compressedSize: number
  width: number
  height: number
  quality: number
  format: ImageFormat
}

/**
 * 이미지 크기 조정 (리사이징) 및 압축
 */
export const resizeImage = async (
  base64: string,
  options: ImageCompressionOptions = {},
): Promise<ImageCompressionResult> => {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8, targetSize, format = "jpeg" } = options

  // 원본 이미지 크기 계산
  const originalSize = calculateBase64Size(base64)

  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64
    img.onload = async () => {
      let width = img.width
      let height = img.height
      let finalQuality = quality
      let finalFormat = format

      // WebP가 지원되지 않는 경우 JPEG로 대체
      if (format === "webp" && !(await isWebPSupported())) {
        finalFormat = "jpeg"
      }

      // 이미지 크기 조정
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0, width, height)

      // 목표 크기가 지정된 경우 자동 품질 조정
      if (targetSize) {
        let currentQuality = quality
        let currentSize = 0
        let compressedData = ""

        // 이진 검색을 사용하여 목표 크기에 가장 가까운 품질 찾기
        let minQuality = 0.1
        let maxQuality = 1.0

        for (let i = 0; i < 5; i++) {
          // 최대 5번 시도
          currentQuality = (minQuality + maxQuality) / 2
          compressedData = canvas.toDataURL(`image/${finalFormat}`, currentQuality)
          currentSize = calculateBase64Size(compressedData)

          if (Math.abs(currentSize - targetSize) < targetSize * 0.1) {
            // 목표 크기의 10% 이내면 충분히 가까운 것으로 간주
            break
          }

          if (currentSize > targetSize) {
            maxQuality = currentQuality
          } else {
            minQuality = currentQuality
          }
        }

        finalQuality = currentQuality
        const compressedSize = calculateBase64Size(compressedData)

        resolve({
          data: compressedData,
          originalSize,
          compressedSize,
          width,
          height,
          quality: finalQuality,
          format: finalFormat,
        })
      } else {
        // 일반 압축
        const compressedData = canvas.toDataURL(`image/${finalFormat}`, finalQuality)
        const compressedSize = calculateBase64Size(compressedData)

        resolve({
          data: compressedData,
          originalSize,
          compressedSize,
          width,
          height,
          quality: finalQuality,
          format: finalFormat,
        })
      }
    }
  })
}

/**
 * 이미지 파일 유효성 검사
 */
export const validateImage = (file: File): { valid: boolean; message?: string } => {
  // 파일 타입 검사
  if (!file.type.startsWith("image/")) {
    return { valid: false, message: "이미지 파일만 업로드 가능합니다." }
  }

  // 파일 크기 검사 (10MB 제한)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, message: "이미지 크기는 10MB 이하여야 합니다." }
  }

  return { valid: true }
}

/**
 * 이미지 썸네일 생성
 */
export const createThumbnail = async (base64: string, size = 300, format: ImageFormat = "jpeg"): Promise<string> => {
  // WebP가 지원되지 않는 경우 JPEG로 대체
  const finalFormat = format === "webp" && !(await isWebPSupported()) ? "jpeg" : format

  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // 정사각형 썸네일 생성
      const minDimension = Math.min(img.width, img.height)
      const startX = (img.width - minDimension) / 2
      const startY = (img.height - minDimension) / 2

      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, startX, startY, minDimension, minDimension, 0, 0, size, size)

      const thumbnail = canvas.toDataURL(`image/${finalFormat}`, 0.7)
      resolve(thumbnail)
    }
  })
}

/**
 * 이미지 크기에 따른 최적 압축 품질 추천
 */
export const recommendQuality = (fileSize: number): number => {
  // 파일 크기에 따른 품질 추천 (KB 단위)
  if (fileSize > 5000) return 0.5 // 5MB 이상
  if (fileSize > 2000) return 0.6 // 2MB 이상
  if (fileSize > 1000) return 0.7 // 1MB 이상
  if (fileSize > 500) return 0.8 // 500KB 이상
  return 0.9 // 500KB 미만
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

/**
 * 이미지 포맷 변환 (기존 이미지를 다른 포맷으로 변환)
 */
export const convertImageFormat = async (
  base64: string,
  format: ImageFormat = "webp",
  quality = 0.8,
): Promise<string> => {
  // WebP가 지원되지 않는 경우 JPEG로 대체
  const finalFormat = format === "webp" && !(await isWebPSupported()) ? "jpeg" : format

  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0)

      const convertedImage = canvas.toDataURL(`image/${finalFormat}`, quality)
      resolve(convertedImage)
    }
  })
}

/**
 * 이미지 포맷 감지
 */
export const detectImageFormat = (base64: string): ImageFormat => {
  if (base64.startsWith("data:image/webp")) {
    return "webp"
  }
  return "jpeg"
}

/**
 * 이미지 포맷 비교 (압축률 계산)
 */
export const compareImageFormats = async (
  base64: string,
  quality = 0.8,
): Promise<{
  jpeg: { size: number; data: string }
  webp: { size: number; data: string }
  savingsPercent: number
}> => {
  const img = new Image()
  img.src = base64

  return new Promise((resolve) => {
    img.onload = async () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0)

      const jpegData = canvas.toDataURL("image/jpeg", quality)
      const jpegSize = calculateBase64Size(jpegData)

      // WebP 지원 확인
      const webpSupported = await isWebPSupported()
      let webpData: string
      let webpSize: number

      if (webpSupported) {
        webpData = canvas.toDataURL("image/webp", quality)
        webpSize = calculateBase64Size(webpData)
      } else {
        // WebP를 지원하지 않는 경우 JPEG와 동일하게 설정
        webpData = jpegData
        webpSize = jpegSize
      }

      const savingsPercent = webpSize < jpegSize ? Math.round(100 - (webpSize / jpegSize) * 100) : 0

      resolve({
        jpeg: { size: jpegSize, data: jpegData },
        webp: { size: webpSize, data: webpData },
        savingsPercent,
      })
    }
  })
}
