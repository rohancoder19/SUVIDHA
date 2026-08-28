import os
import json
import csv

def preprocess_dataset(csv_path: str, output_json_path: str):
    print(f"Reading dataset from {csv_path}...")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset CSV not found at {csv_path}")

    schemes = []
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Clean target occupations
            raw_occupations = str(row.get('target_occupations', 'All') or 'All')
            occupations = [occ.strip() for occ in raw_occupations.split(';') if occ.strip()]
            if not occupations:
                occupations = ['All']

            # Clean allowed categories
            raw_categories = str(row.get('allowed_categories', 'All') or 'All')
            categories = [cat.strip() for cat in raw_categories.split(';') if cat.strip()]
            if not categories:
                categories = ['All']

            # Boolean conversion for is_student_only
            raw_student = str(row.get('is_student_only', 'false')).lower()
            is_student_only = raw_student in ['true', '1', 'yes']

            # Numeric conversions
            try:
                min_age = int(row.get('min_age', 0))
            except (ValueError, TypeError):
                min_age = 0

            try:
                max_age = int(row.get('max_age', 100))
            except (ValueError, TypeError):
                max_age = 100

            try:
                max_income = float(row.get('max_income', 10000000))
            except (ValueError, TypeError):
                max_income = 10000000.0

            scheme_data = {
                "scheme_name": str(row.get('scheme_name', '')).strip(),
                "scheme_slug": str(row.get('scheme_slug', '')).strip(),
                "department": str(row.get('department', '')).strip(),
                "level": str(row.get('level', 'Central')).strip(),
                "state_name": str(row.get('state_name', 'All India')).strip(),
                "min_age": min_age,
                "max_age": max_age,
                "gender": str(row.get('gender', 'All')).strip(),
                "max_income": max_income,
                "is_student_only": is_student_only,
                "target_occupations": occupations,
                "allowed_categories": categories,
                "description": str(row.get('description', '')).strip(),
                "eligibility_text": str(row.get('eligibility_text', '')).strip(),
                "benefits": str(row.get('benefits', '')).strip(),
                "application_url": str(row.get('application_url', '#')).strip()
            }
            schemes.append(scheme_data)

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(schemes, f, indent=2, ensure_ascii=False)

    print(f"Successfully processed {len(schemes)} schemes into {output_json_path}")
    return schemes

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_file = os.path.join(base_dir, 'updated_data.csv')
    json_out = os.path.join(base_dir, 'data', 'preprocessed_schemes.json')
    preprocess_dataset(csv_file, json_out)
