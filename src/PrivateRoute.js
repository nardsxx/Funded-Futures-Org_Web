// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

const PrivateRoute = ({ element: Component }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return;
  }

  return user ? <Component /> : <Navigate to="/"/>;
};

export default PrivateRoute;
