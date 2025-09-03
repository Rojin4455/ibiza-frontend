import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Activity, Search, Settings } from 'lucide-react';
import axiosInstance from '../axios/axiosInstance';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAccessControl } from '../customHooks/useAccessControl';


export default function Dashboard() {
  // Sample data - replace with your actual data
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { isFullAccess, isRestricted, locationId: accessLocationId } = useAccessControl();
  const [searchParams] = useSearchParams();
  const [subAccounts, setSubAccounts] = useState([])
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Determine the locationId from access control or fallback to URL param
  const locationId = accessLocationId || searchParams.get('locationId');
  console.log("is full access: ", isFullAccess)
  console.log("is locationId access: ", locationId)
  console.log("is isRestricted access: ", isRestricted)
  // const [subAccounts, setSubAccounts] = useState([])


  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts()
  },[locationId])

  useEffect(() => {
    // Find and set the default selected account based on locationId
    const defaultAccount = subAccounts.find(account => 
      account.locationId === locationId
    );
    
    if (defaultAccount) {
      setSelectedAccount(defaultAccount);
    }
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setShowDropdown(false);
    navigate(`/?locationId=${account.LocationId}`)
  };


  const fetchContacts = async (url) => {
    try {
      const apiUrl = url ? url : `accounts/contacts/?location_id=${locationId}`;
      const response = await axiosInstance.get(apiUrl);
  
      if (response.status === 200) {
        setUsers(response.data.results);   // ✅ only current page
        setTotalCount(response.data.count); 
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        console.error("error response: ", response);
      }
    } catch (error) {
      console.error("something went wrong: ", error);
    }
  };


  const handleNext = () => {
    if (nextPage) fetchContacts(nextPage.replace("http://localhost:8000/", ""));
  };
  
  const handlePrevious = () => {
    if (prevPage) fetchContacts(prevPage.replace("http://localhost:8000/", ""));
  };
useEffect(()=> {

    fetchContacts()
},[])
  
  // Chart data - sample user growth over time
  const chartData = (() => {
    const dateCount = {};
  
    users.forEach(user => {
      const dateOnly = new Date(user.contact.date_added).toISOString().split('T')[0];
      dateCount[dateOnly] = (dateCount[dateOnly] || 0) + 1;
    });
  
    // Convert to cumulative growth format
    const sortedDates = Object.keys(dateCount).sort();
    let cumulative = 0;
  
    return sortedDates.map(date => {
      cumulative += dateCount[date];
      return {
        date,
        users: cumulative,
      };
    });
  })();

  const handleViewUser = async (user) => {
    navigate(`/user-properties/${user.contact.id}?locationId=${locationId}`)
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.contact.email && user.contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const usersLastWeek = users.filter(user => new Date(user.contact.date_added) >= oneWeekAgo);

  // Calculate growth rate (simplified)
  const growthRate = usersLastWeek.length > 0 
  ? ((users.length / usersLastWeek.length) * 100).toFixed(1) 
  : 0;


  

  useEffect(() => {

    const fetch_subaccounts = async () => {
      try{
      const response = await axiosInstance.get('accounts/fetch-accounts/')
      if(response.status === 200){
        setSubAccounts(response.data.sub_accounts)
        setSelectedAccount(response.data.sub_accounts[0])
      }else{
        console.error("error response")
      }
    }catch(error){
      console.error("something went wrong: ", error)
    }
    }
    if(!isRestricted){
    fetch_subaccounts()
    }
  },[])


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="relative">
        {!isRestricted && (
      <button 
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        onClick={toggleDropdown}
      >
        <Users size={20} />
        <span>{selectedAccount ? selectedAccount.company_name : 'Sub-accounts'}</span>
      </button>
      )}

      
      {showDropdown && !isRestricted && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <ul className="py-1">
            {subAccounts.map((location) => (
              <li 
                key={location.companyId} 
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                  selectedAccount?.companyId === location.companyId ? 'bg-blue-100' : ''
                }`}
                onClick={() => handleSelectAccount(location)}
              >
                {location.company_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </div>        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Leads</h2>
                <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">New This Week</h2>
                <p className="text-2xl font-bold text-gray-800">{usersLastWeek.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Growth Rate</h2>
                <p className="text-2xl font-bold text-gray-800">{growthRate}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">User Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#059669" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Users List Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Leads Who Have Match</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="w-full">
  {/* Table container with shadow and rounded corners */}
  <div className="bg-white shadow-lg rounded-xl overflow-hidden">
    {/* Desktop view */}
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-primary/10 to-primary/5">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Join Date
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Total Properties
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Selected Properties
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Total Value
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => {
              // Calculate total properties and total value
              const totalProperties = user.properties?.length || 0;
              const selectedProperties = user.contact.properties?.length || 0;
              const totalValue = user.properties?.reduce((sum, property) => {
                const price = parseFloat(property.price) || 0;
                return sum + price;
              }, 0) || 0;

              return (
                <tr
                  key={user.contact.id}
                  className={`
                    hover:bg-gray-50 transition-all duration-200
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primaryhover flex items-center justify-center text-white font-bold">
                          {user.contact.first_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {user.contact.first_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {user.contact.email ? (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          {user.contact.email}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No Email</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(user.contact.date_added).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {totalProperties}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {selectedProperties}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                    €{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-primaryhover hover:from-primaryhover hover:to-primary transform hover:scale-105 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Details
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  <p className="text-gray-500 text-lg">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile view - Card layout */}
    <div className="lg:hidden">
      {filteredUsers.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user, index) => {
            const totalProperties = user.properties?.length || 0;
            const selectedProperties = user.contact.properties?.length || 0;
            const totalValue = user.properties?.reduce((sum, property) => {
              const price = parseFloat(property.price) || 0;
              return sum + price;
            }, 0) || 0;

            return (
              <div key={user.contact.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primaryhover flex items-center justify-center text-white font-bold text-lg">
                      {user.contact.first_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {user.contact.first_name || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.contact.email || 'No Email'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewUser(user)}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-primaryhover shadow-sm"
                  >
                    Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Join Date</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(user.contact.date_added).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Properties</p>
                    <p className="text-sm text-gray-900 mt-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {totalProperties}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Selected Properties</p>
                    <p className="text-sm text-gray-900 mt-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {selectedProperties}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Value</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                    {totalValue.toLocaleString('en-IE',{ style: 'currency', currency: "EUR" }, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  </div>
</div>


          
          {/* Pagination could be added here */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center justify-between">
  <div className="text-sm text-gray-500">
    Showing {users.length} of {totalCount} users
  </div>
  <div className="flex gap-2">
    <button
      onClick={handlePrevious}
      disabled={!prevPage}
      className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
    >
      Previous
    </button>
    <button
      onClick={handleNext}
      disabled={!nextPage}
      className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}