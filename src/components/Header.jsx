import React,{useState} from 'react'
import DashboardPage from '../pages/DashboardPage';
import { Search, Home, Settings, Filter, ChevronDown, MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


function Header({activeTab}) {
    const navigate = useNavigate()

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
          <img src="/favicon.ico" alt="Logo" className="w-12 h-12" />
          </div>
          
          <nav className="flex space-x-8">
            <button 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-secondary'}`}
              onClick={() => navigate('/')}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>
            
            <button 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-secondary'}`}
              onClick={() => navigate('/properties')}
            >
              <MapPin size={20} />
              <span>All Properties</span>
            </button>
            
            <button 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-secondary'}`}
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
      )
}

export default Header