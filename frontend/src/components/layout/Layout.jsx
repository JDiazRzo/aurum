import { Sidebar } from './Sidebar.jsx'

export const Layout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{
      marginLeft: 220, flex: 1, padding: '2.5rem',
      maxWidth: 960, minHeight: '100vh',
    }}>
      {children}
    </main>
  </div>
)
