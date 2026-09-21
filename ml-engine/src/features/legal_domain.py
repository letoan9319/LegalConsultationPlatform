from typing import Dict, List


class LegalDomainClassifier:
    DOMAIN_KEYWORDS = {
        'CIVIL': ['tran chap', 'boi thuong', 'thuong mai', 'hieu luan', 'dieu kien'],
        'CRIMINAL': ['hinh su', 'to an', 'toa an', 'tu', 'pham to', 'truy to'],
        'LAND': ['dat dai', 'nha o', 'chuyen nhuong', 'so huu', 'quyen su dung dat'],
        'LABOR': ['lao dong', 'viec lam', 'luong', 'thoai vic', 'cong doan'],
        'COMMERCIAL': ['kinh doanh', 'cong ty', 'nhan nuoi', 'dau tu', 'chung khoan'],
        'FAMILY': ['hon nhan', 'ly hon', 'chia tai san', 'nuoi con', 'giam ho'],
        'INTELLECTUAL': ['so huu tri tue', 'patent', 'thuong hieu', 'ban quyen'],
        'TAX': ['thue', 'thue thu nhap', 'VAT', 'ke khai thue'],
        'ADMINISTRATIVE': ['hanh chinh', 'kien nghi', 'khiyeu nai', 'keo doi'],
        'INSURANCE': ['bao hiem', 'boi thuong', 'hop dong bao hiem'],
    }

    def classify(self, text: str) -> Dict[str, float]:
        text_lower = text.lower()
        scores = {}
        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            scores[domain] = score
        total = sum(scores.values())
        if total > 0:
            scores = {k: v / total for k, v in scores.items()}
        return scores

    def predict(self, texts: List[str]) -> List[Dict[str, float]]:
        return [self.classify(text) for text in texts]
