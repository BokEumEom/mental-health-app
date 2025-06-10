"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeCollection } from "@/components/badge-collection"
import { LevelInfo } from "@/components/level-info"
import { UserProfileSettings } from "@/components/user-profile-settings"
import { useUserProfile } from "@/contexts/user-profile-context"
import { useTutorial } from "@/contexts/tutorial-context"
import { Settings, LogOut, Moon, Bell, Shield, HelpCircle, BookOpen, Award, Bookmark, History } from "lucide-react"
import { useRouter } from "next/navigation"

export function ProfileScreen() {
  const { userProfile } = useUserProfile()
  const { resetTutorial } = useTutorial()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
  const router = useRouter()

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode)
    // 실제 다크 모드 전환 로직 추가
  }

  const handleNotificationsToggle = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled)
    // 실제 알림 설정 로직 추가
  }

  const handleTutorialReset = () => {
    resetTutorial()
    alert("튜토리얼이 재설정되었습니다. 앱을 다시 시작하면 튜토리얼이 표시됩니다.")
  }

  // 마이페이지 메뉴 아이템
  const menuItems = [
    {
      id: "recovery-notes",
      title: "나의 회복 노트",
      description: "감정과 생각을 기록하고 관리하세요",
      icon: <BookOpen size={20} />,
      onClick: () => router.push("/recovery-notes"),
    },
    {
      id: "badges",
      title: "성장 배지",
      description: "획득한 배지와 성장 기록을 확인하세요",
      icon: <Award size={20} />,
      onClick: () => router.push("/badges"),
    },
    {
      id: "saved-posts",
      title: "저장한 글",
      description: "북마크한 커뮤니티 글을 모아보세요",
      icon: <Bookmark size={20} />,
      onClick: () => router.push("/saved-posts"),
    },
    {
      id: "activity-history",
      title: "활동 기록",
      description: "앱 사용 기록과 통계를 확인하세요",
      icon: <History size={20} />,
      onClick: () => router.push("/activity-history"),
    },
  ]

  return (
    <div className="flex flex-col p-4 pb-20 gap-6">
      {/* 프로필 정보 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/abstract-profile.png" alt="프로필 이미지" />
              <AvatarFallback>사용자</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-xl font-bold">{userProfile.jobRole ? userProfile.jobRole : "직장인"}</h2>
              <p className="text-sm text-slate-500">감정 관리 여정을 시작했어요</p>
            </div>
          </div>

          <div className="mt-4">
            <UserProfileSettings />
          </div>
        </CardContent>
      </Card>

      {/* 레벨 정보 */}
      <LevelInfo />

      {/* 배지 컬렉션 */}
      <BadgeCollection limit={4} showViewAll={true} />

      {/* 마이페이지 메뉴 */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:bg-slate-50" onClick={item.onClick}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  {item.icon}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 설정 */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-medium flex items-center">
            <Settings size={18} className="mr-2" />
            설정
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Moon size={18} className="mr-2 text-slate-600" />
                <Label htmlFor="dark-mode">다크 모드</Label>
              </div>
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={18} className="mr-2 text-slate-600" />
                <Label htmlFor="notifications">알림</Label>
              </div>
              <Switch id="notifications" checked={isNotificationsEnabled} onCheckedChange={handleNotificationsToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield size={18} className="mr-2 text-slate-600" />
                <Label>개인정보 보호</Label>
              </div>
              <Button variant="ghost" size="sm">
                관리
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle size={18} className="mr-2 text-slate-600" />
                <Label>튜토리얼 다시보기</Label>
              </div>
              <Button variant="ghost" size="sm" onClick={handleTutorialReset}>
                재설정
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로그아웃 */}
      <Button variant="outline" className="w-full">
        <LogOut size={16} className="mr-2" />
        로그아웃
      </Button>
    </div>
  )
}
