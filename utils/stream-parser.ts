// Gemini API 스트리밍 응답 파서
export async function parseGeminiStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onFinish: () => void,
) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let timeoutId: NodeJS.Timeout | null = null

  // 타임아웃 설정 (10초)
  timeoutId = setTimeout(() => {
    reader.cancel("Timeout exceeded").catch(console.error)
    onError(new Error("응답 시간이 초과되었습니다."))
  }, 10000)

  try {
    while (true) {
      const { done, value } = await reader.read()

      // 타임아웃 리셋
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          reader.cancel("Timeout exceeded").catch(console.error)
          onError(new Error("응답 시간이 초과되었습니다."))
        }, 10000)
      }

      if (done) {
        // 타임아웃 해제
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // 스트림이 끝났을 때 남은 버퍼 처리
        if (buffer.trim()) {
          try {
            const lines = buffer.split("\n")
            for (const line of lines) {
              if (line.startsWith("data: ") && line.length > 6) {
                const data = line.slice(6)
                if (data !== "[DONE]") {
                  try {
                    const parsed = JSON.parse(data)
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ""
                    if (text) {
                      onChunk(text)
                    }
                  } catch (e) {
                    // JSON 파싱 오류는 무시하고 계속 진행
                  }
                }
              }
            }
          } catch (e) {
            // 버퍼 처리 오류는 무시
          }
        }

        onFinish()
        break
      }

      // 디코딩 및 버퍼에 추가
      buffer += decoder.decode(value, { stream: true })

      // 데이터 라인 처리
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)

          if (data === "[DONE]") {
            // 타임아웃 해제
            if (timeoutId) {
              clearTimeout(timeoutId)
              timeoutId = null
            }
            onFinish()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ""

            if (text) {
              onChunk(text)
            }
          } catch (e) {
            // JSON 파싱 오류는 무시하고 계속 진행
          }
        }
      }
    }
  } catch (error) {
    // 타임아웃 해제
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    onError(error instanceof Error ? error : new Error(String(error)))
  } finally {
    // 타임아웃 해제
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    reader.releaseLock()
  }
}
