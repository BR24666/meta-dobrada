'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

const LoginForm = dynamic(() => import('@/components/LoginForm'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function LoginPage() {
  return <LoginForm />;
} 