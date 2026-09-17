import ScraperFC
import pandas as pd
import time
import random
import os

# ScraperFC'nin hafızasına yeni ligleri anlık olarak enjekte etme
ScraperFC.sofascore.comps["Belgium Pro League"] = {"SOFASCORE": 38}
ScraperFC.sofascore.comps["Poland Ekstraklasa"] = {"SOFASCORE": 202}
ScraperFC.sofascore.comps["Denmark Superliga"] = {"SOFASCORE": 39}
ScraperFC.sofascore.comps["Norway Eliteserien"] = {"SOFASCORE": 20}
ScraperFC.sofascore.comps["Brazil Serie A"] = {"SOFASCORE": 325}
ScraperFC.sofascore.comps["Czech First League"] = {"SOFASCORE": 172}
# Arjantin Ligi zaten kütüphanede "Argentina Liga Profesional" (ID: 155) olarak mevcut

def run_scraper():
    print("ScraperFC başlatılıyor... (Çoklu Lig Modu)")
    ss = ScraperFC.Sofascore()
    
    # Hedef Sezon
    season = "25/26"
    
    # Yeni eklenen 7 ligin listesi
    leagues = [
        "Belgium Pro League",
        "Poland Ekstraklasa",
        "Denmark Superliga",
        "Norway Eliteserien",
        "Brazil Serie A",
        "Czech First League",
        "Argentina Liga Profesional"
    ]
    
    # Verilerin kaydedileceği klasörü oluşturalım
    output_dir = "scraped_data"
    os.makedirs(output_dir, exist_ok=True)
    
    all_players_list = []
    
    calendar_leagues = ["Norway Eliteserien", "Brazil Serie A", "Argentina Liga Profesional"]
    
    for league in leagues:
        # Kullanıcının kuralı: 24/25 -> 2025, 25/26 -> 2026
        actual_season = season
        if league in calendar_leagues:
            if season == "24/25":
                actual_season = "2025"
            elif season == "25/26":
                actual_season = "2026"

        print(f"\n[{league}] - {actual_season} (Hedef: {season}) sezonu için veri çekiliyor...")
        
        # BAN KORUMASI: Her lig arasında rastgele 10 ila 15 saniye bekle
        sleep_time = random.uniform(10, 15)
        print(f"Güvenlik için {sleep_time:.2f} saniye bekleniyor...")
        time.sleep(sleep_time)
        
        try:
            player_data = ss.scrape_player_league_stats(actual_season, league)
            
            # Veriye hangi sezona ait olduğunu ve ligini etiketliyoruz (Hepsi 24/25 veya 25/26 etiketini alacak)
            player_data['season'] = season 
            player_data['league_name'] = league
            
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
        final_df.to_csv(f"extra_7_leagues_{season.replace('/', '-')}.csv", index=False)
        print(f"\nBİTTİ! Tüm ligler birleştirildi ve 'extra_7_leagues_{season.replace('/', '-')}.csv' olarak kaydedildi.")
        print(f"Toplam Oyuncu Havuzu: {len(final_df)}")
    else:
        print("\nHiçbir lig verisi çekilemedi.")

if __name__ == "__main__":
    run_scraper()
