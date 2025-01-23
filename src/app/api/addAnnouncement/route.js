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

        const title = searchParams.get('title');
        const description = searchParams.get('description');
        const classID = searchParams.get('classID');
        const adminUID = searchParams.get('adminUID');
        if (!title || !description || !classID || !adminUID) {
            return NextResponse.json(
                { error: 'Missing required parameters: title, description' },
                { status: 400 }
            );
        }


        const db = admin.firestore();

        const adminDoc = await db.collection('admins').doc('adminUsers').get();
        if (!adminDoc.exists) {
            return NextResponse.json({ error: 'Admin document not found' }, { status: 404 });
        }

        const adminUserIds = adminDoc.data().userIDs;

        if (!Array.isArray(adminUserIds) || !adminUserIds.includes(adminUID)) {
            return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 });
        }

        const userClassesRef = db.collection('users').doc(adminUID).collection('classes').doc(classID).collection('announcements');
        const newClassRef = userClassesRef.doc();
        await newClassRef.set({
            id: newClassRef.id,
            title: title,
            description: description,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });


        return NextResponse.json({ success: true, message: 'Announcement added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding announcement:', error.message);
        return NextResponse.json(
            { error: 'Failed to add Announcement', details: error.message },
            { status: 500 }
        );
    }
}