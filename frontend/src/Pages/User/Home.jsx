import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PRODUCTS, CATEGORIES } from "../User/Data";
import {
  ShoppingCart,
  X,
  Star,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import { FaGrinStars } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Trigger notification toast
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showNotification(`Added ${product.name} to cart!`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showNotification("Item removed from cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {notification && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <main>
        <>
          {/* Hero Banner Section */}
          <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>New Season Arrivals 2026</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Discover Amazing{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Products
                  </span>
                </h1>
                <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
                  Shop the latest trends with the best prices. Fast delivery &
                  secure payment guaranteed on all orders.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                  <button
                    onClick={() => setActiveTab("Products")}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedCategory("Electronics")}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold backdrop-blur-md transition-all duration-300"
                  >
                    Explore Tech
                  </button>
                </div>
              </div>

              {/* Hero floating banner items */}
              <div className="relative flex justify-center">
                <div className="relative w-full max-w-md h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 backdrop-blur-xl flex items-center justify-center p-6 group">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-110 transition duration-700"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80')`,
                    }}
                  ></div>
                  <div className="relative z-10 text-center space-y-3">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Trending #1
                    </span>
                    <h3 className="text-2xl font-bold">
                      Immersive Sound Headphones
                    </h3>
                    <p className="text-sm text-slate-200">
                      Active Noise Cancellation & 40h Battery
                    </p>
                    <div className="text-2xl font-black text-cyan-300">
                      $49.99
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Featured Products
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Handpicked favorites curated just for you
                </p>
              </div>
              <button
                onClick={() => setActiveTab("Products")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {PRODUCTS.filter((p) => p.tag === "Featured").map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
                >
                  <div
                    className="relative h-60 overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => setQuickViewProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                      {product.badge}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-blue-600 hover:text-white text-slate-800 p-2.5 rounded-full shadow-lg transition duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3
                        className="font-bold text-slate-900 mt-1 line-clamp-1 cursor-pointer hover:text-blue-600 transition"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-1 mt-1 text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="font-bold text-slate-700">
                          {product.rating}
                        </span>
                        <span className="text-slate-400">
                          ({product.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-lg font-black text-slate-900">
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shop by Category Section */}
          <section className="py-16 bg-slate-100/70 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Shop by Category
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                  Explore our extensive range of premium quality collections
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveTab("Products");
                    }}
                    className="bg-white rounded-2xl p-4 text-center cursor-pointer border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300 relative">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                        {cat.name}
                      </h4>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Summer Savings Promotional Banner */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left mb-6 md:mb-0">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  Limited Time Offer
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                  Summer Savings Event!
                </h2>
                <p className="text-white/90 text-base sm:text-lg">
                  Up to 40% OFF on selected items across all categories. Don't
                  miss out on hot summer deals.
                </p>
              </div>
              <div className="relative z-10">
                <button
                  onClick={() => setActiveTab("Products")}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition duration-300"
                >
                  Explore Deals
                </button>
              </div>
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Fresh Picks Just In
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  New Arrivals
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {PRODUCTS.filter((p) => p.tag === "New Arrival").map(
                (product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
                  >
                    <div
                      className="relative h-52 overflow-hidden bg-slate-100 cursor-pointer"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                        New
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                      <div>
                        <h3
                          className="font-bold text-slate-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600"
                          onClick={() => setQuickViewProduct(product)}
                        >
                          {product.name}
                        </h3>
                        <div className="text-xs text-amber-500 font-bold mt-1">
                          ★ {product.rating} ({product.reviews})
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-black text-slate-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Top Rated Favorites Section */}
          <section className="py-16 bg-slate-100/70 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Top Rated by You
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Top Rated Favorites
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {PRODUCTS.slice(0, 10).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div
                      className="relative h-44 rounded-xl overflow-hidden bg-slate-100 mb-3 cursor-pointer"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        ✓ Verified Buyer
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4
                        className="font-bold text-slate-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        {product.name}
                      </h4>
                      <div className="text-sm font-black text-slate-900">
                        ${product.price.toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                        <span>★★★★★</span>
                        <span className="text-slate-600">4.8 / 5</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full mt-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-xl transition duration-300 shadow"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>

        {activeTab === "About" && (
          <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                About ShopEase
              </span>
              <h1 className="text-4xl font-black text-slate-900">
                Redefining Online Shopping Experience
              </h1>
              <p className="text-slate-600 text-lg">
                We bring you the highest quality products with unmatched
                customer service and lightning-fast delivery.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-slate-700 leading-relaxed">
              <p>
                Founded in 2024, ShopEase has grown into a trusted destination
                for thousands of online shoppers looking for top-tier
                electronics, apparel, home goods, and outdoor essentials.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-black text-blue-600">50K+</div>
                  <div className="text-sm font-semibold text-slate-600 mt-1">
                    Happy Customers
                  </div>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-black text-blue-600">100%</div>
                  <div className="text-sm font-semibold text-slate-600 mt-1">
                    Secure Checkout
                  </div>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-black text-blue-600">24/7</div>
                  <div className="text-sm font-semibold text-slate-600 mt-1">
                    Dedicated Support
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Contact" && (
          <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Get In Touch
              </span>
              <h1 className="text-4xl font-black text-slate-900">
                We'd Love to Hear From You
              </h1>
              <p className="text-slate-600">
                Have questions about your order or our products? Drop us a
                message.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Contact Information
                </h3>
                <div className="space-y-4 text-slate-600">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>123 Commerce St, Suite 400, NY</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>+1 (800) 987-5468554</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>support@shopease.com</span>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showNotification("Message sent successfully!");
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <textarea
                  rows="4"
                  placeholder="Your Message"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">Newsletter Signup</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
            Stay updated on new products and deals. Subscribe now and get 15%
            off your first order.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newsletterEmail) {
                setNewsletterSubscribed(true);
                showNotification("Successfully subscribed to newsletter!");
                setNewsletterEmail("");
              }
            }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-md"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-blue-600/40 transition whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
      <Footer setActiveTab={setActiveTab} />
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Shopping Cart ({cartCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto animate-pulse" />
                    <p className="text-slate-500 font-medium">
                      Your cart is currently empty.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-blue-700 transition"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="text-blue-600 font-black text-sm mt-0.5">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-2 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              {/* Footer Checkout */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-base font-bold text-slate-900">
                    <span>Subtotal:</span>
                    <span className="text-xl text-blue-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      showNotification(
                        "Order placed successfully! Thank you for shopping with ShopEase.",
                      );
                      setCart([]);
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-72 md:h-full bg-slate-100 relative">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow">
                  {quickViewProduct.badge}
                </span>
              </div>
              <div className="p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {quickViewProduct.category}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">
                    {quickViewProduct.name}
                  </h2>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{quickViewProduct.rating} / 5.0</span>
                    <span className="text-slate-400">
                      ({quickViewProduct.reviews} verified reviews)
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 pt-2">
                    ${quickViewProduct.price.toFixed(2)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Experience ultimate comfort and top-tier durability with
                    this premium item. Designed for modern lifestyle needs with
                    secure warranty and fast delivery.
                  </p>
                </div>
                <button
                  onClick={() => {
                    addToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
