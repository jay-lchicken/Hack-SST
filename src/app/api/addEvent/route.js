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

        const name = searchParams.get('name');
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const adminUID = searchParams.get('adminUID');
        const classID = searchParams.get('classID')
        const falseTit = searchParams.get('false')
        const trueTit = searchParams.get('true')

        if (!name || !start || !end || !adminUID ||!classID) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const auth = admin.auth();

        const db = admin.firestore();

        const adminDoc = await db.collection('admins').doc('adminUsers').get();
        if (!adminDoc.exists) {
            return NextResponse.json({ error: 'Admin document not found' }, { status: 404 });
        }

        const adminUserIds = adminDoc.data().userIDs;

        if (!Array.isArray(adminUserIds) || !adminUserIds.includes(adminUID)) {
            return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 });
        }

        const userClassesRef = db.collection('users').doc(adminUID).collection('classes').doc(classID).collection('events');
        const newClassRef = userClassesRef.doc();
        await newClassRef.set({
            name: name,
            start: start,
            end: end,
            trueTitle: trueTit,
            falseTitle: falseTit
        });

        const studentsRef = db
            .collection('users')
            .doc(adminUID)
            .collection('classes')
            .doc(classID)
            .collection('students');

        const studentSnapshot = await studentsRef.get();



        const students = [];

        studentSnapshot.forEach((doc) => {
            const studentData = doc.data();
            students.push({
                id: doc.id,
                ...studentData,
            });
        });
        for (const student of students){
            const studentEventRef = db.collection('users').doc(adminUID).collection('classes').doc(classID).collection('events').doc(newClassRef.id).collection("Students");
            const newStudentEventRef = studentEventRef.doc(student.id);
            await newStudentEventRef.set({
                name: student.name,
                email: student.email,
                attended: false,
            });
        }

        return NextResponse.json({ success: true, message: 'Event added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding event:', error.message);
        return NextResponse.json(
            { error: 'Failed to add event', details: error.message },
            { status: 500 }
        );
    }
}