"use client"
import {useEffect, useState} from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBUMv3D8Zv-o8vx76U3j9vkhC3vkbc_u1Y",
    authDomain: "hackatsst-52e39.firebaseapp.com",
    projectId: "hackatsst-52e39",
    storageBucket: "hackatsst-52e39.firebasestorage.app",
    messagingSenderId: "693174506645",
    appId: "1:693174506645:web:058e4de7d1763ab775379c"
};

// Initialize Firebase
let auth; // Define `auth` outside of the component to make it globally accessible.

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                console.log("User is signed in:", currentUser.email);
                setUser(currentUser); // Update user state

                // Call the API to check admin status
                const isAdmin = await checkAdminStatus(currentUser.uid);
                if (isAdmin) {
                    window.location.href = "/admin/menu";
                }
            } else {
                console.log("No user is signed in.");
                setUser(null); // Reset user state
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const isAdmin = await checkAdminStatus(userCredential.user.uid);

            if (isAdmin) {
                window.location.href = "/admin/menu";
            } else {
                console.log("User is not an admin.");
            }
        } catch (err) {
            setError(err.message); // Display the error message
            console.error("Error logging in:", err);
        }
    };
    const checkAdminStatus = async (uid) => {
        try {
            const response = await fetch(`/api/checkAdmin?id=${uid}`);
            if (!response.ok) {
                console.error("Failed to check admin status:", await response.text());
                return false;
            }
            const data = await response.json();
            return data.isAdmin; // `isAdmin` is returned from the API
        } catch (err) {
            console.error("Error checking admin status:", err);
            return false;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md"
            >
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-64 h-10 bg-gray-200 rounded-xl px-4 text-red-500 m-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-64 h-10 bg-gray-200 rounded-xl text-red-500 px-4 m-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    className="w-64 h-10 bg-blue-500 text-white rounded-xl m-2 hover:bg-blue-600 transition-colors"
                >
                    Login
                </button>
            </form>
            {user && (
                <div className="mt-4">
                    <p className="text-green-500">Signed in as: {user.email}</p>
                </div>
            )}
        </div>
    );
}