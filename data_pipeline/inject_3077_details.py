import pandas as pd

print("3.077 Top 5 oyuncusunun detayları ana dosyaya enjekte ediliyor...")

try:
    # Ana dosyamızı (6497 kişi) oku
    df_master = pd.read_csv("temizlenmis_24_25.csv")
    
    # Yeni oluşturduğumuz 3077 kişilik Top 5 detay havuzunu oku
    df_details = pd.read_csv("scraped_details_data/top5_leagues_details_24-25.csv")
    
    # ID sütun ismini eşitle
    df_details = df_details.rename(columns={'player_id': 'player id'})
    
    # İki dataframe'i de 'player id' üzerinden indexle (Update işlemi için şart)
    df_master.set_index('player id', inplace=True)
    df_details.set_index('player id', inplace=True)
    
    # Sadece eşleşen ID'lerdeki (3.077 kişi) verileri (age, height vb.) güncelle
    df_master.update(df_details)
    
    # Index'i eski haline (sütuna) geri al
    df_master.reset_index(inplace=True)
    
    # Güncellenmiş dosyayı kaydet
    df_master.to_csv("temizlenmis_24_25.csv", index=False)
    
    print("MUAZZAM BAŞARI! 3.077 oyuncunun verisi saniyeler içinde ana dosyaya (temizlenmis_24_25.csv) işlendi.")
    print("Arayüzünüz (Frontend) an itibariyle bu oyuncuları eksiksiz göstermeye hazırdır!")
    
except Exception as e:
    print("Hata:", e)
