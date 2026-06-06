export const Badge = ({ children, variant = 'warn' }) => {
  const styles = {
    warn:    { background: '#1f1200', color: '#C9A84C', border: '1px solid #3a2800' },
    success: { background: '#0d1f0d', color: '#6db887', border: '1px solid #1a3a1a' },
    danger:  { background: '#1f0d0d', color: '#c97070', border: '1px solid #3a1a1a' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, padding: '3px 8px', borderRadius: 20,
      fontWeight: 500, ...styles[variant],
    }}>
      {children}
    </span>
  )
}
