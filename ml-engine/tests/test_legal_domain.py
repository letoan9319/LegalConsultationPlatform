import pytest
from features.legal_domain import LegalDomainClassifier


class TestLegalDomainClassifier:
    def test_civil_classification(self):
        classifier = LegalDomainClassifier()
        text = "toi bi tran chap ve viec boi thuong that nghiep"
        scores = classifier.classify(text)
        assert 'CIVIL' in scores
        assert scores['CIVIL'] > 0

    def test_criminal_classification(self):
        classifier = LegalDomainClassifier()
        text = "toi bi to an xet xu ve toi pham hinh su"
        scores = classifier.classify(text)
        assert 'CRIMINAL' in scores
        assert scores['CRIMINAL'] > 0
