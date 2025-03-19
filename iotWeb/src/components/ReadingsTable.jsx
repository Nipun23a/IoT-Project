// src/components/ReadingsTable.jsx
import {formatDate, formatValue, getAirQualityColor, getPollutantColor} from '../utilities/formatters';

const ReadingsTable = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Recent Readings</h3>
                <div className="text-center py-8">
                    <p className="text-gray-500">No data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-medium text-gray-700">Recent Readings</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NH₃
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SO₂
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NO₂
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Benzene
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CO
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Air Quality
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(-10).reverse().map((reading) => (
                        <tr key={reading.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(reading.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPollutantColor('nh3_ppm', reading.nh3_ppm)}>
                    {formatValue(reading.nh3_ppm)} ppm
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPollutantColor('so2_ppm', reading.so2_ppm)}>
                    {formatValue(reading.so2_ppm)} ppm
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPollutantColor('no2_ppm', reading.no2_ppm)}>
                    {formatValue(reading.no2_ppm)} ppm
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPollutantColor('benzene_ppm', reading.benzene_ppm)}>
                    {formatValue(reading.benzene_ppm)} ppm
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={getPollutantColor('co_ppm', reading.co_ppm)}>
                    {formatValue(reading.co_ppm)} ppm
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAirQualityColor(reading.air_quality)} text-white`}>
                    {formatValue(reading.air_quality, 0)}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReadingsTable;