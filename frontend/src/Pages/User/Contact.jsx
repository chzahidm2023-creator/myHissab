import React, { useState } from "react";
import {
  ArrowRight,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  Headphones,
  Sparkles,
  Mail,
  CheckCircle,
  Tag,
} from "lucide-react";

import { PRODUCTS, CATEGORIES } from "./Data";

export default function Home() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [cart, setCart] = useState([]);

  const featuredProducts = PRODUCTS.slice(0, 8);

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over Rs. 5,000",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "Safe and secure checkout",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Here whenever you need us",
    },
    {
      icon: Sparkles,
      title: "Quality Products",
      description: "Carefully selected for you",
    },
  ];

  const handleAddToCart = (product) => {
    setCart((previous) => [...previous, product]);
  };

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    // Demo only: connect a newsletter API to save subscriptions.
    setSubscribed(true);
    setEmail("");
  };

  return (
    <main className="overflow-hidden bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              <Sparkles size={16} />
              Welcome to ShopEase
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Discover Your
              <span className="block text-indigo-600">Perfect Style</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 md:text-lg">
              Explore our collection of quality products, discover amazing
              deals, and enjoy a simple and convenient shopping experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Shop Now
                <ArrowRight size={19} />
              </a>

              <a
                href="/categories"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600"
              >
                Explore Categories
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {PRODUCTS.length}+
                </p>
                <p className="mt-1 text-sm text-gray-500">Products</p>
              </div>

              <div className="h-10 w-px bg-gray-200" />

              <div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {CATEGORIES.length}
                </p>
                <p className="mt-1 text-sm text-gray-500">Categories</p>
              </div>

              <div className="h-10 w-px bg-gray-200" />

              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={15} fill="currentColor" />
                  ))}
                </div>

                <p className="mt-1 text-sm text-gray-500">Quality Shopping</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 -top-5 h-32 w-32 rounded-full bg-purple-200/60 blur-3xl" />
            <div className="absolute -bottom-5 -right-5 h-36 w-36 rounded-full bg-indigo-200/70 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-2xl shadow-indigo-100">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
                alt="ShopEase shopping collection"
                className="h-80 w-full rounded-2xl object-cover sm:h-[440px]"
              />

              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Your next favorite find
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900">
                      Shop the Latest Collection
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <ShoppingCart size={23} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Features */}
      <section className="border-b border-gray-100 px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                Browse Collections
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Shop by Category
              </h2>

              <p className="mt-3 max-w-xl leading-7 text-gray-600">
                Find the products you love by exploring our collections.
              </p>
            </div>

            <a
              href="/categories"
              className="inline-flex items-center gap-2 font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              View All Categories
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <a
                key={category.name}
                href={`/categories?category=${encodeURIComponent(category.name)}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="overflow-hidden bg-gray-50">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-32 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-40"
                    loading="lazy"
                  />
                </div>

                <div className="p-4">
                  <h3 className="truncate font-bold text-gray-900 transition group-hover:text-indigo-600">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {category.count ??
                      PRODUCTS.filter(
                        (product) => product.category === category.name,
                      ).length}{" "}
                    items
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                Handpicked for You
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Featured Products
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                Discover popular picks from our collection.
              </p>
            </div>

            <a
              href="/products"
              className="inline-flex items-center gap-2 font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              View All Products
              <ArrowRight size={18} />
            </a>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <a
                    href={`/products?id=${encodeURIComponent(product.id)}`}
                    className="relative block overflow-hidden bg-gray-100"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {product.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                        {product.tag}
                      </span>
                    )}

                    {!product.tag && product.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                        {product.badge}
                      </span>
                    )}
                  </a>

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {product.category}
                    </p>

                    <h3 className="mt-2 line-clamp-2 min-h-12 font-bold text-gray-900 transition group-hover:text-indigo-600">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={15} fill="currentColor" />
                        <span className="text-sm font-semibold text-gray-700">
                          {product.rating}
                        </span>
                      </div>

                      <span className="text-sm text-gray-400">
                        ({product.reviews ?? 0} reviews)
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xl font-extrabold text-gray-900">
                        Rs. {Number(product.price).toLocaleString("en-PK")}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700"
                      >
                        <ShoppingCart size={19} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <ShoppingCart size={40} className="mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No Products Available
              </h3>
              <p className="mt-2 text-gray-500">
                Add products to products.js to display them here.
              </p>
            </div>
          )}

          {cart.length > 0 && (
            <div
              role="status"
              className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4"
            >
              <p className="font-medium text-indigo-800">
                {cart.length} item(s) added to your demo cart.
              </p>

              <button
                type="button"
                onClick={() => setCart([])}
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Clear Demo Cart
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white sm:p-12 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <Tag size={16} />
              Special Collection
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
              Great Products.
              <br />
              Great Shopping.
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-indigo-100">
              Explore our latest products and find something special for
              yourself or someone you love.
            </p>

            <a
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Explore Collection
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
              alt="ShopEase featured collection"
              className="h-64 w-full object-cover transition duration-500 hover:scale-105 md:h-80"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Mail size={26} />
          </div>

          <h2 className="mt-5 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Stay in the Loop
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
            Subscribe to discover new arrivals, product updates, and special
            offers from ShopEase.
          </p>

          {subscribed ? (
            <div
              role="status"
              className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
            >
              <CheckCircle size={21} />
              <span className="font-semibold">Thank you for subscribing!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                autoComplete="email"
                required
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3.5 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
              >
                Subscribe
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Newsletter subscription is a demo until connected to a backend.
          </p>
        </div>
      </section>
    </main>
  );
}
