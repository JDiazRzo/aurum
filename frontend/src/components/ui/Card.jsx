export const Card = ({ children, style, ...props }) => (
  <div style={{
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    ...style,
  }} {...props}>
    {children}
  </div>
)
