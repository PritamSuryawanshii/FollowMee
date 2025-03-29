
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import AuthForms from '@/components/AuthForms';

const Login = () => {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <AuthForms />;
};

export default Login;
