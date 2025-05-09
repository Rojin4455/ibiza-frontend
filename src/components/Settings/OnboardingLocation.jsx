import { useState, useEffect } from "react";
import { Search, MapPin, Plus, Info, X, AlertTriangle } from "lucide-react";
import axiosInstance from "../../axios/axiosInstance";
import { toast } from "sonner";

// Mock data for demonstration
// const mockLocations = [
//   { locationId: "loc_001", location_name: "Downtown Office", isBlocked: false },
//   { locationId: "loc_002", location_name: "West Side Branch", isBlocked: true },
//   { locationId: "loc_003", location_name: "Eastwood Mall Kiosk", isBlocked: false },
//   { locationId: "loc_004", location_name: "South Bay Center", isBlocked: false },
//   { locationId: "loc_005", location_name: "North Heights Plaza", isBlocked: true },
//   { locationId: "loc_006", location_name: "Central Business District", isBlocked: false },
//   { locationId: "loc_007", location_name: "Riverfront Store", isBlocked: false },
//   { locationId: "loc_008", location_name: "Airport Terminal B", isBlocked: false },
//   { locationId: "loc_009", location_name: "University Campus", isBlocked: true },
//   { locationId: "loc_010", location_name: "Suburban Mall", isBlocked: false },
//   { locationId: "loc_011", location_name: "Harbor Point", isBlocked: false },
//   { locationId: "loc_012", location_name: "Tech District Hub", isBlocked: false },
// ];

export default function OnboardingLocation({setIsModalOpen, isModalOpen, setLocations, locations}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const filteredLocations = locations.filter(loc => 
    loc.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.locationId.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleToggleBlock = async (id) => {
    setIsLoading(true);

    try{
        const response = await axiosInstance.post(`core/locations/${id}/toggle-status/`)

        if(response.status === 200){
            setLocations(locations.map(loc => 
                loc.id === id ? {...loc, is_blocked: !loc.is_blocked} : loc
              ));
              setIsLoading(false);
              
              toast.success("Status changes successfully")
        }else{
            console.error("error response: ", response)
            toast.error("Something went wrong")
        }

    }catch(error){
        toast.error("Something went wrong")

    }

  };

  const handleOnboardLocation = () => {
    setNotification({
        message: "Initiating location onboarding process...",
        type: "info"
      });
    
      const clientId = process.env.REACT_APP_CLIENT_ID;
      const redirectUri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
      const scope = encodeURIComponent(process.env.REACT_APP_SCOPES);
      const baseAuthUrl = process.env.REACT_APP_GHL_API_URL;
    
      const authUrl = `${baseAuthUrl}?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=${scope}`;
    
      // Redirect the user to the auth URL
      window.location.href = authUrl;
      

    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Close modal when clicking Escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <div className="font-sans">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 transition-all z-50 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'warning' ? 'bg-orange-100 text-orange-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {notification.type === 'success' ? <Info size={20} /> : 
           notification.type === 'warning' ? <AlertTriangle size={20} /> : 
           <Info size={20} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2">
            <X size={16} />
          </button>
        </div>
      )}
      


      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-400 to-blue-200 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin />
                <span>GHL Locations</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={18} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Locations List */}
            <div className="overflow-y-auto flex-grow p-2">
              {filteredLocations.length > 0 ? (
                <div className="grid gap-3 p-2">
                  {filteredLocations.map(location => (
                    <div 
                      key={location.LocationId}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <MapPin size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{location.company_name}</h3>
                          <span className="text-sm text-gray-500">{location.LocationId}</span>
                        </div>
                      </div>
                      
                      {/* <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          location.is_blocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {location.is_blocked ? 'Blocked' : 'Active'}
                        </span>
                        
                        <button
                          onClick={() => handleToggleBlock(location.id)}
                          disabled={isLoading}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            location.is_blocked
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          } transition-colors disabled:opacity-50`}
                        >
                          {location.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                      </div> */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <AlertTriangle size={24} className="mb-2" />
                  <p>No locations found matching "{searchTerm}"</p>
                </div>
              )}
            </div>

            {/* Footer with Onboard Button */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
              </span>
              <button
                onClick={handleOnboardLocation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                <span>Onboard New Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}