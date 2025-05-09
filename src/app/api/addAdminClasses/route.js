import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';



export async function POST(request) {
    if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Convert escaped \n back to actual newlines
            }),
        });

        console.log('Firebase Admin SDK initialized.');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        throw new Error('Failed to initialize Firebase Admin SDK. Check your environment variables.');
    }
}
    try {
        const { searchParams } = new URL(request.url);

        const adminUID = searchParams.get('adminUID');
        const userID = searchParams.get('userID');
        const className = searchParams.get('class');

        if (!adminUID || !userID || !className) {
            return NextResponse.json(
                { error: 'Missing required parameters: adminUID, userID, and class' },
                { status: 400 }
            );
        }

        console.log(`Admin UID: ${adminUID}, User ID: ${userID}, Class: ${className}`);

        const db = admin.firestore();

        const adminDoc = await db.collection('admins').doc('adminUsers').get();
        if (!adminDoc.exists) {
            return NextResponse.json({ error: 'Admin document not found' }, { status: 404 });
        }

        const adminUserIds = adminDoc.data().userIDs;

        if (!Array.isArray(adminUserIds) || !adminUserIds.includes(adminUID)) {
            return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 });
        }

        const userClassesRef = db.collection('users').doc(userID).collection('classes');
        const newClassRef = userClassesRef.doc();
        await newClassRef.set({
            id: newClassRef.id,
            name: className,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Class '${className}' added to userID '${userID}' by adminUID '${adminUID}'.`);

        return NextResponse.json({ success: true, message: 'Class added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding class:', error.message);
        return NextResponse.json(
            { error: 'Failed to add class', details: error.message },
            { status: 500 }
        );
    }
}