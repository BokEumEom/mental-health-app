"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"

export function Confetti() {
  const [windowDimension, setWindowDimension] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  useEffect(() => {
    window.addEventListener("resize", detectSize)
    return () => {
      window.removeEventListener("resize", detectSize)
    }
  }, [])

  return (
    <ReactConfetti
      width={windowDimension.width}
      height={windowDimension.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.2}
    />
  )
}
