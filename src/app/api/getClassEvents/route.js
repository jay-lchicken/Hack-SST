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

        // Reference to the announcements collection
        const announcementsRef = db
            .collection('users')
            .doc(userID)
            .collection('classes')
            .doc(classID)
            .collection('events');

        const announcementsSnapshot = await announcementsRef.get();

        if (announcementsSnapshot.empty) {
            console.log(`No events found for userID: ${userID}, classID: ${classID}`);
            return NextResponse.json({ announcements: [] }, { status: 200 }); // Return an empty list if no announcements are found
        }

        const events = [];

        announcementsSnapshot.forEach((doc) => {
            const announcementData = doc.data();
            events.push({
                id: doc.id,
                ...announcementData,
            });
        });



        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error('Error fetching events:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch events', details: error.message },
            { status: 500 }
        );
    }
}