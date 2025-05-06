import React,{useState} from 'react'
import UserDetails from './UserDetails'
import axiosInstance from '../../axios/axiosInstance';
import { MapPin, RefreshCw } from "lucide-react";
import { toast } from 'sonner';
import XmlList from './XmlList';


function Content({setShowLogoutModal, handleUrlSubmit, setUrlInput, urls, setUrls, urlInput, handleRemoveUrl, setIsModalOpen, setLocations, locations, setTypeInput, typeInput, isLoading}) {

    const [showModal, setShowModal] = useState(false);
    const [selectedUrlId, setSelectedUrlId] = useState(null);
    const [confirmText, setConfirmText] = useState('');
    const [refreshingItems, setRefreshingItems] = useState({});


  
    const openModal = (id) => {
      setSelectedUrlId(id);
      setConfirmText('');
      setShowModal(true);
    };
  
    const confirmDelete = async () => {
      if (confirmText === 'DELETE') {

        try{
            const response = await axiosInstance.delete(`accounts/xmlfeed/${selectedUrlId}/`)
            if(response.status === 204){
                console.log("deleted successfully")
                toast.success("Feed Deleted Successfully")
                handleRemoveUrl(selectedUrlId);
                setShowModal(false);
            }else{
                console.error("error response: ", response)
                toast.error("Something went wrong")

            }
        }catch(error){
            console.error("something went wrong", error)
            toast.error("Something went wrong")


        }

        
      }
    };


    const toggleUrlActive = async (idToToggle) => {
        // Find the specific URL item
        const urlToToggle = urls.find((url) => url.id === idToToggle);
        if (!urlToToggle) return;
      
        try {
          const response = await axiosInstance.patch(`accounts/xmlfeed/${idToToggle}/`, {
            active: !urlToToggle.active,
          });
      
          if (response.status === 200) {
            setUrls(
              urls.map((url) =>
                url.id === idToToggle ? { ...url, active: !url.active } : url
              )
            );
            console.log("Status updated: ", response);
            toast.success("Status Updated Successfully")

          } else {
            console.error("Unexpected response: ", response);
            toast.error("Something went wrong")

          }
        } catch (error) {
          console.error("Error while toggling status: ", error);
          toast.error("Something went wrong")

        }
      };


      const refreshUrl = async (id) => {
        try {
          console.log("xml id: ", id)
          const response = await axiosInstance.get(`/accounts/refresh-feed/${id}/`);
          if (response.status === 200){
          console.log("Refresh success:", response.data);
          toast.success("Feed Refreshed Successfully")

          }else{
            console.error("error response: ", response.data)
            toast.error("Something went wrong")

          }
          // Optionally show a toast or reload the data
        } catch (error) {
          console.error("Error refreshing feed:", error.response?.data || error.message);
          toast.error(`${error.message}`)

          // Optionally show an error toast or message
        }
      };


      const handleRefresh = async (id) => {
        // Skip if this item is already refreshing
        if (refreshingItems[id]) return;
        
        // Set this specific item as refreshing
        setRefreshingItems(prev => ({ ...prev, [id]: true }));
        
        try {
          // Your existing refresh function
          await refreshUrl(id);
        } catch (error) {
          console.error("Error refreshing feed:", error);
        } finally {
          // Clear refreshing state for this item
          setRefreshingItems(prev => {
            const updated = { ...prev };
            delete updated[id]; // Remove this item from refreshing state
            return updated;
          });
        }
      };
    
      
      


    //   const handleUrlSubmit = (e) => {
    //     e.preventDefault();
    //     if (urlInput.trim()) {
    //       const now = new Date().toISOString();
    //       setUrls([...urls, { 
    //         id: Date.now(), 
    //         url: urlInput.trim(),
    //         active: false,
    //         created_at: now,
    //         updated_at: now
    //       }]);
    //       setUrlInput('');
    //     }
    //   };

  return (
<div className="max-w-4xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your profile and preferences</p>
          </div>
          
          <UserDetails />

          <div className="px-6 py-5 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* <h3 className="text-lg font-medium leading-6 text-gray-900">Security</h3> */}
              <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primaryhover transition-colors"
        >
          <MapPin size={18} />
          <span>Manage GHL Locations</span>
        </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* URL Management Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Manage xml URLs</h3>
            <p className="mt-1 text-sm text-gray-500">Add and manage your saved xml URLs</p>
          </div>
          
          <div className="px-6 py-5">
          <form onSubmit={handleUrlSubmit} className="flex gap-3 flex-wrap sm:flex-nowrap">
  <div className="flex-grow min-w-[200px]">
    <input
      type="url"
      value={urlInput}
      onChange={(e) => setUrlInput(e.target.value)}
      placeholder="https://example.com"
      required
      className="h-12 shadow-sm border p-4 border-primary focus:border-primaryhover focus:ring-0 block w-full sm:text-sm rounded-md py-3"
    />
  </div>

  <div className="flex-grow min-w-[150px]">
    <input
      type="text"
      value={typeInput}
      onChange={(e) => setTypeInput(e.target.value)}
      placeholder="Type name"
      required
      className="h-12 shadow-sm border p-4 border-primary focus:border-primaryhover focus:ring-0 block w-full sm:text-sm rounded-md py-3"
    />
  </div>

  <button
  type="submit"
  disabled={isLoading}
  className={`inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primaryhover'
  } focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary`}
>
  {isLoading ? 'Adding...' : 'Add URL'}
</button>
</form>


            
<div className="mt-6">
  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
    Your URLs
  </h4>
  {urls.length > 0 ? (
  
  <XmlList toggleUrlActive={toggleUrlActive} handleRefresh={handleRefresh} handleRemoveUrl={handleRemoveUrl} xmlUrls={urls} locations={locations} setShowModal={setShowModal} openModal={openModal}/>
  
  ) : (
    <p className="text-gray-500 text-sm">You haven't added any URLs yet.</p>
  )}
</div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
                    <h2 className="text-lg font-bold text-red-600 mb-3">⚠️ Confirm Deletion</h2>
                    <p className="text-gray-700 mb-4">
                      Removing this URL will delete all the property data inside the XML URL.
                      This action cannot be undone. Please type <strong className="text-red-500">DELETE</strong> to confirm.
                    </p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder='Type "DELETE" here'
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-red-500"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        disabled={confirmText !== 'DELETE'}
                        className={`px-4 py-2 rounded text-white ${
                          confirmText === 'DELETE'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-red-300 cursor-not-allowed'
                        }`}
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    )
}

export default Content