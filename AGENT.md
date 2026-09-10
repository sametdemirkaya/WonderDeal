# Proje
WonderDeal Scouting Engine — Futbol kulüpleri ve scoutlar için makine öğrenimi (PCA & KNN) tabanlı, taktiksel oyuncu keşif ve DNA benzerliği hesaplama platformu.

# Stack
Python (FastAPI) · React (Vite) · Tailwind CSS · Pandas & Scikit-learn (Model) · Recharts (Veri Görselleştirme)

# Kurallar
- Full-Stack mimari esastır: Veri hesaplamaları, algoritmalar ve arama işlemleri Backend'de (Python) yapılır, Frontend (React) sadece bu veriyi gösterir.
- Tüm oyuncu veri setleri mevkilere göre ayrık olarak (`FW`, `MF`, `DF` CSV'leri) saklanır ve benzerlik aramaları sadece ilgili mevki içinde yapılır.
- Karar mekanizmalarında belgeler arası hiyerarşi geçerlidir: Mimari bir çelişki çıkarsa **`AGENT.md`** kazanır. Tasarımsal konularda **`DESIGN.md`** kazanır.
- Her geliştirme (milestone) veya alınan kritik mimari karar sonrası `MEMORY.md` (Yol Günlüğü) dosyasına mutlaka yeni bir madde eklenir.
- Arayüz (Frontend), `DESIGN.md`'de belirtilen karanlık (dark) analitik temaya, glassmorphism efektlerine ve kesin tipografi (Inter, Plus Jakarta, JetBrains) kurallarına %100 sadık kalınarak inşa edilir.

# Yapma
- React (Frontend) tarafında Kosinüs Benzerliği, Öklid Uzaklığı veya karmaşık arama (Fuzzy Search) algoritmaları yazma. Tüm matematiksel ve arama yükünü Python'a bırak.
- Tailwind CSS kullanırken, `tailwind.config` içinde belirlenen ana tema renkleri haricinde inline stil (satır içi CSS) yazma. 
- Python kodlarını, makine öğrenimi ağırlıklarını veya benzerlik formüllerini asla istemci (tarayıcı) tarafında açık edecek kodlamalar yapma.
- Belgelenmemiş (MEMORY.md'ye işlenmemiş) büyük mimari değişiklikler yapma.
