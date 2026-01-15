import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { menuConfig } from './Sidebar';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active module from current path
  const getModuleFromPath = (path) => {
    if (path.startsWith('/ventas')) return 'ventas';
    if (path.startsWith('/marketing')) return 'marketing';
    if (path.startsWith('/finanzas')) return 'finanzas';
    if (path.startsWith('/inventario')) return 'inventario';
    if (path.startsWith('/config')) return 'config';
    return 'finanzas'; // default
  };

  const [activeModule, setActiveModule] = useState(getModuleFromPath(location.pathname));

  useEffect(() => {
    setActiveModule(getModuleFromPath(location.pathname));
  }, [location.pathname]);

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    // Navigate to first item in the module
    const firstItem = menuConfig[moduleId]?.[0];
    if (firstItem) {
      navigate(firstItem.path);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <Header activeModule={activeModule} onModuleChange={handleModuleChange} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} />

        <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
