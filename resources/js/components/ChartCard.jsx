const ChartCard = ({ title, Icon, children }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="h-[300px]">{children}</div>
    </div>
  )
}

// grey placeholder while the chart data is being fetched
export const ChartSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    <div className="h-5 w-48 bg-gray-200 rounded mb-6" />
    <div className="h-[280px] bg-gray-100 rounded" />
  </div>
)

// true when a chart has at least one non-zero value worth drawing
export const hasValues = (rows, key) => Array.isArray(rows) && rows.some((r) => Number(r?.[key]) > 0)

export default ChartCard
