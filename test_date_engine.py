from datetime import date
from date_engine import compute_deadline


def test_calendar_days():
    start = date(2026, 1, 1)
    result = compute_deadline(start, 10, "calendar")
    assert result == date(2026, 1, 11)


def test_business_days_crossing_weekend():
    # Jan 1, 2026 is a Thursday
    start = date(2026, 1, 1)
    result = compute_deadline(start, 3, "business")
    # Fri, Sat, Sun, Mon, Tue -> should skip Sat/Sun
    assert result == date(2026, 1, 6)


def test_business_days_crossing_holiday():
    # Dec 24, 2026 -> should skip Christmas (Dec 25)
    start = date(2026, 12, 24)
    result = compute_deadline(start, 1, "business")
    assert result == date(2026, 12, 28)
def test_india_business_days():
    # Republic Day is Jan 26 in India
    start = date(2026, 1, 24)  # Saturday
    result = compute_deadline(start, 1, "business", country="IN", state="KA")
    # Sat, Sun skipped, Jan 26 (Mon) is Republic Day -> also skipped
    assert result == date(2026, 1, 27)