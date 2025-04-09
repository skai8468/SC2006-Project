import joblib
import pandas as pd

class PricePredictor:
    def __init__(self):
        self.rent_model = joblib.load('artifacts/rent_model.joblib')
        self.sale_model = joblib.load('artifacts/sale_model.joblib')
        self.encoder = joblib.load('artifacts/encoder.joblib')
    
    def predict(self, property_type, input_data):
        df = pd.DataFrame([input_data])
        
        df['lease_age'] = pd.Timestamp.now().year - df['lease_commence_date']
        df['remaining_lease_years'] = df['remaining_lease'].str.extract('(\d+)').astype(float)
        
        categoricals = self.encoder.transform(df[['town', 'flat_type']])
        features = pd.concat([
            pd.DataFrame(categoricals.toarray()),
            df[['floor_area_sqm', 'lease_age', 'remaining_lease_years']]
        ], axis=1)
        
        model = self.rent_model if property_type == 'rental' else self.sale_model
        return model.predict(features)[0]

# Example usage
if __name__ == '__main__':
    predictor = PricePredictor()
    test_property = {
        'town': 'ANG MO KIO',
        'flat_type': '4 ROOM',
        'floor_area_sqm': 90,
        'lease_commence_date': 2010,
        'remaining_lease': '70 years'
    }
    
    print("Predicted monthly rent: $", 
          predictor.predict('rental', test_property))
    print("Predicted resale price: $", 
          predictor.predict('resale', test_property))