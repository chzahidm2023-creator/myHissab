import React from "react";
import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  Headphones,
  Users,
  Sparkles,
  Target,
  Heart,
  Package,
  Layers,
} from "lucide-react";

import { PRODUCTS, CATEGORIES } from "./Data";

export default function About() {
  const stats = [
    {
      value: "50K+",
      label: "Happy Customers",
      icon: Users,
    },
    {
      value: `${PRODUCTS.length}+`,
      label: "Products Available",
      icon: Package,
    },
    {
      value: `${CATEGORIES.length}`,
      label: "Product Categories",
      icon: Layers,
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Trusted Quality",
      description:
        "We carefully select quality products to provide you with a reliable shopping experience.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "We work to deliver your favorite products safely and on time.",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description:
        "Our support team is here to help with your questions and shopping needs.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description:
        "Your satisfaction is our priority, and we continuously work to improve your experience.",
    },
  ];

  return (
    <main className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              <Sparkles size={16} />
              About ShopEase
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Redefining Online{" "}
              <span className="text-indigo-600">Shopping Experience</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 md:text-lg">
              We bring you the highest quality products with unmatched customer
              service and lightning-fast delivery.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Explore Products
                <ShoppingCart size={18} />
              </a>

              <a
                href="/contact"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-indigo-600 hover:text-indigo-600"
              >
                Contact Us
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full bg-purple-200/60 blur-2xl" />
            <div className="absolute -bottom-5 -right-5 h-32 w-32 rounded-full bg-indigo-200/70 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-3 shadow-2xl shadow-indigo-100">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                alt="Customer shopping online"
                className="h-72 w-full rounded-2xl object-cover sm:h-96"
              />

              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur-md sm:left-8 sm:right-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <ShoppingCart size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Shopping Made Simple
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Quality, convenience and trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Our Story
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              Making Online Shopping Better for Everyone
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Founded in 2024, ShopEase aims to provide customers with a
              convenient destination for electronics, apparel, home goods, and
              outdoor essentials.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              We believe online shopping should be simple, convenient, and
              enjoyable. That is why we focus on quality products, a smooth
              shopping experience, secure checkout, and helpful customer
              service.
            </p>

            <div className="mt-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Target size={24} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">Our Mission</h3>
                <p className="mt-2 leading-7 text-gray-600">
                  To make quality products accessible through a reliable,
                  customer-focused online shopping platform.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-2xl bg-indigo-50">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80"
                alt="Retail shopping experience"
                className="h-56 w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl bg-purple-50">
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=700&q=80"
                alt="Customer making a purchase"
                className="h-56 w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="col-span-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <p className="text-lg font-semibold">
                "Your satisfaction is at the heart of everything we do."
              </p>
              <p className="mt-2 text-sm text-indigo-100">
                The ShopEase Promise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              ShopEase in Numbers
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
              Built Around Your Trust
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Icon size={27} />
                  </div>

                  <h3 className="mt-5 text-3xl font-extrabold text-gray-900">
                    {stat.value}
                  </h3>

                  <p className="mt-2 font-medium text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Why ShopEase?
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              More Than Just Shopping
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              We combine quality, convenience, and customer care to make every
              shopping experience better.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-indigo-100 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-12 text-center text-white sm:px-12 md:py-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Discover ShopEase?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-indigo-100">
            Explore our collection and find the products that fit your needs.
            Your next favorite purchase is just a click away.
          </p>

          <a
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-indigo-700 transition hover:bg-indigo-50"
          >
            Start Shopping
            <ShoppingCart size={19} />
          </a>
        </div>
      </section>
    </main>
  );
}
