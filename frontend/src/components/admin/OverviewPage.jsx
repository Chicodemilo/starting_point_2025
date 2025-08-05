import React, { useEffect } from 'react';
import useAdminStore from '../../stores/adminStore';
import AdminLogin from './AdminLogin';
import MainOverview from './MainOverview';

function OverviewPage() {
  // Admin store state and actions
  const { 
    isAuthenticated, 
    initialize
  } = useAdminStore();
  
  // Initialize store on component mount to restore session
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Conditionally render based on authentication status
  if (isAuthenticated) {
    return <MainOverview />;
  } else {
    return <AdminLogin />;
  }
}

export default OverviewPage;
