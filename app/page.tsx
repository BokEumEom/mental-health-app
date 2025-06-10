import { Tabs, TabsContent } from "@/components/ui/tabs"
import { HomeScreen } from "@/components/home-screen"
import { CommunityScreen } from "@/components/community-screen"
import { ChatbotScreen } from "@/components/chatbot-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { MobileNavbar } from "@/components/mobile-navbar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col">
        <header className="p-4 border-b">
          <h1 className="text-2xl font-bold text-teal-600">마음퇴근</h1>
          <p className="text-sm text-slate-500">직장인의 일상에 숨 쉴 틈을</p>
        </header>

        <Tabs defaultValue="home" className="flex-1 flex flex-col">
          <TabsContent value="home" className="flex-1 p-0 m-0">
            <HomeScreen />
          </TabsContent>
          <TabsContent value="community" className="flex-1 p-0 m-0">
            <CommunityScreen />
          </TabsContent>
          <TabsContent value="chatbot" className="flex-1 p-0 m-0">
            <ChatbotScreen />
          </TabsContent>
          <TabsContent value="profile" className="flex-1 p-0 m-0">
            <ProfileScreen />
          </TabsContent>

          <MobileNavbar />
        </Tabs>
      </div>
    </main>
  )
}
