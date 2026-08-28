import csv
import json
import re
import os

csv_path = os.path.join(os.path.dirname(__file__), 'data', 'updated_data.csv')
json_out_path = os.path.join(os.path.dirname(__file__), 'data', 'preprocessed_schemes.json')

schemes = []
seen_slugs = set()

def extract_age_bounds(text):
    min_age = 0
    max_age = 100
    if not text:
        return min_age, max_age
    
    try:
        range_match = re.search(r'(\d{1,2})\s*[-to–]\s*(\d{1,2})\s*(?:years|yrs)?', text, re.IGNORECASE)
        if range_match:
            return int(range_match.group(1)), int(range_match.group(2))
        
        min_match = re.search(r'(?:min|at least|above|minimum)\s*(?:age)?\s*(?:of)?\s*(\d{1,2})', text, re.IGNORECASE)
        if min_match:
            min_age = int(min_match.group(1))
            
        max_match = re.search(r'(?:max|up to|not exceed|below)\s*(?:age)?\s*(?:of)?\s*(\d{1,2})', text, re.IGNORECASE)
        if max_match:
            max_age = int(max_match.group(1))
    except Exception:
        pass
        
    return min_age, max_age

def extract_income_ceiling(text):
    if not text:
        return 0.0
    
    try:
        lakh_match = re.search(r'(?:₹|Rs\.?|INR)?\s*([\d\.]+)\s*(?:lakh|lac)', text, re.IGNORECASE)
        if lakh_match:
            val_str = lakh_match.group(1).strip()
            if val_str and val_str != '.':
                return float(val_str) * 100000
    except Exception:
        pass
    
    try:
        num_match = re.search(r'(?:income|earning)\s*(?:below|under|not exceed|less than)?\s*(?:₹|Rs\.?)?\s*([\d,]+)', text, re.IGNORECASE)
        if num_match:
            val_str = num_match.group(1).replace(',', '').strip()
            if val_str and val_str != '.':
                val = float(val_str)
                if val > 1000:
                    return val
    except Exception:
        pass
    
    return 0.0

def extract_gender(text):
    if not text:
        return "All"
    text_lower = text.lower()
    if "women" in text_lower or "female" in text_lower or "girl" in text_lower or "mother" in text_lower:
        if "male" not in text_lower and "men" not in text_lower:
            return "Female"
    elif "male" in text_lower or "boy" in text_lower:
        if "female" not in text_lower and "girl" not in text_lower:
            return "Male"
    return "All"

def extract_student(text):
    if not text:
        return False
    text_lower = text.lower()
    return any(k in text_lower for k in ["student", "school", "college", "scholarship", "matric", "university", "coaching"])

def extract_state(text, scheme_name):
    combined = f"{scheme_name} {text}".lower()
    indian_states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Delhi", "Puducherry", "Jammu and Kashmir", "Ladakh"
    ]
    for state in indian_states:
        if state.lower() in combined:
            return state
    return "All India"

with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        name = (row.get('scheme_name') or '').strip().strip('"')
        slug = (row.get('slug') or '').strip()
        if not slug and name:
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        if not name:
            continue

        # Ensure unique slug
        base_slug = slug
        counter = 1
        while slug in seen_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1
        seen_slugs.add(slug)
        
        details = (row.get('details') or '').strip()
        benefits = (row.get('benefits') or '').strip()
        eligibility = (row.get('eligibility') or '').strip()
        application = (row.get('application') or '').strip()
        documents = (row.get('documents') or '').strip()
        level = (row.get('level') or 'Central').strip()
        category = (row.get('schemeCategory') or 'General Welfare').strip()

        min_age, max_age = extract_age_bounds(eligibility)
        max_income = extract_income_ceiling(eligibility)
        gender = extract_gender(eligibility)
        is_student = extract_student(eligibility + " " + details + " " + category)
        state_name = extract_state(eligibility + " " + details, name)

        req_docs = [d.strip() for d in re.split(r'[\.\n;]', documents) if len(d.strip()) > 3]
        if not req_docs:
          req_docs = ["Aadhaar Card", "Income Certificate", "Residence Proof", "Bank Account Details"]

        app_steps = [a.strip() for a in re.split(r'Step\s*\d+:|\n', application) if len(a.strip()) > 5]
        if not app_steps:
          app_steps = ["Visit official scheme portal", "Register account with Aadhaar", "Fill online application form", "Submit required documents"]

        scheme_obj = {
            "scheme_slug": slug,
            "scheme_name": name,
            "department": f"{level} Government Department",
            "level": level if level in ["Central", "State"] else "Central",
            "state_name": state_name,
            "category": category,
            "description": details if len(details) > 10 else name,
            "eligibility_text": eligibility if len(eligibility) > 10 else "All eligible citizens can apply.",
            "benefits": benefits if len(benefits) > 5 else "Financial & Social Assistance",
            "application_url": f"https://myscheme.gov.in/schemes/{slug}",
            "official_source": f"https://myscheme.gov.in/schemes/{slug}",
            "min_age": min_age,
            "max_age": max_age,
            "gender": gender,
            "max_income": max_income,
            "is_student_only": is_student,
            "target_occupations": ["All"],
            "allowed_categories": ["All"],
            "required_documents": req_docs[:6],
            "application_process": app_steps[:6]
        }
        schemes.append(scheme_obj)

print(f"Successfully processed {len(schemes)} unique schemes from CSV!")

with open(json_out_path, 'w', encoding='utf-8') as f:
    json.dump(schemes, f, indent=2, ensure_ascii=False)

print(f"Saved preprocessed JSON to {json_out_path}")
