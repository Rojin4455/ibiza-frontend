import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


function UserProtectedRouter({children}) {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!user.accessToken || !user.isAdmin) {
        navigate('/user');
      }
    }, [user, navigate]);
  
    if (user.accessToken && user.isAdmin) {
      return children;
    }
  
    return null;
}

export default UserProtectedRouter