import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'), // Convert escaped \n back to actual newlines
            }),
        });

        console.log('Firebase Admin SDK initialized.');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        throw new Error('Failed to initialize Firebase Admin SDK. Check your environment variables.');
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID'); // Retrieve the "userID" parameter from the query string
        const classID = searchParams.get('classID'); // Retrieve the "classID" parameter from the query string

        if (!userID || !classID) {
            return NextResponse.json(
                { error: 'userID and classID parameters are required' },
                { status: 400 }
            );
        }

        console.log(`Fetching announcements for userID: ${userID}, classID: ${classID}`);
        const db = admin.firestore();

        const batch = db.batch();
        const studentRef = db.collection('users').doc(userID).collection('joinedClasses').doc(classID);
        const classDoc = await studentRef.get();
        const teacherID = classDoc.data().teacherId;
        const classDocRef = db.collection('users').doc(teacherID).collection('classes').doc(classID).collection('events');

        const eventsSnapshot = await classDocRef.get();
        const events = [];
        eventsSnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        await batch.commit();

        if (eventsSnapshot.empty) {
            console.log(`No announcements found for userID: ${userID}, classID: ${classID}`);
            return NextResponse.json({ announcements: [] }, { status: 200 }); // Return an empty list if no announcements are found
        }

        const announcements = [];

        for (const event of events) {
            console.log(event);

            // Reference to the student's document
            const ref = db
                .collection('users')
                .doc(teacherID)
                .collection('classes')
                .doc(classID)
                .collection('events')
                .doc(event.id)
                .collection('Students')
                .doc(userID);

            try {
                const studentDoc = await ref.get();

                // Check if the student document exists and retrieve the 'attended' status
                const attended = studentDoc.exists ? studentDoc.data().attended : false;

                announcements.push({
                    id: event.id,
                    name: event.name || "No name provided", // Gracefully handle missing name
                    attended: attended, // Use the fetched attended status
                    start: event.start,
                    end: event.end,
                    trueTitle: event.trueTitle,
                    falseTitle: event.falseTitle
                });
            } catch (error) {
                console.error(`Error fetching student data for eventID: ${event.id}`, error);
            }
        }

        // Return or process announcements as needed
        return NextResponse.json({ announcements }, { status: 200 });
        console.log(
            `Announcements retrieved for userID ${userID}, classID ${classID}:`,
            announcements
        );

        return NextResponse.json({ announcements }, { status: 200 });
    } catch (error) {
        console.error('Error fetching announcements:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch announcements', details: error.message },
            { status: 500 }
        );
    }
}