const variants = {
  primary: 'bg-gold text-black font-semibold hover:bg-gold-light',
  ghost:   'bg-transparent text-muted border border-border hover:border-gold hover:text-gold',
  danger:  'bg-transparent text-danger border border-danger hover:opacity-80',
}

export const Button = ({ children, variant = 'primary', loading, fullWidth, style, ...props }) => (
  <button
    disabled={loading || props.disabled}
    className={`
      flex items-center justify-center gap-2
      px-5 py-2.5 rounded-md text-sm
      transition-all duration-200
      active:scale-95
      disabled:opacity-60 disabled:cursor-not-allowed
      ${variants[variant]}
      ${fullWidth ? 'w-full' : ''}
    `}
    style={style}
    {...props}
  >
    {loading ? '...' : children}
  </button>
)