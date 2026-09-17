import pandas as pd

print("Kayıp detaylar ana dosyaya geri yükleniyor...")
try:
    df_master = pd.read_csv("temizlenmis_24_25.csv")
    df_details = pd.read_csv("scraped_details_data/extra_7_leagues_details_24-25.csv")
    
    # Fazlalık sütunları atıp sadece lazım olanları alalım
    df_details_subset = df_details.drop_duplicates(subset=['player_id']).drop(columns=['name', 'current_team', 'position'], errors='ignore')
    
    # Master dosya ile detayları ID üzerinden birleştir
    df_merged = pd.merge(df_master, df_details_subset, left_on='player id', right_on='player_id', how='left')
    
    # Gereksiz player_id sütununu at
    if 'player_id' in df_merged.columns:
        df_merged = df_merged.drop(columns=['player_id'])
        
    # Dosyayı güncelle
    df_merged.to_csv("temizlenmis_24_25.csv", index=False)
    print("Başarılı! Amar Memic ve diğer tüm 7 lig oyuncularının detayları arayüze geri döndü!")
    
except Exception as e:
    print("Hata:", e)
