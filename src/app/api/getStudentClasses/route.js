import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

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
            return NextResponse.json({ error: 'userID parameter is required' }, { status: 400 });
        }

        console.log(`Fetching classes for userID: ${userID}`);

        const db = admin.firestore();

        const classesRef = db.collection('users').doc(userID).collection('joinedClasses');
        const classesSnapshot = await classesRef.get();

        if (classesSnapshot.empty) {
            console.log(`No classes found for userID: ${userID}`);
            return NextResponse.json({ classes: [] }, { status: 200 }); // Return an empty list if no classes are found
        }

        const classes = [];

        classesSnapshot.forEach((doc) => {
            const classData = doc.data();
            classes.push({
                id: doc.id,
                name: classData.className,
            });
        });

        console.log(`Classes retrieved for userID ${userID}:`, classes);

        return NextResponse.json({ classes }, { status: 200 });
    } catch (error) {
        console.error('Error fetching classes for user:', error.message);
        return NextResponse.json({ error: 'Failed to fetch classes', details: error.message }, { status: 500 });
    }
}