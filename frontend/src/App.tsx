import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Footer } from "./components/layout/footer";
import { Header } from "./components/layout/header";
import { AboutPage } from "./pages/about";
import { ContactPage } from "./pages/contact";
import { CreateListingPage } from "./pages/create-listing";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { MyListingsPage } from "./pages/my-listings";
import { PropertiesPage } from "./pages/properties";
import { PropertyDetailsPage } from "./pages/property-details";
import { RegisterPage } from "./pages/register";
import { AuthProvider } from "./components/auth/auth-context";
import { AdminDashboard } from "./pages/admin-dashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/create-listing" element={<CreateListingPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
