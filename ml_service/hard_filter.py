from typing import List, Dict, Any, Tuple

def evaluate_hard_eligibility(user_profile: Dict[str, Any], scheme: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    """
    Evaluates 6-stage hard eligibility pipeline for a user profile and scheme.
    Returns (is_eligible, matched_reasons, missing_requirements).
    """
    user_state = user_profile.get("state", "All India").strip()
    user_district = user_profile.get("district", "").strip()
    user_age = int(user_profile.get("age", 25))
    user_gender = user_profile.get("gender", "All").strip()
    user_income = float(user_profile.get("income", 0))
    user_category = user_profile.get("category", "General").strip()
    user_is_student = bool(user_profile.get("isStudent", False) or user_profile.get("is_student", False))
    user_occupation = user_profile.get("occupation", "All").strip()

    matched_reasons = []
    missing_requirements = []

    # Rule 1: State Isolation & District
    scheme_level = scheme.get("level", "Central")
    scheme_state = scheme.get("state_name", scheme.get("state", "All India"))
    if scheme_level == "State" or (scheme_state and scheme_state != "All India"):
        if user_state.lower() != scheme_state.lower():
            missing_requirements.append(f"Requires residence in {scheme_state} (Your state: {user_state})")
            return False, matched_reasons, missing_requirements
        else:
            matched_reasons.append(f"Resides in target state: {scheme_state}")
    else:
        matched_reasons.append("Central scheme available nationwide")

    # Rule 2: Gender Filter
    scheme_gender = scheme.get("gender", "All")
    if scheme_gender != "All" and scheme_gender.lower() != user_gender.lower():
        missing_requirements.append(f"Targeted specifically for {scheme_gender} applicants")
        return False, matched_reasons, missing_requirements
    elif scheme_gender != "All":
        matched_reasons.append(f"Gender criteria met ({user_gender})")

    # Rule 3: Age Bounds
    min_age = int(scheme.get("min_age", scheme.get("minAge", 0)))
    max_age = int(scheme.get("max_age", scheme.get("maxAge", 100)))
    if user_age < min_age or user_age > max_age:
        missing_requirements.append(f"Age must be between {min_age} and {max_age} (Your age: {user_age})")
        return False, matched_reasons, missing_requirements
    else:
        matched_reasons.append(f"Age requirement met ({user_age} yrs within range {min_age}–{max_age})")

    # Rule 4: Income Ceiling
    max_income = scheme.get("max_income", scheme.get("maxIncome"))
    if max_income is not None and float(max_income) > 0:
        if user_income > float(max_income):
            missing_requirements.append(f"Annual income ceiling is ₹{int(float(max_income)):,} (Your income: ₹{int(user_income):,})")
            return False, matched_reasons, missing_requirements
        else:
            matched_reasons.append(f"Income within eligible limit (₹{int(user_income):,} <= ₹{int(float(max_income)):,})")

    # Rule 5: Student & Occupation
    if scheme.get("is_student_only", scheme.get("isStudentOnly", False)) and not user_is_student:
        missing_requirements.append("Exclusive to active students")
        return False, matched_reasons, missing_requirements
    elif scheme.get("is_student_only", scheme.get("isStudentOnly", False)):
        matched_reasons.append("Student status confirmed")

    target_occupations = scheme.get("target_occupations", scheme.get("targetOccupations", ["All"]))
    if isinstance(target_occupations, str):
        target_occupations = [o.strip() for o in target_occupations.split(";")]

    if "All" not in target_occupations and user_occupation not in target_occupations:
        matched_occ = any(user_occupation.lower() == occ.lower() for occ in target_occupations)
        if not matched_occ:
            missing_requirements.append(f"Targeted for occupations: {', '.join(target_occupations)} (Your occupation: {user_occupation})")
            return False, matched_reasons, missing_requirements
        else:
            matched_reasons.append(f"Occupation matches target group ({user_occupation})")

    # Rule 6: Category Quotas
    allowed_categories = scheme.get("allowed_categories", scheme.get("allowedCategories", ["All"]))
    if isinstance(allowed_categories, str):
        allowed_categories = [c.strip() for c in allowed_categories.split(";")]

    if "All" not in allowed_categories and user_category not in allowed_categories:
        matched_cat = any(user_category.lower() == cat.lower() for cat in allowed_categories)
        if not matched_cat:
            missing_requirements.append(f"Targeted for categories: {', '.join(allowed_categories)} (Your category: {user_category})")
            return False, matched_reasons, missing_requirements
        else:
            matched_reasons.append(f"Social category quota met ({user_category})")

    # Standard missing document highlights if applicable
    req_docs = scheme.get("required_documents", scheme.get("requiredDocuments", []))
    if req_docs and isinstance(req_docs, list) and len(req_docs) > 0:
        missing_requirements.append(f"Requires {len(req_docs)} document(s): {', '.join(req_docs[:2])}")

    return True, matched_reasons, missing_requirements


def calculate_affinity_score(user_profile: Dict[str, Any], scheme: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
    """
    Computes explainable weighted SUVIDHA Match Score (0-100%):
    - Hard Eligibility Base Match: 40%
    - Profile & Demographic Match: 25%
    - Location Match: 15%
    - Need / Category Match: 10%
    - Semantic / Priority Match: 10%
    """
    eligibility_weight = 40.0
    profile_score = 15.0
    location_score = 10.0
    category_score = 5.0
    priority_score = 5.0

    # Income proximity factor (lower relative income to ceiling = higher need)
    max_income = scheme.get("max_income", scheme.get("maxIncome", 1000000))
    user_income = float(user_profile.get("income", 0))
    if max_income and float(max_income) > 0:
        ratio = user_income / float(max_income)
        profile_score += (1.0 - ratio) * 10.0

    # Specific Category match bonus
    allowed_cats = scheme.get("allowed_categories", scheme.get("allowedCategories", ["All"]))
    if user_profile.get("category") in allowed_cats and "All" not in allowed_cats:
        category_score += 5.0

    # Occupation match bonus
    occupations = scheme.get("target_occupations", scheme.get("targetOccupations", ["All"]))
    if user_profile.get("occupation") in occupations and "All" not in occupations:
        profile_score += 5.0

    # Location match bonus
    scheme_state = scheme.get("state_name", scheme.get("state", "All India"))
    if user_profile.get("state", "") == scheme_state:
        location_score += 5.0

    total_score = eligibility_weight + profile_score + location_score + category_score + priority_score
    final_score = round(max(25.0, min(99.0, total_score)), 1)

    breakdown = {
        "eligibility_match": eligibility_weight,
        "profile_match": round(profile_score, 1),
        "location_match": round(location_score, 1),
        "category_match": round(category_score, 1),
        "priority_match": round(priority_score, 1)
    }

    return final_score, breakdown


def filter_and_sort_schemes(user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filters schemes using strict hard eligibility logic, calculates match percentages,
    and returns eligible schemes sorted in DESCENDING ORDER by match_percentage (highest match first).
    """
    eligible = []
    for scheme in schemes:
        is_eligible, matched_reasons, missing_reqs = evaluate_hard_eligibility(user_profile, scheme)
        if is_eligible:
            match_pct, score_breakdown = calculate_affinity_score(user_profile, scheme)
            scheme_copy = dict(scheme)
            scheme_copy["match_percentage"] = match_pct
            scheme_copy["score_breakdown"] = score_breakdown
            scheme_copy["matched_reasons"] = matched_reasons
            scheme_copy["missing_requirements"] = missing_reqs
            eligible.append(scheme_copy)

    # Sort strictly in DESCENDING ORDER (highest match percentage first)
    eligible.sort(key=lambda s: s["match_percentage"], reverse=True)
    return eligible
