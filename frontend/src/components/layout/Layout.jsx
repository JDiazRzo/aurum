import { Sidebar } from './Sidebar.jsx'
import { BottomBar } from './BottomBar.jsx'
import Aurora from '../background/Aurora.jsx'

export const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-black relative">
  
    <div className="fixed inset-0 z-0">
      <Aurora
        colorStops={["#2a1f08", "#C9A84C", "#1a1508"]}
        blend={0.3}
        amplitude={0.8}
        speed={0.8}
      />
    </div>

 
    <div className="relative z-10 flex w-full">
   
      <div className="hidden md:block">
        <Sidebar />
      </div>


      <main className="flex-1 md:ml-[220px] p-4 md:p-10 max-w-[960px] min-h-screen pb-24 md:pb-10">
        {children}
      </main>
    </div>


    <div className="md:hidden">
      <BottomBar />
    </div>
  </div>
)