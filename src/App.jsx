import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ATSScanner from './Components/ATSScanner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <ATSScanner/>
    </>
  )
}

export default App
