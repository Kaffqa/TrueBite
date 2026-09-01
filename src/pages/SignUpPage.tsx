import React from 'react';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SignUpForm />
    </div>
  );
}