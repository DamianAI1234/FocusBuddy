import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import NotificationApp from './NotificationApp.tsx'
import './index.css'

const route = window.location.hash;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {route === '#/notification' ? <NotificationApp /> : <App />}
    </React.StrictMode>,
)
