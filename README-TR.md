# Stellar Trust Marketplace 🌟

**Stellar Trust**, Soroban Akıllı Kontratları ve Next.js kullanılarak Stellar ağında inşa edilmiş merkeziyetsiz, güvenilir (trustless) bir Web3 serbest çalışma (freelance) platformudur.

İşverenlerin kripto para ödülü (XLM) ile açık bir panoya görev eklemelerine, işçilerin bu görevleri üzerine almasına, tamamlamasına ve doğrudan IPFS'e kanıt yükleyerek otomatik blokzincir ödemesi almasına olanak tanır.

🔥 **Canlı Demo:** [https://stellar-trust-task.vercel.app/](https://stellar-trust-task.vercel.app/)
## 🚀 Özellikler

* **Açık Pazar Yeri:** İşçisi henüz atanmamış freelance görevlerin olduğu genel bir ilan panosu.
* **Güvenli Emanet (Escrow):** İşverenler bir görev oluşturduğunda XLM fonları kilitlenir. Fonlar, iş onaylanana kadar akıllı kontrat tarafından güvenle tutulur.
* **IPFS Entegrasyonu:** Görev verileri (Başlık/Açıklama) ve işçi kanıtları (Resim/Dosya) Pinata aracılığıyla değiştirilemez şekilde IPFS ağında saklanır.
* **Görev Alma Sistemi:** İşçiler, Freighter cüzdanlarını bağlayarak istedikleri açık görevi bağımsız bir şekilde üstlenebilirler.
* **Reddetme ve Revizyon:** İşverenler, sunulan IPFS kanıtlarını inceler. Gerekirse işi reddederek (`Reject`), işçinin tekrar kanıt yüklemesi için görevi "Yapılıyor" (In Progress) aşamasına geri gönderebilir.
* **Premium Web3 UI/UX:** Tailwind CSS v4 ile inşa edilmiş; uzay derinliğini yansıtan arka plan, neon parlama efektleri, akıcı Aydınlık/Koyu tema geçişleri sunan etkileyici bir "Glassmorphism" arayüz.
* **Toast Bildirimleri:** Kullanıcıyı rahatsız etmeyen, şık `react-hot-toast` bildirim uyarıları.

## 🛠️ Kullanılan Teknolojiler

* **Akıllı Kontrat:** Rust, Soroban SDK
* **Önyüz (Frontend):** Next.js 15 (App Router), React 19, TypeScript
* **Tasarım:** Tailwind CSS v4, Glassmorphism UI
* **Merkeziyetsiz Depolama:** Pinata (IPFS)
* **Cüzdan Bağlantısı:** Freighter API (`@stellar/freighter-api`)
* **Blokzincir Etkileşimi:** Stellar SDK (`stellar-sdk`), Soroban JS İstemcisi

## 📦 Kurulum Öncesi Gereksinimler

Projeyi yerel ortamınızda çalıştırmadan önce sisteminizde aşağıdakilerin kurulu olduğundan emin olun:

1. **Node.js** (v18 veya üzeri)
2. **Rust ve Cargo** (En güncel kararlı sürüm)
3. **Soroban CLI** (`cargo install --locked soroban-cli` ile kurulabilir)
4. **Freighter Cüzdan Uzantısı** (Tarayıcınıza kurulu ve Stellar Testnet ağına ayarlı olmalı)
5. **Pinata Hesabı** (IPFS yüklemeleri için)

## 🔑 Ortam Değişkenleri (.env.local)

`frontend` klasörünün içinde aşağıdaki yapıda bir `.env.local` dosyası oluşturun:

```env
# Stellar Ayarları
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=SİZİN_SOROBAN_KONTRAT_ID_NİZ
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org

# Pinata IPFS Ayarı (Sadece Vercel gibi Server tarafında tutulmalı, gizli kalmalıdır)
PINATA_JWT="sizin_pinata_jwt_token_kodunuz"
```

## 🏗️ Akıllı Kontrat Dağıtımı (Deployment)

1. Kontrat klasörüne gidin:
   ```bash
   cd contracts/trust_task
   ```
2. Kontratı WebAssembly modülüne derleyin:
   ```bash
   stellar contract build
   ```
3. Stellar Testnet ağına dağıtın (Yükleme yapacağınız CLI hesabında XLM olduğundan emin olun):
   ```bash
   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/trust_task_contract.wasm --source sizin-hesabiniz --network testnet
   ```
4. Önyüzün kullanabilmesi için yeni TypeScript bağlantı (binding) dosyalarını üretin:
   ```bash
   stellar contract bindings typescript --network testnet --contract-id <YENI_KONTRAT_IDNJZ> --output-dir ../../frontend/src/contracts/trust_task_v4 --overwrite
   ```
5. Bu yeni paketleri kurup derleyin:
   ```bash
   cd ../../frontend/src/contracts/trust_task_v4
   npm install && npm run build
   ```

## 💻 Önyüzü (Frontend) Çalıştırma

1. Terminalde `frontend` klasörüne geçin:
   ```bash
   cd frontend
   ```
2. Gerekli kütüphaneleri yükleyin:
   ```bash
   npm install
   ```
3. Geliştirici sunucusunu başlatın:
   ```bash
   npm run dev
   ```
4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) (veya 3001) adresini açın.

## 👨‍💻 Geliştirici

Bu proje **Alper Bilgin** tarafından geliştirilmiştir.
- **Portfolyo:** [alperbilgin.vercel.app](https://alperbilgin.vercel.app/)
- **Linktree:** [Linktr.ee/Alper_Bilgin](https://linktr.ee/Alper_Bilgin)

---
*Rise in Web3 Stellar Bootcamp / Hackathon'u kapsamında hazırlanmıştır.*
