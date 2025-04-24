// Create a custom hook for detecting iframe and checking access level
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axiosInstance from '../axios/axiosInstance';

export function useAccessControl() {
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.user);
  const [accessLevel, setAccessLevel] = useState('loading');
  
  const locationId = searchParams.get('locationId');
  
  useEffect(() => {
    // Check if running in iframe
    const isInIframe = window !== window.parent;
    console.log("inIframe: ", isInIframe)
    
    // Determine the access level
    // if (isInIframe && locationId) {
    if(isInIframe){
        // const response = axiosInstance.post("accounts")
      // User is in iframe from GHL (locationId presence confirms it's GHL)
      setAccessLevel('restricted');

    } else if (!user.accessToken || !user.isAdmin) {
        // Not logged in or not admin
        setAccessLevel('unauthorized');
    } else {
      // User is accessing directly and is logged in as admin
      setAccessLevel('full');
    }
  }, [user, locationId]);
  
  return {
    accessLevel,
    isFullAccess: accessLevel === 'full',
    isRestricted: accessLevel === 'restricted',
    isUnauthorized: accessLevel === 'unauthorized',
    locationId
  };
}