# WonderDeal Scouting Engine — Proje Yol Haritası (ROADMAP)

Bu belge, `INTENT.md`, `DESIGN.md`, `MEMORY.md`, `AGENT.md` ve `TRD.md` dosyalarında alınan tüm mimari ve tasarımsal kararlara dayanarak hazırlanmış adım adım geliştirme yol haritasıdır.

---

## 🟢 Faz 1: Proje Kurulumu ve Altyapı (Hazırlık Aşaması)
*Bu fazda klasör yapıları oluşturulur ve bağımlılıklar yüklenir.*

- [x] Tüm proje yönetim (MD) belgelerinin oluşturulması.
- [x] Makine öğrenimi verilerinin (`Scout_Data_FW.csv`, `MF`, `DF`) proje klasörüne entegre edilmesi.
- [ ] **Backend Kurulumu:** `backend/` klasörünün oluşturulması. Python sanal ortamının (venv) kurulması. `FastAPI`, `uvicorn`, `pandas`, `scikit-learn` ve `rapidfuzz` (veya benzeri arama) kütüphanelerinin indirilmesi.
- [ ] **Frontend Kurulumu:** `frontend/` klasörünün `npm create vite@latest` ile React projesi olarak başlatılması. `tailwindcss`, `zustand`, `recharts`, `lucide-react` paketlerinin kurulması.
- [ ] **Tasarım Sisteminin Eklenmesi:** `DESIGN.md` referans alınarak `tailwind.config.js` içine koyu lacivert renk paletinin ve font (Inter, Plus Jakarta Sans, JetBrains Mono) ayarlarının yapılması.

---

## 🟡 Faz 2: Backend (FastAPI) Geliştirmesi
*Python tarafında verilerin işlenmesi ve API'lerin dışarı açılması.*

- [ ] **Veri Yükleme (Lifespan):** Uygulama başlarken 3 CSV dosyasının da Pandas DataFrame olarak sunucu RAM'ine (`lifespan` event'i ile) yüklenmesi.
- [ ] **Pydantic Modelleri:** Gelen isteklerin (Request) ve dönen yanıtların (Response) doğrulanması için şemaların (TRD'deki `SearchResponseItem`, `CompareRequest` vb.) yazılması.
- [ ] **Endpoint 1 (`GET /api/search`):** Frontend'den gelen arama metni ile hızlı (Fuzzy) isim aramasının yapılıp JSON döndürülmesi.
- [ ] **Endpoint 2 (`POST /api/compare`):** Hedef oyuncunun PC vektörleri alınarak, aynı havuzdaki (pozisyondaki) oyuncular arasında **Kosinüs Benzerliği** (DNA) ve **Öklid Uzaklığı** (Kalite/Hacim farkı) hesaplayan makine öğrenimi algoritmasının koda dökülmesi.
- [ ] **Filtrelerin Eklenmesi:** Yaş ve dakika kısıtlamalarının (TRD.md) `compare` fonksiyonu içine dahil edilmesi.
- [ ] **CORS Ayarları:** React ön yüzünün FastAPI'ye sorunsuz bağlanabilmesi için CORS middleware'in aktifleştirilmesi.

---

## 🟠 Faz 3: Frontend (React) Temel İnşası
*Arayüzün kullanıcı etkileşimine ve Zustand durum yönetimine hazırlanması.*

- [ ] **Zustand State Kurulumu:** `useScoutStore` dosyasının oluşturulup seçili oyuncu, aktif filtreler ve arama sonuçları statelerinin tanımlanması.
- [ ] **Ana Layout ve Glassmorphism:** Sol menü (Sidebar) ve ana içerik alanının (Main Content) tasarlanması. `backdrop-blur-xl` ve `bg-surface/80` sınıflarıyla şeffaf premium görünümün verilmesi.
- [ ] **Arama Çubuğu (Search Bar):** Kullanıcının isim girdiği ve `GET /api/search` tetikleyerek çıkan sonuçlardan "Hedef Oyuncu" seçtiği bileşenin yazılması.
- [ ] **Filtre Paneli:** Yaş aralığı (Slider/Input), minimum dakika ve pozisyon (FW, MF, DF) seçeneklerini barındıran kontrol panelinin oluşturulması.

---

## 🔴 Faz 4: Entegrasyon ve Veri Görselleştirme (UI/UX)
*Frontend ve Backend'in bağlanması ve verilerin grafiklere dökülmesi.*

- [ ] **API Entegrasyonu:** "Karşılaştır" butonuna basıldığında Zustand'daki verilerin `POST /api/compare` adresine gönderilip dönen sonuçların state'e yazdırılması.
- [ ] **Sonuç Tablosu (Results Table):** Gelen benzer oyuncuların listeleneceği tablonun oluşturulması. (Tipografi olarak *JetBrains Mono* kullanılması).
- [ ] **DNA İlerleme Çubukları (Progress Bars):** DNA Benzerliği yüzdelerinin tablonun içinde renkli yatay çubuklar (`h-1.5`) şeklinde gösterilmesi.
- [ ] **Radar Grafiği (Spider Chart):** `Recharts` kütüphanesi kullanılarak seçilen oyuncuların PC (Temel Bileşen) değerlerinin 5 veya 10 eksenli bir radar grafiğinde üst üste bindirilerek görselleştirilmesi.

---

## 🟣 Faz 5: Test, Optimizasyon ve Kapanış
*Uygulamanın hız testi ve tasarım pürüzlerinin giderilmesi.*

- [ ] **Arama Performans Testi:** Backend arama (Fuzzy) hızının ölçülmesi. Gerekirse önbellekleme (LRU Cache) eklenmesi.
- [ ] **Hesaplama Hızı Kontrolü:** Matris işlemlerinin (Cosine/Euclidean) performansının incelenip 5000+ satırda gecikme yaşatmadığının teyidi.
- [ ] **Görsel Revizyon:** Hata durumlarında, boş durumlarda (oyuncu bulunamadı) gösterilecek UI/UX uyarı kartlarının eklenmesi.
- [ ] **Canlıya Alma Hazırlığı:** `MEMORY.md` dosyasına son eklemelerin yapılması ve kodun devredilmesi.
