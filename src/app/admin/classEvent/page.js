"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
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
    const [nameOfStudent, setNameOfStudent] = useState("");
    const [emailOfStudent, setEmailOfStudent] = useState("");
    const [eventID, setEventID] = useState("");
    const [eventName, setEventName] = useState("")
    const [isPopupVisible, setIsPopupVisible] = useState(false); // State for popup visibility
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // State for selected announcement
    const [isUpdating, setIsUpdating] = useState(false); // State for update status
    const [trueTitle, setTrueTitle] = useState(false); // State for update status
    const [falseTitle, setFalseTitle] = useState(false); // State for update status
    const [showAPILink, setShowAPILink] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://hackatsst.hackclub.com/api/formChangeStatus?adminID=${userID}&classID=${classID}&email=[SET IN FORM]&eventID=${eventID}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    const handlePopupSubmit = async (attended) => {
        if (!selectedAnnouncement) return;

        setIsUpdating(true); // Start updating
        try {
            await handleAttendanceChange(selectedAnnouncement.id, attended); // Call update function
            setIsPopupVisible(false); // Close the popup on successful update
        } catch (error) {
            console.error("Error updating attendance:", error);
            alert("Failed to update attendance. Please try again."); // Show error message
        } finally {
            setIsUpdating(false); // End updating
        }
    };
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
                        setFalseTitle(data.eventData.falseTitle)
                        setTrueTitle(data.eventData.trueTitle)


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
    const handleAttendanceChange = async (studentID, attended) => {
        try {
            const response = await fetch(`/api/updateStudentEvent?userID=${userID}&classID=${classID}&eventID=${eventID}&studentID=${studentID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attended }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error updating attendance:', errorData.error);
                return;
            }
            setAnnouncements((prevAnnouncements) =>
                prevAnnouncements.map((announcement) =>
                    announcement.id === studentID
                        ? { ...announcement, attended } // Update the "attended" field locally
                        : announcement
                )
            );

            console.log('Attendance updated successfully!');
        } catch (error) {
            console.error('Error:', error);
        }
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
                <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold mb-4">Event: {eventName}</h1>
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => setShowAPILink(true)}
                        >
                            View API
                        </button>
                    </div>
                    <ul>
                        {announcements.length > 0 ? (
                            announcements.map((announcement) => (
                                <li
                                    key={announcement.id}
                                    className="p-4 border-b border-gray-300 flex flex-col align-top justify-start"
                                >
                                    <div className="flex flex-row items-center justify-between gap-4">
                                        {/* Name and Email */}
                                        <div className="flex flex-col justify-center">
                                            <span className="text-black text-sm">{announcement.email}</span>
                                            <h1 className="text-black text-4xl font-bold">{announcement.name}</h1>
                                        </div>

                                        {/* Status Capsule */}
                                        <span
                                            className={`px-4 py-2 rounded-full text-white text-sm font-semibold inline-block ${
                                                announcement.attended
                                                    ? "bg-green-500/50 border border-green-500 border-4 text-opacity-100"
                                                    : "bg-red-500/50 border border-red-500 border-4 text-opacity-100"
                                            }`}
                                        >
    {announcement.attended ? trueTitle : falseTitle}
  </span>
                                    </div>


                                    <button
                                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                        onClick={() => {
                                            setSelectedAnnouncement(announcement); // Set the selected announcement
                                            setIsPopupVisible(true); // Show the popup
                                        }}
                                    >
                                        Change Status
                                    </button>
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

            {/* Popup */}
            {isPopupVisible && selectedAnnouncement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-black">
                            Change Status for {selectedAnnouncement.name}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                onClick={() => handlePopupSubmit(true)} // Submit as "Attended: Yes"
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Updating..." : `Mark as ${trueTitle}`}
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                onClick={() => handlePopupSubmit(false)} // Submit as "Attended: No"
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Updating..." :  `Mark as ${falseTitle}`}
                            </button>
                            <button
                                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                                onClick={() => setIsPopupVisible(false)} // Close popup without saving
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showAPILink && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[60%] h-[100%] md:h-[60%] relative">
                        <button
                            onClick={() => setShowAPILink(false)}
                            className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-black rounded-full p-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-black">API Link and JSON</h2>

                        <div className="flex flex-col gap-4 overflow-scroll max-h-[90%]">
                            {/* Clickable API Link */}
                            <div className="text-black">POST JSON</div>
                            <div
                                className="text-blue-500 break-words whitespace-normal cursor-pointer"
                                onClick={handleCopy}
                                title="Click to copy"
                            >
                                https://hackatsst.hackclub.com/api/formChangeStatus
                            </div>
                            {copied && <div className="text-green-500 text-sm">Copied!</div>}

                            {/* JSON Body */}
                            <div className="text-black">Body</div>
                            <pre className="bg-gray-100 p-2 rounded-md text-black whitespace-pre-wrap">
          {JSON.stringify({ attended: "false/true" }, null, 4)}
        </pre>

                            {/* URL Parameters */}
                            <div className="text-black">URL Parameters</div>
                            <pre className="bg-gray-100 p-2 rounded-md text-black whitespace-pre-wrap">
                                email: [EMAIL FIELD]
                            </pre>
                            <pre  className="bg-gray-100 p-2 rounded-md text-black whitespace-pre-wrap">
                                eventID: {eventID}
                            </pre>
                            <pre  className="bg-gray-100 p-2 rounded-md text-black whitespace-pre-wrap">
                                classID: {classID}
                                </pre>
                            <pre  className="bg-gray-100 p-2 rounded-md text-black whitespace-pre-wrap">
                                adminID: {userID}
                                </pre>



                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}