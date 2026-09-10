import pandas as pd
import difflib
import argparse
import os

def clean_fbref_pos(pos_str):
    if pd.isna(pos_str):
        return None
    # FBref'te pozisyonlar "MFFW", "DFMF", "GK" şeklindedir. İlk ikisini alırız.
    return str(pos_str)[:2]

def merge_datasets(sofa_file, fbref_file, output_file):
    print(f"\n--- {os.path.basename(sofa_file)} İÇİN İŞLEM BAŞLIYOR ---")
    
    # Sofascore verisini oku
    df_sofa = pd.read_csv(sofa_file)
    
    # FBref verisini oku (FBref CSV formatında ilk satır gereksizdir, header=1 kullanırız)
    try:
        df_fbref = pd.read_csv(fbref_file, header=1)
    except Exception as e:
        print(f"Hata: {fbref_file} okunamadı. Formatını kontrol edin.")
        return
    
    sofa_names = df_sofa['player'].dropna().unique()
    fbref_names = df_fbref['Player'].dropna().unique()
    
    # Pozisyonları bir sözlükte (dictionary) tutalım
    fbref_pos_dict = dict(zip(df_fbref['Player'], df_fbref['Pos']))
    
    final_pos_mapping = {}
    exact_matches = 0
    fuzzy_matches = 0
    missing = []
    
    for s_name in sofa_names:
        # 1. KUSURSUZ EŞLEŞME (Exact Match)
        if s_name in fbref_names:
            final_pos_mapping[s_name] = clean_fbref_pos(fbref_pos_dict[s_name])
            exact_matches += 1
        else:
            # 2. BULANIK MANTIK (Fuzzy Match)
            # cutoff=0.75 demek %75 ve üzeri benzeyenleri kabul et demek. 
            # 0.6 yaparsak hata payı artar, 0.8 yaparsak zorlaşır. 0.75 genelde iyidir.
            closest = difflib.get_close_matches(s_name, fbref_names, n=1, cutoff=0.7)
            if closest:
                matched_fbref_name = closest[0]
                final_pos_mapping[s_name] = clean_fbref_pos(fbref_pos_dict[matched_fbref_name])
                fuzzy_matches += 1
                # print(f"Kurtarılan: {s_name} -> {matched_fbref_name}")
            else:
                missing.append(s_name)
    
    # Eşleşen Pozisyonları Sofascore DataFrame'ine yeni bir sütun olarak ekle
    df_sofa['Pos'] = df_sofa['player'].map(final_pos_mapping)
    
    # Sonucu kaydet
    df_sofa.to_csv(output_file, index=False)
    
    print("\n--- SONUÇ İSTATİSTİKLERİ ---")
    print(f"Toplam Sofascore Oyuncusu : {len(sofa_names)}")
    print(f"Kusursuz Eşleşen          : {exact_matches}")
    print(f"Bulanık Mantıkla Kurtarılan: {fuzzy_matches}")
    print(f"Hâlâ Eşleşmeyen (Fire)    : {len(missing)}")
    print(f"Yeni veri dosyaya kaydedildi: {output_file}")
    
    if missing:
        print("\n--- HÂLÂ EŞLEŞMEYENLER (ÖRNEK 15 KİŞİ) ---")
        for m in missing[:15]:
            print(f"- {m}")
        print("...")

if __name__ == "__main__":
    # Test amaçlı tek dosya çalıştırıyoruz.
    sofa_path = "scraped_data/turkiye_super_lig_24-25.csv"
    fbref_path = "scraped_data/fbref_turkiye_super_lig_24-25.txt"
    out_path = "scraped_data/turkiye_super_lig_24-25_merged.csv"
    
    merge_datasets(sofa_path, fbref_path, out_path)
