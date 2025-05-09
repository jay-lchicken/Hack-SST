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

        const nameOfStudent = searchParams.get('name');
        const email = searchParams.get('email');
        const classID = searchParams.get('classID');
        const adminUID = searchParams.get('adminUID');
        if (!nameOfStudent || !email || !classID || !adminUID) {
            return NextResponse.json(
                { error: 'Missing required parameters: title, description' },
                { status: 400 }
            );
        }

        const auth = admin.auth();
        const user = await auth.getUserByEmail(email);
        const userID = user.uid;
        const db = admin.firestore();

        const adminDoc = await db.collection('admins').doc('adminUsers').get();
        if (!adminDoc.exists) {
            return NextResponse.json({ error: 'Admin document not found' }, { status: 404 });
        }

        const adminUserIds = adminDoc.data().userIDs;

        if (!Array.isArray(adminUserIds) || !adminUserIds.includes(adminUID)) {
            return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 });
        }
        if (!userID) {
            return NextResponse.json({ error: 'User does not exist' }, { status: 403 });
        }
        const userClassesRef = db.collection('users').doc(adminUID).collection('classes').doc(classID).collection('students');
        const newClassRef = userClassesRef.doc(userID);
        await newClassRef.set({
            id: userID,
            studentID: userID,
            name: nameOfStudent,
            email: email,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        const classesRef = db.collection('users').doc(adminUID).collection('classes').doc(classID);
        const classData = await classesRef.get();
        const className = classData.data().name;
        const studentClassRef = db.collection('users').doc(userID).collection('joinedClasses');
        const newClassRefe = studentClassRef.doc(classID);
        await newClassRefe.set({
            id: classID,
            className:className,
            classID: classID,
            teacherId: adminUID,
        });


        return NextResponse.json({ success: true, message: 'Announcement added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding student:', error.message);
        return NextResponse.json(
            { error: 'Failed to add Student', details: error.message },
            { status: 500 }
        );
    }
}