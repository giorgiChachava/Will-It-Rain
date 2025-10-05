from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import requests
from datetime import timedelta
import io
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")


# Historical window
start, end = "20050101", "20250606"
temporal, community = "daily", "RE"
 
# --- Fetch NASA POWER data ---
def get_nasa_power_data(lat, lon, start, end, temporal="daily", community="RE"):
    base_url = f"https://power.larc.nasa.gov/api/temporal/{temporal}/point"
    params = {
        "parameters": "T2M,T2M_MAX,T2M_MIN,PRECTOT",
        "community": community,
        "longitude": lon,
        "latitude": lat,
        "start": start,
        "end": end,
        "format": "JSON",
    }
    print(f"\n📡 Fetching data for ({lat},{lon}) {start}-{end} …")
    r = requests.get(base_url, params=params, timeout=120)
    r.raise_for_status()
    data = r.json().get("properties", {}).get("parameter", {})
    if not data:
        return pd.DataFrame()
    df = pd.DataFrame(data)
    df.index = pd.to_datetime(df.index)
    df.rename(columns={
        "T2M": "Avg_Temp_°C",
        "T2M_MAX": "Max_Temp_°C",
        "T2M_MIN": "Min_Temp_°C",
        "PRECTOT": "Precipitation_mm",
    }, inplace=True)
    df = df.apply(pd.to_numeric, errors="coerce").sort_index()
    return df
 
# --- Temperature categories ---
def categorize_temp_simple(temp):
    if pd.isna(temp): return None
    if temp < 0:   return "Very Cold"
    if temp < 10:  return "Cold"
    if temp < 20:  return "Mild"
    if temp < 30:  return "Warm / Hot"
    return "Very Hot"
 
# --- Weighted probabilities (years + days) ---
def category_probabilities_weighted_days(df, target_date: str, last_n_years: int = 20, half_window_days: int = 5):
    """Weighted category probabilities with more importance to recent years and days closer to target date."""
    try:
        anchor = pd.to_datetime(target_date, format="%Y%m%d", errors="raise")
    except Exception:
        anchor = pd.to_datetime(target_date)
 
    categories = ["Very Cold", "Cold", "Mild", "Warm / Hot", "Very Hot"]
    year_distributions = []
    year_weights = []
 
    print(f"\n📅 Target date: {anchor.strftime('%Y-%m-%d')}")
    print(f"🗓️ Window: ±{half_window_days} days per year, past {last_n_years} years\n")
 
    # Loop over past years (exclude target year)
    for i, y in enumerate(range(anchor.year - 1, anchor.year - last_n_years - 1, -1)):
        y_weight = last_n_years - i
        year_weights.append(y_weight)
 
        try:
            anchor_y = anchor.replace(year=y)
        except ValueError:
            anchor_y = anchor.replace(year=y, day=28)
 
        start_y = max(pd.Timestamp(y, 1, 1), anchor_y - timedelta(days=half_window_days))
        end_y   = min(pd.Timestamp(y, 12, 31), anchor_y + timedelta(days=half_window_days))
 
        sub = df.loc[start_y:end_y, ["Max_Temp_°C"]].copy()
        if sub.empty:
            print(f"{y}: No data\n")
            year_weights[-1] = 0
            continue
 
        # Day-level weights: closer to target day = higher
        sub["Day_Weight"] = sub.index.map(lambda d: half_window_days - abs((d - anchor_y).days) + 1)
        sub["Category"] = sub["Max_Temp_°C"].apply(categorize_temp_simple)
 
        # Weighted counts
        weighted_counts = sub.groupby("Category")["Day_Weight"].sum().reindex(categories, fill_value=0)
        weighted_probs = weighted_counts / weighted_counts.sum() * 100
        year_distributions.append(weighted_probs)
 
        print(f"{y} ({start_y.date()} → {end_y.date()}), year_weight={y_weight}:")
        for c in categories:
            print(f"  {c:<10}: {weighted_probs[c]:5.1f}%")
        print("")
 
    if not year_distributions:
        print("⚠️ No valid data found in the chosen years/window.")
        return None, None
 
    # Weighted mean across years
    df_years = pd.concat(year_distributions, axis=1)
    year_weights = np.array(year_weights[:df_years.shape[1]])
    mean_probs = (df_years * year_weights).sum(axis=1) / year_weights.sum()
 
    print("📊 Weighted mean category probabilities (years + days):")
    for c in categories:
        print(f"  {c:<10}: {mean_probs[c]:5.1f}%")
 
    predicted = mean_probs.idxmax()
    confidence = mean_probs.max()
    print(f"\n🌡️ Predicted category for {anchor.strftime('%Y-%m-%d')}: {predicted} ({confidence:.1f}% confidence)")
 
    return categories, mean_probs
 
# --- Run ---
# df = get_nasa_power_data(lat, lon, start, end, temporal, community)
# if df.empty:
#     print("No data returned from NASA POWER API.")
# else:
#     categories, mean_probs = category_probabilities_weighted_days(df, date_str, last_n_years=20, half_window_days=5)
        
 

@app.route("/predict_temperature", methods=["POST"])
def predict_temperature():
    data = request.json
    lat = data.get("lat")
    lon = data.get("lon")
    date_str = data.get("date_str")
    
    if lat is None or lon is None or date_str is None:
        return jsonify({"error": "lat, lon, and date are required"}), 400
    
    df = get_nasa_power_data(lat, lon, "20050101", "20250606")
    if df.empty:
        return jsonify({"error": "No data returned from NASA POWER API."}), 400
    
    categories, mean_probs = category_probabilities_weighted_days(df, date_str, last_n_years=20, half_window_days=5)
    if mean_probs is None:
        return jsonify({"error": "No valid data for chosen date."}), 400
    
    # Convert mean_probs to a dictionary for frontend
    probs_dict = {c: float(mean_probs[c]) for c in categories}
    
    return jsonify({
        "predicted_category": mean_probs.idxmax(),
        "confidence": float(mean_probs.max()),
        "probabilities": probs_dict
    })

if __name__ == "__main__":
    app.run(debug=True)