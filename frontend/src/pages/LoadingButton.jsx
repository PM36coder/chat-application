export const LoadingButton = ({
  children,
  onClick,
  loading = false,
  className = "",
  type = "submit",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-all ${className}`}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      )}
      {loading ? "Loading..." : children}
    </button>
  );
};
