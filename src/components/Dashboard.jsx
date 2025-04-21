import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Activity, Search } from 'lucide-react';
import axiosInstance from '../axios/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  // Sample data - replace with your actual data
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('');

  
useEffect(()=> {
    const fetchContacts = async () => {
        try{
            const response = await axiosInstance.get("accounts/contacts/")
            if(response.status === 200){
                console.log("response: ", response.data)
                setUsers(response.data)
            }else{
                console.error("error response: ", response)
            }
        }catch(error){
            console.error("something went wrong: ", error)
        }
    }
    fetchContacts()
},[])
  
  // Chart data - sample user growth over time
  const chartData = (() => {
    const dateCount = {};
  
    users.forEach(user => {
      const dateOnly = new Date(user.date_added).toISOString().split('T')[0];
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
    navigate(`/user-properties/${user.id}`)
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const usersLastWeek = users.filter(user => new Date(user.date_added) >= oneWeekAgo);

  // Calculate growth rate (simplified)
  const growthRate = usersLastWeek.length > 0 
  ? ((users.length / usersLastWeek.length) * 100).toFixed(1) 
  : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Leads</h2>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
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
          
          <div className="overflow-x-auto w-full">
  <table className="min-w-[600px] w-full table-auto md:table-fixed divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Email
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Join Date
        </th>
        <th className="px-4 py-3"></th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-200">
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <tr
            key={user.id}
            className="hover:bg-gray-50 transition-colors duration-200"
          >
            <td className="px-4 py-4 whitespace-normal break-words">
              <div className="font-semibold text-gray-900 capitalize">{user.first_name}</div>
            </td>
            <td className="px-4 py-4 whitespace-normal break-words">
              <div className="text-gray-600 italic">
                {user.email ? user.email : "No Email Provided"}
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-gray-500">
              {new Date(user.date_added).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-right">
              <button
                onClick={() => handleViewUser(user)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primaryhover transition"
              >
                View Details
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
            No users found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

          
          {/* Pagination could be added here */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}