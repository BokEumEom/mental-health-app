"use server"

import { revalidatePath } from "next/cache"

// 메시지 타입 정의
export type Message = {
  role: "user" | "model"
  parts: string
}

// Gemini API 호출 함수
export async function sendMessageToGemini(messages: Message[]) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined")
    }

    // Gemini API 엔드포인트
    const url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"

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
        ...messages.map((msg) => ({
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

    // API 요청 (타임아웃 설정)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15초 타임아웃

    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId) // 타임아웃 해제

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(`API 요청 실패: ${errorData.error?.message || response.statusText}`)
        } catch (e) {
          throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()

      // 응답에서 텍스트 추출
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "죄송합니다, 응답을 생성하는 데 문제가 발생했습니다."

      revalidatePath("/") // 페이지 리프레시
      return { text: responseText }
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        throw new Error("요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.")
      }
      throw fetchError
    }
  } catch (error) {
    console.error("Gemini API 오류:", error)
    return { text: "죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }
  }
}
