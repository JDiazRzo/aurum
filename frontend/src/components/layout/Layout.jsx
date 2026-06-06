import { Sidebar } from './Sidebar.jsx'
import Aurora from '../background/Aurora.jsx'

export const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-black relative">
    {/* Fondo Aurora */}
    <div className="fixed inset-0 z-0">
      <Aurora
        colorStops={["#e8c97a", "#C9A84C", "#8a6e2e"]}
        blend={0.8}
        amplitude={1.0}
        speed={1.1}
      />
    </div>

    {/* Contenido encima del fondo */}
    <div className="relative z-10 flex w-full">
      <Sidebar />
      <main className="ml-[220px] flex-1 p-10 max-w-[960px] min-h-screen">
        {children}
      </main>
    </div>
  </div>
)