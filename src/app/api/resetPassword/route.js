import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { initializeApp } from 'firebase/app';
const firebaseConfig = {
    apiKey: "AIzaSyBUMv3D8Zv-o8vx76U3j9vkhC3vkbc_u1Y",
    authDomain: "hackatsst-52e39.firebaseapp.com",
    projectId: "hackatsst-52e39",
    storageBucket: "hackatsst-52e39.firebasestorage.app",
    messagingSenderId: "693174506645",
    appId: "1:693174506645:web:058e4de7d1763ab775379c"
};


export async function GET(request) {
    const app = initializeApp(firebaseConfig);
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const auth = getAuth(app);
        await sendPasswordResetEmail(auth, email);

        return NextResponse.json({ success: true, message: 'Password reset email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error sending password reset email:', error.message);
        return NextResponse.json({ success: false, error: 'Failed to send password reset email', details: error.message }, { status: 500 });
    }
}