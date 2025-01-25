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

        if (!userID) {
            return NextResponse.json(
                { error: 'userID parameters are required' },
                { status: 400 }
            );
        }


        const db = admin.firestore();

        // Reference to the announcements collection
        const adminRef = db
            .collection('users')
            .doc(userID)
        const classDoc = await adminRef.get();
        try{
            const teacherID = classDoc.data().uid;
            if (teacherID){
                return NextResponse.json({uid: teacherID }, { status: 200 });
            }else{
                return NextResponse.json({uid: userID }, { status: 200 });
            }
        }catch (error){
            return NextResponse.json(
                { error: 'Failed to fetch', details: error.message },
                { status: 500 }
            );

        }

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch', details: error.message },
            { status: 500 }
        );
    }
}