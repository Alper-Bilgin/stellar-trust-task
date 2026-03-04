export const uploadToPinata = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Dosya yüklenemedi");

        const data = await res.json();
        return `ipfs://${data.ipfsHash}`;
    } catch (error) {
        console.error("IPFS Yükleme hatası:", error);
        throw error;
    }
};

export const uploadJSONToPinata = async (jsonObj: any) => {
    try {
        const res = await fetch("/api/upload-json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonObj),
        });

        if (!res.ok) throw new Error("JSON yüklenemedi");

        const data = await res.json();
        return `ipfs://${data.ipfsHash}`;
    } catch (error) {
        console.error("IPFS JSON Yükleme hatası:", error);
        throw error;
    }
};
