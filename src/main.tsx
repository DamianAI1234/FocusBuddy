import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import NotificationApp from './NotificationApp.tsx'
import './index.css'

const isNotification = window.location.hash.includes('notification') || window.location.search.includes('notification');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {isNotification ? <NotificationApp /> : <App />}
    </React.StrictMode>,
)
