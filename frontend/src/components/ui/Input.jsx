export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs text-muted tracking-wide">
        {label}
      </label>
    )}
    <input
      className={`
        bg-surface2 border border-border rounded-md
        px-3.5 py-2.5 text-sm text-white
        outline-none transition-colors duration-200
        focus:border-gold placeholder:text-dim
        ${className}
      `}
      {...props}
    />
    {error && <span className="text-xs text-danger">{error}</span>}
  </div>
)