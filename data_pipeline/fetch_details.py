import ScraperFC
import pandas as pd
import time
import random
import os
import traceback
from datetime import datetime, timezone, timedelta
from ScraperFC.utils import botasaurus_browser_get_json

def run_details_scraper():
    print("Oyuncu Pozisyon ve Yaş (Details) Çekme İşlemi Başlatılıyor (GELİŞMİŞ OYUNCU BAZLI CHECKPOINT)...")
    
    input_file = "all_leagues_combined_25-26.csv"
    output_dir = "scraped_details_data"
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "details_25_26.csv")
    
    if not os.path.exists(input_file):
        print(f"HATA: {input_file} bulunamadı!")
        return
        
    df_main = pd.read_csv(input_file)
    total_players = len(df_main)
    
    # Checkpoint (Kaldığımız yerden devam etme) Kontrolü
    scraped_ids = set()
    if os.path.exists(output_file):
        df_existing = pd.read_csv(output_file)
        scraped_ids = set(df_existing["player_id"].dropna().astype(int).tolist())
        print(f"\n--- KAYIT KONTROLÜ (CHECKPOINT) ---")
        print(f"Kaldığımız yerden devam ediliyor... (Şu ana kadar {len(scraped_ids)} oyuncu çekilmiş)")
    else:
        # Dosyayı başlıklarla oluştur
        pd.DataFrame(columns=[
            "player_id", "name", "position", "current_team", "dob", "age", 
            "height", "weight", "foot", "country", "contract_until", 
            "market_value", "market_value_currency"
        ]).to_csv(output_file, index=False)
        print("\nYeni bir detay kayıt dosyası oluşturuldu.")

    API_PREFIX = "https://api.sofascore.com/api/v1"
    
    batch_count = 0
    BATCH_LIMIT = 50
    LONG_SLEEP_MINUTES = 5

    count = 0
    for index, row in df_main.iterrows():
        pid = int(row["player id"])
        
        # Zaten çekilmişse atla
        if pid in scraped_ids:
            continue
            
        safe_player_name = str(row.get('player', 'Unknown')).encode('ascii', 'replace').decode('ascii')
        print(f"[{len(scraped_ids) + 1}/{total_players}] Oyuncu ID {pid} ({safe_player_name}) çekiliyor...")
        
        try:
            url = f"{API_PREFIX}/player/{pid}"
            # ScraperFC'nin Cloudflare'i geçen özel istek fonksiyonunu kullanıyoruz
            response = botasaurus_browser_get_json(url)
            
            if not response or "player" not in response:
                raise Exception(f"Cloudflare Ban veya Hatalı Yanıt: {response}")
                
            player_dict = response["player"]
            
            dob = (
                datetime.fromtimestamp(0, timezone.utc) + timedelta(seconds=player_dict["dateOfBirthTimestamp"])
                if "dateOfBirthTimestamp" in player_dict else None
            )
            age = (datetime.now(timezone.utc) - dob).days // 365 if dob else None
            dob_str = dob.strftime("%Y-%m-%d") if dob else None

            contract = (
                datetime.fromtimestamp(0, timezone.utc) + timedelta(seconds=player_dict["contractUntilTimestamp"])
                if "contractUntilTimestamp" in player_dict else None
            )
            contract_str = contract.strftime("%Y-%m-%d") if contract else None

            market_val = (
                player_dict["proposedMarketValueRaw"]["value"]
                if "proposedMarketValueRaw" in player_dict and "value" in player_dict["proposedMarketValueRaw"] else None
            )
            market_curr = (
                player_dict["proposedMarketValueRaw"]["currency"]
                if "proposedMarketValueRaw" in player_dict and "currency" in player_dict["proposedMarketValueRaw"] else None
            )

            p_data = {
                "player_id": pid,
                "name": player_dict.get("name"),
                "position": player_dict.get("position"),
                "current_team": player_dict["team"]["name"] if "team" in player_dict and "name" in player_dict["team"] else None,
                "dob": dob_str,
                "age": age,
                "height": player_dict.get("height"),
                "weight": player_dict.get("weight"),
                "foot": player_dict.get("preferredFoot"),
                "country": player_dict["country"]["name"] if "country" in player_dict and "name" in player_dict["country"] else None,
                "contract_until": contract_str,
                "market_value": market_val,
                "market_value_currency": market_curr
            }
            
            # Tek bir oyuncuyu diske anında yaz! (Gerçek Checkpoint)
            pd.DataFrame([p_data]).to_csv(output_file, mode='a', header=False, index=False)
            scraped_ids.add(pid)
            
            consecutive_errors = 0 # Başarılı olunca hatayı sıfırla
            batch_count += 1
            
            if batch_count >= BATCH_LIMIT:
                print(f"\n[MOLA VAKTİ] {BATCH_LIMIT} oyuncu çekildi. Ban yememek için {LONG_SLEEP_MINUTES} dakika dinleniliyor...")
                time.sleep(LONG_SLEEP_MINUTES * 60)
                batch_count = 0
            else:
                # Her oyuncudan sonra 10-15 saniye arası rastgele çok uzun bekle (Sıfır Risk)
                time.sleep(random.uniform(9.5, 14.5))
            
        except Exception as e:
            consecutive_errors = locals().get('consecutive_errors', 0) + 1
            print(f"HATA: Oyuncu {pid} API'den gelmedi. Sebep: {e}")
            if consecutive_errors >= 3:
                print("3 KEZ ÜST ÜSTE HATA! Kesin Cloudflare banı yedik. Program durduruluyor...")
                break
            print("Anlık kopma olabilir, 60 saniye bekleniyor...")
            time.sleep(60)
            continue

if __name__ == "__main__":
    run_details_scraper()
