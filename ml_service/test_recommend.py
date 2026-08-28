import urllib.request
import json

payload = {
    'state': 'Madhya Pradesh',
    'age': 25,
    'gender': 'Female',
    'income': 150000,
    'category': 'General',
    'isStudent': False,
    'occupation': 'Homemaker'
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/recommend', data=data, headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
out = json.loads(res.read())

print(f"Eligible schemes count: {out['count']}")
for s in out['schemes']:
    print(f"- {s['scheme_name']}: {s['match_percentage']}% (Level: {s['level']}, State: {s['state_name']})")
