import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Breathe from './pages/Breathe'
import Codex from './pages/Codex'
import Home from './pages/Home'
import Journal from './pages/Journal'
import Studio from './pages/Studio'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="studio" element={<Studio />} />
          <Route path="journal" element={<Journal />} />
          <Route path="breathe" element={<Breathe />} />
          <Route path="codex" element={<Codex />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
