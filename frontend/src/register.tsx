import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Register } from './Auth.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Register />
  </StrictMode>,
);
