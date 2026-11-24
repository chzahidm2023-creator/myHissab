import { Link } from "react-router-dom";
import { FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 pt-16 pb-12 text-slate-400">
      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <Link to="/" className="flex items-center space-x-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              S
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              ShopEase
            </span>
          </Link>
          <p className="max-w-sm text-sm">
            Stay updated on new products and deals. Your ultimate destination
            for seamless shopping.
          </p>
          <div className="flex items-center space-x-4 pt-2 text-white">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="rounded-full bg-slate-800 p-2 transition hover:bg-blue-600"
            >
              <FaFacebook className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="rounded-full bg-slate-800 p-2 transition hover:bg-blue-600"
            >
              <FaTwitter className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full bg-slate-800 p-2 transition hover:bg-blue-600"
            >
              <FaInstagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/account" className="transition hover:text-white">
                My Account
              </Link>
            </li>
            <li>
              <Link to="/orders/track" className="transition hover:text-white">
                Order Tracking
              </Link>
            </li>
            <li>
              <Link to="/returns" className="transition hover:text-white">
                Returns
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="transition hover:text-white">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="transition hover:text-white">
                Shipping
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Company Info</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="transition hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/careers" className="transition hover:text-white">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/press" className="transition hover:text-white">
                Press
              </Link>
            </li>
            <li>
              <Link to="/blog" className="transition hover:text-white">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Contact &amp; Social</h4>
          <div className="space-y-2 text-sm">
            <p>Customer Support</p>
            <a
              href="mailto:infor@gmail.com"
              className="block font-medium text-white transition hover:text-blue-400"
            >
              infor@gmail.com
            </a>
            <a
              href="tel:+919875468554"
              className="block font-medium text-white transition hover:text-blue-400"
            >
              +91 9875468554
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between border-t border-slate-800 px-4 pt-8 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Content on ShopEase</p>
      </div>
    </footer>
  );
}
