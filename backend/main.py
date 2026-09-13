from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
import os
import joblib

import unicodedata

def normalize_string(s: str) -> str:
    if not isinstance(s, str):
        return ""
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

# --- Yollar ve Bellek ---
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_pipeline"))
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))

# Hafızada tutulacak yapılar
app_data = {
    'raw_df': pd.DataFrame(),           # Kullanıcının verdiği temizlenmiş tablo
    'preprocessed_dfs': {},             # FW, MF, DF olarak ayrılmış ve mekanik temizliği (per90 vb) yapılmış tablolar
    'pca_vectors': {},                  # FW, MF, DF için PCA uzayındaki (15 boyutlu) koordinatlar
    'models': {
        'pt': {},
        'pca': {}
    }
}

# --- Pydantic Modelleri (API Yanıt Şekilleri) ---
class SearchResponseItem(BaseModel):
    player_id: int
    player_name: str
    position_group: str
    team: str
    season: str

class PlayerMatch(BaseModel):
    player_id: int
    player_name: str
    season: str
    team: str
    minutes_played: float
    cosine_similarity: float
    euclidean_distance: float
    pc_values: List[float]
    
    # İsteğe bağlı eklenecekler (Boy, yaş, piyasa değeri)
    age: Optional[float] = None
    height: Optional[float] = None
    foot: Optional[str] = None
    contract_until: Optional[str] = None
    market_value: Optional[float] = None
    raw_stats: Dict[str, float] = {}
    similarity_drivers: List[str] = []
    
class CompareResponse(BaseModel):
    target_player_id: int
    target_player_name: str
    target_team: str = "Unknown"
    target_season: str
    target_age: Optional[float] = None
    target_market_value: Optional[float] = None
    target_market_value_currency: Optional[str] = None
    target_pc_values: List[float]
    target_raw_stats: Dict[str, float] = {}
    matches: List[PlayerMatch]

import re

def format_feature_name(name: str) -> str:
    """CamelCase veya düz kelimeleri kullanıcı dostu hale getirir."""
    # Araya boşluk koy
    name = re.sub(r'(?<!^)(?=[A-Z])', ' ', name)
    name = name.title()
    name = name.replace('Percentage', '%')
    return name

# --- Ön İşleme (Sizin 41 Hücrelik Kodunuzun FastAPI Versiyonu) ---
def preprocess_for_position(df_pos: pd.DataFrame) -> pd.DataFrame:
    """Belirli bir mevki (DF, MF, FW) için sizin kurallarınıza göre ön işleme yapar."""
    if df_pos.empty:
        return df_pos
        
    df = df_pos.copy()
    
    # Sizin belirlediğiniz özellik listeleri
    id_time_features = ['player', 'team', 'player id', 'team id', 'Pos', 'appearances', 'minutesPlayed', 'season']
    # 'season' sütunu da bizim sistemimiz için bir ID sütunu.
    
    rate_features = ['accurateCrossesPercentage', 'accurateLongBallsPercentage', 'accuratePassesPercentage',
                     'aerialDuelsWonPercentage', 'goalConversionPercentage', 'groundDuelsWonPercentage',
                     'penaltyConversion', 'scoringFrequency', 'setPieceConversion',
                     'successfulDribblesPercentage', 'tacklesWonPercentage', 'totalDuelsWonPercentage', 'rating']
                     
    count_attack = ['assists', 'attemptPenaltyMiss', 'attemptPenaltyPost', 'attemptPenaltyTarget',
                    'bigChancesCreated', 'bigChancesMissed', 'expectedAssists', 'expectedGoals',
                    'freeKickGoal', 'goals', 'goalsAssistsSum', 'goalsFromOutsideTheBox',
                    'headedGoals', 'hitWoodwork', 'leftFootGoals', 'offsides', 'passToAssist',
                    'penaltiesTaken', 'penaltyWon', 'rightFootGoals', 'shotFromSetPiece',
                    'shotsFromInsideTheBox', 'shotsFromOutsideTheBox', 'shotsOffTarget',
                    'shotsOnTarget', 'totalShots']
                    
    count_defense = ['ballRecovery', 'blockedShots', 'cleanSheet', 'clearances', 'errorLeadToGoal',
                     'errorLeadToShot', 'goalsConceded', 'goalsConcededOutsideTheBox', 'interceptions',
                     'ownGoals', 'penaltyConceded', 'possessionWonAttThird', 'tackles']
                     
    count_possession = ['accurateChippedPasses', 'accurateCrosses', 'accurateFinalThirdPasses',
                        'accurateLongBalls', 'accurateOppositionHalfPasses', 'accurateOwnHalfPasses',
                        'accuratePasses', 'aerialDuelsWon', 'aerialLost', 'dispossessed', 'dribbledPast',
                        'duelLost', 'groundDuelsWon', 'inaccuratePasses', 'keyPasses', 'possessionLost',
                        'successfulDribbles', 'touches', 'wasFouled']
                        
    drop_features = ['countRating', 'goalsConcededInsideTheBox', 'goalsFromInsideTheBox', 'matchesStarted',
                     'penaltyGoals', 'tacklesWon', 'totalAttemptAssist', 'totalChippedPasses', 'totalContest',
                     'totalCross', 'totalLongBalls', 'totalOppositionHalfPasses', 'totalOwnHalfPasses',
                     'totalPasses', 'totalRating', 'attemptPenaltyMiss', 'attemptPenaltyPost', 'attemptPenaltyTarget',
                     'freeKickGoal', 'setPieceConversion', 'ownGoals', 'directRedCards', 'redCards', 'yellowRedCards',
                     'cleanSheet', 'goalsConceded', 'goalsConcededOutsideTheBox', 'rating', 'totwAppearances',
                     'penaltiesTaken', 'penaltyConversion', 'scoringFrequency', 'accuratePasses', 'totalDuelsWon',
                     'duelLost', 'totalShots', 'goalsAssistsSum', 'leftFootGoals', 'rightFootGoals']
                     
    count_features = count_attack + count_defense + count_possession
    count_features_to_per90 = [col for col in count_features if col not in drop_features]
    
    # 1. Per90 Uygulaması
    for col in count_features_to_per90:
        if col in df.columns:
            # Sıfıra bölme hatasını önlemek için güvenli bölme
            df[col] = np.where(df['minutesPlayed'] > 0, (df[col] / df['minutesPlayed']) * 90, 0)
            
    # 2. İndeksi Ayarlama (KİMLİK SÜTUNLARI)
    # Burada 'player id' ve 'season' benzersiz anahtarımız!
    kimlik_sutunlari = ['player id', 'player', 'team', 'team id', 'Pos', 'season']
    
    # Veri setinde olmayan kimlik sütunlarını filtrele (Eğer yeni veride yoksa çökmesin diye)
    kimlik_mevcut = [col for col in kimlik_sutunlari if col in df.columns]
    
    zaman_sutunlari = [col for col in id_time_features if col not in kimlik_sutunlari and col in df.columns]
    
    # İndeks ataması
    df = df.set_index(kimlik_mevcut)
    
    # 3. Gereksiz ve Zaman Sütunlarını Silme
    # Sadece tabloda var olan drop edilecekleri bul
    to_drop = [col for col in (drop_features + zaman_sutunlari) if col in df.columns]
    df = df.drop(columns=to_drop)
    
    # Yaş, Boy gibi ek profil sütunları varsa onları da modelden çıkar (Onlar model inputu değil!)
    ek_profiller = ['age', 'height', 'weight', 'foot', 'country', 'market_value', 'market_value_currency', 'contract_until', 'dob']
    to_drop_ek = [col for col in ek_profiller if col in df.columns]
    df = df.drop(columns=to_drop_ek)
    
    # Sütunları isimlerine göre alfabetik sıralayalım (PowerTransformer'ın feature sırası uyuşmazlığını önlemek için standart)
    df = df.reindex(sorted(df.columns), axis=1)
    
    return df

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- WONDERDEAL API BAŞLATILIYOR ---")
    
    # 1. Modelleri Yükleme (SİZİN EĞİTTİĞİNİZ PKL DOSYALARI)
    # KESİNLİKLE EĞİTİM (fit) YAPILMIYOR. SADECE YÜKLENİYOR.
    for pos in ['FW', 'MF', 'DF']:
        try:
            pt_path = os.path.join(MODELS_DIR, f"pt_model_{pos}.pkl")
            pca_path = os.path.join(MODELS_DIR, f"pca_model_{pos}.pkl")
            
            app_data['models']['pt'][pos] = joblib.load(pt_path)
            app_data['models']['pca'][pos] = joblib.load(pca_path)
            print(f"[BAŞARILI] {pos} modelleri yüklendi.")
        except Exception as e:
            print(f"[HATA] {pos} modelleri yüklenemedi: {e}")

    # 2. Temizlenmiş Veriyi Yükleme
    file_24_25 = os.path.join(DATA_DIR, "temizlenmis_24_25.csv")
    file_25_26 = os.path.join(DATA_DIR, "temizlenmis_25_26.csv")
    
    dfs_to_concat = []
    
    if os.path.exists(file_24_25):
        df_24 = pd.read_csv(file_24_25)
        df_24['season'] = '24-25' # Sezon etiketi ekle
        dfs_to_concat.append(df_24)
        print(f"[VERİ] 24-25 verisi yüklendi ({len(df_24)} oyuncu).")
        
    if os.path.exists(file_25_26):
        df_25 = pd.read_csv(file_25_26)
        df_25['season'] = '25-26' # Sezon etiketi ekle
        dfs_to_concat.append(df_25)
        print(f"[VERİ] 25-26 verisi yüklendi ({len(df_25)} oyuncu).")
        
    if dfs_to_concat:
        app_data['raw_df'] = pd.concat(dfs_to_concat, ignore_index=True)
        app_data['raw_df']['player_normalized'] = app_data['raw_df']['player'].apply(normalize_string)
        
        # 3. Veriyi Mevkilere Ayırma ve Dönüştürme (Transform)
        for pos in ['FW', 'MF', 'DF']:
            df_pos_raw = app_data['raw_df'][app_data['raw_df']["Pos"] == pos].copy()
            
            if not df_pos_raw.empty and pos in app_data['models']['pt']:
                # Adım A: Mekanik Pandas Temizliği (Per90 vs)
                df_prep = preprocess_for_position(df_pos_raw)
                app_data['preprocessed_dfs'][pos] = df_prep
                
                # Modelin beklediği özellik sayısıyla (54) bizimkinin uyup uymadığını kontrol et
                pt_model = app_data['models']['pt'][pos]
                pca_model = app_data['models']['pca'][pos]
                
                # Feature sıralamasını modele göre zorla (Scikit-Learn uyumluluğu için)
                if hasattr(pt_model, 'feature_names_in_'):
                    # Model eğitimindeki sütun isimleri belliyse direkt onu kullan
                    missing_cols = set(pt_model.feature_names_in_) - set(df_prep.columns)
                    if missing_cols:
                        print(f"UYARI: {pos} verisinde eksik sütunlar var: {missing_cols}")
                        # Boşları 0 ile doldur
                        for c in missing_cols:
                            df_prep[c] = 0.0
                    df_prep = df_prep[pt_model.feature_names_in_]
                
                # Adım B: PowerTransform Uygulama (SADECE TRANSFORM!)
                # Asla fit_transform yapmıyoruz. Modeli bozmuyoruz.
                pt_transformed_matrix = pt_model.transform(df_prep)
                
                # Adım C: PCA Uygulama (SADECE TRANSFORM!)
                pca_matrix = pca_model.transform(pt_transformed_matrix)
                
                # Vektörleri tabloya kaydet
                skor_isimleri = [f"PC{i}" for i in range(1, pca_matrix.shape[1] + 1)]
                df_pca = pd.DataFrame(pca_matrix, index=df_prep.index, columns=skor_isimleri)
                
                app_data['pca_vectors'][pos] = df_pca
                print(f"[BAŞARILI] {pos} için PCA uzayı oluşturuldu ({len(df_pca)} nokta).")
                
    yield
    # Kapanışta belleği temizle
    app_data.clear()

app = FastAPI(title="WonderDeal API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "WonderDeal API Ayakta!"}

@app.get("/api/search", response_model=List[SearchResponseItem])
def search_players(
    q: str, 
    season: Optional[str] = "25-26",
    min_market_value: Optional[float] = None,
    max_market_value: Optional[float] = None,
    include_unknown_value: Optional[bool] = True
):
    """Oyuncuları isme göre arar ve filtrelere göre daraltır."""
    if not q or len(q) < 2 or app_data['raw_df'].empty:
        return []
        
    q_lower = normalize_string(q)
    
    # 1. İsme göre filtrele
    matches = app_data['raw_df'][app_data['raw_df']['player_normalized'].str.contains(q_lower, na=False)]
    
    # 2. Sezon filtresi (Tekli seçim)
    if season and season != "All":
        matches = matches[matches['season'] == season]
        
    # 3. Market Value filtresi
    if (min_market_value is not None or max_market_value is not None) and not matches.empty:
        def mv_filter(row):
            val = row.get('market_value')
            if pd.isna(val) or val is None:
                return include_unknown_value
            val = float(val)
            if min_market_value is not None and val < min_market_value:
                return False
            if max_market_value is not None and val > max_market_value:
                return False
            return True
        
        matches = matches[matches.apply(mv_filter, axis=1)]
    
    results = []
    for _, row in matches.head(20).iterrows():
        results.append(SearchResponseItem(
            player_id=int(row['player id']),
            player_name=row['player'],
            position_group=row['Pos'],
            team=row['team'],
            season=row.get('season', 'Unknown')
        ))
    return results

@app.get("/api/player/{player_id}/{season}")
def get_player_stats(player_id: int, season: str):
    """Belirli bir oyuncunun tam profilini ve ön işlenmiş (per90/yüzdelik) istatistiklerini getirir."""
    try:
        if app_data['raw_df'].empty:
            raise HTTPException(status_code=503, detail="Data not loaded yet")
            
        raw_match = app_data['raw_df'][(app_data['raw_df']['player id'] == player_id) & (app_data['raw_df']['season'] == season)]
        if raw_match.empty:
            raise HTTPException(status_code=404, detail="Player not found")
            
        raw_row = raw_match.iloc[0]
        pos = raw_row['Pos']
        df_prep = app_data['preprocessed_dfs'].get(pos)
        
        if df_prep is None:
            raise HTTPException(status_code=404, detail="Position data not found")
            
        df_prep_reset = df_prep.reset_index()
        match = df_prep_reset[(df_prep_reset['player id'] == player_id) & (df_prep_reset['season'] == season)]
        
        if match.empty:
            raise HTTPException(status_code=404, detail="Player preprocessed data not found")
            
        stats_dict = match.iloc[0].to_dict()
        
        # Raw verilerden ekstra profil bilgilerini ekle
        profile_info = {
            'player_id': int(player_id),
            'player_name': str(raw_row.get('player', 'Unknown')),
            'team': str(raw_row.get('team', 'Unknown')),
            'season': str(season),
            'position': str(pos),
            'age': float(raw_row.get('age')) if not pd.isna(raw_row.get('age')) else None,
            'height': float(raw_row.get('height')) if not pd.isna(raw_row.get('height')) else None,
            'foot': str(raw_row.get('foot')) if not pd.isna(raw_row.get('foot')) else None,
            'market_value': float(raw_row.get('market_value')) if not pd.isna(raw_row.get('market_value')) else None,
            'minutes_played': int(raw_row.get('minutesPlayed', 0)),
            'stats': {}
        }
        
        # Tüm model özelliklerini stats altına koy (NaN değerleri temizle)
        feature_names = app_data['models']['pt'][pos].feature_names_in_
        for k in feature_names:
            v = stats_dict.get(k)
            if pd.isna(v):
                profile_info['stats'][k] = 0.0
            else:
                profile_info['stats'][k] = float(v)
                    
        # NaN değerleri None yap
        for k, v in profile_info.items():
            if pd.isna(v):
                profile_info[k] = None
                
        return profile_info
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



FW_STATS = ['goals', 'assists', 'expectedGoals', 'shotsOnTarget', 'bigChancesCreated', 'successfulDribbles', 'touches']
MF_STATS = ['accuratePassesPercentage', 'keyPasses', 'assists', 'successfulDribbles', 'ballRecovery', 'tackles', 'interceptions']
DF_STATS = ['interceptions', 'clearances', 'tackles', 'ballRecovery', 'aerialDuelsWonPercentage', 'groundDuelsWonPercentage', 'accuratePassesPercentage']

def get_raw_stats(raw_row: pd.Series, pos: str) -> dict:
    stats_list = []
    if 'FW' in pos:
        stats_list = FW_STATS
    elif 'MF' in pos:
        stats_list = MF_STATS
    else:
        stats_list = DF_STATS
        
    result = {}
    minutes = raw_row.get('minutesPlayed', 0)
    for stat in stats_list:
        val = raw_row.get(stat, 0)
        # Eğer yüzde verisi değilse, p90 (90 dakika başına) hesapla
        if 'Percentage' not in stat and minutes > 0:
            result[stat] = round((float(val) / float(minutes)) * 90, 2)
        else:
            result[stat] = round(float(val), 2)
    return result

@app.get("/api/compare", response_model=CompareResponse)
def compare_players(
    target_player_id: int, 
    target_season: str, 
    min_minutes: int = 500, 
    season: Optional[str] = "25-26",
    min_market_value: Optional[float] = None,
    max_market_value: Optional[float] = None,
    include_unknown_value: Optional[bool] = True,
    age_min: Optional[int] = 15,
    age_max: Optional[int] = 40
):
    """Hedef oyuncuya benzeyenleri bulur (Kosinüs Benzerliği)"""
    df_raw = app_data['raw_df']
    if df_raw.empty:
        raise HTTPException(status_code=500, detail="Veritabanı boş.")
        
    # Hedef oyuncuyu bul
    target_info = df_raw[(df_raw['player id'] == target_player_id) & (df_raw['season'] == target_season)]
    if target_info.empty:
        raise HTTPException(status_code=404, detail="Oyuncu bulunamadı.")
        
    target_row = target_info.iloc[0]
    pos = target_row['Pos']
    target_name = target_row['player']
    
    if pos not in app_data['pca_vectors']:
        raise HTTPException(status_code=500, detail=f"{pos} için PCA modeli yüklenmemiş.")
        
    df_pca = app_data['pca_vectors'][pos]
    
    # İndeksten hedef oyuncunun PCA vektörünü bul
    # Index yapımız: ['player id', 'player', 'team', 'team id', 'Pos', 'season']
    target_vector = None
    for idx, row in df_pca.iterrows():
        if idx[0] == target_player_id and idx[-1] == target_season:
            target_vector = row.values.reshape(1, -1)
            target_pc_values = row.tolist()
            break
            
    if target_vector is None:
        raise HTTPException(status_code=404, detail="Oyuncunun PCA uzayında vektörü bulunamadı.")
        
    target_raw_stats = get_raw_stats(target_row, pos)
        
    # Benzerlikleri hesapla
    # Sadece filtrelere uyanları (dakika ve istenilen sezon) al
    filtered_indices = []
    for idx in df_pca.index:
        p_id, p_name, t_name, t_id, p_pos, p_season = idx
        
        # Kendisini listeleme
        if p_id == target_player_id and p_season == target_season:
            continue
            
        # Kullanıcı sadece tek bir sezon ile kıyasla dediyse (varsayılan: 25-26)
        if season and season != "All" and p_season != season:
            continue
            
        # Dakika filtresi (Orijinal tablodan bak)
        # Optimizasyon: Büyük verilerde bu döngü yavaşlayabilir, ancak 3000 oyuncu için anlık çalışır.
        raw_row = df_raw[(df_raw['player id'] == p_id) & (df_raw['season'] == p_season)].iloc[0]
        if raw_row.get('minutesPlayed', 0) < min_minutes:
            continue
            
        # Yaş filtresi
        player_age = raw_row.get('age')
        if not pd.isna(player_age) and player_age is not None:
            if player_age < age_min or player_age > age_max:
                continue
                
        # Market Value filtresi
        if min_market_value is not None or max_market_value is not None:
            mv_val = raw_row.get('market_value')
            if pd.isna(mv_val) or mv_val is None:
                if not include_unknown_value:
                    continue
            else:
                mv_val = float(mv_val)
                if min_market_value is not None and mv_val < min_market_value:
                    continue
                if max_market_value is not None and mv_val > max_market_value:
                    continue
                    
        filtered_indices.append(idx)
        
    if not filtered_indices:
        return CompareResponse(
            target_player_id=target_player_id, target_player_name=target_name, target_season=target_season, matches=[]
        )
        
    df_pca_filtered = df_pca.loc[filtered_indices]
    
    # Sklearn ile matematiksel işlemler
    cos_sim_matrix = cosine_similarity(target_vector, df_pca_filtered.values)[0]
    euclid_matrix = euclidean_distances(target_vector, df_pca_filtered.values)[0]
    
    # Sıralama (Kosinüs benzerliği en yüksek olan en iyi)
    best_matches_idx = np.argsort(cos_sim_matrix)[::-1][:500] # İlk 500
    
    # Benzerlik sürücüleri için matrisler
    pca_model = app_data['models']['pca'][pos]
    pt_model = app_data['models']['pt'][pos]
    V_squared = np.square(pca_model.components_)
    feature_names = pt_model.feature_names_in_
    
    matches = []
    for i in best_matches_idx:
        match_index = df_pca_filtered.index[i]
        p_id, p_name, t_name, t_id, p_pos, p_season = match_index
        
        raw_row = df_raw[(df_raw['player id'] == p_id) & (df_raw['season'] == p_season)].iloc[0]
        
        # Benzerlik Vektörü (W) ve Özellik Skorları hesaplama
        match_vector = df_pca_filtered.values[i]
        W = target_vector[0] * match_vector
        feature_scores = W @ V_squared
        
        # En iyi 10 özelliği al
        top_indices = np.argsort(feature_scores)[::-1][:10]
        top_features = [format_feature_name(feature_names[idx]) for idx in top_indices]
        
        matches.append(PlayerMatch(
            player_id=p_id,
            player_name=p_name,
            season=p_season,
            team=t_name,
            minutes_played=raw_row['minutesPlayed'],
            cosine_similarity=round(float(cos_sim_matrix[i]) * 100, 2),
            euclidean_distance=round(float(euclid_matrix[i]), 2),
            pc_values=df_pca_filtered.values[i].tolist(),
            age=raw_row.get('age', None) if not pd.isna(raw_row.get('age', None)) else None,
            height=raw_row.get('height', None) if not pd.isna(raw_row.get('height', None)) else None,
            foot=raw_row.get('foot', None) if not pd.isna(raw_row.get('foot', None)) else None,
            contract_until=raw_row.get('contract_until', None) if not pd.isna(raw_row.get('contract_until', None)) else None,
            market_value=raw_row.get('market_value', None) if not pd.isna(raw_row.get('market_value', None)) else None,
            raw_stats=get_raw_stats(raw_row, pos),
            similarity_drivers=top_features
        ))
        
    return CompareResponse(
        target_player_id=target_player_id,
        target_player_name=target_name,
        target_team=target_row['team'],
        target_season=target_season,
        target_age=target_row.get('age', None) if not pd.isna(target_row.get('age', None)) else None,
        target_market_value=target_row.get('market_value', None) if not pd.isna(target_row.get('market_value', None)) else None,
        target_market_value_currency=target_row.get('market_value_currency', None) if not pd.isna(target_row.get('market_value_currency', None)) else None,
        target_pc_values=target_pc_values,
        target_raw_stats=target_raw_stats,
        matches=matches
    )
