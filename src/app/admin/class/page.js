"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import HoverPopupLink from "@/app/hoverPopup";

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
    const [announcementText, setAnnouncementText] = useState("");
    const [popupError, setPopupError] = useState("");
    const [userID, setUserID] = useState("");
    const [classID, setClassID] = useState(""); // Store classID
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState("");
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

                    if (adminStatus && classIDS) {
                        const adminID = await fetchAdminID(currentUser.uid);
                        // Set the userID state
                        setUserID(adminID.uid);
                        // Fetch announcements only if admin and classID exist
                        const data = await fetchAnnouncements(classIDS, adminID.uid);
                        setAnnouncements(data.announcements || []);
                    }
                } catch (err) {
                    console.error("Error fetching announcements:", err.message);
                    setError("Failed to load announcements. Please try again.");
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
        if (!announcementText) {
            setPopupError("Announcement text is required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(
                `/api/addAnnouncement?title=${announcementTitle}&classID=${classID}&description=${encodeURIComponent(
                    announcementText
                )}&adminUID=${userID}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add announcement.");
                setIsSubmitting(false);

            }

            // Success
            console.log("Announcement added successfully.");
            window.location.reload();
            setShowPopup(false); // Close the popup
        } catch (err) {
            console.error("Error adding announcement:", err.message);
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

    const fetchAnnouncements = async (classID, userID) => {
        const response = await fetch(`/api/getClassAnnouncements?userID=${userID}&classID=${classID}`);
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
            <div className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-8 ">
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {isAdmin ? (
                <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold mb-4">Class Announcements</h1>
                        <div>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-4"
                                onClick={() => setShowPopup(true)}
                            >
                                Add Announcement
                            </button>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-4"
                                onClick={() => {
                                    if (classID) {
                                        router.push(`/admin/classEvents?classID=${encodeURIComponent(classID)}`);
                                    } else {
                                        console.error("classID is not defined");
                                    }
                                }
                            }
                            >
                                View events
                            </button>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                onClick={() => {
                                    if (classID) {
                                        router.push(`/admin/classStudents?classID=${encodeURIComponent(classID)}`);
                                    } else {
                                        console.error("classID is not defined");
                                    }
                                }}
                            >
                                View Students
                            </button>
                        </div>

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
                                        <h1 className="text-black text-4xl mb-2">{announcement.title}</h1>
                                        <h2 className="text-black">
                                            {new Date(
                                                announcement.timestamp._seconds * 1000 + announcement.timestamp._nanoseconds / 1e6
                                            ).toLocaleString()}
                                        </h2>
                                        <span className="text-black">
                        {announcement.description.split(" ").map((word, index) => {
                            const isLink = word.includes(".") && !word.includes(" "); // Detect links
                            const url = isLink && !word.startsWith("http") ? `http://${word}` : word;

                            return isValidUrl(word) ? (
                                <span className="text-black" key={index}>
                                    <HoverPopupLink url={url.endsWith(".") ? url.slice(0, -1) : url} />
                                    {url.endsWith(".") ? ". " : " "}
                                </span>
                            ) : (
                                <span className="text-black" key={index}>
                                    {word + " "}
                                </span>
                            );
                        })}
                    </span>
                                    </li>
                                ))
                        ) : (
                            <p className="text-black">No announcements found.</p>
                        )}
                    </ul>
                </div>
            ) : (
                <p className="text-black">You are not authorized to view this page.</p>
            )}
            {showPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-black">Add Announcement</h2>
                        {popupError && <p className="text-red-500 text-sm mb-2">{popupError}</p>}
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={announcementTitle}
                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                            className="w-full h-10 bg-gray-200 text-red-500 rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <textarea
                            placeholder="Enter announcement text"
                            value={announcementText}
                            onChange={(e) => setAnnouncementText(e.target.value)}
                            className="w-full h-20 bg-gray-200 text-black rounded-lg px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

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