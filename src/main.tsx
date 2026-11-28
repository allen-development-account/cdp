import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {StandaloneStorefrontApp} from './components/ecommerce/StandaloneStorefrontApp';
import './index.css';

const isStandaloneStorefront =
  window.location.pathname.startsWith('/storefront') ||
  new URLSearchParams(window.location.search).get('storefront') === '1';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isStandaloneStorefront ? <StandaloneStorefrontApp /> : <App />}
  </StrictMode>,
);
