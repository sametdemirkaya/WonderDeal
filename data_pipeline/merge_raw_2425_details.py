import pandas as pd

print("24/25 Extra 7 Lig ham dosyasına detay verileri (Pozisyon dahil) ekleniyor...")

try:
    df_raw = pd.read_csv("extra_7_leagues_merged_24-25.csv")
    df_details = pd.read_csv("scraped_details_data/extra_7_leagues_details_24-25.csv")
    
    # Gereksiz kopyaları düşelim (isim, takım vs zaten var)
    # AMa pozisyon ('position') sütununu KESİNLİKLE tutuyoruz, adını 'Pos' yapıyoruz ki Colab'da tanısın
    df_details_subset = df_details.drop(columns=['name', 'current_team'], errors='ignore')
    if 'position' in df_details_subset.columns:
        df_details_subset = df_details_subset.rename(columns={'position': 'Pos'})
    
    # Birleştirme (merge)
    df_merged = pd.merge(df_raw, df_details_subset, left_on='player id', right_on='player_id', how='left')
    
    # player_id fazlalığını atalım
    if 'player_id' in df_merged.columns:
        df_merged = df_merged.drop(columns=['player_id'])
        
    df_merged.to_csv("extra_7_leagues_merged_24-25.csv", index=False)
    
    print("Müthiş Başarı! Tüm detaylar ve Pozisyon verisi 'extra_7_leagues_merged_24-25.csv' içine gömüldü.")
except Exception as e:
    print("Hata:", e)
