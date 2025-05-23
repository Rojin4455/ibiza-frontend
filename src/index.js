import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import {store} from  '../src/store'
import { Toaster, toast } from 'sonner';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <Toaster richColors position="top-center"/>
    <App />
  </Provider>

);

