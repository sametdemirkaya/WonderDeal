import pandas as pd

def merge_for_colab():
    print("Veriler yukleniyor...")
    df_base = pd.read_csv('all_leagues_combined_25-26.csv')
    df_details = pd.read_csv('scraped_details_data/details_25_26.csv')
    
    # Isim benzerliklerinden veya ayni isimli oyunculardan dolayi veri karismasin diye,
    # Kesin ve essiz bir anahtar olan ID uzerinden birlestirme yapiyoruz.
    # Base dosyada "player id", details dosyasinda "player_id" olarak geciyor.
    
    # Details dosyasindaki kopyalari (varsa) temizleyelim
    df_details = df_details.drop_duplicates(subset=['player_id'])
    
    print("Veriler oyuncu ID'sine gore birlestiriliyor (Guvenli Merge)...")
    # Base ile details'i merge et
    df_merged = pd.merge(df_base, df_details, left_on='player id', right_on='player_id', how='left')
    
    # player_id sutunu iki tane oldu ("player id" ve "player_id"), birini dusurebiliriz
    if 'player_id' in df_merged.columns:
        df_merged = df_merged.drop(columns=['player_id'])
        
    output_filename = 'raw_ready_for_colab_25-26.csv'
    df_merged.to_csv(output_filename, index=False)
    
    print(f"ISLEM BASARILI! Birlesik dosya kaydedildi: {output_filename}")
    print(f"Toplam Oyuncu: {len(df_merged)}")

if __name__ == '__main__':
    merge_for_colab()
