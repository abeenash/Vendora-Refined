const Card = ({ title, value, growth = null, Icon, bg = "bg-gray-100", iconColor = "text-gray-600" }) => {
  return (
    <div className={`${bg} p-6 rounded-lg shadow-md flex items-start justify-between`}>
      {/* Left Content */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {growth && (
          <p className="text-xs text-muted-foreground">
            <span className={`font-semibold ${growth.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
              {growth}
            </span>{" "}
            from last month
          </p>
        )}
      </div>

      {/* Right Icon */}
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-inner">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );
};

export default Card;
