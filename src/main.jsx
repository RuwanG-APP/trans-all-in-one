import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n.js'
import { OrderProvider } from './context/OrderContext.jsx'
import { TranslatorProvider } from './context/TranslatorContext.jsx'
import { AgentProvider } from './context/AgentContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OrderProvider>
      <TranslatorProvider>
        <AgentProvider>
          <App />
        </AgentProvider>
      </TranslatorProvider>
    </OrderProvider>
  </React.StrictMode>,
)
