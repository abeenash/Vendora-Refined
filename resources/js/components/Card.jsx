const Card = ({ title, value, Icon, bg = "bg-white", iconColor = "text-gray-600", children }) => {
  return (
    <div className={`${bg} p-6 rounded-lg shadow-md flex items-start justify-between`}>
      {/* Left Content */}
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-semibold text-foreground ${children}`}>{value}</p>
      </div>

      {/* Right Icon */}
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-inner">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );
};

export default Card;
