
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Toaster } from "@/components/ui/toaster";
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Ingredients from './pages/Ingredients';
import EditIngredient from './pages/EditIngredient';
import Dishes from './pages/Dishes';
import EditDish from './pages/EditDish';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <div className="pt-14 md:pt-0 md:pl-64">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/ingredients/new" element={<EditIngredient />} />
              <Route path="/ingredients/edit/:id" element={<EditIngredient />} />
              <Route path="/dishes" element={<Dishes />} />
              <Route path="/dishes/new" element={<EditDish />} />
              <Route path="/dishes/edit/:id" element={<EditDish />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
