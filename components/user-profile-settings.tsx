"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserProfile } from "@/contexts/user-profile-context"
import type { JobRole } from "@/data/conversation-topics"

export function UserProfileSettings() {
  const { userProfile, updateJobRole } = useUserProfile()
  const [selectedJob, setSelectedJob] = useState<JobRole | undefined>(userProfile.jobRole)

  const handleJobChange = (value: string) => {
    const jobRole = value as JobRole
    setSelectedJob(jobRole)
    updateJobRole(jobRole)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">맞춤 설정</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">직무 분야</label>
            <Select value={selectedJob} onValueChange={handleJobChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="직무를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="개발">개발</SelectItem>
                <SelectItem value="디자인">디자인</SelectItem>
                <SelectItem value="마케팅">마케팅</SelectItem>
                <SelectItem value="영업">영업</SelectItem>
                <SelectItem value="인사">인사</SelectItem>
                <SelectItem value="기획">기획</SelectItem>
                <SelectItem value="관리">관리</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">직무에 맞는 대화 주제를 추천해 드립니다</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
