from datetime import date, timedelta
import holidays


def compute_deadline(start_date, number_of_days, day_type, state="CA"):
    if day_type == "calendar":
        return start_date + timedelta(days=number_of_days)

    elif day_type == "business":
        us_holidays = holidays.US(state=state)
        current_date = start_date
        days_added = 0

        while days_added < number_of_days:
            current_date += timedelta(days=1)
            is_weekend = current_date.weekday() >= 5  # 5=Saturday, 6=Sunday
            is_holiday = current_date in us_holidays

            if not is_weekend and not is_holiday:
                days_added += 1

        return current_date

    else:
        raise ValueError("day_type must be 'business' or 'calendar'")