import { XIcon } from "lucide-react";

const CustomerRow = ({ item, onRemove }) => {
    return (
        <div
            className="flex items-center justify-between border-gray-500 shadow-md
      bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg p-3"
        >
            <div className="flex-1">
                <p className="font-semibold">{item?.name}</p>
                {item?.phone && (
                    <p className="text-sm opacity-80">{item.phone}</p>
                )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="p-1 rounded-full hover:bg-white/20 transition"
            >
                <XIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default CustomerRow;
