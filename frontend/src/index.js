import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import App from './App';
import './index.css';


window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      event.error.message.includes('Receiving end does not exist')) {
    console.log('Suppressing Chrome extension error:', event.error.message);
    event.preventDefault();
    return false;
  }
});


window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('Receiving end does not exist')) {
    console.log('Suppressing Chrome extension promise rejection:', event.reason.message);
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
