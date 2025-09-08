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

export default ChartCard