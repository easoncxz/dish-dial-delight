import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { DataProvider } from './context/DataContext'
import Navbar from './components/Navbar'
import Index from './pages/Index'
import Ingredients from './pages/Ingredients'
import EditIngredient from './pages/EditIngredient'
import Dishes from './pages/Dishes'
import EditDish from './pages/EditDish'
import Meals from './pages/Meals'
import EditMeal from './pages/EditMeal'
import DataManagement from './pages/DataManagement'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <DataProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/ingredients/new" element={<EditIngredient />} />
              <Route path="/ingredients/edit/:id" element={<EditIngredient />} />
              <Route path="/dishes" element={<Dishes />} />
              <Route path="/dishes/new" element={<EditDish />} />
              <Route path="/dishes/edit/:id" element={<EditDish />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/meals/new" element={<EditMeal isCreating={true} />} />
              <Route path="/meals/edit/:id" element={<EditMeal isCreating={false} />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </DataProvider>
    </Router>
  )
}

export default App
