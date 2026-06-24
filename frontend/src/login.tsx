import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Login } from './Auth.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Login />
  </StrictMode>,
);
