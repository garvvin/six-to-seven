import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-gray-200 mt-auto"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary-600" aria-hidden="true" />
            <span className="text-lg font-semibold text-gray-900">
              HealthSync
            </span>
          </div>

          <div className="text-sm text-gray-600 text-center md:text-right">
            <p>Built for better health tracking</p>
            <p className="mt-1">
              © {currentYear} HealthSync. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
