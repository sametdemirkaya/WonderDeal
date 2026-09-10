import ScraperFC
import pandas as pd
import time
import random
import os

def run_scraper():
    print("ScraperFC başlatılıyor... (Çoklu Lig Modu)")
    ss = ScraperFC.Sofascore()
    
    # Hedef Sezon
    season = "24/25"
    
    # Çekilecek Ligler Listesi
    # Not: ScraperFC kütüphanesinde Türkiye 1. Ligi varsayılan olarak yoktur, 
    # bu yüzden sadece 5 büyük ligin alt liglerini ekleyebildik.
    leagues = [
        "England Premier League", "England EFL Championship",
        "Spain La Liga", "Spain La Liga 2",
        "Italy Serie A", "Italy Serie B",
        "Germany Bundesliga", "Germany 2.Bundesliga",
        "France Ligue 1", "France Ligue 2",
        "Turkiye Super Lig", 
        "Portugal Primeira Liga", 
        "Netherlands Eredivisie"
    ]
    
    # Verilerin kaydedileceği klasörü oluşturalım
    output_dir = "scraped_data"
    os.makedirs(output_dir, exist_ok=True)
    
    all_players_list = []
    
    for league in leagues:
        print(f"\n[{league}] - {season} sezonu için veri çekiliyor...")
        
        # BAN KORUMASI: Her lig arasında rastgele 10 ila 15 saniye bekle
        sleep_time = random.uniform(10, 15)
        print(f"Güvenlik için {sleep_time:.2f} saniye bekleniyor...")
        time.sleep(sleep_time)
        
        try:
            player_data = ss.scrape_player_league_stats(season, league)
            print(f"BAŞARILI: {league} - {len(player_data)} oyuncu çekildi.")
            
            # Her ligin yedeğini ayrı ayrı kaydedelim (çökme durumunda veri kaybetmemek için)
            file_name = league.replace(" ", "_").lower() + f"_{season.replace('/', '-')}.csv"
            player_data.to_csv(os.path.join(output_dir, file_name), index=False)
            
            # Tüm ligleri birleştirmek için listeye ekleyelim
            all_players_list.append(player_data)
            
        except Exception as e:
            print(f"HATA: {league} çekilirken sorun oluştu. Belki lig başlamamıştır veya ID yoktur.")
            print("Hata detayı:", e)
            
    # Tüm liglerin birleştirilmesi
    if all_players_list:
        final_df = pd.concat(all_players_list, ignore_index=True)
        final_df.to_csv(f"all_leagues_combined_{season.replace('/', '-')}.csv", index=False)
        print(f"\nBİTTİ! Tüm ligler birleştirildi ve 'all_leagues_combined_{season.replace('/', '-')}.csv' olarak kaydedildi.")
        print(f"Toplam Oyuncu Havuzu: {len(final_df)}")
    else:
        print("\nHiçbir lig verisi çekilemedi.")

if __name__ == "__main__":
    run_scraper()
