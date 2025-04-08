import pandas as pd
from django.db import connection
from sklearn.preprocessing import OneHotEncoder
import joblib

def prepare_data():
    query = """
    SELECT town, flat_type, floor_area_sqm, lease_commence_date,
           remaining_lease, monthly_rent, resale_price, for_rent, for_sale
    FROM data_management_flat
    """
    df = pd.read_sql(query, connection)
    
    df['lease_age'] = pd.Timestamp.now().year - df['lease_commence_date']
    df['remaining_lease_years'] = df['remaining_lease'].str.extract('(\d+)').astype(float)
    
    encoder = OneHotEncoder(handle_unknown='ignore')
    categorical_features = encoder.fit_transform(df[['town', 'flat_type']])
    
    X_rent = pd.concat([
        pd.DataFrame(categorical_features.toarray()),
        df[['floor_area_sqm', 'lease_age', 'remaining_lease_years']]
    ], axis=1)
    y_rent = df['monthly_rent']
    
    X_sale = X_rent.copy()
    y_sale = df['resale_price']
    
    joblib.dump(encoder, 'artifacts/encoder.joblib')
    return {
        'rental': (X_rent, y_rent),
        'resale': (X_sale, y_sale)
    }