import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScoutStore } from '../store/useScoutStore';
import { searchPlayers } from '../api';
import SeasonToggle from '../components/SeasonToggle';
import { Search, ArrowRight, Network, Database, SlidersHorizontal, UserSearch, Target, FileCheck } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setTargetPlayer, setFilters } = useScoutStore();
  
  const [localQuery, setLocalQuery] = useState('');
  const [localSeason, setLocalSeason] = useState('25-26');
  const [localResults, setLocalResults] = useState([]);

  // Debounced live search
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (localQuery.length >= 2) {
        // Hedef oyuncu araması için sadece sezonu filtrele (piyasa değeri vb. yok)
        const results = await searchPlayers(localQuery, { season: localSeason });
        setLocalResults(results);
      } else {
        setLocalResults([]);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localQuery, localSeason]);

  const handleSelectPlayer = (player) => {
    const primaryPos = player.position_group.split(',')[0].trim();
    // Save to Zustand store and navigate
    setFilters({ position_group: primaryPos });
    setTargetPlayer(player);
    navigate('/scout');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // If they press enter, navigate with the first result if available
    if (localResults.length > 0) {
      handleSelectPlayer(localResults[0]);
    }
  };

  return (
    <PageTransition className="bg-surface text-text-main antialiased selection:bg-primary-blue/30 selection:text-white min-h-screen relative">
      {/* Ambient Background Accents */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-[#2F80ED]/15 via-[#2F80ED]/5 to-transparent blur-[140px]"></div>
        <div className="absolute top-[35%] right-[-120px] w-[500px] h-[500px] bg-[#2F80ED]/5 rounded-full blur-[130px]"></div>
        <div className="absolute top-[65%] left-[-150px] w-[500px] h-[500px] bg-[#60A5FA]/5 rounded-full blur-[140px]"></div>
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-surface/80 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a className="flex items-center gap-3 group" href="#">
            <div className="h-8 flex items-center">
              <span className="font-display font-bold text-xl tracking-tight text-white">WonderDeal</span>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/scout')} className="text-sm font-semibold text-text-muted hover:text-white transition-colors uppercase tracking-wider">Scout</button>
            <button onClick={() => navigate('/h2h')} className="text-sm font-semibold text-text-muted hover:text-white transition-colors uppercase tracking-wider">Compare</button>
            <button onClick={() => navigate('/shortlist')} className="text-sm font-semibold text-text-muted hover:text-white transition-colors uppercase tracking-wider">Shortlist</button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-border-subtle mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary-blue animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide text-text-muted uppercase">
                Futbol İstihbarat & Oyuncu Keşif Motoru
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
              Find Players. Compare DNA.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-primary-blue to-accent-cyan">
                Build Better Teams.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-7 text-base sm:text-lg md:text-xl text-text-muted max-w-2xl font-normal leading-relaxed">
              Veri bilimi ve taktiksel benzerlik algoritmalarıyla kulübünüzün oyun felsefesine en uygun potansiyelleri ve benzer profilleri saniyeler içinde keşfedin.
            </p>

            {/* Season Toggle placed right above Search */}
            <div className="flex justify-center mt-10 mb-6">
              <SeasonToggle 
                options={[
                  { label: 'Tüm Sezonlar', value: 'All' },
                  { label: '25-26', value: '25-26' },
                  { label: '24-25', value: '24-25' }
                ]}
                selected={localSeason}
                onChange={setLocalSeason}
              />
            </div>

            {/* Search Bar Component with AutoComplete */}
            <div className="w-full max-w-2xl relative">
              <form 
                className="relative flex items-center bg-surface-card/90 rounded-2xl p-2 border border-border-subtle shadow-2xl backdrop-blur-md focus-within:border-primary-blue/60 transition-all" 
                onSubmit={handleFormSubmit}
              >
                <Search className="w-6 h-6 text-text-dim ml-3 mr-2 pointer-events-none" />
                <input 
                  className="w-full bg-transparent border-0 text-white placeholder-text-dim text-sm sm:text-base focus:ring-0 focus:outline-none" 
                  placeholder="Bir oyuncu arayın (Örn: Trent Alexander-Arnold)..." 
                  type="text" 
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                />
                <button 
                  className="shrink-0 px-5 py-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-primary-blue/25" 
                  type="submit"
                >
                  <span>Oyuncuyu Analiz Et</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Search Dropdown */}
              {localResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-border-subtle rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto text-left">
                  {localResults.map((p, i) => (
                    <div 
                      key={i} 
                      className="p-3 hover:bg-white/[0.05] cursor-pointer border-b border-border-subtle last:border-0"
                      onClick={() => handleSelectPlayer(p)}
                    >
                      <div className="font-semibold text-white">{p.player_name}</div>
                      <div className="text-xs text-text-muted">{p.team} • {p.position_group}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 text-xs text-text-muted">
              <span className="px-3 py-1 rounded-md bg-white/[0.03] border border-border-subtle flex items-center gap-1.5">
                <Network className="w-4 h-4 text-accent-cyan" />
                Benzer Profil Keşfi
              </span>
              <span className="px-3 py-1 rounded-md bg-white/[0.03] border border-border-subtle flex items-center gap-1.5">
                <Database className="w-4 h-4 text-accent-cyan" />
                Opta & Telemetri Entegrasyonu
              </span>
              <span className="px-3 py-1 rounded-md bg-white/[0.03] border border-border-subtle flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                Dinamik Filtre & Vektör Hassasiyeti
              </span>
            </div>
          </div>
        </section>

        {/* KEY METRICS STRIP */}
        <section className="border-y border-border-subtle bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border-subtle md:grid-cols-3">
              <div className="pt-4 md:pt-0">
                <div className="font-mono text-3xl md:text-4xl font-bold text-white tracking-tight">110,000+</div>
                <div className="text-xs uppercase tracking-wider text-text-muted mt-1.5 font-medium">Oyuncu Profili</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="font-mono text-3xl md:text-4xl font-bold text-white tracking-tight">5</div>
                <div className="text-xs uppercase tracking-wider text-text-muted mt-1.5 font-medium">Büyük Lig</div>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="font-mono text-3xl md:text-4xl font-bold text-emerald-400 tracking-tight">%98.4'e Varan</div>
                <div className="text-xs uppercase tracking-wider text-text-muted mt-1.5 font-medium">Filtreye Göre Ayarlanabilir Eşleşme Hassasiyeti</div>
              </div>
            </div>
          </div>
        </section>

        {/* THREE-STEP HOW IT WORKS */}
        <section className="py-24 md:py-32" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-blue mb-3">Nasıl Çalışır?</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
                Basit, Güçlü ve Veriye Dayalı
              </h2>
              <p className="text-text-muted text-sm sm:text-base mt-4 leading-relaxed">
                Dakikalar içinde geleneksel gözlem süreçlerini hızlandıran modern transfer zekası akışı.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative bg-surface-card/60 rounded-2xl p-8 border border-border-subtle hover:border-border-highlight transition-all duration-200 group">
                <div className="font-mono text-primary-blue text-sm font-semibold tracking-wider uppercase mb-6 flex items-center justify-between">
                  <span>01 / Girdi</span>
                  <UserSearch className="w-5 h-5 group-hover:text-primary-blue transition-colors text-text-dim" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">Hedef Oyuncuyu Seç</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Kıyaslamak istediğiniz referans oyuncuyu ve aradığınız kilit taktiksel rolü belirleyin.
                </p>
              </div>
              {/* Step 2 */}
              <div className="relative bg-surface-card/60 rounded-2xl p-8 border border-border-subtle hover:border-border-highlight transition-all duration-200 group">
                <div className="font-mono text-accent-cyan text-sm font-semibold tracking-wider uppercase mb-6 flex items-center justify-between">
                  <span>02 / Analiz</span>
                  <Target className="w-5 h-5 group-hover:text-accent-cyan transition-colors text-text-dim" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">DNA & Vektör Eşleşmesi</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Gelişmiş makine öğrenimi modeli, 50+ parametre üzerinden en yakın taktiksel ikizleri filtreler.
                </p>
              </div>
              {/* Step 3 */}
              <div className="relative bg-surface-card/60 rounded-2xl p-8 border border-border-subtle hover:border-border-highlight transition-all duration-200 group">
                <div className="font-mono text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-6 flex items-center justify-between">
                  <span>03 / Çıktı</span>
                  <FileCheck className="w-5 h-5 group-hover:text-emerald-400 transition-colors text-text-dim" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">Keşfet & Raporla</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Bütçe, lig uyumluluğu ve gelişim potansiyeliyle filtrelenmiş scout raporunu anında inceleyin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL PREVIEW / TEASER CARD (SINGLE ELEGANT PREVIEW) */}
        <section className="py-16 md:py-24 bg-white/[0.015] border-t border-border-subtle" id="preview">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-blue mb-2">Örnek Eşleşme Analizi</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Taktiksel DNA ve Benzerlik Çıktısı
              </h2>
            </div>
            {/* Master Preview Card */}
            <div className="bg-surface-card/80 rounded-2xl border border-border-subtle p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              {/* Top Row: Benchmark Anchor Player */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 mb-8 border-b border-border-subtle gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-primary-blue text-xl font-bold font-mono">
                    TAA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Trent Alexander-Arnold</h3>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-primary-blue/15 text-primary-blue border border-primary-blue/30">Referans</span>
                    </div>
                    <p className="text-sm text-text-muted">Liverpool FC • Premier League • Sağ Bek / Oyun Kurucu Bek</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-text-dim block">Taktiksel Küme</span>
                  <span className="text-sm font-semibold text-white">Ters Ayaklı Oyun Kurucu (Inverted FB)</span>
                </div>
              </div>

              {/* Bottom: Discovered Matches (2 Minimalist Clean Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Match 1: Hakimi */}
                <div className="bg-surface-subtle/80 rounded-xl p-6 border border-border-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-blue"></span>
                        <h4 className="font-semibold text-white text-base">Achraf Hakimi</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md">
                        %92.7 Benzerlik
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-6">Paris Saint-Germain • Ligue 1 • Yaş 25</p>
                    
                    {/* Minimalist Match Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-text-muted mb-1.5">
                          <span>Hücuma Katkı</span>
                          <span className="font-mono text-white">%96</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-blue rounded-full" style={{ width: '96%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-text-muted mb-1.5">
                          <span>Kilit Pas & xA</span>
                          <span className="font-mono text-white">%91</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-blue rounded-full" style={{ width: '91%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center text-xs">
                    <span className="text-text-dim">Tahmini Piyasa Değeri</span>
                    <span className="font-mono font-semibold text-white">€65M</span>
                  </div>
                </div>

                {/* Match 2: Dedic (High Upside) */}
                <div className="bg-surface-subtle/80 rounded-xl p-6 border border-border-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan"></span>
                        <h4 className="font-semibold text-white text-base">Amar Dedić</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-md">
                        %89.4 Yüksek Potansiyel
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-6">RB Salzburg • Avusturya Bundesliga • Yaş 21</p>
                    
                    {/* Minimalist Match Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-text-muted mb-1.5">
                          <span>Hücuma Katkı</span>
                          <span className="font-mono text-white">%89</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-cyan rounded-full" style={{ width: '89%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-text-muted mb-1.5">
                          <span>Kilit Pas & xA</span>
                          <span className="font-mono text-white">%86</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-cyan rounded-full" style={{ width: '86%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center text-xs">
                    <span className="text-text-dim">Fırsat Değeri</span>
                    <span className="font-mono font-semibold text-emerald-400">€12M – €15M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MINIMALIST FOOTER */}
      <footer className="border-t border-border-subtle bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-dim">© 2025 WonderDeal AG. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-muted font-medium">
            <a className="hover:text-white transition-colors" href="#">Gizlilik Politikası</a>
            <a className="hover:text-white transition-colors" href="#">Kullanım Şartları</a>
            <a className="hover:text-white transition-colors" href="#">API Dokümantasyonu</a>
            <a className="hover:text-white transition-colors" href="#">İletişim</a>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
};

export default LandingPage;
