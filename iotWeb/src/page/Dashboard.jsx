// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransmitterData, useLatestReading } from '../hooks/useFirebaseData';
import Header from '../components/Header';
import TransmitterSelector from '../components/TransmitterSelector';
import AirQualityCard from '../components/AirQualityCard';
import SensorChart from '../components/SensorChart';
import ReadingsTable from '../components/ReadingsTable';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [selectedTransmitter, setSelectedTransmitter] = useState(null);

    // Fetch data based on selected transmitter
    const { data, loading: dataLoading, error: dataError } = useTransmitterData(selectedTransmitter);
    const { reading: latestReading, loading: readingLoading } = useLatestReading(selectedTransmitter);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Air Quality Monitoring Dashboard</h1>

                    <TransmitterSelector
                        selectedTransmitter={selectedTransmitter}
                        onSelectTransmitter={setSelectedTransmitter}
                    />

                    {dataError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-red-700">Error loading data: {dataError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTransmitter ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <AirQualityCard reading={latestReading} loading={readingLoading} />

                                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <SensorChart
                                        data={data}
                                        dataKey="temperature"
                                        title="Temperature"
                                        color="#ef4444"
                                        unit="°C"
                                    />
                                    <SensorChart
                                        data={data}
                                        dataKey="humidity"
                                        title="Humidity"
                                        color="#3b82f6"
                                        unit="%"
                                    />
                                </div>
                            </div>

                            {/* First row of gas sensors - critical gases for garbage areas */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <SensorChart
                                    data={data}
                                    dataKey="h2s_ppm"
                                    title="Hydrogen Sulfide"
                                    color="#8b5cf6"
                                    unit=" ppm"
                                />
                                <SensorChart
                                    data={data}
                                    dataKey="ch4_ppm"
                                    title="Methane"
                                    color="#ec4899"
                                    unit=" ppm"
                                />
                                <SensorChart
                                    data={data}
                                    dataKey="nh3_ppm"
                                    title="Ammonia"
                                    color="#14b8a6"
                                    unit=" ppm"
                                />
                            </div>

                            {/* Second row of gas sensors - standard pollutants */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <SensorChart
                                    data={data}
                                    dataKey="co_ppm"
                                    title="Carbon Monoxide"
                                    color="#f59e0b"
                                    unit=" ppm"
                                />
                                <SensorChart
                                    data={data}
                                    dataKey="no2_ppm"
                                    title="Nitrogen Dioxide"
                                    color="#10b981"
                                    unit=" ppm"
                                />
                                <SensorChart
                                    data={data}
                                    dataKey="so2_ppm"
                                    title="Sulfur Dioxide"
                                    color="#6366f1"
                                    unit=" ppm"
                                />
                            </div>

                            {/* Additional gas sensors relevant to garbage areas */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <SensorChart
                                    data={data}
                                    dataKey="benzene_ppm"
                                    title="Benzene"
                                    color="#d946ef"
                                    unit=" ppm"
                                />
                                <SensorChart
                                    data={data}
                                    dataKey="smoke_ppm"
                                    title="Smoke"
                                    color="#64748b"
                                    unit=" ppm"
                                />
                                <SensorChart
                                    data={data}
                                    dataKey="air_quality"
                                    title="Air Quality Index"
                                    color="#0ea5e9"
                                    unit=""
                                />
                            </div>

                            <div className="mb-6">
                                <ReadingsTable data={data} loading={dataLoading} />
                            </div>
                        </>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Select a Transmitter</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Please select a transmitter from the dropdown menu above to view air quality data.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;