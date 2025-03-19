// src/components/AirQualityCard.jsx
import { formatValue, getAirQualityColor, getAirQualityText } from '../utilities/formatters';

const AirQualityCard = ({ reading, loading }) => {
    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (!reading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Air Quality Index</h3>
                <div className="text-center py-8">
                    <p className="text-gray-500">No data available</p>
                    <p className="text-sm text-gray-400 mt-2">Select a transmitter to view data</p>
                </div>
            </div>
        );
    }

    const airQualityValue = reading.air_quality;
    const colorClass = getAirQualityColor(airQualityValue);
    const qualityText = getAirQualityText(airQualityValue);

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Air Quality Index</h3>
                <div className="flex items-center justify-center my-4">
                    <div className="relative w-48 h-48">
                        {/* Circular gauge */}
                        <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
                        <div
                            className={`absolute inset-0 rounded-full border-8 ${colorClass} border-opacity-90`}
                            style={{
                                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((airQualityValue / 300) * Math.PI * 2 - Math.PI / 2)}% ${50 + 50 * Math.sin((airQualityValue / 300) * Math.PI * 2 - Math.PI / 2)}%, ${airQualityValue > 150 ? '100% 0%, 100% 50%' : ''})`
                            }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-bold text-gray-800">{formatValue(airQualityValue, 0)}</span>
                            <span className={`text-sm font-medium ${colorClass.replace('bg-', 'text-')}`}>{qualityText}</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                        <span className="block text-sm text-gray-500">Temperature</span>
                        <span className="text-xl font-medium">{formatValue(reading.temperature)}°C</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-sm text-gray-500">Humidity</span>
                        <span className="text-xl font-medium">{formatValue(reading.humidity)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirQualityCard;