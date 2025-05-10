import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';



export async function POST(request) {
    if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY, // Convert escaped \n back to actual newlines
            }),
        });

        console.log('Firebase Admin SDK initialized.');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        throw new Error('Failed to initialize Firebase Admin SDK. Check your environment variables.');
    }
}
    try {
        const auth = admin.auth();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const classID = searchParams.get('classID');
        const eventID = searchParams.get('eventID');
        const user = await auth.getUserByEmail(email);
        const adminID = searchParams.get('adminID');
        const userID = user.uid;
        const body = await request.json(); // Parse the JSON body
        var { attended } = body; // Extract the 'attended' value

        if (!email || !classID || !eventID || attended === undefined) {
            return NextResponse.json(
                { error: 'Missing required parameters or data.',
                email: email,
                classID: classID,
                eventID: eventID,
                attended: attended,
                    studentID: userID
                },
                { status: 400 }
            );
        }

        const db = admin.firestore();
        if (attended == 'true'){
            attended = true;
        }else{
            attended = false;
        }
        // Reference to the student document
        const studentRef = db
            .collection('users')
            .doc(adminID)
            .collection('classes')
            .doc(classID)
            .collection('events')
            .doc(eventID)
            .collection('Students')
            .doc(userID);

        // Update the 'attended' field in the student document
        await studentRef.update({ attended });

        console.log(`Updated status for studentID: ${userID} to ${attended}`);

        return NextResponse.json(
            { message: 'Student status updated successfully.' },
            { status: 200 }
        );
    } catch (error) {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        console.error('Error updating status:', error.message);
        return NextResponse.json(
            { error: 'Failed to update status', details: error.message , email: email},
            { status: 500 }
        );
    }
}