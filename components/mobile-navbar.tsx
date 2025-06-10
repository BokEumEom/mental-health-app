"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeIcon, MessageCircle, Users, Calendar, User } from "lucide-react"
import { ChatbotScreen } from "@/components/chatbot-screen"
import { HomeScreen } from "@/components/home-screen"
import { CommunityScreen } from "@/components/community-screen"
import { EmotionCalendarScreen } from "@/components/emotion-calendar-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { initializeCommunityData } from "@/utils/community-storage"
import { TutorialButton } from "@/components/tutorial-button"

export function MobileNavbar() {
  const [activeTab, setActiveTab] = useState("home")
  const [isScrolled, setIsScrolled] = useState(false)

  // 커뮤니티 데이터 초기화
  useEffect(() => {
    initializeCommunityData()
  }, [])

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header
        className={`sticky top-0 z-10 flex justify-between items-center px-4 py-3 bg-background transition-shadow ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <h1 className="text-lg font-bold">마음퇴근</h1>
        <div className="flex items-center space-x-2">
          <TutorialButton />
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "chatbot" && <ChatbotScreen />}
        {activeTab === "community" && <CommunityScreen />}
        {activeTab === "calendar" && <EmotionCalendarScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>

      {/* 하단 네비게이션 */}
      <div className="sticky bottom-0 z-10 bg-background border-t border-gray-200 pb-safe-area">
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 h-16">
            <TabsTrigger
              value="home"
              className="flex flex-col items-center justify-center data-[state=active]:text-primary"
            >
              <HomeIcon size={20} />
              <span className="text-xs mt-1">홈</span>
            </TabsTrigger>
            <TabsTrigger
              value="chatbot"
              className="flex flex-col items-center justify-center data-[state=active]:text-primary"
              id="chatbot-tab"
            >
              <MessageCircle size={20} />
              <span className="text-xs mt-1">대화</span>
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="flex flex-col items-center justify-center data-[state=active]:text-primary"
              id="community-tab"
            >
              <Users size={20} />
              <span className="text-xs mt-1">커뮤니티</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="flex flex-col items-center justify-center data-[state=active]:text-primary"
              id="calendar-tab"
            >
              <Calendar size={20} />
              <span className="text-xs mt-1">캘린더</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex flex-col items-center justify-center data-[state=active]:text-primary"
              id="profile-tab"
            >
              <User size={20} />
              <span className="text-xs mt-1">마이</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
