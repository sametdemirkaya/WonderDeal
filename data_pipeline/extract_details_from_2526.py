import pandas as pd
import os

print("Dahice optimizasyon başlatılıyor: 25/26 detayları Top 5 havuzuna aktarılıyor...")

try:
    # 25/26 verilerini oku
    df_2526 = pd.read_csv("temizlenmis_25_26.csv")
    
    # Hedef dosyamız olan Top 5 (24/25) dosyasını oku
    df_top5 = pd.read_csv("temizlenmis_24_25_SADECE_TOP5_YEDEK.csv")
    
    # 25/26'dan sadece ihtiyacımız olan detay sütunlarını ve player id'yi al
    detail_cols = ['player id', 'dob', 'age', 'height', 'weight', 'foot', 'country', 'contract_until', 'market_value', 'market_value_currency', 'Pos']
    # 'Pos' sütununu 'position' yapalım ki scraper formatına uysun
    
    df_details = df_2526[detail_cols].copy()
    df_details = df_details.rename(columns={'player id': 'player_id', 'Pos': 'position'})
    
    # Çift olanları temizle
    df_details = df_details.drop_duplicates(subset=['player_id'])
    
    # Sadece Top 5 ligde oynayan (4470 kişi içindeki) oyuncuların detaylarını filtrele
    top5_ids = df_top5['player id'].unique()
    df_details_filtered = df_details[df_details['player_id'].isin(top5_ids)].copy()
    
    # Bu veriyi scraper'ın okuyacağı "top5_leagues_details_24-25.csv" dosyası olarak kaydet
    output_dir = "scraped_details_data"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "top5_leagues_details_24-25.csv")
    
    df_details_filtered.to_csv(output_file, index=False)
    
    print(f"BAŞARILI! 25/26 dosyasından {len(df_details_filtered)} adet Top 5 oyuncusunun detayı otomatik olarak kurtarıldı!")
    print(f"Geriye sıfırdan çekilmesi gereken sadece {len(top5_ids) - len(df_details_filtered)} oyuncu kaldı!")
    
except Exception as e:
    print("Hata:", e)
