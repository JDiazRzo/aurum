export const Input = ({ label, error, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '.5px' }}>
        {label}
      </label>
    )}
    <input {...props} />
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
)
