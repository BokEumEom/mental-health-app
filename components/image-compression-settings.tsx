"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { isWebPSupported, type ImageFormat } from "@/utils/image-utils"

interface ImageCompressionSettingsProps {
  quality: number
  onQualityChange: (quality: number) => void
  onAutoCompress: () => void
  fileSize?: number
  compressedSize?: number
  isCompressing: boolean
  useAutoCompression: boolean
  onAutoCompressionChange: (value: boolean) => void
  targetSize: number
  onTargetSizeChange: (size: number) => void
  format: ImageFormat
  onFormatChange: (format: ImageFormat) => void
  formatSavings?: number
}

export function ImageCompressionSettings({
  quality,
  onQualityChange,
  onAutoCompress,
  fileSize,
  compressedSize,
  isCompressing,
  useAutoCompression,
  onAutoCompressionChange,
  targetSize,
  onTargetSizeChange,
  format,
  onFormatChange,
  formatSavings = 0,
}: ImageCompressionSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [webpSupported, setWebpSupported] = useState(false)

  // WebP 지원 여부 확인
  useEffect(() => {
    const checkWebPSupport = async () => {
      const supported = await isWebPSupported()
      setWebpSupported(supported)
    }
    checkWebPSupport()
  }, [])

  // 압축률 계산
  const compressionRate = fileSize && compressedSize ? Math.round(100 - (compressedSize / fileSize) * 100) : 0

  // 파일 크기를 사람이 읽기 쉬운 형태로 변환
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 KB"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Settings size={14} />
          <span>압축 설정</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">이미지 압축 설정</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-compression">자동 압축</Label>
              <Switch id="auto-compression" checked={useAutoCompression} onCheckedChange={onAutoCompressionChange} />
            </div>
            <p className="text-xs text-gray-500">
              자동 압축을 사용하면 목표 크기에 맞게 이미지 품질이 자동으로 조정됩니다.
            </p>
          </div>

          {useAutoCompression ? (
            <div className="space-y-2">
              <Label>목표 크기</Label>
              <Select
                value={targetSize.toString()}
                onValueChange={(value) => onTargetSizeChange(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="목표 크기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100KB (낮은 품질)</SelectItem>
                  <SelectItem value="200">200KB (일반 품질)</SelectItem>
                  <SelectItem value="500">500KB (좋은 품질)</SelectItem>
                  <SelectItem value="1000">1MB (고품질)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="quality-slider">품질: {Math.round(quality * 100)}%</Label>
              </div>
              <Slider
                id="quality-slider"
                min={10}
                max={100}
                step={5}
                value={[quality * 100]}
                onValueChange={(value) => onQualityChange(value[0] / 100)}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>낮은 품질</span>
                <span>고품질</span>
              </div>
            </div>
          )}

          {/* 이미지 포맷 선택 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>이미지 포맷</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>WebP는 JPEG보다 30-40% 더 작은 파일 크기로 동일한 품질을 제공합니다.</p>
                    {!webpSupported && <p className="text-amber-500">현재 브라우저는 WebP를 지원하지 않습니다.</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2">
              <Button
                variant={format === "jpeg" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onFormatChange("jpeg")}
              >
                JPEG
              </Button>
              <Button
                variant={format === "webp" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onFormatChange("webp")}
                disabled={!webpSupported}
              >
                WebP
                {formatSavings > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatSavings}% 절약
                  </Badge>
                )}
              </Button>
            </div>
            {!webpSupported && (
              <p className="text-xs text-amber-500">
                현재 브라우저는 WebP 포맷을 지원하지 않습니다. JPEG가 사용됩니다.
              </p>
            )}
          </div>

          {fileSize && compressedSize && (
            <div className="pt-2 border-t text-sm">
              <div className="flex justify-between">
                <span>원본 크기:</span>
                <span className="font-medium">{formatFileSize(fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>압축 후:</span>
                <span className="font-medium">{formatFileSize(compressedSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>압축률:</span>
                <span className="font-medium text-green-600">{compressionRate}% 감소</span>
              </div>
            </div>
          )}

          <Button size="sm" className="w-full gap-1" onClick={onAutoCompress} disabled={isCompressing}>
            {isCompressing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>압축 중...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>지금 압축하기</span>
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
