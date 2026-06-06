const styles = {
  warn:    'bg-[#1f1200] text-gold border border-[#3a2800]',
  success: 'bg-[#0d1f0d] text-success border border-[#1a3a1a]',
  danger:  'bg-[#1f0d0d] text-danger border border-[#3a1a1a]',
}

export const Badge = ({ children, variant = 'warn' }) => (
  <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${styles[variant]}`}>
    {children}
  </span>
)