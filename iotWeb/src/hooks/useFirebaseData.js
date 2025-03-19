import {useState,useEffect} from "react";
import {fetchTransmitterData,fetchLatestReadings} from "../service/firebase.js";

export function useTransmitterData(transmitterId,limit = 100){
    const [data,setData] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(() => {
        async function fetchData(){
            if (!transmitterId) return;
            try {
                setLoading(true);
                const result = await fetchTransmitterData(transmitterId,limit);
                setData(result);
                setError(null)
            }catch (error) {
                setError(error.message);
                console.log('Error fetching data: ',error);
            }finally {
                setLoading(false);
            }
        }
        fetchData()
    }, [transmitterId,limit]);

    return {data,loading,error}
}

export function useLatestReading(transmitterId){
    const [reading,setReading] = useState(null);
    const [loading,setLoading]= useState(true);
    const [error,setError] = useState(null);

    useEffect(() => {
        async function fetchData(){
            if (!transmitterId){
                setLoading(false);
                return
            }
            try {
                setLoading(true);
                const result = await fetchLatestReadings(transmitterId);
                setReading(result);
                setError(null);
            }catch (error){
                setError(error.message);
                console.error('Error fetching latest reading:',error);
            }finally {
                setLoading(false)
            }
        }
        fetchData();

        // Set up periodic refresh every 30 seconds
        const interval = setInterval(fetchData,30000);
        return () => clearInterval(interval);
    }, [transmitterId]);

    return {reading,loading,error};
}