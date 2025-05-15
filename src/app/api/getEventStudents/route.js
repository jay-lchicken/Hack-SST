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
        const eventID = searchParams.get('eventID')
        if (!userID || !classID || !eventID) {
            return NextResponse.json(
                { error: 'userID and classID parameters are required' },
                { status: 400 }
            );
        }

        console.log(`Fetching students for userID: ${userID}, classID: ${classID}`);

        const db = admin.firestore();

        // Reference to the announcements collection
        const announcementsRef = db
            .collection('users')
            .doc(userID)
            .collection('classes')
            .doc(classID)
            .collection('events')
            .doc(eventID)
            .collection('Students')

        const announcementsSnapshot = await announcementsRef.get();

        if (announcementsSnapshot.empty) {
            console.log(`No students found for userID: ${userID}, classID: ${classID}`);
            return NextResponse.json({ announcements: [] }, { status: 200 }); // Return an empty list if no announcements are found
        }

        const data = [];

        announcementsSnapshot.forEach((doc) => {
            const announcementData = doc.data();
            data.push({
                id: doc.id,
                ...announcementData,
            });
        });
        const eventRef = db
            .collection('users')
            .doc(userID)
            .collection('classes')
            .doc(classID)
            .collection('events')
            .doc(eventID);
        const eventSnapshot = await eventRef.get(); // Fetch the document

        const eventData = eventSnapshot.data(); // Extract the data




        return NextResponse.json({ data, eventData  }, { status: 200 });
    } catch (error) {
        console.error('Error fetching events:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch events', details: error.message },
            { status: 500 }
        );
    }
}