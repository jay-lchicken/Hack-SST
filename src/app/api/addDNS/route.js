import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const content = searchParams.get("content");
        const comment = searchParams.get("comment");
        const name = searchParams.get("name");

        if (!content || !comment || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const CLOUDFLARE_ZONE_ID = process.env.ZONE;
        const CLOUDFLARE_API_TOKEN = process.env.KEY; 

        const CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`;

        const payload = {
            comment: comment,
            content: content,
            name: name,
            proxied: true, // Hardcoded
            ttl: 1,        // Hardcoded (Auto TTL)
            type: "CNAME"  // Hardcoded
        };

        const response = await fetch(CLOUDFLARE_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.success) {
            return NextResponse.json({ error: "Failed to create DNS record", details: data.errors }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "DNS record created successfully", data });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
