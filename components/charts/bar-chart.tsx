"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Chart.js 등록
Chart.register(...registerables)

type BarChartProps = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
  title?: string
  yAxisTitle?: string
  height?: number
  showLegend?: boolean
  horizontal?: boolean
  stacked?: boolean
}

export function BarChart({
  labels,
  datasets,
  title,
  yAxisTitle,
  height = 300,
  showLegend = true,
  horizontal = false,
  stacked = false,
}: BarChartProps) {
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
  ]

  useEffect(() => {
    if (!chartRef.current) return

    // 이전 차트 인스턴스 제거
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // 데이터셋에 색상 추가
    const coloredDatasets = datasets.map((dataset, index) => {
      // 단일 데이터셋인 경우 각 데이터 포인트에 다른 색상 적용
      if (datasets.length === 1 && Array.isArray(dataset.data) && !dataset.backgroundColor) {
        return {
          ...dataset,
          backgroundColor: dataset.data.map((_, i) => defaultColors[i % defaultColors.length]),
          borderColor: dataset.data.map((_, i) => defaultColors[i % defaultColors.length]),
          borderWidth: 1,
        }
      }

      // 여러 데이터셋인 경우 각 데이터셋에 단일 색상 적용
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
        borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
        borderWidth: 1,
      }
    })

    // 차트 생성
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar", // 항상 "bar" 타입 사용
        data: {
          labels,
          datasets: coloredDatasets,
        },
        options: {
          indexAxis: horizontal ? "y" : "x", // 가로 막대 차트는 indexAxis: 'y'로 설정
          responsive: true,
          maintainAspectRatio: false,
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
              display: showLegend && datasets.length > 1,
              position: "top",
              labels: {
                usePointStyle: true,
                padding: 15,
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: 10,
              cornerRadius: 4,
              caretSize: 5,
            },
          },
          scales: {
            x: {
              stacked: stacked,
              grid: {
                display: !horizontal,
              },
              ticks: {
                maxRotation: horizontal ? 0 : 45,
                minRotation: horizontal ? 0 : 45,
              },
            },
            y: {
              stacked: stacked,
              beginAtZero: true,
              title: {
                display: !!yAxisTitle,
                text: yAxisTitle || "",
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
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
  }, [labels, datasets, title, yAxisTitle, height, showLegend, horizontal, stacked])

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  )
}
