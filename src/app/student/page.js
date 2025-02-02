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
                <div className={"flex flex-row"}>
                    <div className="loader">
                        <svg viewBox="0 0 80 80">
                            <circle r="32" cy="40" cx="40" id="test"></circle>
                        </svg>
                    </div>

                    <div className="loader triangle">
                        <svg viewBox="0 0 86 80">
                            <polygon points="43 8 79 72 7 72"></polygon>
                        </svg>
                    </div>

                    <div className="loader">
                        <svg viewBox="0 0 80 80">
                            <rect height="64" width="64" y="8" x="8"></rect>
                        </svg>
                    </div>
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
                <button className="logout" onClick={logout} >


                    <div className="sign">
                        <svg viewBox="0 0 512 512">
                            <path
                                d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                        </svg>
                    </div>

                    <div className="logtext ">Logout</div>
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
                                className="button"
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