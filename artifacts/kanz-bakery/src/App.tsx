import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import CustomerChat from './components/CustomerChat';
import Home from './pages/Home';
import MenuPage from './pages/Menu';
import BulkOrder from './pages/BulkOrder';
import Catering from './pages/Catering';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ManageProducts from './pages/admin/ManageProducts';
import AdminChat from './pages/admin/AdminChat';
import Employees from './pages/admin/Employees';
import AdminDashboard from './pages/admin/AdminDashboard';
import type { CartItem } from './types';
import type { MenuItem } from '@workspace/api-client-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🥐</p>
        <h1 className="text-2xl font-bold text-[#2C1810] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Page Not Found</h1>
        <a href="/" className="text-[#D4A017] hover:underline text-sm">← Back to Home</a>
      </div>
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) navigate('/login');
  }, [user, loading, navigate]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user.role !== 'admin') return null;
  return <>{children}</>;
}

function AppShell() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((c) => c.id !== id));
    else setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: qty } : c));
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Admin routes get their own full-screen layout
  const isAdmin = location.startsWith('/admin');

  if (isAdmin) {
    return (
      <AdminGuard>
        <AdminLayout>
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin"           component={AdminDashboard} />
            <Route path="/admin/orders"     component={AdminOrders}     />
            <Route path="/admin/products"   component={ManageProducts}  />
            <Route path="/admin/categories" component={ManageCategories}/>
             <Route path="/admin/employees"  component={Employees}       />
            <Route path="/admin/chat"       component={AdminChat}       />
            <Route><AdminDashboard /></Route>
          </Switch>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main>
        <Switch>
          <Route path="/"            component={Home} />
          <Route path="/menu">
            <MenuPage cart={cart} onAddToCart={addToCart} />
          </Route>
          <Route path="/bulk-order">
            <BulkOrder cart={cart} onUpdateQty={updateQty} onRemove={removeItem} onClearCart={clearCart} />
          </Route>
          <Route path="/catering"    component={Catering}  />
          <Route path="/login"       component={Login}     />
          <Route path="/register"    component={Register}  />
          <Route path="/my-orders"   component={MyOrders}  />
          <Route path="/profile"     component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      {cartOpen && (
        <Cart items={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeItem} />
      )}
      <CustomerChat />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
