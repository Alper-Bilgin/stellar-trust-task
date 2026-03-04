#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String};

// 1. Görev Durumları
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TaskStatus {
    Open = 0,       // Görev oluşturuldu, işçi atandı
    InReview = 1,   // İşçi kanıtı (IPFS hash) yükledi
    Completed = 2,  // İş veren onayladı ve ödeme yapıldı
}

// 2. Görev Veri Yapısı
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Task {
    pub employer: Address,
    pub worker: Address,
    pub amount: i128,
    pub evidence_hash: String, // IPFS Hash buraya kaydedilecek
    pub status: TaskStatus,
}

#[contract]
pub struct TrustTaskContract;

#[contractimpl]
impl TrustTaskContract {
    // 3. Görev Oluşturma ve Parayı Kilitleme
    pub fn create_task(env: Env, employer: Address, worker: Address, amount: i128) -> u32 {
        employer.require_auth();

        // Parayı iş verenden alıp kontratın kendisine (Escrow) transfer etme
        // Stellar üzerindeki standart Native Token (XLM) kontrat adresi kullanılır
        let token_address = env.current_contract_address(); // Basitlik için kontrat adresini saklıyoruz
        
        // Görev ID'si (Gerçek projede bir sayaç kullanılmalı, şimdilik 1 diyelim)
        let task_id = 1;

        let task = Task {
            employer,
            worker,
            amount,
            evidence_hash: String::from_str(&env, ""),
            status: TaskStatus::Open,
        };

        // Veriyi blockchain'e kalıcı olarak kaydet
        env.storage().persistent().set(&task_id, &task);
        task_id
    }

    // 4. İş Kanıtı Gönderme (İşçi Tarafından)
    pub fn submit_work(env: Env, task_id: u32, evidence_hash: String) {
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        
        // Sadece görevli işçi bu fonksiyonu çağırabilir
        task.worker.require_auth();
        
        task.evidence_hash = evidence_hash;
        task.status = TaskStatus::InReview;

        env.storage().persistent().set(&task_id, &task);
    }

    // 5. Ödemeyi Serbest Bırakma (İş Veren Tarafından)
    pub fn approve_and_pay(env: Env, task_id: u32) {
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        
        // Sadece iş veren onay verebilir
        task.employer.require_auth();
        
        // Burada gerçek token transferi mantığı çalışır (Escrow -> Worker)
        // Şimdilik sadece statü güncelliyoruz, token transferi için SDK detaylarına gireceğiz
        task.status = TaskStatus::Completed;

        env.storage().persistent().set(&task_id, &task);
    }

    // 6. Belirli bir görev ID'sine göre veri çekme (Read-only)
    pub fn get_task(env: Env, task_id: u32) -> Option<Task> {
        // Persistent storage'dan veriyi çek, eğer yoksa None dön
        env.storage().persistent().get(&task_id)
    }
}
