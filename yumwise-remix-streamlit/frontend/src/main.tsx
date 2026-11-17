import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { connectToStreamlit } from './services/apiClient';

createRoot(document.getElementById('root')!).render(<App />);

connectToStreamlit();
