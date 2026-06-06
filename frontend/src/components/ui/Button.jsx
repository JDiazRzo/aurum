const variants = {
  primary: {
    background: 'var(--gold)', color: '#080808',
    border: 'none', fontWeight: 600,
  },
  ghost: {
    background: 'transparent', color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'transparent', color: 'var(--danger)',
    border: '1px solid var(--danger)',
  },
}

export const Button = ({ children, variant = 'primary', loading, style, ...props }) => (
  <button
    disabled={loading || props.disabled}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 14,
      fontFamily: 'var(--font-body)', transition: 'opacity .2s, transform .1s',
      opacity: (loading || props.disabled) ? 0.6 : 1,
      width: props.fullWidth ? '100%' : undefined,
      ...variants[variant], ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    {...props}
  >
    {loading ? '...' : children}
  </button>
)
