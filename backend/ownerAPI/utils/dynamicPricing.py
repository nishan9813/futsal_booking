import datetime

def calculate_dynamic_price(ground, booking_datetime, recent_booking_count=0):

    if not ground.use_dynamic_pricing:
        return ground.price

    price = ground.price
    weekday = booking_datetime.weekday() 
    hour = booking_datetime.hour

    if weekday in [5]:
        price *= 1.2   # +20%

    if 17 <= hour <= 22:
        price *= 1.3   # +30%

    if 5 <= hour < 11:
        price *= 0.9   # -10%

    if recent_booking_count >= 5:  
        price *= 1.25   # +25%


    return round(price)

    # --- Rule 5: Ground type adjustment ---
    # if ground.ground_type in ["TURF", "WOOD"]:  
    #     price *= 1.1   # +10% premium