from typing import List, Dict, Any

def evaluate_hard_eligibility(user_profile: Dict[str, Any], scheme: Dict[str, Any]) -> bool:
    """
    Strict 6-stage deterministic hard filter pipeline.
    Returns True if scheme passes all filters, False otherwise.
    """
    user_state = user_profile.get("state", "").strip()
    user_age = int(user_profile.get("age", 0))
    user_gender = user_profile.get("gender", "All").strip()
    user_income = float(user_profile.get("income", 0))
    user_category = user_profile.get("category", "General").strip()
    user_is_student = bool(user_profile.get("isStudent", False) or user_profile.get("is_student", False))
    user_occupation = user_profile.get("occupation", "All").strip()

    # Rule 1: State Isolation
    scheme_level = scheme.get("level", "Central")
    scheme_state = scheme.get("state_name", "All India")
    if scheme_level == "State" or scheme_state != "All India":
        if user_state.lower() != scheme_state.lower():
            return False

    # Rule 2: Gender Filter
    scheme_gender = scheme.get("gender", "All")
    if scheme_gender != "All" and scheme_gender.lower() != user_gender.lower():
        return False

    # Rule 3: Age Bounds
    min_age = int(scheme.get("min_age", 0))
    max_age = int(scheme.get("max_age", 100))
    if user_age < min_age or user_age > max_age:
        return False

    # Rule 4: Income Ceiling
    max_income = scheme.get("max_income")
    if max_income is not None and float(max_income) > 0:
        if user_income > float(max_income):
            return False

    # Rule 5: Student & Occupation
    if scheme.get("is_student_only", False) and not user_is_student:
        return False

    target_occupations = scheme.get("target_occupations", ["All"])
    if isinstance(target_occupations, str):
        target_occupations = [o.strip() for o in target_occupations.split(";")]

    if "All" not in target_occupations and user_occupation not in target_occupations:
        # Check case-insensitive match
        matched_occ = any(user_occupation.lower() == occ.lower() for occ in target_occupations)
        if not matched_occ:
            return False

    # Rule 6: Category Quotas
    allowed_categories = scheme.get("allowed_categories", ["All"])
    if isinstance(allowed_categories, str):
        allowed_categories = [c.strip() for c in allowed_categories.split(";")]

    if "All" not in allowed_categories and user_category not in allowed_categories:
        matched_cat = any(user_category.lower() == cat.lower() for cat in allowed_categories)
        if not matched_cat:
            return False

    return True


def calculate_affinity_score(user_profile: Dict[str, Any], scheme: Dict[str, Any]) -> float:
    """
    Computes a match percentage score (0-100%) based on secondary demographic affinities.
    """
    score = 40.0  # Base passing score

    # Income proximity factor (lower relative income to ceiling = higher urgency/affinity)
    max_income = scheme.get("max_income", 1000000)
    user_income = float(user_profile.get("income", 0))
    if max_income and max_income > 0:
        ratio = user_income / float(max_income)
        score += (1.0 - ratio) * 20.0

    # Specific Category match bonus
    allowed_cats = scheme.get("allowed_categories", ["All"])
    if user_profile.get("category") in allowed_cats and "All" not in allowed_cats:
        score += 15.0

    # Specific Occupation match bonus
    occupations = scheme.get("target_occupations", ["All"])
    if user_profile.get("occupation") in occupations and "All" not in occupations:
        score += 15.0

    # Age centrality bonus
    min_age = int(scheme.get("min_age", 0))
    max_age = int(scheme.get("max_age", 100))
    mid_age = (min_age + max_age) / 2.0
    user_age = int(user_profile.get("age", 25))
    age_dist = abs(user_age - mid_age)
    score += max(0, 10 - (age_dist / 5.0))

    # Clamp score between 15% and 98%
    final_score = round(max(15.0, min(98.0, score)), 1)
    return final_score


def filter_and_sort_schemes(user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filters schemes using strict hard eligibility logic, calculates match percentages,
    and returns eligible schemes sorted in ASCENDING ORDER by match_percentage.
    """
    eligible = []
    for scheme in schemes:
        if evaluate_hard_eligibility(user_profile, scheme):
            match_pct = calculate_affinity_score(user_profile, scheme)
            scheme_copy = dict(scheme)
            scheme_copy["match_percentage"] = match_pct
            eligible.append(scheme_copy)

    # Sort strictly in ASCENDING ORDER as required by Master Prompt Section 4
    eligible.sort(key=lambda s: s["match_percentage"], reverse=False)
    return eligible
