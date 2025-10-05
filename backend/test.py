# merged_weather_baseline.py
# One script: Rain probability (Level-2) + Temperature & Wind category probabilities
# Uses NASA POWER daily data for the previous N full years ending before the target year.
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import requests
from datetime import timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")
 
# =========================
# === PRESETS (EDITABLE) ==
# =========================
ROLLING_YEARS = 20                  # previous N FULL calendar years (ending year BEFORE target)
SMOOTH_WINDOW_DAYS = 13             # +/- days around target DOY for seasonality (rain model)
TW_HALF_WINDOW_DAYS = 10            # +/- days for temp/wind categories
BLEND_MODE = "equal"                # "equal" or "sample_weighted"
YESTERDAY_INFERENCE = "yday_climo"  # "yday_climo" (stable) or "prev_year_yesterday"
PERSISTENCE_WEIGHT = 0.20           # weight for persistence in rain (0.0–1.0), lower = “rain is random”
 
# Rain intensity classes (mm/day)
NO_RAIN_THRESHOLD = 0.5
HEAVY_THRESHOLD   = 15.0
 
# Wind thresholds (mph) and conversion (POWER WS10M/WS10M_MAX are in m/s)
MPH_PER_MS = 2.23693629
WINDY_THRESHOLD_MPH = 8.0
WINDY_THRESHOLD_MS  = WINDY_THRESHOLD_MPH / MPH_PER_MS  # ≈ 3.58 m/s
 
# =========================
# === INPUT ===============
# =========================
def read_user_inputs():
    lat_str = input("Latitude (e.g., 41.7151): ").strip()
    lon_str = input("Longitude (e.g., 44.8271): ").strip()
    date_str = input("Target date (YYYY-MM-DD or YYYYMMDD): ").strip()
 
    try:
        lat = float(lat_str); lon = float(lon_str)
    except ValueError:
        raise ValueError("Latitude/Longitude must be numeric.")
    if not (-90 <= lat <= 90):   raise ValueError("Latitude must be between -90 and 90.")
    if not (-180 <= lon <= 180): raise ValueError("Longitude must be between -180 and 180.")
 
    if "-" not in date_str and len(date_str) == 8:
        date_parsed = pd.to_datetime(date_str, format="%Y%m%d", errors="coerce")
    else:
        date_parsed = pd.to_datetime(date_str, errors="coerce")
    if pd.isna(date_parsed):
        raise ValueError("Invalid date. Use YYYY-MM-DD or YYYYMMDD.")
 
    return float(lat), float(lon), date_parsed.strftime("%Y-%m-%d")
 
# =========================
# === HISTORY WINDOW ======
# =========================
def compute_history_window(target_date_str, rolling_years=ROLLING_YEARS, min_first_year=1981):
    """
    Use previous N FULL calendar years ending Dec 31 of the year before target.
    Example: target=2024-12-05, N=20 -> 2004-01-01 .. 2023-12-31
    """
    t = pd.to_datetime(target_date_str)
    end_year = t.year - 1
    start_year = max(min_first_year, end_year - rolling_years + 1)
    start = pd.Timestamp(start_year, 1, 1)
    end = pd.Timestamp(end_year, 12, 31)
    return start.strftime("%Y%m%d"), end.strftime("%Y%m%d"), start_year, end_year
 
# =========================
# === DATA FETCH (POWER) ==
# =========================
def fetch_power(lat, lon, start_yyyymmdd, end_yyyymmdd, temporal="daily", community="RE"):
    """
    One call for all variables we need:
      - Rain: PRECTOTCORR (mm/day)
      - Temperature: T2M, T2M_MAX, T2M_MIN (°C)
      - Wind: WS10M_MAX (m/s)
    """
    base_url = f"https://power.larc.nasa.gov/api/temporal/{temporal}/point"
    params = {
        "parameters": "PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,WS10M_MAX",
        "community": community,
        "longitude": lon,
        "latitude": lat,
        "start": start_yyyymmdd,
        "end": end_yyyymmdd,
        "format": "JSON",
    }
    r = requests.get(base_url, params=params, timeout=90)
    r.raise_for_status()
    data = r.json().get("properties", {}).get("parameter", {})
    if not data:
        raise RuntimeError("No data returned from NASA POWER. Check coordinates/dates.")
    df = pd.DataFrame(data)              # columns are parameter names, index are YYYYMMDD strings
    df.index = pd.to_datetime(df.index)  # to datetime index
    df = df.apply(pd.to_numeric, errors="coerce").sort_index()
    return df
 
# =========================
# === RAIN MODEL (LEVEL-2)
# =========================
def classify_intensity(mm):
    if mm < NO_RAIN_THRESHOLD:
        return "no_rain"
    elif mm < HEAVY_THRESHOLD:
        return "moderate"
    else:
        return "heavy"
 
def add_calendar_and_flags(df_precip):
    df = df_precip.copy()
    doy = df["date"].dt.dayofyear
    df["doy"] = doy.where(doy != 366, 365)     # map leap DOY to 365
    df["month"] = df["date"].dt.month
    df["class"] = [classify_intensity(x) for x in df["precip_mm"]]
    df["wet"] = (df["precip_mm"] >= NO_RAIN_THRESHOLD).astype(int)
    return df
 
def circular_doy_distance(d1, d2):
    raw = abs(d1 - d2)
    return min(raw, 365 - raw)
 
def seasonal_window(df, target_doy, half_width):
    return df[df["doy"].apply(lambda d: circular_doy_distance(d, target_doy) <= half_width)]
 
def seasonal_probs(df, target_date, half_width=SMOOTH_WINDOW_DAYS):
    target = pd.to_datetime(target_date, errors="coerce")
    if pd.isna(target):
        raise ValueError("Could not parse target date.")
    target_doy = target.timetuple().tm_yday
    if target_doy == 366:
        target_doy = 365
    sub = seasonal_window(df, target_doy, half_width)
    n = len(sub)
    if n == 0:
        raise RuntimeError("No historical samples in seasonal window.")
    p_rain = sub["wet"].mean()
    wet_sub = sub[sub["wet"] == 1]
    if len(wet_sub) > 0:
        f_mod = (wet_sub["class"] == "moderate").mean()
        f_hev = (wet_sub["class"] == "heavy").mean()
    else:
        f_mod = np.nan; f_hev = np.nan
    return {
        "p_climo": float(p_rain),
        "n_climo": int(n),
        "target_doy": int(target_doy),
        "window_half_width_days": int(half_width),
        "cond_wet_split": {
            "f_moderate_given_wet": None if np.isnan(f_mod) else float(f_mod),
            "f_heavy_given_wet": None if np.isnan(f_hev) else float(f_hev),
        }
    }
 
def monthly_markov(df):
    """For each month m: P(W|W_prev,m), P(W|D_prev,m) and denominators."""
    x = df.sort_values("date").copy()
    x["wet_prev"] = x["wet"].shift(1)
    valid = x.dropna(subset=["wet_prev"]).copy()
    out = {}
    for m in range(1, 13):
        vm = valid[valid["month"] == m]
        if len(vm) == 0:
            out[m] = {"P_W_given_W": np.nan, "P_W_given_D": np.nan,
                      "den_Wprev": 0, "den_Dprev": 0}
            continue
        den_Wprev = int((vm["wet_prev"] == 1).sum())
        den_Dprev = int((vm["wet_prev"] == 0).sum())
        num_WW   = int(((vm["wet_prev"] == 1) & (vm["wet"] == 1)).sum())
        num_DW   = int(((vm["wet_prev"] == 0) & (vm["wet"] == 1)).sum())
        p_w_w = (num_WW / den_Wprev) if den_Wprev > 0 else np.nan
        p_w_d = (num_DW / den_Dprev) if den_Dprev > 0 else np.nan
        out[m] = {"P_W_given_W": p_w_w, "P_W_given_D": p_w_d,
                  "den_Wprev": den_Wprev, "den_Dprev": den_Dprev}
    return out
 
def blend_probs(p_climo, p_markov, mode="equal", n_climo=None, n_markov=None, cap=0.85, w_persist=None):
    if np.isnan(p_markov):
        return p_climo
    if np.isnan(p_climo):
        return p_markov
    if w_persist is not None:
        w = float(np.clip(w_persist, 0.0, 1.0))
        return (1.0 - w) * p_climo + w * p_markov
    if mode == "sample_weighted" and n_climo is not None and n_markov is not None and (n_climo + n_markov) > 0:
        w_m = n_markov / (n_climo + n_markov + 1e-9)
        w_m = min(max(w_m, 0.15), cap)
        return (1.0 - w_m) * p_climo + w_m * p_markov
    return 0.5 * (p_climo + p_markov)
 
def level2_rain(lat, lon, target_date, df_full,
                smooth_window_days=SMOOTH_WINDOW_DAYS,
                blend_mode=BLEND_MODE,
                y_infer_mode=YESTERDAY_INFERENCE,
                persistence_weight=PERSISTENCE_WEIGHT):
    # Build precip df for the rain model
    if "PRECTOTCORR" not in df_full.columns:
        raise RuntimeError("PRECTOTCORR not found in fetched data.")
    df_precip = df_full[["PRECTOTCORR"]].rename(columns={"PRECTOTCORR": "precip_mm"}).copy()
    df_precip = df_precip.reset_index().rename(columns={"index": "date"})
 
    # Prep / features
    df = add_calendar_and_flags(df_precip)
    season = seasonal_probs(df, target_date, half_width=smooth_window_days)
    p_climo, n_climo = season["p_climo"], season["n_climo"]
 
    # Markov by month
    month = pd.to_datetime(target_date).month
    markov = monthly_markov(df)
    rec = markov.get(month, {"P_W_given_W": np.nan, "P_W_given_D": np.nan, "den_Wprev":0, "den_Dprev":0})
    p_w_w = rec["P_W_given_W"]; p_w_d = rec["P_W_given_D"]
 
    # Yesterday inference
    target_dt = pd.to_datetime(target_date)
    yesterday_dt = target_dt - timedelta(days=1)
    p_markov = np.nan
    n_markov_den = 0
 
    if y_infer_mode == "prev_year_yesterday":
        # Handle leap-day edge
        try:
            prev_year_yday = yesterday_dt.replace(year=yesterday_dt.year - 1)
        except ValueError:
            prev_year_yday = yesterday_dt.replace(year=yesterday_dt.year - 1, day=28)
        row = df[df["date"] == prev_year_yday]
        if len(row):
            ystate_proxy = "wet" if float(row.iloc[0]["precip_mm"]) >= NO_RAIN_THRESHOLD else "dry"
            p_markov = p_w_w if ystate_proxy == "wet" else p_w_d
            n_markov_den = rec["den_Wprev"] if ystate_proxy == "wet" else rec["den_Dprev"]
 
    if (np.isnan(p_markov) or y_infer_mode == "yday_climo") and (not np.isnan(p_w_w) and not np.isnan(p_w_d)):
        season_yday = seasonal_probs(df, str(yesterday_dt.date()), half_width=smooth_window_days)
        p_yday = season_yday["p_climo"]
        p_markov = p_w_w * p_yday + p_w_d * (1.0 - p_yday)
        n_markov_den = rec["den_Wprev"] + rec["den_Dprev"]
 
    # Blend
    p_final = blend_probs(p_climo, p_markov,
                          mode=blend_mode, n_climo=n_climo, n_markov=n_markov_den,
                          w_persist=persistence_weight)
 
    # Split intensities
    f_mod = season["cond_wet_split"]["f_moderate_given_wet"]
    f_hev = season["cond_wet_split"]["f_heavy_given_wet"]
    if f_mod is None or f_hev is None or np.isnan(f_mod) or np.isnan(f_hev):
        P_moderate = np.nan; P_heavy = np.nan
    else:
        P_moderate = p_final * f_mod
        P_heavy = p_final * f_hev
    P_no_rain = 1.0 - p_final if not np.isnan(p_final) else np.nan
 
    return {
        "P_rain_final": None if np.isnan(p_final) else float(p_final),
        "P_no_rain": None if np.isnan(P_no_rain) else float(P_no_rain),
        "P_moderate": None if np.isnan(P_moderate) else float(P_moderate),
        "P_heavy": None if np.isnan(P_heavy) else float(P_heavy),
    }
 
# =========================
# === TEMP & WIND CATS ====
# =========================
def categorize_temp_simple(temp_c):
    if pd.isna(temp_c): return None
    if temp_c < 0:   return "Very Cold"
    if temp_c < 10:  return "Cold"
    if temp_c < 20:  return "Mild"
    if temp_c < 30:  return "Warm / Hot"
    return "Very Hot"
 
def categorize_wind_speed_ms(ws_ms):
    if pd.isna(ws_ms): return None
    return "No Wind" if ws_ms < WINDY_THRESHOLD_MS else "Windy"
 
def category_probabilities_weighted_days(df, target_date, column, categories,
                                         last_n_years=ROLLING_YEARS, half_window_days=TW_HALF_WINDOW_DAYS,
                                         categorizer=None):
    # target date
    try:
        anchor = pd.to_datetime(target_date, format="%Y%m%d", errors="raise")
    except Exception:
        anchor = pd.to_datetime(target_date)
 
    year_distributions = []
    year_weights = []
 
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
 
        sub = df.loc[start_y:end_y, [column]].copy()
        if sub.empty:
            year_weights[-1] = 0
            continue
 
        # --- FIX: robust day differences & weights (no .clip() on Index) ---
        day_diff = ((sub.index - anchor_y) / pd.Timedelta(days=1)).astype(float)  # in days
        weights  = np.clip(half_window_days - np.abs(day_diff) + 1, 0, None)      # triangular kernel
        sub["Day_Weight"] = weights
 
        # Categorize
        sub["Category"] = sub[column].apply(categorizer)
 
        # Drop NaNs/None
        valid = sub.dropna(subset=["Category", column])
        if valid.empty:
            year_weights[-1] = 0
            continue
 
        weighted_counts = valid.groupby("Category")["Day_Weight"].sum().reindex(categories, fill_value=0.0)
        total = weighted_counts.sum()
        if total <= 0:
            year_weights[-1] = 0
            continue
        weighted_probs = 100.0 * weighted_counts / total
        year_distributions.append(weighted_probs)
 
    if not year_distributions:
        return categories, None
 
    df_years = pd.concat(year_distributions, axis=1)
    year_weights = np.array(year_weights[:df_years.shape[1]])
    if year_weights.sum() == 0:
        return categories, None
    mean_probs = (df_years * year_weights).sum(axis=1) / year_weights.sum()
    return categories, mean_probs
 
# =========================
# === MAIN RUNNER =========
# =========================
if __name__ == "__main__":
    lat, lon, target_date = read_user_inputs()
 
    # Build history window & fetch once
    start_str, end_str, hist_start_year, hist_end_year = compute_history_window(target_date, rolling_years=ROLLING_YEARS)
    df_all = fetch_power(lat, lon, start_str, end_str)
 
    # ---- Rain (Level-2) ----
    rain_out = level2_rain(lat, lon, target_date, df_all)
 
    def pct(x):
        return "—" if x is None or np.isnan(x) else f"{100*x:0.1f}%"
 
    print("\n== Final Rain Probability ==")
    print(f"Final P(rain): {pct(rain_out['P_rain_final'])}")
    print(f"P(no rain) : {pct(rain_out['P_no_rain'])}")
    print(f"P(moderate): {pct(rain_out['P_moderate'])}")
    print(f"P(heavy)   : {pct(rain_out['P_heavy'])}")
 
    # ---- Temperature categories (use T2M_MAX) ----
    if "T2M_MAX" in df_all.columns:
        temp_categories = ["Very Cold", "Cold", "Mild", "Warm / Hot", "Very Hot"]
        cats_t, probs_t = category_probabilities_weighted_days(
            df_all, target_date, "T2M_MAX", temp_categories,
            last_n_years=ROLLING_YEARS, half_window_days=TW_HALF_WINDOW_DAYS,
            categorizer=categorize_temp_simple
        )
        print("\n== Temperature Category Probabilities (weighted) ==")
        if probs_t is None:
            print("No temperature data in the chosen window.")
        else:
            for c in cats_t:
                print(f"{c:<12}: {probs_t.get(c, 0.0):5.1f}%")
            pred_t = probs_t.idxmax(); conf_t = float(probs_t.max())
            print(f"Predicted: {pred_t} ({conf_t:0.1f}%)")
    else:
        print("\n(Temperature variable T2M_MAX not available.)")
 
    # ---- Wind categories (use WS10M_MAX in m/s, threshold ~3.6 m/s) ----
    if "WS10M_MAX" in df_all.columns:
        wind_categories = ["No Wind", "Windy"]
        cats_w, probs_w = category_probabilities_weighted_days(
            df_all, target_date, "WS10M_MAX", wind_categories,
            last_n_years=ROLLING_YEARS, half_window_days=TW_HALF_WINDOW_DAYS,
            categorizer=categorize_wind_speed_ms
        )
        print("\n== Wind Category Probabilities (weighted) ==")
        if probs_w is None:
            print("No wind data in the chosen window.")
        else:
            for c in cats_w:
                print(f"{c:<8}: {probs_w.get(c, 0.0):5.1f}%")
            pred_w = probs_w.idxmax(); conf_w = float(probs_w.max())
            print(f"Predicted: {pred_w} ({conf_w:0.1f}%)")
    else:
        print("\n(Wind variable WS10M_MAX not available.)")
 
@app.route("/predict_all", methods=["POST"])
def predict_all():
    data = request.json
    lat = data.get("lat")
    lon = data.get("lon")
    date_str = data.get("date_str")
    if lat is None or lon is None or date_str is None:
        return jsonify({"error": "lat, lon, and date_str are required"}), 400

    # Build history window & fetch once
    start_str, end_str, hist_start_year, hist_end_year = compute_history_window(date_str, rolling_years=ROLLING_YEARS)
    try:
        df_all = fetch_power(lat, lon, start_str, end_str)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # ---- Rain (Level-2) ----
    rain_out = level2_rain(lat, lon, date_str, df_all)
    def pct(x):
        return None if x is None or np.isnan(x) else float(100 * x)

    rain_probs = {
        "Final Rain": pct(rain_out['P_rain_final']),
        "No Rain": pct(rain_out['P_no_rain']),
        "Moderate": pct(rain_out['P_moderate']),
        "Heavy": pct(rain_out['P_heavy']),
    }

    # ---- Temperature categories (use T2M_MAX) ----
    temp_probs = {}
    if "T2M_MAX" in df_all.columns:
        temp_categories = ["Very Cold", "Cold", "Mild", "Warm / Hot", "Very Hot"]
        cats_t, probs_t = category_probabilities_weighted_days(
            df_all, date_str, "T2M_MAX", temp_categories,
            last_n_years=ROLLING_YEARS, half_window_days=TW_HALF_WINDOW_DAYS,
            categorizer=categorize_temp_simple
        )
        if probs_t is not None:
            for c in cats_t:
                temp_probs[c] = float(probs_t.get(c, 0.0))
    # ---- Wind categories (use WS10M_MAX in m/s, threshold ~3.6 m/s) ----
    wind_probs = {}
    if "WS10M_MAX" in df_all.columns:
        wind_categories = ["No Wind", "Windy"]
        cats_w, probs_w = category_probabilities_weighted_days(
            df_all, date_str, "WS10M_MAX", wind_categories,
            last_n_years=ROLLING_YEARS, half_window_days=TW_HALF_WINDOW_DAYS,
            categorizer=categorize_wind_speed_ms
        )
        if probs_w is not None:
            for c in cats_w:
                wind_probs[c] = float(probs_w.get(c, 0.0))

    return jsonify({
        "temperature": temp_probs,
        "wind": wind_probs,
        "precipitation": rain_probs
    })

if __name__ == "__main__":
    app.run(debug=True)