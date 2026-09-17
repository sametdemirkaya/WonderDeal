import pandas as pd

print("25/26 sezonu ham verileri yükleniyor...")
df_base = pd.read_csv("extra_7_leagues_25-26.csv")
df_details = pd.read_csv("scraped_details_data/extra_7_leagues_details_25-26.csv")

print(f"Base satır sayısı: {len(df_base)}")
print(f"Details satır sayısı: {len(df_details)}")

# Birleştirme (Base'de 'player id', Details'te 'player_id')
df_merged = pd.merge(df_base, df_details, left_on='player id', right_on='player_id', how='left')

# Dosyayı kaydet
output_filename = "extra_7_leagues_merged_25-26.csv"
df_merged.to_csv(output_filename, index=False)

print(f"\nBaşarıyla birleştirildi ve '{output_filename}' olarak kaydedildi!")
print(f"Toplam Satır: {len(df_merged)}")
print(f"Toplam Sütun: {len(df_merged.columns)}")
