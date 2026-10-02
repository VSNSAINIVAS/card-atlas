#!/usr/bin/env python3
"""Validate the static site's canonical offer and limit data."""
import json
from pathlib import Path
from datetime import date
from urllib.parse import urlparse
root=Path(__file__).resolve().parent
d=json.loads((root/'offers.json').read_text()); limits=json.loads((root/'limits.json').read_text())
expected={'millennia':'hdfc','regalia':'hdfc','pixel':'pixel','airtel':'axis','myzone':'axis','ixigo':'au'}
assert {c['id']:c['pool'] for c in d['cards']}==expected, 'Card/pool mapping changed'
assert limits['currency']=='INR' and set(limits['pools'])=={'hdfc','pixel','axis','au'}
assert all(type(v) is int and 0<=v<=9007199254740991 for v in limits['pools'].values())
def valid_date(s): assert date.fromisoformat(s).isoformat()==s
valid_date(limits['updated']); valid_date(d['checked'])
for s in d['sources'].values():
 assert urlparse(s['url']).scheme=='https' and urlparse(s['url']).hostname
 valid_date(s['checked'])
ids=set(); cats={'Shopping','Dining','Travel','Lounges','Bills','Entertainment','Rewards','Milestones','Fuel','UPI','Welcome','Fees'}
for o in d['offers']:
 assert o['id'] not in ids; ids.add(o['id'])
 assert o['card'] in expected and o['category'] in cats
 assert o['source'] in d['sources'] and o['kind'] in {'benefit','fee','notice'}
 assert o['regions'] and set(o['regions'])<={'domestic','international'}
 assert isinstance(o['merchants'],list) and all(isinstance(m,str) and m.strip() for m in o['merchants'])
 assert set(o.get('merchantTitles',{}))<=set(o['merchants'])
 for k in ('value','title','summary','details'): assert isinstance(o[k],str) and o[k].strip(), (o['id'],k)
 valid_date(o['checked'])
 if o.get('expiry'):valid_date(o['expiry'])
 if o['kind']=='notice':assert o.get('flag')
for c in expected:
 for region in ('domestic','international'):assert any(o['card']==c and region in o['regions'] for o in d['offers']), (c,region)
print(f"Valid: {len(d['cards'])} cards, {len(d['offers'])} offers/costs/notices, 4 pools.")
