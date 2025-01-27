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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [announcementText, setAnnouncementText] = useState("");
    const [popupError, setPopupError] = useState("");
    const [userID, setUserID] = useState("");
    const [classID, setClassID] = useState(""); // Store classID
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [attendance, setAttendance] = useState("");

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
                    const data = await fetchAnnouncements(classIDS, currentUser.uid);
                    setAnnouncements(data.announcements || []);
                    const sdata = await fetchAttendance(classIDS, currentUser.uid);
                    setAttendance(sdata.announcements || []);

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




    const fetchAnnouncements = async (classID, userID) => {
        const response = await fetch(`/api/getStudentClassAnnouncements?userID=${userID}&classID=${classID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        return data;
    };
    const fetchAttendance = async (classID, userID) => {
        const response = await fetch(`/api/getStudentAttendance?userID=${userID}&classID=${classID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        return data;
    };
    const isValidUrl = urlString=> {
        var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
            '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
        return !!urlPattern.test(urlString);
    }
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
        <div className="bg-neutral-900 flex flex-col items-center justify-center min-h-screen">
            {/* Main Content */}
            <div className="w-full  max-w-2xl md:max-w-6xl bg-neutral-800 shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Class Announcements</h1>
                    <button
                        className="text-white text-xl px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰ Events
                    </button>
                </div>
                <ul>
                    {announcements.length > 0 ? (
                        announcements
                            .sort((a, b) => {
                                const dateA = new Date(a.timestamp._seconds * 1000 + a.timestamp._nanoseconds / 1e6);
                                const dateB = new Date(b.timestamp._seconds * 1000 + b.timestamp._nanoseconds / 1e6);
                                return dateB - dateA; // Sort from latest to oldest
                            })
                            .map((announcement) => (
                            <li
                                key={announcement.id}
                                className="p-4 border-b border-neutral-700 flex flex-col justify-start"
                            >
                                <h1 className="text-white text-4xl mb-2">{announcement.title}</h1>
                                <span>
                                    {announcement.description.split(' ').map((word, index) => {
                                        const isLink = word.includes('.') && !word.includes(' '); // Detect links
                                        const url = isLink && !word.startsWith('http') ? `http://${word}` : word;

                                        return isValidUrl(word) ? (
                                            // <span>
                                            //
                                            // </span>
                                                <span>
                                                    <a
                                                        key={index}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'green', textDecoration: 'underline' }}
                                                    >
                                                    {word}
                                                </a>
                                                    <span> </span>
                                                </span>


                                        ) : (
                                            word + ' '
                                        )
                                    })}
                                </span>
                            </li>
                        ))
                    ) : (
                        <p className="text-white">No announcements found.</p>
                    )}
                </ul>
            </div>

            {/* Sidebar for Attendance */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-neutral-700 shadow-lg p-6 transform ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 z-50`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Class Events</h1>
                    <button
                        className="text-white text-xl px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ✕ Close
                    </button>
                </div>
                <ul>
                    {attendance.length > 0 ? (

                        attendance
                            .sort((a, b) => {
                                const dateA = new Date(Number(a.start)); // Convert "start" to a number and create a Date object
                                const dateB = new Date(Number(b.start));
                                return dateB - dateA; // Sort from latest to oldest
                            })
                            .map((attendee) => (
                            <li
                                key={attendee.id}
                                className="p-4 border-b border-neutral-600 flex flex-col justify-start"
                            >
                                <h1 className="text-white text-4xl mb-2">{attendee.name}</h1>
                                <span className={"text-white"}>
  Start: {new Date(Number(attendee.start)).toLocaleString()}
</span>
                                <span className={"text-white"}>
  End: {new Date(Number(attendee.end)).toLocaleString()}
</span>
                                <span
                                    className={`mt-4 px-4 py-2 rounded-full text-white text-sm font-semibold inline-block ${
                                        attendee.attended
                                            ? 'bg-green-500/50 border border-green-500'
                                            : 'bg-red-500/50 border border-red-500'
                                    }`}
                                >
            {attendee.attended ? attendee.trueTitle : attendee.falseTitle}
          </span>
                            </li>
                        ))
                    ) : (
                        <p className="text-white">No attendance records found.</p>
                    )}
                </ul>
            </div>

            {/* Sidebar Background Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}