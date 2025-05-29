
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to landing page instead of root to avoid circular routing
  return <Navigate to="/dashboard" replace />;
};

export default Index;
