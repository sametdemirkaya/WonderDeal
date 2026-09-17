import pandas as pd
import os
import shutil

print("12 Liglik Master Veriseti Oluşturuluyor...")

try:
    file_top5 = "temizlenmis_25_26.csv"
    file_extra7 = "temizlenmis_extra_7_leagues_25_26.csv"
    
    # Her ihtimale karşı eski 5 liglik dosyanın yedeğini alalım
    shutil.copy(file_top5, "temizlenmis_25_26_top5_backup.csv")
    
    df_top5 = pd.read_csv(file_top5)
    df_extra7 = pd.read_csv(file_extra7)
    
    print(f"Top 5 Lig oyuncu sayısı: {len(df_top5)}")
    print(f"Extra 7 Lig oyuncu sayısı: {len(df_extra7)}")
    
    # Alt alta birleştir
    df_master = pd.concat([df_top5, df_extra7], ignore_index=True)
    
    # Duplicate (Aynı oyuncunun birden fazla ligde kaydı varsa) kontrolü
    # Player ID'ye göre tekrar edenleri temizle ve en çok süre alanı tut (Colab mantığı)
    df_master = df_master.sort_values('minutesPlayed', ascending=False)
    df_master = df_master.drop_duplicates(subset=['player id'], keep='first')
    
    # Üzerine yaz
    df_master.to_csv("temizlenmis_25_26.csv", index=False)
    
    print(f"\nİşlem Başarılı!")
    print(f"Toplam Birleşmiş Oyuncu Sayısı: {len(df_master)}")
    print("Oluşturulan Master Dosya: temizlenmis_25_26.csv")
    
except Exception as e:
    print(f"Hata oluştu: {e}")
