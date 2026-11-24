import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, ShoppingCart, Star, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { PRODUCTS, CATEGORIES } from "./Data";

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");

  // URL query parameter change hone par state update karne ke liye
  useEffect(() => {
    setSelectedCategory(categoryParam || null);
  }, [categoryParam]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];

    return PRODUCTS.filter((product) => {
      const matchesCategory =
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("shopease-cart") || "[]");
    const existing = cart.find((item) => item.id === product.id);

    const updatedCart = existing
      ? cart.map((item) =>
          item.id === product.id ? { ...item, qty: (item.qty || 1) + 1 } : item,
        )
      : [...cart, { ...product, qty: 1 }];

    localStorage.setItem("shopease-cart", JSON.stringify(updatedCart));

    setNotification(`${product.name} added to cart!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const getProductCount = (categoryName) =>
    PRODUCTS.filter(
      (product) =>
        product.category.toLowerCase() === categoryName.toLowerCase(),
    ).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Notification */}
      {notification && (
        <div className="fixed right-6 top-24 z-50 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl">
          <ShoppingCart className="mr-2 inline h-5 w-5 text-amber-400" />
          {notification}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-16 text-white lg:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-300">
            Explore Collections
          </span>

          <h1 className="mt-5 text-3xl font-black sm:text-5xl">
            Shop by Category
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg">
            Explore our wide range of products. Find everything you need in one
            place with quality, style, and great prices.
          </p>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-300">
            <p>
              <span className="font-bold text-white">{CATEGORIES.length}</span>{" "}
              Categories
            </p>

            <p>
              <span className="font-bold text-white">{PRODUCTS.length}</span>{" "}
              Products
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Explore Our Categories
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choose a category to discover its products.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => {
            const count = getProductCount(category.name);
            const isSelected =
              selectedCategory?.toLowerCase() === category.name.toLowerCase();

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => {
                  const newCategory = isSelected ? null : category.name;
                  setSelectedCategory(newCategory);
                  setSearchQuery("");
                  if (newCategory) {
                    setSearchParams({ category: newCategory });
                  } else {
                    setSearchParams({});
                  }
                }}
                className={`group flex flex-col items-center rounded-2xl border bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-100"
                    : "border-slate-200 shadow-sm hover:border-blue-400"
                }`}
              >
                <div className="relative h-24 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-32">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-blue-900/10 transition group-hover:bg-transparent" />

                  <span className="absolute bottom-2 right-2 rounded-lg bg-white/95 px-2 py-1 text-lg shadow">
                    {category.icon}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800 transition group-hover:text-blue-600">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs text-slate-400">{count} Products</p>

                <span
                  className={`mt-3 flex items-center gap-1 text-xs font-bold ${
                    isSelected ? "text-blue-700" : "text-blue-600"
                  }`}
                >
                  {isSelected ? "Selected" : "Explore"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Products */}
        {selectedCategory && (
          <section className="mt-16">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Selected Collection
                </span>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {selectedCategory}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {categoryProducts.length} products available
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in this category..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {categoryProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <p className="text-lg font-bold text-slate-700">
                  No products found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Try searching with another product name.
                </p>

                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <span className="absolute left-3 top-3 rounded-lg bg-blue-600/95 px-2.5 py-1 text-xs font-bold text-white">
                        {product.badge}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                      <div>
                        <p className="text-xs font-semibold uppercase text-blue-600">
                          {product.category}
                        </p>

                        <h3 className="mt-1 line-clamp-1 font-bold text-slate-900">
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
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
