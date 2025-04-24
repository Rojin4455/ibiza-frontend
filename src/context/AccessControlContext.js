import React, { createContext, useContext } from 'react';
import { useAccessControl } from '../customHooks/useAccessControl';

// Create context
const AccessControlContext = createContext();

// Context provider component
export function AccessControlProvider({ children }) {
  const accessControl = useAccessControl();
  
  return (
    <AccessControlContext.Provider value={accessControl}>
      {children}
    </AccessControlContext.Provider>
  );
}

// Custom hook to use the context
export function useAccessControlContext() {
  return useContext(AccessControlContext);
}