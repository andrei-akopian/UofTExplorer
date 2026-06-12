from typing import Optional


def course_code_parser(course_code: str) -> Optional[list[str | int]]:
    """
    Dilutes the course code into its prime components.
    verify flag converts this into a checker.

    Returns either parsed string, or None
    """
    if len(course_code) != 8 or not course_code.isupper():
        return None

    department_code = ""
    course_number = ""
    length = ""
    campus = ""
    i = 0
    # Department code
    while i < len(course_code) and course_code[i].isalpha():
        department_code += course_code[i]
        i += 1
    if len(department_code) not in [3, 4]:
        return None
    # Course number with  department
    while i < len(course_code) and course_code[i].isdigit():
        course_number += course_code[i]
        i += 1
    if (len(course_number) == 2 and len(department_code) != 4) or (
        len(course_number) > 4
    ):
        return None
    # Length (year) or (halfyear)
    while i < len(course_code) and course_code[i].isalpha():
        length += course_code[i]
        i += 1
    if len(length) != 1:
        return None
    # Compus code, see CAMPUSES constant
    while i < len(course_code) and course_code[i].isdigit():
        campus += course_code[i]
        i += 1
    if len(campus) != 1:
        return None
    return [department_code, int(course_number), length, int(campus)]
