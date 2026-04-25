import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n.js'
import { OrderProvider } from './context/OrderContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OrderProvider>
      <App />
    </OrderProvider>
  </React.StrictMode>,
)
