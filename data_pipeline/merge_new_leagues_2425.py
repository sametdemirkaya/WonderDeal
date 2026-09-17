import pandas as pd
import shutil
import os

print("1. Adım: Orijinal Top 5 dosyasının yedeği alınıyor...")
original_file = "temizlenmis_24_25.csv"
backup_file = "temizlenmis_24_25_SADECE_TOP5_YEDEK.csv"

# Yedeği kopyala
if os.path.exists(original_file):
    shutil.copy2(original_file, backup_file)
    print(f"Başarılı! Yedek dosya oluşturuldu: {backup_file}")
else:
    print(f"HATA: {original_file} bulunamadı!")
    exit(1)

print("\n2. Adım: Top 5 ve Extra 7 ligleri birleştiriliyor...")
try:
    df_top5 = pd.read_csv(original_file)
    df_extra7 = pd.read_csv("temizlenmis_extra_7_leagues_24_25.csv")
    
    print(f"Top 5 lig oyuncu sayısı: {len(df_top5)}")
    print(f"Extra 7 lig oyuncu sayısı: {len(df_extra7)}")
    
    # Alt alta birleştir
    df_master = pd.concat([df_top5, df_extra7], ignore_index=True)
    
    # Yeni dosyayı orijinalin üzerine yaz
    df_master.to_csv(original_file, index=False)
    
    print(f"\nMuazzam Başarı! Yeni Master Dosya ({original_file}) Toplam Oyuncu Sayısı: {len(df_master)}")
    
except Exception as e:
    print(f"Birleştirme sırasında hata oluştu: {e}")
