// src/components/SensorChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { prepareChartData } from '../utilities/formatters';

const SensorChart = ({ data, dataKey, title, color = '#3b82f6', unit = '' }) => {
    const chartData = prepareChartData(data, dataKey);

    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
                <p className="text-gray-500">No data available for {title}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis unit={unit} tick={{ fontSize: 12 }} width={40} />
                        <Tooltip
                            formatter={(value) => [`${value}${unit}`, title]}
                            labelFormatter={(label) => `Time: ${label}`}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', border: '1px solid #e0e0e0' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={{ stroke: color, strokeWidth: 2, r: 4, fill: 'white' }}
                            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: color }}
                            name={title}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SensorChart;