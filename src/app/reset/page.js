"use client";
import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        // Dynamically load the Fillout script
        const script = document.createElement("script");
        script.src = "https://server.fillout.com/embed/v1/";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script); // Cleanup when component unmounts
        };
    }, []);

    return (
        <div
            style={{ width: "100%", height: "500px" }}
            data-fillout-id="h7bEizyJ6Jus"
            data-fillout-embed-type="standard"
            data-fillout-inherit-parameters
            data-fillout-dynamic-resize
        />
    );
}