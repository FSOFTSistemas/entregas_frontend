import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  Home,
  Package,
  Users,
  Truck,
  Building2,
  LogOut,
  Menu
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', roles: ['master', 'admin', 'entregador'] },
    { path: '/produtos', icon: Package, label: 'Produtos', roles: ['master', 'admin'] },
    { path: '/usuarios', icon: Users, label: 'Usuários', roles: ['master', 'admin'] },
    { path: '/entregas', icon: Truck, label: 'Entregas', roles: ['master', 'admin'] },
    { path: '/empresas', icon: Building2, label: 'Empresas', roles: ['master'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.tipo_usuario)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Sistema de Entregas</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-white/70">Bem-vindo, </span>
            <span className="font-medium">{user?.nome}</span>
            <div className="text-xs text-white/70">
              {user?.razao_social} • {user?.tipo_usuario}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-black">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          bg-orange-400 text-white
          h-screen
        `}>
          <div className="p-4 flex flex-col justify-center items-center border-b border-white/20 space-y-2">
            <Truck className="h-12 w-12 text-white" />
            <span className="text-white font-semibold text-center">{user.empresa.razao_social}</span>
          </div>
          <nav className="p-4 space-y-2 mt-16 md:mt-0">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-white text-orange-500'
                      : 'hover:bg-orange-500 hover:text-white'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
