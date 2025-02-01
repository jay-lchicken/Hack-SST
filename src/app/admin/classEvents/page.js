"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import {router} from "next/client";
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
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupError, setPopupError] = useState("");
    const [userID, setUserID] = useState("");
    const [classID, setClassID] = useState(""); // Store classID
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameOfEvent, setNameOfEvent] = useState("");
    const [emailOfStudent, setEmailOfStudent] = useState("");
    const [eventStart, setEventStart] = useState("");
    const [eventEnd, setEventEnd] = useState("")
    const [trueTitle, setTrueTitle] = useState("")
    const [falseTitle, setFalseTitle] = useState("")

    useEffect(() => {
        // Get the classID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const classIDS = urlParams.get("classID");

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
                        const data = await fetchAnnouncements(classIDS, adminID.uid);
                        setAnnouncements(data.events || []);
                    }
                } catch (err) {
                    console.error("Error fetching events:", err.message);
                    setError("Failed to load events. Please try again.");
                } finally {
                    setLoading(false);
                }
            } else {
                // Redirect to login if no user is logged in
                router.push("/login");
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
        if (!nameOfEvent || !eventStart || !eventEnd) {
            setPopupError("Fields is required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const startDate = new Date(eventStart);
            const endDate = new Date(eventEnd);

// Get their timestamps (in milliseconds since January 1, 1970)
            const startTimestamp = startDate.getTime();
            const endTimestamp = endDate.getTime();
            const response = await fetch(
                `/api/addEvent?name=${nameOfEvent}&start=${startTimestamp}&end=${endTimestamp}&adminUID=${userID}&classID=${classID}&true=${trueTitle}&false=${falseTitle}`,
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

    const fetchAnnouncements = async (classID, userID) => {
        const response = await fetch(`/api/getClassEvents?userID=${userID}&classID=${classID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();
        console.log(data)
        return data;
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-8 ">
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {isAdmin ? (
                <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold mb-4">Class Events</h1>
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => setShowPopup(true)}
                        >
                            Add Events
                        </button>
                    </div>
                    <ul>
                        {announcements.length > 0 ? (
                            announcements
                                .sort((a, b) => {
                                    const dateA = new Date(Number(a.start)); // Convert "start" to a number and create a Date object
                                    const dateB = new Date(Number(b.start));
                                    return dateB - dateA; // Sort from latest to oldest
                                })
                                .map((announcement) => (
                                <li
                                    key={announcement.id}
                                    className="p-2 border-b border-gray-300 flex flex-col align-top justify-start"
                                >
                                    <h1 className={"text-black text-4xl"}>{announcement.name}</h1>
                                    <span className={"text-black"}>
  Start: {new Date(Number(announcement.start)).toLocaleString()}
</span>
                                    <span className={"text-black"}>
  End: {new Date(Number(announcement.end)).toLocaleString()}
</span>
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        onClick={() => (router.push(`../admin/classEvent?classID=${classID}&eventID=${announcement.id}`))}
                                    >
                                        View
                                    </button>


                                </li>
                            ))
                        ) : (
                            <p className="text-black">No events found.</p>
                        )}
                    </ul>
                </div>
            ) : (
                <p className="text-black">You are not authorized to view this page.</p>
            )}
            {showPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-black">Add Events</h2>
                        {popupError && <p className="text-red-500 text-sm mb-2">{popupError}</p>}
                        <input
                            type="text"
                            placeholder="Name of event"
                            value={nameOfEvent}
                            onChange={(e) => setNameOfEvent(e.target.value)}
                            className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            placeholder="True Title"
                            value={trueTitle}
                            onChange={(e) => setTrueTitle(e.target.value)}
                            className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="text"
                            placeholder="False Title"
                            value={falseTitle}
                            onChange={(e) => setFalseTitle(e.target.value)}
                            className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex flex-col">
                            <input
                                type="datetime-local"
                                placeholder="Event Start"
                                value={eventStart}
                                onChange={(e) => setEventStart(e.target.value)}
                                className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="datetime-local"
                                placeholder="Event End"
                                value={eventEnd}
                                onChange={(e) => setEventEnd(e.target.value)}
                                className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600"
                                onClick={handleAddAnnouncement}
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