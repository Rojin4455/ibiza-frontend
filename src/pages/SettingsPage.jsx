import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import UserDetails from '../components/Settings/UserDetails';
import LogoutModal from '../components/Settings/LogoutModal';
import Content from '../components/Settings/Content';
import axiosInstance from '../axios/axiosInstance';
import axios from 'axios';

function SettingsPage() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState([]);

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
    try{
        const response =  await axiosInstance.post('accounts/xmlfeed/',{
            url:urlInput
        })
        if(response.status === 201){
            if (urlInput.trim()) {
                setUrls([...urls, { date: Date.now(), url: urlInput.trim(), active:true}]);
                setUrlInput('');
              }
            console.log("success response; ", response)
        }else{
            console.log("error response ;", response)
        }
    }catch(error){
        console.error("somwtthing went wrong", error)
    }

  };

  const handleRemoveUrl = (idToRemove) => {
    setUrls(urls.filter(url => url.id !== idToRemove));
  };

  const handleLogout = () => {
    // Implement actual logout logic here
    console.log('User logged out');
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={'settings'} />
      
      <Content setShowLogoutModal={setShowLogoutModal} handleUrlSubmit={handleUrlSubmit} setUrlInput={setUrlInput} urls={urls} setUrls={setUrls} urlInput={urlInput} handleRemoveUrl={handleRemoveUrl} />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal setShowLogoutModal={setShowLogoutModal} handleLogout={handleLogout} />
      )}
    </div>
  )
}

export default SettingsPage