import { XIcon } from "lucide-react";

const ProductRow = ({ item, products, onChange, onRemove }) => {
    const product = products.find((p) => p.id === item.product_id);

    return (
        <div
            className="flex items-center justify-between border-gray-500 shadow-md
      bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg p-3"
        >
            <div className="flex-1">
                <p className="font-medium">{product?.name}</p>
                <p className="text-sm text-gray-700">NPR {item.price}</p>
            </div>

            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={() =>
                        onChange({
                            ...item,
                            quantity: Math.max(1, item.quantity - 1),
                        })
                    }
                    className="px-3 border rounded-md bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                >
                    -
                </button>
                <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                        onChange({
                            ...item,
                            quantity: parseInt(e.target.value, 10) || 1,
                        })
                    }
                    className="w-15 border bg-gray-200 hover:bg-gray-300 border-gray-500 rounded-md px-2 py-1 text-center font-semibold"
                />
                <button
                    type="button"
                    onClick={() =>
                        onChange({
                            ...item,
                            quantity: Math.min(item.quantity + 1),
                        })
                    }
                    className="px-3 border rounded-md bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                >
                    +
                </button>
            </div>

            <span className="mx-4">
                = NPR {(item.quantity * item.price).toFixed(2)}
            </span>

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

export default ProductRow;
