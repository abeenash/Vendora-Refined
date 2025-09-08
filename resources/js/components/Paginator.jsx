const Paginator = ({ section }) => {
    return (
        <div className="p-4 flex justify-center space-x-2">
            {section.links.map((link, index) => (
                <button
                    key={index}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    onClick={() => link.url && router.visit(link.url)}
                    className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
                        link.active
                            ? "bg-teal-600 text-white"
                            : "bg-white text-gray-700"
                    } disabled:opacity-50`}
                />
            ))}
        </div>
    );
};

export default Paginator;
