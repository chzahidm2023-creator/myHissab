import React, { useState, useMemo } from "react";
import { ShoppingCart, Star, Search, RotateCcw } from "lucide-react";

import { PRODUCTS, CATEGORIES } from "../User/Data";

export default function AllProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState("");

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const addToCart = (product) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => item.id === product.id,
      );

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [...previousCart, { ...product, qty: 1 }];
    });

    setNotification(`${product.name} added to cart!`);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-2xl">
          <ShoppingCart className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="mb-4 inline-block rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-300">
            Explore Our Collection
          </span>

          <h1 className="text-3xl font-black sm:text-5xl">All Products</h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Discover quality products across all categories. Find your favorites
            at great prices.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            <span>
              <strong className="text-white">{filteredProducts.length}</strong>{" "}
              Products Found
            </span>

            <span>
              <strong className="text-white">{CATEGORIES.length}</strong>{" "}
              Categories
            </span>

            <span>
              <strong className="text-white">
                {cart.reduce((total, item) => total + item.qty, 0)}
              </strong>{" "}
              Items Added
            </span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Product Catalog
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing results for{" "}
              <span className="font-semibold text-blue-600">
                {selectedCategory === "All"
                  ? "All Categories"
                  : selectedCategory}
              </span>
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products or categories..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition ${
                selectedCategory === "All"
                  ? "bg-blue-600 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              All Products
            </button>

            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition ${
                  selectedCategory === category.name
                    ? "bg-blue-600 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>

          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white py-24 text-center shadow-sm">
            <Search className="mx-auto mb-4 h-14 w-14 text-slate-300" />

            <h3 className="text-xl font-bold text-slate-800">
              No Products Found
            </h3>

            <p className="mx-auto mt-2 max-w-md px-4 text-sm text-slate-500">
              No products match your search. Try another keyword or select a
              different category.
            </p>

            <button
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product Image */}
                <div className="group relative h-60 overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-lg bg-blue-600/95 px-2.5 py-1 text-xs font-bold text-white shadow">
                    {product.badge}
                  </span>

                  {product.tag === "New Arrival" && (
                    <span className="absolute right-3 top-3 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                      New
                    </span>
                  )}

                  <button
                    onClick={() => addToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                    className="absolute bottom-3 right-3 rounded-full bg-white p-3 text-slate-800 opacity-0 shadow-lg transition hover:bg-blue-600 hover:text-white group-hover:opacity-100"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {product.category}
                    </span>

                    <h3 className="mt-1 line-clamp-1 font-bold text-slate-900 transition hover:text-blue-600">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                      <span className="font-bold text-slate-700">
                        {product.rating}
                      </span>

                      <span className="text-slate-400">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-lg font-black text-slate-900">
                      ${product.price.toFixed(2)}
                    </span>

                    <button
                      onClick={() => addToCart(product)}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
