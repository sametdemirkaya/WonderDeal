import pandas as pd

print("Extra 7 lig 25/26 dosyasına detay verileri ekleniyor...")

try:
    df_clean = pd.read_csv("temizlenmis_extra_7_leagues_25_26.csv")
    df_details = pd.read_csv("scraped_details_data/extra_7_leagues_details_25-26.csv")
    
    # İhtiyacımız olmayan ve temizlenmiş dosyada zaten var olan sütunları (name, position vb.) çıkaralım
    df_details_subset = df_details.drop(columns=['name', 'current_team', 'position'], errors='ignore')
    
    # Birleştirme işlemi
    df_merged = pd.merge(df_clean, df_details_subset, left_on='player id', right_on='player_id', how='left')
    
    # Fazlalık player_id sütununu silelim
    if 'player_id' in df_merged.columns:
        df_merged = df_merged.drop(columns=['player_id'])
        
    df_merged.to_csv("temizlenmis_extra_7_leagues_25_26.csv", index=False)
    print("Detaylar başarıyla eklendi ve 'temizlenmis_extra_7_leagues_25_26.csv' güncellendi!")
    
except Exception as e:
    print("Hata:", e)
