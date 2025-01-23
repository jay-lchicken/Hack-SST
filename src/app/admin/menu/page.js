"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
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
let auth;

export default function Home() {
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
                try {
                    // Check if the current user is an admin
                    const adminStatus = await checkAdminStatus(currentUser.uid);
                    setIsAdmin(adminStatus);
                    setUserID(currentUser.uid);
                    if (adminStatus) {
                        // Fetch admin classes if the user is an admin
                        const data = await fetchAdminClasses();
                        setClasses(data.classes || []);
                    }
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
    const handleAddClass = async () => {
        setIsSubmitting(true);
        if (!className) {
            setPopupError("All fields required.");
            return;
        }

        try {
            const response = await fetch(
                `/api/addAdminClasses?adminUID=${userID}&userID=${userID}&class=${className}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add class.");
            }

            // Success
            console.log("Class added successfully.");
            window.location.reload();
            setShowPopup(false); // Close the popup
        } catch (err) {
            console.error("Error adding class:", err.message);
            setPopupError(err.message);
        }
        setIsSubmitting(false);
    };
    const checkAdminStatus = async (userId) => {
        const response = await fetch(`/api/checkAdmin?id=${userId}`);
        if (!response.ok) {
            throw new Error("Failed to check admin status");
        }
        const data = await response.json();
        return data.isAdmin;
    };

    const fetchAdminClasses = async () => {
        const response = await fetch(`/api/getAdminClasses?userID=${auth.currentUser.uid}`);
        if (!response.ok) {
            throw new Error("Failed to fetch admin classes");
        }
        const data = await response.json();
        return data;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p>Loading...</p>
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {isAdmin ? (
                <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold mb-4">Your Classes</h1>
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => setShowPopup(true)}>
                            Add Class
                        </button>
                    </div>
                    <ul>
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <li
                                    key={cls.id}
                                    className="p-2 border-b border-gray-300  flex justify-between items-center"
                                >
                                    <span className={"text-black"}>{cls.name}</span>
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        onClick={() => (window.location.href = `../admin/class?classID=${cls.id}`)}
                                    >
                                        View
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>No classes found.</p>
                        )}
                    </ul>
                </div>
            ) : (
                <p>You are not authorized to view this page.</p>
            )}
            {showPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Class</h2>
                        {popupError && <p className="text-red-500 text-sm mb-2">{popupError}</p>}

                        <input
                            type="text"
                            placeholder="Class Name"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex justify-end">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600"
                                onClick={handleAddClass}
                            >
                                {isSubmitting ? "Adding..." : "Add"}
                            </button>
                            <button
                                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}