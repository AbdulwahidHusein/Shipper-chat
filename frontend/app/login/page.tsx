import { Suspense } from 'react';
import LoginPage from '@/components/auth/LoginPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Login() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message="Loading..." />}>
      <LoginPage />
    </Suspense>
  );
}
