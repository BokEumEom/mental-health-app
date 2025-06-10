import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not defined" }, { status: 500 })
    }

    // Gemini API 엔드포인트 (스트리밍용)
    const url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:streamGenerateContent"

    // 시스템 프롬프트 설정
    const systemPrompt = `당신은 '마음퇴근'이라는 직장인 감정 보호 앱의 AI 챗봇입니다.
    당신의 역할은 직장인들의 감정을 이해하고, 공감하며, 실질적인 도움을 제공하는 것입니다.
    특히 다음과 같은 상황에 집중해주세요:
    - 조직 내 책임 전가, 모호한 지시, 위계적 소통 문제
    - 감정 소진, 번아웃, 위화감 등의 감정적 어려움
    - 직장 내 갈등과 스트레스 상황

    항상 다음과 같은 방식으로 응답해주세요:
    1. 사용자의 감정을 인정하고 공감합니다.
    2. 그 감정이 정당하다는 것을 확인시켜 줍니다.
    3. 비슷한 상황을 겪는 사람들이 많다는 것을 알려줍니다.
    4. 실질적인 대처 방법이나 조언을 제공합니다.
    5. 긍정적이고 지지적인 메시지로 마무리합니다.

    답변은 친근하고 따뜻한 톤으로, 200자 이내로 간결하게 작성해주세요.`

    // API 요청 본문 구성
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        ...messages.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.parts }],
        })),
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }

    console.log("API 요청 시작:", url)

    try {
      // Gemini API 호출 (스트리밍)
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("API 응답 상태:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API 오류 응답:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          return NextResponse.json(
            { error: errorData.error?.message || response.statusText },
            { status: response.status },
          )
        } catch (e) {
          return NextResponse.json(
            { error: `API 오류: ${response.status} ${response.statusText}` },
            { status: response.status },
          )
        }
      }

      // 스트리밍 응답 설정
      const stream = response.body
      if (!stream) {
        console.error("스트림 없음")
        return NextResponse.json({ error: "No response stream available" }, { status: 500 })
      }

      console.log("스트림 응답 반환")

      // 스트리밍 응답을 클라이언트로 전달
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (fetchError) {
      console.error("Fetch 오류:", fetchError)
      return NextResponse.json({ error: `Fetch 오류: ${fetchError.message}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Gemini API 스트리밍 오류:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
