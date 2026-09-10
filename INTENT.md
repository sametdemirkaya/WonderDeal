## Bağlam
Şu an ne durumdayız? Hangi sistem? Hangi açı?
Mevcut durumda Google Colab üzerinde Python (Pandas & Scikit-learn) kullanılarak geliştirilmiş bir futbol scout veri bilimi modeli bulunmaktadır. Bu model, PCA ve KNN algoritmalarıyla oyuncu istatistiklerini işleyerek "DNA Benzerliği" ve "Kalite Farkı Skoru" hesaplamaktadır. Ancak bu algoritmik gücü son kullanıcının (scoutların) kolayca kullanabileceği bir arayüz bulunmamaktadır. Hedefimiz, arka uçtaki bu hazır yapının potansiyelini ortaya çıkaracak reaktif bir web ön yüzü (frontend) açısı kurgulamaktır.

## Hedef
Ne istiyoruz? Tek cümlede çıktı.
Futbol scoutlarının takımına özel "gizli cevherleri" bulabilmesi için, arka plandaki veri bilimi modelinin sonuçlarını akıllı arama, dinamik filtreler ve interaktif radar grafikleriyle sunan modern, hızlı ve reaktif bir web uygulaması (frontend) inşa etmek.

## Kullanıcı
Kim için? Hangi rolden?
- Futbol kulüplerindeki profesyonel scoutlar (oyuncu izleme uzmanları).
- Transfer komiteleri ve sportif direktörler.
- Veri odaklı çalışan futbol analistleri ve ilgili son kullanıcılar.

## Başarı kriteri
Nasıl ölçeriz? Sayılabilir liste.
1. Akıllı arama çubuğunun (hatalı yazım toleranslı) sorunsuz çalışması ve aranan hedefin doğru olarak ilk 3 sonuçta listelenmesi.
2. Yaş ve oynama süresi filtrelerinin anlık (reaktif) olarak sonuç tablosunu güncellemesi.
3. Sonuç tablosunda seçilen 2-3 farklı oyuncu ile hedef oyuncunun verilerinin (maksimum 4 oyuncu) interaktif radar grafiğinde (spider chart) birbiri üzerine bindirilerek doğru ve anlaşılır şekilde görselleştirilmesi.
4. Sistemin, backend API'den (veya mock veriden) gelen JSON verisini hatasız bir şekilde tablo ve grafiklere dönüştürmesi.
5. Arayüzün modern web tasarım standartlarına (tercihen koyu tema) ve mobil/masaüstü cihazlara (responsive) uygun olması.

## Kapsam dışı
Bu görevde yapmayacaklarımız.
- Arka uç (backend) veri bilimi algoritmasının (PCA, KNN, Kosinüs Benzerliği) yeniden yazılması veya makine öğrenimi modelinin eğitilmesi.
- Veritabanı mimarisinin kurulması (Veriler Colab modelinin sunduğu JSON/API çıktısı üzerinden statik veya mock olarak alınacaktır).
- Kullanıcı giriş/çıkış (Authentication) veya oturum yönetimi gibi sistemlerin eklenmesi.
- Maç videoları veya ısı haritaları gibi verisetinde olmayan ekstra görselleştirmelerin eklenmesi.

## Riskler
Bilinen tuzaklar ve azaltma planı.
- **Backend-Frontend Veri Uyumsuzluğu:** Python modelinden dönecek JSON formatı henüz net değil. Çözüm: Ön yüz geliştirilirken esnek bir veri modeli ve örnek (mock) JSON datası kullanılarak bileşenler test edilecek.
- **Radar Grafiğinde Görsel Karmaşa:** Çok fazla oyuncu seçildiğinde radar grafiğinin okunamaz hale gelmesi. Çözüm: Arayüz tarafında grafik seçimi 2-3 oyuncu (hedef oyuncu dahil en fazla 4) ile sınırlandırılacak.
- **Fuzzy Search Performansı:** Hatalı yazım toleransının frontend tarafında binlerce oyuncu içinde yapılması tarayıcıyı yorabilir. Çözüm: Gerekirse arama işlemi backend tarafına bırakılacak veya Fuse.js gibi optimize kütüphaneler kullanılacak.
