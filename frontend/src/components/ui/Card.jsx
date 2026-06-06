export const Card = ({ children, className = '', style, ...props }) => (
  <div
    className={`bg-surface2 border border-border rounded-lg p-5 ${className}`}
    style={style}
    {...props}
  >
    {children}
  </div>
)
