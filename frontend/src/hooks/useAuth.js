import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Safety check: Make sure hook is used inside AuthProvider
  if (!context) {
    throw new Error(
      'useAuth must be used inside <AuthProvider>. ' +
      'Wrap your app with AuthProvider in App.jsx'
    );
  }

  return context;
};

export default useAuth;
