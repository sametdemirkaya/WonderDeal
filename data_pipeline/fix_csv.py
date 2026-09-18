import csv
import os

input_file = 'scraped_details_data/top5_leagues_details_24-25.csv'
output_file = 'scraped_details_data/fixed_details.csv'

with open(input_file, 'r', encoding='utf-8') as fin, open(output_file, 'w', encoding='utf-8', newline='') as fout:
    reader = csv.reader(fin)
    writer = csv.writer(fout)
    
    headers = next(reader)
    writer.writerow(headers) # player_id,dob,age,height,weight,foot,country,contract_until,market_value,market_value_currency,position
    
    count_11 = 0
    count_13 = 0
    for row in reader:
        if len(row) == 11:
            writer.writerow(row)
            count_11 += 1
        elif len(row) == 13:
            player_id = row[0]
            position = row[2]
            dob = row[4]
            age = row[5]
            height = row[6]
            weight = row[7]
            foot = row[8]
            country = row[9]
            contract_until = row[10]
            market_value = row[11]
            currency = row[12]
            
            new_row = [player_id, dob, age, height, weight, foot, country, contract_until, market_value, currency, position]
            writer.writerow(new_row)
            count_13 += 1
        else:
            print('Bilinmeyen format:', len(row), row)

print(f'11 sutunlu {count_11} satir, 13 sutunlu {count_13} satir islendi.')
