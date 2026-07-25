import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// BrowserRouter — butun ilovani "o'rab turadi".
// Shu orqali React Router URL manzillarni kuzatib boradi
// va sahifani qayta yuklamasdan kerakli komponentni ko'rsatadi.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
