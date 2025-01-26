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
    appId: "1:693174506645:web:058e4de7d1763ab775379c",
};

// Initialize Firebase
let auth;

export default function Announcements() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupError, setPopupError] = useState("");
    const [userID, setUserID] = useState("");
    const [classID, setClassID] = useState(""); // Store classID
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameOfStudent, setNameOfStudent] = useState("");
    const [emailOfStudent, setEmailOfStudent] = useState("");
    const [eventID, setEventID] = useState("");
    const [eventName, setEventName] = useState("")
    useEffect(() => {
        // Get the classID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const classIDS = urlParams.get("classID");
        const eventIDS = urlParams.get("eventID")
        setEventID(eventIDS);
        // Set classID in state
        setClassID(classIDS);

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Check if the current user is an admin
                    const adminStatus = await checkAdminStatus(currentUser.uid);
                    setIsAdmin(adminStatus);
                    setUserID(currentUser.uid);

                    if (adminStatus && classIDS) {
                        const adminID = await fetchAdminID(currentUser.uid);
                        // Set the userID state
                        setUserID(adminID.uid);
                        // Fetch announcements only if admin and classID exist
                        const data = await fetchAnnouncements(classIDS, adminID.uid, eventIDS);
                        setAnnouncements(data.data || []);
                        setEventName(data.eventData.name)
                    }
                } catch (err) {
                    console.error("Error fetching announcements:", err.message);
                    setError("Failed to load announcements. Please try again.");
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
    const fetchAdminID = async (userID) => {
        const response = await fetch(`/api/getAdminID?userID=${userID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch admin ID");
        }
        const data = await response.json();

        return data;
    }
    const handleAddAnnouncement = async () => {
        setIsSubmitting(true);
        if (!emailOfStudent || !nameOfStudent) {
            setPopupError("Announcement text is required.");
            setIsSubmitting(false);

            return;
        }

        try {
            const response = await fetch(
                `/api/addStudent?name=${nameOfStudent}&classID=${classID}&email=${encodeURIComponent(
                    emailOfStudent
                )}&adminUID=${userID}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add student.");
                setIsSubmitting(false);

            }

            // Success
            console.log("Student added successfully.");
            window.location.reload();
            setShowPopup(false); // Close the popup
        } catch (err) {
            console.error("Error adding student:", err.message);
            setPopupError(err.message);
            setIsSubmitting(false);

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

    const fetchAnnouncements = async (classID, userID, eventID) => {
        const response = await fetch(`/api/getEventStudents?userID=${userID}&classID=${classID}&eventID=${eventID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        return data;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p className="text-black">Loading...</p>
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
                        <h1 className="text-2xl font-bold mb-4">Event: {eventName}</h1>

                    </div>
                    <ul>
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <li
                                    key={announcement.id}
                                    className="p-2 border-b border-gray-300 flex flex-col align-top justify-start"
                                >
                                    <h1 className={"text-black text-4xl"}>{announcement.name}</h1>
                                    <span className={"text-black"}>{announcement.email}</span>

                                </li>
                            ))
                        ) : (
                            <p className="text-black">No students found.</p>
                        )}
                    </ul>
                </div>
            ) : (
                <p className="text-black">You are not authorized to view this page.</p>
            )}

        </div>
    );
}