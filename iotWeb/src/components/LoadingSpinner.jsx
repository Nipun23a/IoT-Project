// src/components/LoadingSpinner.jsx
const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
};

export default LoadingSpinner;
