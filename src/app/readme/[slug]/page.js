"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWorkshop } from "@/components/readme";
const markdownToHtml = require("@hackclub/markdown");
import "./markdown.css"; // Import markdown styles
import HoverPopupLink from "@/app/hoverPopup";
export default function WorkshopPage() {
    const { slug } = useParams();
    const [content, setContent] = useState("Loading...");
    const [readme, setReadme] = useState("");

    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            try {
                const markdown = await getWorkshop(slug);
                let html = await markdownToHtml(markdown, "README.md", "", true);
                setReadme(markdown);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const firstH2 = doc.querySelector("h2");
                if (firstH2) {
                    firstH2.remove(); // ✅ Remove first <h2>
                }
                doc.querySelectorAll("a").forEach((anchor) => {
                    const url = anchor.getAttribute("href");

                    const hoverPopup = doc.createElement("HoverPopupLink");
                    hoverPopup.setAttribute("url", url);
                    hoverPopup.innerHTML = anchor.innerHTML;

                    anchor.replaceWith(hoverPopup);
                });
                html = doc.body.innerHTML; // Convert back to HTML string
                setContent(html); // ✅ Store fetched Markdown in state
            } catch (error) {
                setContent("<p>Error loading workshop content.</p>");
                console.error("Error fetching workshop:", error);
            }
        };

        fetchData();
    }, [slug]);

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px", fontFamily: "Arial, sans-serif" }} className={"min-w-full"}>

            {/* ✅ Apply markdown styling */}
            <div className="markdown-content min-w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl justify-center items-center flex flex-col" >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6cl">README: {slug}</h1>

                <div className={"markdown"} dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* Debugging: See raw HTML output */}
        </div>
    );
}