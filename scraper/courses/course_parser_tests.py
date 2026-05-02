"""
CSC111 Winter 2026 Project 2

TODO

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
"""

import unittest
from course_parser import *


class MyTestCase(unittest.TestCase):
    def test_requisites_parser(self):
        cp = CourseParser()
        # MAT247 prereqs
        parsed = cp.requisites_parser("Prerequisite: MAT240H1/ MAT240H5")
        assert parsed == ["OR", "MAT240H1", "MAT240H5"]
        parsed = cp.requisites_parser("Exclusion: ACT230H1")
        assert parsed == ["AND", "ACT230H1"]
        parsed = cp.requisites_parser("Corequisite: ACT230H1")
        assert parsed == ["AND", "ACT230H1"]
        # STA347H1
        parsed = cp.requisites_parser("Prerequisite: STA247H1(70%)/ STA255H1(70%)/ STA237H1(70%)/ STA257H1/ ECO227Y1/ STAB52H3/ STA256H5; MAT223H1/ MAT224H1/ MAT240H1/ MATA22H3/ MATA23H3/ MAT223H5/ MAT240H5/ MATB24H3/ MAT224H5; MAT235Y1/ MAT237Y1/ MAT257Y1/ ( MATB41H3, MATB42H3)/ ( MAT232H5, MAT236H5)/ ( MAT233H5, MAT236H5) (Note: STA257H1, MAT223H1/ MAT240H1, MAT237Y1/ MAT257Y1 are very strongly recommended)")
        assert parsed == ["AND",
              ["OR", "STA247H1", "STA255H1", "STA237H1", "STA257H1", "ECO227Y1", "STAB52H3", "STA256H5"],
              ["OR", "MAT223H1", "MAT224H1", "MAT240H1", "MATA22H3", "MATA23H3", "MAT223H5", "MAT240H5", "MATB24H3",
               "MAT224H5"],
              ["OR", "MAT235Y1", "MAT237Y1", "MAT257Y1",
              ["AND", "MATB41H3", "MATB42H3"],
              ["AND", "MAT232H5", "MAT236H5"],
              ["AND", "MAT233H5", "MAT236H5"]],
                "STA257H1",
              ["OR", "MAT223H1", "MAT240H1"],
              ["OR", "MAT237Y1", "MAT257Y1"]
            ]

    def test_req_string_to_opslist(self):
        cp = CourseParser()
        # -- trivial cases --
        assert cp.req_string_to_opslist("MAT240H1/ MAT240H5") == ["MAT240H1", "/", "MAT240H5"]
        assert cp.req_string_to_opslist("MAT157Y1/ ( MAT157H5, MAT159H5)") == [
            "MAT157Y1", "/", "(", "MAT157H5", ",", "MAT159H5", ")"
        ]
        parsed = cp.req_string_to_opslist("(MAT157H5, MAT159H5), CSC110H1")
        assert parsed == [
            "(", "MAT157H5", ",", "MAT159H5", ")", ",", "CSC110H1"
        ]
        parsed = cp.req_string_to_opslist("(MAT157H5, MAT159H5)/ CSC110H1")
        assert parsed == [
            "(", "MAT157H5", ",", "MAT159H5", ")", "/", "CSC110H1"
        ]
        parsed = cp.req_string_to_opslist("(ECO372H1(70%)/ ECO374H1(70%)/ ECO375H1(60%)) OR ( ECO200Y1(80%)/ ECO204Y1(80%)/ ECO206Y1(80%), ( ECO220Y1(80%)/ ECO227Y1(80%))")
        assert parsed == [
            "(","ECO372H1","/","ECO374H1","/",
            "ECO375H1", ")", "/", "(", "ECO200Y1", "/",
            "ECO204Y1","/","ECO206Y1",",","(","ECO220Y1","/","ECO227Y1",")",")"
        ]
        # -- complicated cases --
        # STA130H1 prerequisite
        parsed = cp.req_string_to_opslist("MAT135H1/ MAT136H1/ MAT137Y1/ MAT157Y1, ( CSC108H1/ equivalent programming experience)/ CSC110Y1/ CSC148H1 *Note: the corequisite may be completed either concurrently or in advance.")
        assert parsed == [
            "MAT135H1", "/", "MAT136H1","/","MAT137Y1","/","MAT157Y1",",","(","CSC108H1",")", "/", "CSC110Y1", "/", "CSC148H1"
        ]
        # JFL388H1
        parsed = cp.req_string_to_opslist("4.0 credits, and any 100-level or higher language course OR introductory linguistics course (e.g., LIN200H1, FRE272H1, ITA360H1, SLA323H1/ SLA380H1, SPA322H1)")
        assert parsed == [
            "(", "LIN200H1", ",", "FRE272H1", ",", "ITA360H1", ",", "SLA323H1", "/", "SLA380H1", ",", "SPA322H1", ")"
        ]
        # STA347H1
        parsed = cp.req_string_to_opslist("STA247H1(70%)/ STA255H1(70%)/ STA237H1(70%)/ STA257H1/ ECO227Y1/ STAB52H3/ STA256H5; MAT223H1/ MAT224H1/ MAT240H1/ MATA22H3/ MATA23H3/ MAT223H5/ MAT240H5/ MATB24H3/ MAT224H5; MAT235Y1/ MAT237Y1/ MAT257Y1/ ( MATB41H3, MATB42H3)/ ( MAT232H5, MAT236H5)/ ( MAT233H5, MAT236H5) (Note: STA257H1, MAT223H1/ MAT240H1, MAT237Y1/ MAT257Y1 are very strongly recommended)")
        assert parsed == [
            "STA247H1", "/", "STA255H1", "/", "STA237H1", "/", "STA257H1", "/", "ECO227Y1", "/", "STAB52H3", "/", "STA256H5", ",", "MAT223H1","/","MAT224H1","/","MAT240H1","/","MATA22H3","/","MATA23H3","/","MAT223H5","/","MAT240H5","/","MATB24H3","/","MAT224H5",",","MAT235Y1","/","MAT237Y1","/","MAT257Y1","/","(","MATB41H3",",","MATB42H3",
            ")","/","(","MAT232H5",",","MAT236H5",")","/","(","MAT233H5",",","MAT236H5",")", ",", "(","STA257H1",",","MAT223H1","/","MAT240H1",",","MAT237Y1","/","MAT257Y1",")"
        ]
        parsed = cp.req_string_to_opslist("CSC209H1/ CSC209H5/ CSCB09H3; STA237H1/ STA247H1/ STA255H1/ STA257H1 Prerequisite for Faculty of Applied Science and Engineering students: APS105H1/ APS106H1/ ESC180H1/ CSC180H1; ECE302H1/ STA286H1/ CHE223H1/ CME263H1/ MIE231H1/ MIE236H1/ MSE238H1/ ECE286H1")


    def test_naive_requisites_parser(self):
        cp = CourseParser()
        parsed, _ = cp.naive_requisites_parser(["MAT240H1", "/", "MAT240H5"])
        assert parsed == ["AND", "MAT240H1", "MAT240H5"]


    def test_nested_lists_flattener(self):
        cp = CourseParser()
        parsed = cp.nested_lists_flattener(["AND", "A", "B"])
        assert parsed == ["AND", "A", "B"]
        parsed = cp.nested_lists_flattener(["AND", ["AND", "A"], "B"])
        assert parsed == ["AND", "A", "B"]
        parsed = cp.nested_lists_flattener(["AND", ["OR", "A", "C"], "B"])
        assert parsed == ["AND", ["OR", "A", "C"], "B"]
        parsed = cp.nested_lists_flattener(["AND", ["OR", "A", "C", ["OR", ["AND", "D"], "E"]], "B"])
        assert parsed == ["AND", ["OR", "A", "C", ["AND", "D"], "E"], "B"]
        parsed = cp.nested_lists_flattener(["AND", ["AND", "A", "B"], "B"])
        assert parsed == ["AND", "A", "B", "B"]
        parsed = cp.nested_lists_flattener(["A"])
        assert parsed == ["AND", "A"]
        parsed = cp.nested_lists_flattener([[[["A"]]]])
        assert parsed == ["AND", "A"]
        parsed = cp.nested_lists_flattener([[[["OR", "A"]]]])
        assert parsed == ["OR", "A"]
        parsed = cp.nested_lists_flattener(["AND", ["OR", "A"]])
        assert parsed == ["AND", ["OR", "A"]]

    def test_rpn_parser(self):
        cp = CourseParser()
        parsed = cp.requisites_to_polish_notation([
            "MAT157Y1", "/", "MAT137Y1"
        ])

        assert parsed == ["MAT157Y1", "MAT137Y1", "/"]
        parsed = cp.requisites_to_polish_notation([
            "MAT157Y1", "/", "(", "MAT157H5", ",", "MAT159H5", ")"
        ])
        assert parsed == ["MAT157Y1", "MAT157H5", "MAT159H5", ",", "/"]
        parsed = cp.requisites_to_polish_notation([
            "MAT157Y1", ",", "(", "MAT157H5", ",", "MAT159H5", ")", "/", "(", "MAT137Y1", ")"
        ])
        assert parsed == ["MAT157Y1", "MAT157H5", "MAT159H5", ",", "MAT137Y1", "/", ","]
        parsed = cp.requisites_to_polish_notation([
            "ABC333H1", ",", "(","ABC444H1",",","ABC555H1", "/", "ABC666H1",",","ABC555H1", "/", "ABC666H1",")"
        ])
        assert parsed == ['ABC333H1', 'ABC444H1', 'ABC555H1', 'ABC666H1', '/', 'ABC555H1', 'ABC666H1', '/', ',', ',', ',']

    def test_rpn_to_nested_lists(self):
        cp = CourseParser()
        parsed = cp.requisites_pn_to_nested_lists([
            "MAT157Y1", "MAT137Y1", "/"
        ])
        assert parsed == ["OR", "MAT157Y1", "MAT137Y1"]
        parsed = cp.requisites_pn_to_nested_lists(['ABC333H1', 'ABC444H1', 'ABC555H1', 'ABC666H1', '/', 'ABC555H1', 'ABC666H1', '/', ',', ',', ','])
        assert parsed == ['AND', 'ABC333H1', ['AND', 'ABC444H1', ['AND', ['OR', 'ABC555H1', 'ABC666H1'], ['OR', 'ABC555H1', 'ABC666H1']]]]

    def test_simplify_requisite(self):
        cp = CourseParser()
        output = cp.simplify_requisite(["AND", "A"], {"A", "B", "C"})
        assert output == ["AND", "A"]
        output = cp.simplify_requisite(["AND", "A", "D"], {"A", "B", "C"})
        assert output == ["AND", "A"]
        output = cp.simplify_requisite(["AND", "A", ["OR", "D"]], {"A", "B", "C"})
        assert output == ["AND", "A"]
        output = cp.simplify_requisite(["AND", "A", ["OR", "D", "C"]], {"A", "B", "C"})
        assert output == ["AND", "A", "C"]
        output = cp.simplify_requisite(["AND", ["OR", "D", "B", "C"], "G"], {"A", "B", "C"})
        assert output == ["OR", "B", "C"]
        output = cp.simplify_requisite(["AND", ["OR", "D", ["AND", "B", "C"]], "G"], {"A", "B", "C"})
        assert output == ["AND", "B", "C"]


if __name__ == '__main__':
    unittest.main()

    import doctest
    doctest.testmod(verbose=True)

    import python_ta
    python_ta.check_all(config={
        'allow-local-imports': True,
        'extra-imports': [],
        'allowed-io': [],
        'max-line-length': 120,
        'max-nested-blocks': 5,
        'max-locals': 20,
        'max-branches': 15,
        'max-args': 7
    })
