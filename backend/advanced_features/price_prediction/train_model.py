from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
from data_prep import prepare_data

def train_random_forest():
    data = prepare_data()
    
    rent_model = RandomForestRegressor(n_estimators=100, random_state=42)
    sale_model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    X_rent, y_rent = data['rental']
    X_train, X_test, y_train, y_test = train_test_split(X_rent, y_rent, test_size=0.2)
    rent_model.fit(X_train, y_train)
    print(f"Rental MAE: ${mean_absolute_error(y_test, rent_model.predict(X_test)):.2f}")
    
    X_sale, y_sale = data['resale']
    X_train, X_test, y_train, y_test = train_test_split(X_sale, y_sale, test_size=0.2)
    sale_model.fit(X_train, y_train)
    print(f"Resale MAE: ${mean_absolute_error(y_test, sale_model.predict(X_test)):.2f}")
    
    joblib.dump(rent_model, 'artifacts/rent_model.joblib')
    joblib.dump(sale_model, 'artifacts/sale_model.joblib')

if __name__ == '__main__':
    train_random_forest()