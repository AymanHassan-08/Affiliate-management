import { SpeedInsights } from '@vercel/speed-insights/react'
import './App.css'

function App() {
  return (
    <>
      <div className="app">
        <header className="app-header">
          <h1>Affiliate Management Dashboard</h1>
          <p>Welcome to the Affiliate Management System</p>
        </header>
        <main className="app-main">
          <div className="card">
            <h2>Dashboard</h2>
            <p>This is the main dashboard for managing affiliate products across Amazon and AliExpress.</p>
          </div>
        </main>
      </div>
      <SpeedInsights />
    </>
  )
}

export default App
