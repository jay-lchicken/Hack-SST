"use server";
import { Octokit } from "octokit";
import dotenv from "dotenv";

dotenv.config();

export async function getWorkshop(slug) {
    try {
        console.log("Fetching README for:", slug);

        const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_KEY });

        // ✅ Correct API request
        const response = await octokit.request("GET /repos/hackclub/hackclub/contents/{path}", {
            owner: "hackclub",
            repo: "hackclub",
            path: `workshops/${slug}/README.md`, // ✅ Fixed Path Formatting
            ref: "main",
        });

        if (!response.data || !response.data.content) {
            throw new Error("No content found in GitHub API response");
        }

        // ✅ Convert base64-encoded content to Markdown
        return Buffer.from(response.data.content, "base64").toString("utf-8");

    } catch (error) {
        console.error("Error fetching README.md:", error);
        return "Error: Failed to fetch workshop README.";
    }
}