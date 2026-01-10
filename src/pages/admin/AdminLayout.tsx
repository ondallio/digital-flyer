import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Store,
  MessageSquare,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBadges } from '../../hooks';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: '대시보드', exact: true },
  { path: '/admin/requests', icon: FileText, label: '신청 관리', badgeType: 'requests' as const },
  { path: '/admin/vendors', icon: Store, label: '거래처 관리' },
  { path: '/admin/tickets', icon: MessageSquare, label: '문의 관리', badgeType: 'tickets' as const },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { badges, refetch } = useBadges();
  const location = useLocation();

  useEffect(() => {
    refetch();
  }, [location, refetch]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-primary-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-primary-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-semibold text-lg">디지털 전단지 관리</h1>
        <div className="flex items-center gap-2">
          {badges.notifications > 0 && (
            <button className="relative p-2 hover:bg-primary-100 rounded-lg">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {badges.notifications > 9 ? '9+' : badges.notifications}
              </span>
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white border-r border-primary-200
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:min-h-screen
          `}
        >
          <div className="p-6 border-b border-primary-200 hidden lg:block">
            <h1 className="font-bold text-xl">디지털 전단지</h1>
            <p className="text-sm text-primary-500 mt-1">관리자 대시보드</p>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const badgeCount = item.badgeType ? badges[item.badgeType] : 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-900 text-white'
                        : 'text-primary-600 hover:bg-primary-100'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {badges.notifications > 0 && (
            <div className="hidden lg:block p-4 border-t border-primary-200">
              <div className="bg-red-50 rounded-lg p-3 flex items-center gap-2">
                <Bell size={18} className="text-red-500" />
                <span className="text-sm text-red-700">
                  새 알림 {badges.notifications}개
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
