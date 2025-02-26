import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        // Get query parameters from URL
        const { searchParams } = new URL(req.url);
        const content = searchParams.get("content");
        const comment = searchParams.get("comment");
        const name = searchParams.get("name");
        const TXT = searchParams.get("TXT")
        // Validate required fields
        if (!content || !comment || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Cloudflare API Credentials
        const CLOUDFLARE_ZONE_ID = process.env.ZONE;
        const CLOUDFLARE_API_TOKEN = process.env.KEY; // ⚠️ Replace with your actual token

        // Cloudflare API URL
        const CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;
        var data = {};
        // Construct the request payload
        if (TXT == "TXT"){
            const payload = {
                comment: comment,
                content: content, // Content for the TXT record
                name: name,
                proxied: false,   // TXT records cannot be proxied
                ttl: 1,          // Hardcoded (Auto TTL)
                type: "TXT"      // Changed from "CNAME" to "TXT"
            };
            
            // Send request to Cloudflare API
            const response = await fetch(CLOUDFLARE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
                },
                body: JSON.stringify(payload),
            });
            data = await response.json();
        }else{
            const payload = {
                comment: comment,
                content: content,
                name: name,
                proxied: true, // Hardcoded
                ttl: 1,        // Hardcoded (Auto TTL)
                type: "CNAME"  // Hardcoded
            };
    
            // Send request to Cloudflare API
            const response = await fetch(CLOUDFLARE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
                },
                body: JSON.stringify(payload),
            });
            data = await response.json();

        }

        // Parse response

        if (!data.success) {
            return NextResponse.json({ error: "Failed to create DNS record", details: data.errors }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "DNS record created successfully", data });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
