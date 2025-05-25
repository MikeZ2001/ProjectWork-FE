import {StrictMode} from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// PrimeReact imports
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core styles
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // PrimeFlex for layout

const rootElement: HTMLElement|null = document.getElementById('root');

// @ts-ignore
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
