import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import UserDetails from '../components/Settings/UserDetails';
import LogoutModal from '../components/Settings/LogoutModal';
import Content from '../components/Settings/Content';
import axiosInstance from '../axios/axiosInstance';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { clearUser } from '../slices/UserSlice';
import { toast } from 'sonner';
import LocationManagement from '../components/Settings/OnboardingLocation';
import { useLocation } from 'react-router-dom';

function SettingsPage() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState([]);
  const dispatch = useDispatch()
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [typeInput,setTypeInput] = useState("")

    const [isLoading, setIsLoading] = useState(false);



    


      const location = useLocation();
    
      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");

        const fetchInstance = async () => {
    
        if (code) {
          try{
          // Send code to backend
          const response = await axiosInstance.get(`${process.env.REACT_APP_BASE_API_URL}core/tokens?code=${code}`)
          if (response.status === 200){
            toast.success("success")
          }else{
            toast.error("error")
          }
        }catch(error){
          toast.error("something went wrong")
        }
        }
        
      }
      fetchInstance()

      }, [location.search]);


      useEffect(() => {
        const fetchLocations = async () => {
            try{
                const response = await axiosInstance.get('core/locations/')
                if(response.status === 200){
                    console.log("location response: ", response)
                setLocations(response.data)
                }else{
                    console.error("error responseL :", response)
                }
            }catch(error){
                console.error("something went wrong: ", error)
            }
        }
        fetchLocations()
      },[])

  useEffect(() => {

    const fetchUrls = async () => {
        try{
            const response = await axiosInstance.get("accounts/xmlfeed/")
            if(response.status === 200){
                console.log("responseL: ", response.data)
                setUrls(response.data)
            }else{
                console.error("error response :", response)
            }
        }catch(error){
            console.error("something went wrong: ", error)
        }
    }
    fetchUrls()
  },[])

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('accounts/xmlfeed/', {
        url: urlInput,
        contact_name: typeInput
      });
  
      if (response.status === 201) {
        if (urlInput.trim()) {
          setUrls([...urls, { date: Date.now(), url: urlInput.trim(), active: true }]);
          setUrlInput('');
          setTypeInput('');
        }
        toast.success("Feed Added Successfully");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleRemoveUrl = (idToRemove) => {
    console.log((":sdsssss", idToRemove))
    setUrls(urls.filter(url => url.id !== idToRemove));
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      const response = await axiosInstance.post('auth/logout/', {}, { 
        withCredentials: true
      });
      if (response.status === 200) {
        console.log("Logout successful: ", response);
        dispatch(clearUser());
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Logout failed: ", error);
      dispatch(clearUser());
      toast.warning("Logged out locally, but server session may still exist");
    } finally {
      setLoadingLogout(false);
      setShowLogoutModal(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={'settings'} />
      <Content setShowLogoutModal={setShowLogoutModal} handleUrlSubmit={handleUrlSubmit} setUrlInput={setUrlInput} urls={urls} setUrls={setUrls} urlInput={urlInput} handleRemoveUrl={handleRemoveUrl} setIsModalOpen={setIsModalOpen} setLocations={setLocations} locations={locations} setTypeInput={setTypeInput} typeInput={typeInput} isLoading={isLoading}/>
      {isModalOpen && (
      <LocationManagement setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} setLocations={setLocations} locations={locations}/>
    )}
      {showLogoutModal && (
        <LogoutModal setShowLogoutModal={setShowLogoutModal} handleLogout={handleLogout} loadingLogout={loadingLogout}/>
      )}
    </div>
  )
}

export default SettingsPage