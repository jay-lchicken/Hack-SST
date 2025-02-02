'use client';
import Image from 'next/image';

export default function Home() {
  return (

    <body class=" w-screen h-full">

      <main class="bg-neutral-900 w-full flex flex-col justify-evenly items-center pb-8 m-0">
        <header className="w-screen  flex justify-center items-center flex-wrap">
          <h1 className="text-4xl text-red-500 font-bold md:text-6xl pl-2">
            Hack@SST
          </h1>
          <h1 class="h-[60px] w-36 text-xl font-semibold text-white">
            a branch of
            <span>
                <a
                    href="https://hackclub.com"
                    target="_blank"
                    class="text-xl font-semibold text-red-500 underline hover:decoration-wavy px-1"
                >
                  Hack Club
                </a>
              </span>
          </h1>
        </header>
        <div class="mt-9 max-w-screen-lg w-[80%] p-10 mx-[10%] flex flex-col items-center">
          <img
            class="w-full md:w-[60%]"
            src="https://assets.hackclub.com/flag-standalone.svg"
            alt="https://assets.hackclub.com/flag-standalone.svg"
          />
          <h1 class="text-2xl text-red-500 font-bold md:text-4xl pt-9 pb-3">
            Welcome Aboard!
          </h1>
          <h1 class="w-[90%] text-xl font-normal text-white text-center md:w-[40%]">
            This is the official
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Hack@SST
              </a>
            </span>
            page and
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Member's Portal
              </a>
            </span>
            , find out everything about us!
          </h1>
          <button className="animated-button mt-4" onClick={() => window.location.href="/login"}>
            <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
              ></path>
            </svg>
            <span className="text">Sign In As Member</span>
            <span className="circle"></span>
            <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
              ></path>
            </svg>
          </button>

        </div>
        <div class="max-w-screen-lg w-[80%] p-10 mx-[10%] mb-[4%] bg-neutral-800 rounded-3xl md:p-14">
          <img
              class="h-auto w-full object-cover rounded-3xl mb-4"
              src="./BannerImg1.jpg"
              alt="./BannerImg1.jpg"
          />
          <h1 class="text-xl font-bold text-white pb-3 md:text-2xl">
            Who Are We?
          </h1>
          <h1 class="text-xl font-light text-white">
            Hi, we are
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Hack@SST
              </a>
            </span>
            , student initiated club in our secondary school,
            <span>
              <a
                href="https://www.sst.edu.sg/"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
                target="_blank"
              >
                School Of Science And Technology
              </a>
            </span>
            . Started in 2025, my friend
            <span>
              <a
                href="https://github.com/jay-lchicken"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                Hong Yu
              </a>
            </span>
            asked
            <span>
              <a
                href="https://github.com/miri-takutodoji-fukito"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                me
              </a>
            </span>
            to help him bring
            <span>
              <a
                href="https://hackclub.com"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                Hack Club
              </a>
            </span>
            into the school, in hopes to build a community of just hobby coders,
            even if they didn't know coding. We wanted to make coding a norm to
            people who didn't expect to see it in that way.
          </h1>
        </div>
        <div class="max-w-screen-lg w-[80%] p-10 mx-[10%] mb-[4%] bg-neutral-800 rounded-3xl md:p-14">
          <img
            class="h-auto w-full object-cover rounded-3xl mb-4"
            src="./BannerImg2.png"
            alt="./BannerImg2.png"
          />
          <h1 class="text-xl font-bold text-white pb-3 md:text-2xl">
            What Is
            <span>
              <a
                href="https://hackclub.com"
                target="_blank"
                class="text-xl font-bold text-red-500 underline hover:decoration-wavy md:text-2xl px-1"
              >
                Hack Club
              </a>
            </span>
            ?
          </h1>
          <h1 class="text-xl font-light text-white">
            <span>
              <a
                href="https://hackclub.com"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                Hack Club
              </a>
            </span>
            is a non-profit based in the US which aims to build an
            internationally connected groups of teen Hackers and to encourage
            the building of these skills.
            <span>
              <a
                href="https://hackclub.com"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                Hack Club
              </a>
            </span>
            also hosts hackathons and multiple events every year, and even have
            a rewards system to encourage and acknowledge the efforts and works
            of Hackers in the community
          </h1>
        </div>
        <div class="max-w-screen-lg w-[80%] p-10 mx-[10%] mb-[4%] bg-neutral-800 rounded-3xl md:p-14">
          <h1 class="text-xl font-bold text-white pb-3 md:text-2xl">
            Who Are Hackers?
          </h1>
          <h1 class="text-xl font-light text-white">
            I've been using the word
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Hackers
              </a>
            </span>
            over the website and you might be concerned of what it even means.
            The teen
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Hackers
              </a>
            </span>
            I am referring to are not
            <span>
              <a
                href="https://www.google.com/search?q=what+is+a+hacker&sca_esv=0dfdeba661b81aed&sxsrf=AHTn8zpGU7BxwhPSL58k-2ROwzHqOBFwQA%3A1737623619181&ei=QwiSZ827Cs_U4-EPlIuegQs&ved=0ahUKEwiN6cu0wIuLAxVP6jgGHZSFJ7AQ4dUDCBI&uact=5&oq=what+is+a+hacker&gs_lp=Egxnd3Mtd2l6LXNlcnAiEHdoYXQgaXMgYSBoYWNrZXIyCxAAGIAEGJECGIoFMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBxAAGIAEGApIgx5Q1QxYrRxwA3gBkAEAmAF5oAGoCKoBBDE3LjG4AQPIAQD4AQGYAhWgAvUIwgIKEAAYsAMY1gQYR8ICChAjGIAEGCcYigXCAhAQABiABBixAxhDGIMBGIoFwgIREC4YgAQYsQMY0QMYgwEYxwHCAgsQABiABBixAxiDAcICBBAjGCfCAgoQABiABBhDGIoFwgIIEC4YgAQYsQPCAhYQLhiABBixAxjRAxhDGIMBGMcBGIoFwgIIEAAYgAQYsQPCAgoQABiABBgUGIcCmAMAiAYBkAYIkgcEMTkuMqAH_IsB&sclient=gws-wiz-serp"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                digital privacy invaders
              </a>
            </span>
            , in
            <span>
              <a
                href="https://hackclub.com"
                target="_blank"
                class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1"
              >
                Hack Club
              </a>
            </span>
            we like to call ourselves
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Hackers
              </a>
            </span>
            as we are
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                creators
              </a>
            </span>
            who want to
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                make a difference
              </a>
            </span>
            in the world and leave it better than when we came.
          </h1>
        </div>
        <div class="max-w-screen-lg w-[80%] p-10 mx-[10%] mb-[4%] bg-neutral-800 rounded-3xl md:p-14 flex flex-col justify-center gap-7">
          <h1 class="text-xl font-bold text-white md:text-2xl">Registration</h1>
          <h1 class="text-xl font-light text-white">
            <span>
              <a class="text-xl font-normal text-red-500 underline hover:decoration-wavy cursor-pointer px-1">
                Hack@SST
              </a>
            </span>
            registrations start around late Febuary and end by mid to late March
            to Sec 1s with a rough intake of 20-30 members every year
          </h1>
          <div class="flex flex-col items-center gap-3">
            <button className="animated-button mt-4" >
              <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
              <span className="text">Registration Closed</span>
              <span className="circle"></span>
              <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
            </button>
            {/* <a class="text-white font-normal hover:font-bold" href="reg.html">
              Find Out More
            </a> */}
          </div>
        </div>
      </main>
    </body>
  );
}
