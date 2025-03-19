// src/components/TransmitterSelector.jsx
import { getTransmitterIds } from '../service/firebase';

const TransmitterSelector = ({ selectedTransmitter, onSelectTransmitter }) => {
    const transmitterIds = getTransmitterIds();

    return (
        <div className="mb-6">
            <label htmlFor="transmitter-select" className="block text-sm font-medium text-gray-800 mb-2">
                Select Transmitter ID
            </label>
            <div className="relative">
                <select
                    id="transmitter-select"
                    value={selectedTransmitter || ''}
                    onChange={(e) => onSelectTransmitter(e.target.value ? parseInt(e.target.value) : null)}
                    className="block w-full pl-4 pr-10 py-2.5 text-base bg-white border border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    rounded-lg shadow-sm appearance-none transition-colors duration-200 ease-in-out"
                >
                    <option value="">Select a transmitter</option>
                    {transmitterIds.map((id) => (
                        <option key={id} value={id}>
                            Transmitter {id}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default TransmitterSelector;