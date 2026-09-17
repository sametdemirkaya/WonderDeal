import ScraperFC.utils
import urllib.parse

def search_tournament(query):
    url = f'https://api.sofascore.com/api/v1/search/all?q={urllib.parse.quote(query)}'
    try:
        data = ScraperFC.utils.botasaurus_browser_get_json(url)
        results = data.get('results', [])
        found_count = 0
        for r in results:
            if r['type'] == 'uniqueTournament':
                entity = r['entity']
                sport = entity.get('category', {}).get('sport', {}).get('slug', '')
                if sport == 'football':
                    name = entity['name']
                    t_id = entity['id']
                    country = entity.get('category', {}).get('name', 'Unknown')
                    print(f"  - Found: {name} (ID: {t_id}) - Country: {country}")
                    found_count += 1
                    if found_count >= 2:
                        break
    except Exception as e:
        print('Error:', e)

queries = ['Pro League', 'Ekstraklasa', 'Chance Liga', 'Superliga', 'Eliteserien', 'Brasileirao Serie A']
for q in queries:
    print(f'\nSearching for: {q}')
    search_tournament(q)
