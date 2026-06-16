def program_code_parser(program_code: str, logger=None) -> list[str]:
    """
    Dilutes the program code into its prime components.
    No department information, surprisingly.

    The Program codes have the folloing format:
    AS (stands for artsci)
    3 letters indicating  major / minor / spec / focus / cert
    4 digit program number
    1 digit suffix for cases where thye apparently run out of codes for a department.

    For example: ASMAJ1689 is CS major
    """
    artsci = program_code[0:2]
    if artsci != "AS" and logger is not None:
        logger.critical("Program title does not start with artsci. %s", program_code)
    program_type = program_code[2:5]  # major / minor / spec / focus / cert
    if program_type not in ["MAJ", "MIN", "SPE", "FOC", "CER"] and logger is not None:
        logger.critical("Program does not have major specification. %s", program_code)
    program_number = program_code[5:9]  # 4 digit number
    if not program_number.isdigit() and logger is not None:
        logger.critical("Program number has strange number format. %s", program_code)
    suffix = program_code[9:]  # they ran out of numbers, this is the fix :\
    if not (len(suffix) == 0 or suffix.isalpha()) and logger is not None:
        logger.critical("Unexpected program sufix. %s", program_code)
    # Example: https://artsci.calendar.utoronto.ca/section/Computer-Science
    return [artsci, program_type, program_number, suffix]
