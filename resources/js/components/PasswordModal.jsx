import Overlay from "./Overlay";

//no onClose on the Overlay: the admin must copy the one-time password before closing
const PasswordModal = ({ password, onClose }) => {
    if (!password) return null;

    return (
        <Overlay>
            <div className="bg-white rounded-xl p-6 w-96 max-w-full shadow-xl animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">
                    New Salesperson Password
                </h2>

                <div className="bg-gray-100 p-3 rounded-lg mb-4 text-center font-mono">
                    {password}
                </div>

                <button
                    onClick={() => {
                        navigator.clipboard.writeText(password);
                        onClose();
                    }}
                    className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                    Copy & Close
                </button>
            </div>
        </Overlay>
    );
};

export default PasswordModal;