"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Chart.js 등록
Chart.register(...registerables)

type LineChartProps = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
  title?: string
  yAxisTitle?: string
  height?: number
  showLegend?: boolean
  tension?: number
}

export function LineChart({
  labels,
  datasets,
  title,
  yAxisTitle,
  height = 300,
  showLegend = true,
  tension = 0.4,
}: LineChartProps) {
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
    const coloredDatasets = datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      backgroundColor: dataset.backgroundColor || `${defaultColors[index % defaultColors.length]}33`, // 33은 20% 투명도
      fill: true,
      tension: tension,
      pointRadius: 3,
      pointHoverRadius: 5,
    }))

    // 차트 생성
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: coloredDatasets,
        },
        options: {
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
              display: showLegend,
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
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
              },
            },
            y: {
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
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
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
  }, [labels, datasets, title, yAxisTitle, height, showLegend, tension])

  return (
    <div style={{ height: `${height}px`, width: "100%" }}>
      <canvas ref={chartRef} />
    </div>
  )
}
