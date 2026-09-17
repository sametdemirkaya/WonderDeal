import ScraperFC.utils
url = 'https://api.sofascore.com/api/v1/search/all?q=Czech'
try:
    data = ScraperFC.utils.botasaurus_browser_get_json(url)
    results = data.get('results', [])
    for r in results:
        if r['type'] == 'uniqueTournament':
            entity = r['entity']
            if entity.get('category', {}).get('sport', {}).get('slug', '') == 'football':
                print(f"Found: {entity['name']} -- ID {entity['id']} -- Country {entity.get('category', {}).get('name', '')}")
except Exception:
    pass
