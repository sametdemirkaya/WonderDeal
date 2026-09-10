# YOL GÜNLÜĞÜ
*Ne yaptık? Her adım tarihiyle birlikte not edilir.*

- **[2026-09-04] Proje Başlangıcı:** Futbol scout arama motoru web arayüzü için `INTENT.md` oluşturuldu ve hedefler belirlendi. Projenin sınırları ve kapsamı çizildi.
- **[2026-09-04] Veri Entegrasyonu:** Colab'da hazırlanan makine öğrenimi modellerinin çıktıları olan Forvet, Orta Saha ve Defans (FW, MF, DF) veri setleri CSV formatında `Scouting` klasörüne aktarıldı.
- **[2026-09-04] Tasarım Kararları:** Kullanıcının referans gösterdiği premium UI/UX (STITCH) kodları detaylıca analiz edildi. Karanlık tema (Dark Mode), spesifik fontlar (Inter, Plus Jakarta Sans, JetBrains Mono) ve renk paletlerini içeren `%100` uyumlu bir `DESIGN.md` dosyası oluşturuldu.

# KARAR DEFTERİ
*Niye böyle? Alınan kararlar ve gerekçeleri.*

- **Karar:** Mimari olarak Python (FastAPI) Backend ve React (Vite) Frontend olmak üzere Full-Stack yapıya geçilmesi.
  **Gerekçe:** Kullanıcının, makine öğrenimi mantığını barındıran kodların ve algoritmik hesaplamaların tarayıcıda (frontend) görünmesini istememesi. Kod güvenliği ve gizliliğinin sağlanması.
- **Karar:** 3 farklı veri setinin tek bir dosyada birleştirilmek yerine ayrı ayrı (`Scout_Data_FW.csv`, vb.) tutulması.
  **Gerekçe:** Her mevkideki oyuncuların PCA eksen hesaplamaları benzersiz olduğu için, Kosinüs Benzerliği ve Öklid uzaklığı aramalarının matematiksel bütünlüğünü korumak adına yalnızca aynı mevkiye ait oyuncular arasında yapılması zorunluluğu.
- **Karar:** Referans koddaki Tailwind CSS ve UI yapısının benimsenmesi.
  **Gerekçe:** Kullanıcının talep ettiği "premium", şık ve modern (glassmorphism) futbol veri analizi görünümünün projeye tam anlamıyla yansıtılabilmesi.

# DEVAMLILIK (Sıradaki Ne?)
*Yeni bir oturum açıldığında nereden devam edilecek?*

1. Kullanıcıdan kodlamaya geçiş için son onay ve başlama komutu bekleniyor.
2. Onay gelir gelmez `backend/` klasörü açılacak, FastAPI kurulumu yapılacak. Colab'daki Kosinüs ve Öklid algoritmalarını işleyecek bir `app.py` yazılacak.
3. Sonrasında `frontend/` klasörü Vite-React ile kurulup `DESIGN.md` içerisindeki Tailwind ve UI standartları projeye entegre edilecek.

# İLERLEME GÖZLEMİ
*Görünür kanıt. Yolculuğun karne defteri.*

- [x] Niyet Belgesi (`INTENT.md`) hazırlandı.
- [x] Model verileri CSV olarak klasöre aktarıldı.
- [x] Geliştirme/Uygulama Planı (`implementation_plan.md`) onay için sunuldu ve Full-Stack olarak güncellendi.
- [x] Tasarım Rehberi (`DESIGN.md`) referans koda sadık kalınarak yazıldı.
- [x] Yol Günlüğü (`MEMORY.md`) oluşturuldu.
- [ ] Backend (Python/FastAPI) ve algoritma kodlaması.
- [ ] Frontend (React/Vite) ve UI inşası.
- [ ] Entegrasyon ve test süreci.
