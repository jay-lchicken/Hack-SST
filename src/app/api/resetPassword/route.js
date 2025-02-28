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
    const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        await sendPasswordResetEmail(auth, email);
}