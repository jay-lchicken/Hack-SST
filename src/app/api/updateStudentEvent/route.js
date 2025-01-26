import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
            }),
        });

        console.log('Firebase Admin SDK initialized.');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        throw new Error('Failed to initialize Firebase Admin SDK. Check your environment variables.');
    }
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID');
        const classID = searchParams.get('classID');
        const eventID = searchParams.get('eventID');
        const studentID = searchParams.get('studentID');

        const body = await request.json(); // Parse the JSON body
        const { attended } = body; // Extract the 'attended' value

        if (!userID || !classID || !eventID || !studentID || attended === undefined) {
            return NextResponse.json(
                { error: 'Missing required parameters or data.' },
                { status: 400 }
            );
        }

        const db = admin.firestore();

        // Reference to the student document
        const studentRef = db
            .collection('users')
            .doc(userID)
            .collection('classes')
            .doc(classID)
            .collection('events')
            .doc(eventID)
            .collection('Students')
            .doc(studentID);

        // Update the 'attended' field in the student document
        await studentRef.update({ attended });

        console.log(`Updated attended for studentID: ${studentID} to ${attended}`);

        return NextResponse.json(
            { message: 'Student attendance updated successfully.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating attendance:', error.message);
        return NextResponse.json(
            { error: 'Failed to update attendance', details: error.message },
            { status: 500 }
        );
    }
}