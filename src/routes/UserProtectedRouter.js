import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessControl } from '../customHooks/useAccessControl'; // Import the hook we created

function UserProtectedRouter({ children }) {
  const { accessLevel } = useAccessControl();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessLevel === 'unauthorized') {
      navigate('/user');
    }
  }, [accessLevel, navigate]);

  if (accessLevel === 'loading') {
    return <div>Loading...</div>; // Optional loading state
  }

  if (accessLevel === 'unauthorized') {
    return null;
  }

  return children;
}

export default UserProtectedRouter;