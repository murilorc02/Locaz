
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="text-2xl font-bold text-primary">
              WorkHub<span className="text-secondary">Oasis</span>
            </div>
            <p className="mt-4 text-gray-600">
              Find and book the perfect workspace for your professional needs.
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Social Media Icons would go here */}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">For Businesses</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link to="/business/signup" className="text-gray-600 hover:text-primary">
                    List Your Space
                  </Link>
                </li>
                <li>
                  <Link to="/business/dashboard" className="text-gray-600 hover:text-primary">
                    Business Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/terms-business" className="text-gray-600 hover:text-primary">
                    Business Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">For Clients</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link to="/search" className="text-gray-600 hover:text-primary">
                    Find a Space
                  </Link>
                </li>
                <li>
                  <Link to="/bookings" className="text-gray-600 hover:text-primary">
                    Manage Bookings
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li className="text-gray-600">
                123 Workspace Lane<br />
                San Francisco, CA 94105
              </li>
              <li className="text-gray-600">
                <a href="mailto:info@workhub-oasis.com" className="hover:text-primary">
                  info@workhub-oasis.com
                </a>
              </li>
              <li className="text-gray-600">
                <a href="tel:+14155550123" className="hover:text-primary">
                  (415) 555-0123
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} WorkHub Oasis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
