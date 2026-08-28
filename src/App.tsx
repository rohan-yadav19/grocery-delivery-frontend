import { Routes, Route } from "react-router-dom";
import { AppLayout, ProtectedRoute, PublicRoute, ToastProvider } from "./components";

// ── Tab routes (rendered inside AppLayout with bottom/top nav) ──
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import AccountPage from "./pages/AccountPage";

// ── Inner routes (standalone, with back navigation) ──
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderFailedPage from "./pages/OrderFailedPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

// ── Auth / onboarding routes (no bottom nav) ──
import SplashPage from "./pages/SplashPage";
import WelcomePage from "./pages/WelcomePage";
import SignInPage from "./pages/SignInPage";
import PhoneNumberPage from "./pages/PhoneNumberPage";
import VerificationPage from "./pages/VerificationPage";
import SelectLocationPage from "./pages/SelectLocationPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* ── Protected Application Routes (require authentication) ─ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* ── Inner routes (standalone layout) ──────────────────── */}
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/order-failed" element={<OrderFailedPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
        </Route>

        {/* ── Public Utility & Auth Flow Routes ──────────────────── */}
        <Route path="/select-location" element={<SelectLocationPage />} />
        <Route path="/phone-number" element={<PhoneNumberPage />} />
        <Route path="/number" element={<PhoneNumberPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/otp" element={<VerificationPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── Initial Onboarding Entry (unauthenticated only) ──────── */}
        <Route element={<PublicRoute />}>
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
