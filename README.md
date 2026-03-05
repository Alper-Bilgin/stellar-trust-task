# Stellar Trust Marketplace 🌟

**Stellar Trust** is a decentralized, trustless Web3 freelance task marketplace built on the Stellar network using Soroban Smart Contracts and Next.js. 

It allows employers to post tasks to an open board with a cryptocurrency bounty (XLM), and enables workers to claim, complete, and submit proof of their work directly to IPFS for verification and automated blockchain payout.

🔥 **Live Demo:** [https://stellar-trust-task.vercel.app/](https://stellar-trust-task.vercel.app/)
## 🚀 Features

* **Open Marketplace:** Browse a public board of unassigned freelance tasks.
* **Trustless Escrow:** Employers lock up XLM when creating a task. Funds are held securely by the smart contract until the work is approved.
* **IPFS Integration:** Task metadata (Titles & Descriptions) and worker evidence (Images/Documents) are stored immutably on IPFS via Pinata.
* **Worker Claiming:** Workers can autonomously claim any open task using their Freighter wallet.
* **Reject & Revision Flow:** Employers can review submitted IPFS evidence. If unsatisfactory, they can reject the work, reverting the task to the "In Progress" stage for the worker to try again.
* **Premium Web3 UI/UX:** A stunning "Glassmorphism" interface built with Tailwind CSS v4, featuring a deep-space radial gradient, neon glow effects, and seamless Dark/Light mode switching via `next-themes`.
* **Toast Notifications:** Elegant, non-blocking alerts using `react-hot-toast`.

## 🛠️ Tech Stack

* **Smart Contract:** Rust, Soroban SDK
* **Frontend:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS v4, Glassmorphism UI
* **Decentralized Storage:** Pinata (IPFS)
* **Wallet Authentication:** Freighter API (`@stellar/freighter-api`)
* **Blockchain Interaction:** Stellar SDK (`stellar-sdk`), Soroban Client

## 📦 Prerequisites

Before running the project locally, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **Rust & Cargo** (Latest stable)
3. **Soroban CLI** (`cargo install --locked soroban-cli`)
4. **Freighter Wallet Extension** (Installed in your browser and on the Stellar Testnet)
5. **Pinata Account** (for IPFS uploads)

## 🔑 Environment Variables

Create a `.env.local` file in the `frontend` directory with the following structure:

```env
# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=YOUR_SOROBAN_CONTRACT_ID
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org

# Pinata IPFS Configuration (Keep secure on Vercel/Serverside)
PINATA_JWT="your_pinata_jwt_token_here"
```

## 🏗️ Smart Contract Deployment

1. Navigate to the contracts folder:
   ```bash
   cd contracts/trust_task
   ```
2. Build the contract to WebAssembly:
   ```bash
   stellar contract build
   ```
3. Deploy to the Stellar Testnet (Make sure your CLI identity is funded):
   ```bash
   stellar contract deploy --wasm target/wasm32-unknown-unknown/release/trust_task_contract.wasm --source your-identity --network testnet
   ```
4. Generate TypeScript bindings for the frontend:
   ```bash
   stellar contract bindings typescript --network testnet --contract-id <YOUR_NEW_CONTRACT_ID> --output-dir ../../frontend/src/contracts/trust_task_v4 --overwrite
   ```
5. Install and build the bindings:
   ```bash
   cd ../../frontend/src/contracts/trust_task_v4
   npm install && npm run build
   ```

## 💻 Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) (or 3001) in your browser.

## 👨‍💻 Author

Developed by **Alper Bilgin**.
- **Portfolio:** [alperbilgin.vercel.app](https://alperbilgin.vercel.app/)
- **Linktree:** [Linktr.ee/Alper_Bilgin](https://linktr.ee/Alper_Bilgin)

---
*Built for the Rise in Web3 Stellar Bootcamp / Hackathon.*
