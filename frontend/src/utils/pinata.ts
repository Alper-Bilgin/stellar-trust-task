export const uploadToPinata = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            },
            body: formData,
        });

        const data = await res.json();
        return `ipfs://${data.IpfsHash}`;
    } catch (error) {
        console.error("IPFS Yükleme hatası:", error);
        throw error;
    }
};
