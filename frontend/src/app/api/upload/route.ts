import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        // formData.get('file') ile gelen dosyayı ya da json nesnesini Pinata'ya iletiyoruz

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
                // formData kendi boundary header'larını ayarlayacağı için Content-Type eklemiyoruz
            },
            body: formData,
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: "Pinata yetkilendirme hatası", details: err }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({ ipfsHash: data.IpfsHash });
    } catch (error: any) {
        console.error("API Route IPFS Error:", error);
        return NextResponse.json({ error: "IPFS yüklemesinde sunucu hatası oluştu." }, { status: 500 });
    }
}
