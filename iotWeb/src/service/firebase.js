import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, get, query, orderByKey, limitToLast } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOStbryJ-cgbxv8nSv-z3dTisE4IXQN3A",
    authDomain: "iot-project-b0154.firebaseapp.com",
    databaseURL: "https://iot-project-b0154-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "iot-project-b0154",
    storageBucket: "iot-project-b0154.firebasestorage.app",
    messagingSenderId: "708269918033",
    appId: "1:708269918033:web:2679117496fa98880bb570",
    measurementId: "G-5667YDJDCN"
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication functions
export const loginWithEmail = async (email,password) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const userCredential = await signInWithEmailAndPassword(auth,email,password);
        return userCredential.user;
    }catch (error){
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return true
    }catch (error){
        throw error;
    }
}

// Data fetching functions
export const fetchTransmitterData = async (transmitterId, limit = 100) => {
    try {
        const dataRef = ref(database, `/air_quality_data/transmitter_${transmitterId}`);
        const dataQuery = query(dataRef, orderByKey(), limitToLast(limit));
        const snapshot = await get(dataQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching transmitter data:", error);
        throw error;
    }
};

export const fetchLatestReadings = async (transmitterId) => {
    try {
        const dataRef = ref(database, `/air_quality_data/transmitter_${transmitterId}`);
        const dataQuery = query(dataRef, orderByKey(), limitToLast(1));
        const snapshot = await get(dataQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            const key = Object.keys(data)[0];
            return {
                id: key,
                ...data[key]
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching latest reading:", error);
        throw error;
    }
};

export const getTransmitterIds = () => {
    // Based on your code, these are the IDs
    return [101, 102, 103];
};
export { auth, database };