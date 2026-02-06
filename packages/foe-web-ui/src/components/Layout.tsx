import { NavLink, Outlet } from 'react-router-dom';
import { FileJson, Map, Hexagon } from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/reports',
    label: 'FOE Reports',
    icon: FileJson,
    description: 'Maturity assessments',
  },
  {
    to: '/mapper',
    label: 'Domain Mapper',
    icon: Map,
    description: 'DDD workspace',
  },
];

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <Hexagon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Katalyst
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Domain Mapper
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div>{item.label}</div>
                <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Flow Optimized Engineering
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
