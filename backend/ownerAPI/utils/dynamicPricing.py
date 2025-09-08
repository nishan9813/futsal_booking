# booking/pricing.py
import datetime

def calculate_dynamic_price(ground, booking_datetime, recent_booking_count=0):
    """
    Calculate dynamic price for a ground based on date/time and demand.
    """
    # If dynamic pricing disabled, return base price
    if not ground.use_dynamic_pricing:
        return ground.price

    price = ground.price
    weekday = booking_datetime.weekday()  # 0 = Monday, 6 = Sunday
    hour = booking_datetime.hour

    # --- Rule 1: Weekend pricing (Sat ) ---
    if weekday in [5]:
        price *= 1.2   # +20%

    # --- Rule 2: Peak hours (6PM–10PM) ---
    if 17 <= hour <= 22:
        price *= 1.3   # +30%

    # --- Rule 3: Morning discount (before 10AM) ---
    if 5 <= hour < 11:
        price *= 0.9   # -10%

    # --- Rule 4: Demand-based adjustment ---
    if recent_booking_count >= 5:   # high demand for this slot
        price *= 1.25   # +25%

    # --- Rule 5: Ground type adjustment ---
    # if ground.ground_type in ["TURF", "WOOD"]:  
    #     price *= 1.1   # +10% premium

    return round(price, 2)
