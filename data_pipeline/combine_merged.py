import pandas as pd
import glob
import os

def combine_merged_files():
    # Sadece 24-25 sezonuna ait ve sonu _merged.csv ile biten dosyaları bul
    file_pattern = "scraped_data/*24-25_merged.csv"
    files = glob.glob(file_pattern)
    
    print(f"Toplam {len(files)} adet '_merged.csv' dosyası bulundu. Birleştiriliyor...")
    
    dfs = []
    for f in files:
        df = pd.read_csv(f)
        dfs.append(df)
        print(f"- {os.path.basename(f)} eklendi. ({len(df)} oyuncu)")
        
    # Hepsini alt alta birleştir
    df_combined = pd.concat(dfs, ignore_index=True)
    
    # Yeni devasa dosyayı kaydet
    output_filename = "all_leagues_combined_24-25_with_pos.csv"
    df_combined.to_csv(output_filename, index=False)
    
    print(f"\n--- İŞLEM BAŞARILI ---")
    print(f"Tüm dosyalar birleştirildi ve '{output_filename}' olarak kaydedildi.")
    print(f"Ana Dosyadaki Toplam Oyuncu Sayısı: {len(df_combined)}")

if __name__ == "__main__":
    combine_merged_files()
