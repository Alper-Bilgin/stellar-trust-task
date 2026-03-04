import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
            body: JSON.stringify({
                pinataContent: body,
                pinataMetadata: {
                    name: "TrustTask_Data.json"
                }
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: "Pinata JSON yetkilendirme hatası", details: err }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({ ipfsHash: data.IpfsHash });
    } catch (error: any) {
        console.error("API Route JSON IPFS Error:", error);
        return NextResponse.json({ error: "IPFS JSON yüklemesinde sunucu hatası oluştu." }, { status: 500 });
    }
}
