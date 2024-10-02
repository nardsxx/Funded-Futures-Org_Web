// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // Firebase hook to get auth state
import { auth } from './firebase'; // Your Firebase config

const PrivateRoute = ({ element: Component }) => {
  const [user, loading] = useAuthState(auth); // Get the current user state

  if (loading) {
    return;
  }

  return user ? <Component /> : <Navigate to="/" />;
};

export default PrivateRoute;
