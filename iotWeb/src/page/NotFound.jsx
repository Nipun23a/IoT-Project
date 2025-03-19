// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col justify-center items-center px-4 text-center">
            <div className="max-w-md">
                <h1 className="text-6xl font-bold text-white mb-6">404</h1>
                <h2 className="text-3xl font-bold text-blue-200 mb-4">Page Not Found</h2>
                <p className="text-blue-200 mb-8">The page you are looking for doesn't exist or has been moved.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;