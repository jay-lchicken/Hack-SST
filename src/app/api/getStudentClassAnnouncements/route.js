import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import {off} from "next/dist/client/components/react-dev-overlay/pages/bus";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                priva1teKey: serviceAccount.private_key.replace(/\\n/g, '\n'), // Convert escaped \n back to actual newlines
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
        const offset = searchParams.get('offset'); // Retrieve the "offset" parameter from the query string
        if (!userID || !classID) {
            return NextResponse.json(
                { error: 'userID and classID parameters are required' },
                { status: 400 }
            );
        }

        console.log(`Fetching announcements for userID: ${userID}, classID: ${classID}`);

        const db = admin.firestore();

        // Reference to the announcements collection
        const studentRef = db
            .collection('users')
            .doc(userID)
            .collection('joinedClasses')
            .doc(classID)
        const classDoc = await studentRef.get();
        const teacherID = classDoc.data().teacherId;
        const classDocRef = db.collection('users').doc(teacherID).collection('classes').doc(classID).collection('announcements')
            .orderBy('timestamp', 'desc')
            .offset(parseInt(offset))// Order by createdAt field (descending for latest first)
            .limit(3)
        const announcementsSnapshot = await classDocRef.get();



        const classDocRef2 = db.collection('users').doc(teacherID).collection('classes').doc(classID).collection('announcements')


        const countQuery = classDocRef2.count();
        const countSnapshot = await countQuery.get();
        const totalSize = countSnapshot.data().count;
        if (announcementsSnapshot.empty) {
            console.log(`No announcements found for userID: ${userID}, classID: ${classID}`);
            return NextResponse.json({ announcements: [] }, { status: 200 }); // Return an empty list if no announcements are found
        }

        const announcements = [];

        announcementsSnapshot.forEach((doc) => {
            const announcementData = doc.data();
            announcements.push({
                id: doc.id,
                ...announcementData,
            });
        });

        console.log(
            `Announcements retrieved for userID ${userID}, classID ${classID}:`,
            announcements
        );

        return NextResponse.json({ announcements,totalSize }, { status: 200 });
    } catch (error) {
        console.error('Error fetching announcements:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch announcements', details: error.message },
            { status: 500 }
        );
    }
}