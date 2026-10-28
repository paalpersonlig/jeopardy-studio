import { HashRouter, Route, Routes } from 'react-router-dom'
import { Library } from './pages/Library'
import { Editor } from './pages/Editor'
import { Presenter } from './pages/Presenter'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/edit/:id" element={<Editor />} />
        <Route path="/play/:id" element={<Presenter />} />
      </Routes>
    </HashRouter>
  )
}
