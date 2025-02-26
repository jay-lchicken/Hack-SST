
'use client';
import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signInWithRedirect } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {useRouter} from "next/navigation";
import { OAuthProvider } from "firebase/auth";
import {createAuth0Client} from '@auth0/auth0-spa-js';

const auth0Client = await createAuth0Client({
  domain: 'dev-xkvf20e8rm5sb3i6.us.auth0.com',
  client_id: 'i9GkofRJoqtAfsHQgqFssfjRBeTnQgX1'
});
const firebaseConfig = {
  apiKey: 'AIzaSyBUMv3D8Zv-o8vx76U3j9vkhC3vkbc_u1Y',
  authDomain: 'hackatsst-52e39.firebaseapp.com',
  projectId: 'hackatsst-52e39',
  storageBucket: 'hackatsst-52e39.firebasestorage.app',
  messagingSenderId: '693174506645',
  appId: '1:693174506645:web:058e4de7d1763ab775379c',
};

// Initialize Firebase
let auth; // Define `auth` outside of the component to make it globally accessible.

export default function Home() {
    const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [app, setApp] = useState(null);
  useEffect(() => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    setApp(app);
    auth = getAuth(app);

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('User is signed in:', currentUser.email);
        setUser(currentUser); // Update user state

        // Call the API to check admin status
        const isAdmin = await checkAdminStatus(currentUser.uid);
        if (isAdmin) {
          router.push('/admin/menu');
        } else {
          router.push('/student');
        }
      } else {
        console.log('No user is signed in.');
        setUser(null); // Reset user state
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  const handle0Auth = async (e) => {
    e.preventDefault();
    const auth0User = await auth0Client.getUser();
    const idToken = await auth0Client.getIdTokenClaims();

    const firebaseUser = await app.auth().signInWithCustomToken(idToken.__raw);
    console.log('Firebase User:', firebaseUser);
  }
  const handleLogin = async (e) => {
    setError(''); // Clear any previous error
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const isAdmin = await checkAdminStatus(userCredential.user.uid);

      if (isAdmin) {

        router.push('/admin/menu');
      } else {
        router.push('/student');
      }
    } catch (err) {
      setError('Error logging you in'); // Display the error message
      console.error('Error logging in:', err);
    }
  };
  const checkAdminStatus = async (uid) => {
    try {
      const response = await fetch(`/api/checkAdmin?id=${uid}`);
      if (!response.ok) {
        console.error('Failed to check admin status:', await response.text());
        return false;
      }
      const data = await response.json();
      return data.isAdmin; // `isAdmin` is returned from the API
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    //     <form
    //         onSubmit={handleLogin}
    //         className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md"
    //     >
    //         <h1 className="text-2xl font-bold mb-4">Login</h1>
    //         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
    //         <input
    //             type="email"
    //             placeholder="Email"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //             className="w-64 h-10 bg-gray-200 rounded-xl px-4 text-red-500 m-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    //         />
    //         <input
    //             type="password"
    //             placeholder="Password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             className="w-64 h-10 bg-gray-200 rounded-xl text-red-500 px-4 m-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    //         />
    //         <button
    //             type="submit"
    //             className="w-64 h-10 bg-blue-500 text-white rounded-xl m-2 hover:bg-blue-600 transition-colors"
    //         >
    //             Login
    //         </button>
    //     </form>
    // {user && (
    //     <div className="mt-4">
    //         <p className="text-green-500">Signed in as: {user.email}</p>
    //     </div>
    // )}
    // </div>
    <body class="bg-neutral-900">

      <main class="bg-neutral-900 w-full flex flex-row items-center m-0 justify-between">
        <div class="w-2/3 flex flex-col items-center justify-center">
          <div class="mt-9 max-w-screen-lg w-[80%] p-10 mx-[10%] flex flex-col items-center">
          <img
            class="w-full md:w-[45%]"
            src="https://assets.hackclub.com/flag-standalone-wtransparent.svg"
            alt="https://assets.hackclub.com/flag-standalone-wtransparent.svg"
          />
          <h1 class="text-2xl text-white font-bold w-[80%] text-center md:text-4xl pt-9 pb-3 md:w-[50%]">
            Login
          </h1>
        </div>
        <form
          onSubmit={handleLogin}
          class="flex flex-col items-center justify-around gap-4 w-full  "
          name="auth"
        >
          {user && (
                <div
                    className="mb-10 relative w-full max-w-96 flex flex-wrap items-center justify-center py-3 pl-4 pr-14 rounded-lg text-base font-medium [transition:all_0.5s_ease] border-solid border border-[#4CAF50] text-[#2D6A4F] [&_svg]:text-[#2D6A4F] group bg-[linear-gradient(#4CAF501a,#4CAF501a)]"
                >
                  <button
                      type="button"
                      aria-label="close-error"
                      onClick={() => setError("")}
                      className="absolute right-4 p-1 rounded-md transition-opacity text-[#4CAF50] border border-[#4CAF50] opacity-40 hover:opacity-100"
                  >
                    <svg
                        stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        height="16"
                        width="16"
                        className="sizer [--sz:16px] h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                  <p className="flex flex-row items-center mr-auto gap-x-2">
                    <svg
                        stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        height="28"
                        width="28"
                        className="h-7 w-7"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    Signed In As: {user.email}
                  </p>
                </div>
            )}
            {error &&
                <div
                    className="mb-10 relative w-full max-w-96 flex flex-wrap items-center justify-center py-3 pl-4 pr-14 rounded-lg text-base font-medium [transition:all_0.5s_ease] border-solid border border-[#f85149] text-[#b22b2b] [&amp;_svg]:text-[#b22b2b] group bg-[linear-gradient(#f851491a,#f851491a)] "
                >
                  <button
                      type="button"
                      aria-label="close-error"
                        onClick={() => setError('')}
                      className="absolute right-4 p-1 rounded-md transition-opacity text-[#f85149] border border-[#f85149] opacity-40 hover:opacity-100"
                  >
                    <svg
                        stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        height="16"
                        width="16"
                        className="sizer [--sz:16px] h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                  <p className="flex flex-row items-center mr-auto gap-x-2">
                    <svg
                        stroke="currentColor"
                        fill="none"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        height="28"
                        width="28"
                        className="h-7 w-7"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                          d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                      ></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    Incorrect Username or Password
                  </p>
                </div>

            }

            <div className="input__container">
              <div className="shadow__input"></div>
              <button className="input__button__shadow">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#000000"
                    width="20px"
                    height="20px"
                >
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  ></path>
                </svg>
              </button>
              <input
                  className="password-input"
                  type="email"
                  placeholder="Type your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input__container mt-8 mb-8">
              <div className="shadow__input"></div>
              <button className="input__button__shadow">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#000000"
                    width="20px"
                    height="20px"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M21 18h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zM12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </button>
              <input
                  className="password-input"
                  type="password"
                  placeholder="Type your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="button">Login</button>
        </form>
        </div>
<div class="w-1/2 h-screen flex items-stretch justify-end">
  <img class="h-full w-auto object-cover" src="/189497810-6d9d2920-6bee-4990-9553-57699918ae9c.png"/>
</div>


      </main>
    </body>
  );
}


