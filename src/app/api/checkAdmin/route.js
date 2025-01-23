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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
        }

        console.log(`Checking admin status for ID: ${id}`);

        const db = admin.firestore();

        const adminDoc = await db.collection('admins').doc('adminUsers').get();

        if (!adminDoc.exists) {
            console.log('Admin document not found.');
            return NextResponse.json({ error: 'Admin document not found' }, { status: 404 });
        }

        const adminUserIds = adminDoc.data().userIDs;

        if (!Array.isArray(adminUserIds)) {
            console.log('Invalid data format in admin document.');
            return NextResponse.json({ error: 'Invalid data format in admin document' }, { status: 500 });
        }

        const isAdmin = adminUserIds.includes(id);

        console.log(`ID ${id} is ${isAdmin ? 'an admin' : 'not an admin'}.`);

        return NextResponse.json({ isAdmin }, { status: 200 });
    } catch (error) {
        console.error('Error checking admin user IDs:', error.message);
        return NextResponse.json({ error: 'Failed to check admin user IDs', details: error.message }, { status: 500 });
    }
}