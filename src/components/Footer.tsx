import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold">📖 eBook Reader</h2>
          <p className="mt-2 text-gray-400">
            Discover and read books with ease. Request new books anytime.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="/" className="hover:text-gray-300">Home</a></li>
            <li><a href="/request" className="hover:text-gray-300">Request a Book</a></li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-semibold">Follow Us</h3>
          <div className="flex justify-center md:justify-start mt-2 space-x-4">
            <a href="#" className="hover:text-gray-400"><FaFacebook size={20} /></a>
            <a href="#" className="hover:text-gray-400"><FaTwitter size={20} /></a>
            <a href="#" className="hover:text-gray-400"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-gray-400"><FaLinkedin size={20} /></a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 text-sm border-t border-gray-700 py-4">
        © {new Date().getFullYear()} eBook Reader. All Rights Reserved.
      </div>
    </footer>
  );
}
