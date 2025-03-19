// Format timestamp string
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString.replace('_', 'T'));
    date.setMinutes(date.getMinutes() + 270); // Add 4 hours 30 minutes

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};


// Format decimal values with fixed precision
export const formatValue = (value, precision = 2) => {
    if (value === undefined || value === null) return 'N/A';
    return Number(value).toFixed(precision);
};

// Get color class based on air quality value
export const getAirQualityColor = (value) => {
    if (value >= 0 && value <= 50) return 'bg-green-500';
    if (value > 50 && value <= 100) return 'bg-yellow-500';
    if (value > 100 && value <= 150) return 'bg-orange-500';
    if (value > 150 && value <= 200) return 'bg-red-500';
    if (value > 200 && value <= 300) return 'bg-purple-500';
    return 'bg-rose-800';
};

// Get descriptive text based on air quality value
export const getAirQualityText = (value) => {
    if (value >= 0 && value <= 50) return 'Good';
    if (value > 50 && value <= 100) return 'Moderate';
    if (value > 100 && value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value > 150 && value <= 200) return 'Unhealthy';
    if (value > 200 && value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
};

// Get color class based on pollutant concentration
export const getPollutantColor = (pollutant, value) => {
    const thresholds = {
        nh3_ppm: {good: 1, moderate: 5, unhealthy: 10, severe: 20},
        so2_ppm: {good: 0.1, moderate: 0.5, unhealthy: 1.0, severe: 3.0},
        no2_ppm: {good: 0.053, moderate: 0.1, unhealthy: 0.36, severe: 0.65},
        benzene_ppm: {good: 0.005, moderate: 0.01, unhealthy: 0.05, severe: 0.1},
        co_ppm: {good: 9, moderate: 15, unhealthy: 30, severe: 50},
        alcohol_ppm: {good: 10, moderate: 50, unhealthy: 100, severe: 200},
        smoke_ppm: {good: 5, moderate: 15, unhealthy: 30, severe: 50}
    };

    const limits = thresholds[pollutant] || {good: 50, moderate: 100, unhealthy: 150, severe: 200};

    if (value <= limits.good) return 'text-green-500';
    if (value <= limits.moderate) return 'text-yellow-500';
    if (value <= limits.unhealthy) return 'text-orange-500';
    return 'text-red-500';
};

// Transform data structure for charts
// Transform data structure for charts with time adjustment
export const prepareChartData = (data, field) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map(item => {
        // Parse the timestamp and adjust by adding 4:30
        let timeStr = 'Unknown';
        if (item.timestamp) {
            const date = new Date(item.timestamp.replace('_', 'T'));
            date.setMinutes(date.getMinutes() + 270); // Add 4 hours 30 minutes
            timeStr = date.toTimeString().substring(0, 5); // Format as HH:MM
        }

        return {
            name: timeStr,
            value: item[field] || 0
        };
    }).slice(-20); // Only last 20 datapoints for readability
};