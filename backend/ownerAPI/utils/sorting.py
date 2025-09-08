

def Price_sorting(grounds, ascending = True):
    return sorted(grounds, key=lambda g: g.price, reverse=not ascending)