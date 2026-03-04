#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

// 1. Görev Durumları
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TaskStatus {
    Open = 0,       // Görev oluşturuldu, henüz kimse almadı
    InProgress = 1, // Bir işçi görevi aldı, üzerinde çalışıyor
    InReview = 2,   // İşçi kanıtı (IPFS hash) yükledi
    Completed = 3,  // İşveren onayladı ve ödeme yapıldı
}

// 2. Görev Veri Yapısı
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Task {
    pub employer: Address,
    pub description_cid: String, // Görev detayları (Title, Description) IPFS Hash'i
    pub worker: Option<Address>, // Görev ilk açıldığında None
    pub amount: i128,
    pub evidence_hash: String,
    pub status: TaskStatus,
}

const TASK_COUNT: soroban_sdk::Symbol = symbol_short!("TASK_CNT");

#[contract]
pub struct TrustTaskContract;

#[contractimpl]
impl TrustTaskContract {
    // Toplam görev sayısını getirme yardımcı fonksiyonu
    pub fn get_task_count(env: Env) -> u32 {
        env.storage().persistent().get(&TASK_COUNT).unwrap_or(0)
    }

    // 3. Görev Oluşturma (Sadece İşveren ve Açıklama Hash'i var)
    pub fn create_task(env: Env, employer: Address, description_cid: String, amount: i128) -> u32 {
        employer.require_auth();

        // Yeni Task ID oluştur
        let mut task_id = Self::get_task_count(env.clone());
        task_id += 1;

        let task = Task {
            employer,
            description_cid,
            worker: None, // Henüz kimse almadı
            amount,
            evidence_hash: String::from_str(&env, ""),
            status: TaskStatus::Open,
        };

        // Veriyi blockchain'e kaydet
        env.storage().persistent().set(&task_id, &task);
        env.storage().persistent().set(&TASK_COUNT, &task_id);
        
        task_id
    }

    // 4. Görevi Kabul Etme (İşçi Tarafından)
    pub fn accept_task(env: Env, task_id: u32, worker: Address) {
        worker.require_auth();
        
        // Görevi getir
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        
        // Sadece Open olan görevler alınabilir
        if task.status != TaskStatus::Open {
            panic!("Bu gorev su anda alinamaz");
        }
        
        // İşçiyi ata ve durumu güncelle
        task.worker = Some(worker);
        task.status = TaskStatus::InProgress;

        env.storage().persistent().set(&task_id, &task);
    }

    // 5. İş Kanıtı Gönderme (İşçi Tarafından)
    pub fn submit_work(env: Env, task_id: u32, evidence_hash: String) {
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        
        // Sadece görevli işçi çağırabilir
        if let Some(assigned_worker) = &task.worker {
            assigned_worker.require_auth();
        } else {
            panic!("Bu goreve atanan bir isci yok");
        }
        
        // Sadece InProgress durumundayken kanıt yüklenebilir
        if task.status != TaskStatus::InProgress {
            panic!("Sadece calisilan gorevlere kanit yuklenebilir");
        }
        
        task.evidence_hash = evidence_hash;
        task.status = TaskStatus::InReview;

        env.storage().persistent().set(&task_id, &task);
    }

    // 6. Ödemeyi Serbest Bırakma (İş Veren Tarafından)
    pub fn approve_and_pay(env: Env, task_id: u32) {
        let mut task: Task = env.storage().persistent().get(&task_id).unwrap();
        
        // Sadece işveren onay verebilir
        task.employer.require_auth();
        
        if task.status != TaskStatus::InReview {
            panic!("Gorev incelemede degil");
        }
        
        task.status = TaskStatus::Completed;

        env.storage().persistent().set(&task_id, &task);
    }

    // 7. Belirli bir görev ID'sine göre veri çekme
    pub fn get_task(env: Env, task_id: u32) -> Option<Task> {
        env.storage().persistent().get(&task_id)
    }
}
