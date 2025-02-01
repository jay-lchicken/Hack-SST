"use client";
import { useEffect, useState } from "react";
import {onAuthStateChanged, signOut} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {useRouter} from "next/navigation";

const firebaseConfig = {
    apiKey: "AIzaSyBUMv3D8Zv-o8vx76U3j9vkhC3vkbc_u1Y",
    authDomain: "hackatsst-52e39.firebaseapp.com",
    projectId: "hackatsst-52e39",
    storageBucket: "hackatsst-52e39.firebasestorage.app",
    messagingSenderId: "693174506645",
    appId: "1:693174506645:web:058e4de7d1763ab775379c"
};

// Initialize Firebase
let auth;

export default function Home() {
    const router = useRouter();

    const [isAdmin, setIsAdmin] = useState(false);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [className, setClassName] = useState("");
    const [popupError, setPopupError] = useState("");
    const [userID, setUserID] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try{
                    const data = await fetchClasses();
                    setClasses(data.classes || []);
                } catch (err) {
                    console.error("Error fetching admin classes:", err.message);
                    setError("Failed to load admin data. Please try again.");
                } finally {
                    setLoading(false);
                }
            } else {
                // Redirect to login if no user is logged in
                window.location.href = "/login";
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);
    const fetchClasses = async () => {
        const response = await fetch(`/api/getStudentClasses?userID=${auth.currentUser.uid}`);
        if (!response.ok) {
            throw new Error("Failed to fetch admin classes");
        }
        const data = await response.json();
        return data;
    };
    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (err) {
            console.error("Error logging out:", err.message);
        }
    };




    if (loading) {
        return (
            <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-8 ">
                {/* Logo */}
                <img
                    className="w-[30%] max-w-xs sm:max-w-sm h-auto "
                    src="https://assets.hackclub.com/flag-standalone.svg"
                    alt="Hack Club Flag"
                />

                {/* Loading Animation */}
                <div id="load" className="flex space-x-2 text-4xl">
                    {["G", "N", "I", "D", "A", "O", "L"].map((letter, index) => (
                        <div key={index}>{letter}</div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <body className="bg-neutral-900 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl bg-neutral-800 shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Your Classes</h1>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-white hover:text-red-500"
                    onClick={logout}>
                    Logout
                </button>

            </div>
            <ul>
                {classes.length > 0 ? (
                    classes.map((cls) => (
                        <li
                            key={cls.id}
                            className="p-4 border-b border-neutral-700 flex justify-between items-center"
                        >
                            <span className="text-white">{cls.name}</span>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-white hover:text-red-500"
                                onClick={() => router.push(`../student/class?classID=${cls.id}`)}
                            >
                                View
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-white">No classes found.</p>
                )}
            </ul>
        </div>


        </body>
    );
}