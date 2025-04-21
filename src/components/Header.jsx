import React, { useState } from 'react';
import { Home, Settings, MapPin, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({ activeTab }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setMenuOpen(false); // Close menu on nav
    navigate(path);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/favicon.ico" alt="Logo" className="w-10 h-10" />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            <NavItem
              icon={<Home size={20} />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => handleNavigate('/')}
            />
            <NavItem
              icon={<MapPin size={20} />}
              label="All Properties"
              active={activeTab === 'properties'}
              onClick={() => handleNavigate('/properties')}
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => handleNavigate('/settings')}
            />
          </nav>

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2">
            <NavItem
              icon={<Home size={20} />}
              label="Dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => handleNavigate('/')}
              mobile
            />
            <NavItem
              icon={<MapPin size={20} />}
              label="All Properties"
              active={activeTab === 'properties'}
              onClick={() => handleNavigate('/properties')}
              mobile
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => handleNavigate('/settings')}
              mobile
            />
          </div>
        )}
      </div>
    </header>
  );
}

function NavItem({ icon, label, active, onClick, mobile = false }) {
  const baseClasses =
    'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200';
  const activeClasses = 'text-primary border-b-2 border-primary';
  const inactiveClasses = 'text-gray-600 hover:text-secondary';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${
        mobile ? 'w-full text-left' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default Header;
