"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Chart.js 등록
Chart.register(...registerables)

type PieChartProps = {
  labels: string[]
  data: number[]
  colors?: string[]
  title?: string
  height?: number
  showLegend?: boolean
  doughnut?: boolean
  cutout?: number
}

export function PieChart({
  labels,
  data,
  colors,
  title,
  height = 300,
  showLegend = true,
  doughnut = false,
  cutout = 50,
}: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // 기본 색상 배열
  const defaultColors = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#f97316", // orange-500
    "#8b5cf6", // violet-500
    "#ef4444", // red-500
    "#f59e0b", // amber-500
    "#06b6d4", // cyan-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#64748b", // slate-500
    "#a855f7", // purple-500
    "#f43f5e", // rose-500
    "#0ea5e9", // sky-500
  ]

  useEffect(() => {
    if (!chartRef.current) return

    // 이전 차트 인스턴스 제거
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // 차트 색상 설정
    const chartColors = colors || data.map((_, index) => defaultColors[index % defaultColors.length])

    // 차트 생성
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: doughnut ? "doughnut" : "pie",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: chartColors,
              borderColor: chartColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: doughnut ? `${cutout}%` : 0,
          plugins: {
            title: {
              display: !!title,
              text: title || "",
              font: {
                size: 16,
                weight: "bold",
              },
              padding: {
                top: 10,
                bottom: 10,
              },
            },
            legend: {
              display: showLegend,
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 15,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw as number
                  const total = data.reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
        },
      })
    }

    // 컴포넌트 언마운트 시 차트 인스턴스 제거
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, data, colors, title, height, showLegend, doughnut, cutout])

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  )
}
