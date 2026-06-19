"use client"

import { Suspense, lazy } from "react"

// Clean default-based lazy imports
const RevenueChartCard = lazy(() => import("./revenue-chart-card"))
const VisitorsChartCard = lazy(() => import("./visitors-chart-card"))
const AudienceOverview = lazy(() => import("./AudienceOverview"))
const ConversionRateChartCard = lazy(() => import("./ConversionRateChartCard"))
const ActiveUsersChartCard = lazy(() => import("./ActiveUsersChartCard"))
const TrafficSourcesChart = lazy(() => import("./TrafficSourcesChart"))
const SessionsDeviceChart = lazy(() => import("./SessionsDeviceChart"))
const BrowserPerformanceCard = lazy(() => import("./BrowserPerformanceCard"))
const VisitorsAnalytics = lazy(() => import("./VisitorsAnalytics"))
const DeviceTypeStats = lazy(() => import("./DeviceTypeStats"))
const TrafficTable = lazy(() => import("../analytics/TrafficTable"))
const SocialTrafficCard = lazy(() => import("./SocialTrafficCard"))

// Skeleton fallback
function CardSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-muted animate-pulse"
      style={{ height }}
    />
  )
}

export default function InfographicDashboard() {
  return (
    <div className="dashboard-analytics">
      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 xl:col-span-12">
          <Suspense fallback={<CardSkeleton height={300} />}>
            <AudienceOverview />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <ConversionRateChartCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <ActiveUsersChartCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <RevenueChartCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <VisitorsChartCard />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<CardSkeleton height={300} />}>
            <TrafficSourcesChart />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<CardSkeleton height={300} />}>
            <SessionsDeviceChart />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={250} />}>
            <BrowserPerformanceCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={250} />}>
            <VisitorsAnalytics />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={250} />}>
            <DeviceTypeStats />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-8 flex">
          <Suspense fallback={<CardSkeleton height={380} />}>
            <TrafficTable />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={280} />}>
            <SocialTrafficCard />
          </Suspense>
        </div>

      </div>
    </div>
  )
}