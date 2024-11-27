// PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

const PublicRoute = ({ element: Component }) => {
  const { user } = useAuth();

  return user ? <Navigate to="/app" /> : <Component />;
};

export default PublicRoute;
