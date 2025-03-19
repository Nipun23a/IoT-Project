import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail } from '../service/firebase';
import LoginForm from "../components/Login.jsx";

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try {
            setError('');
            setLoading(true);
            await loginWithEmail(email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to log in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-md p-8 rounded-xl shadow-xl border border-white border-opacity-20">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-500">
                        Air Quality Monitoring System
                    </h2>
                    <p className="mt-2 text-center text-sm text-blue-200">
                        Please sign in to access the dashboard
                    </p>
                </div>
                <LoginForm onSubmit={handleLogin} error={error} loading={loading} />
            </div>
        </div>
    );
};

export default Login;