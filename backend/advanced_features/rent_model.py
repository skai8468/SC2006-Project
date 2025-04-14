import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

import joblib

def load_data(data_path):
    """
        Load CSV data and parse date columns
    """
    df = pd.read_csv(data_path)
    
    # Convert rent approval date to datetime and extract year/month
    df['rent_approval_date'] = pd.to_datetime(df['rent_approval_date'])
    df['year'] = df['rent_approval_date'].dt.year
    df['month'] = df['rent_approval_date'].dt.month
    
    return df

def get_features_and_target(df):
    """
        Return features and target from dataframe
    """
    features = ['town', 'flat_type', 'year', 'month']
    target = 'monthly_rent'
    
    X = df[features]
    y = df[target]
    
    return X, y

def build_pipeline():
    """
        Build a preprocessing and regression pipeline
    """
    categorical_cols = ['town', 'flat_type']
    numeric_cols = ['year', 'month']
    
    preprocessor = ColumnTransformer(
        transformers=[
            (
                'cat',
                OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'),
                categorical_cols
            ),
            (
                'num',
                StandardScaler(),
                numeric_cols
            )
        ]
    )
    
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', LinearRegression())
    ])
    
    return pipeline

def train_model(data_path, model_path='advanced_features/rent_model.pkl'):
    """
        Train the model and save the pipeline to the disk
    """
    df = load_data(data_path)
    
    X, y = get_features_and_target(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    
    print("Model Training Complete:")
    print("R^2 Score:", r2)
    print("Mean Squared Error:", mse)
    
    joblib.dump(pipe, model_path)
    
    return pipe

_MODEL_CACHE = None
def get_model(model_path='advanced_features/rent_model.pkl'):
    """
        Load the trainded model from disk with caching
    """
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        _MODEL_CACHE = joblib.load(model_path)
    return _MODEL_CACHE

def predict_rent(features, model_path='advanced_features/rent_model.pkl'):
    """
        Predict the rental price

        Args:
            features (list): List of features values in order [town, flat_type, year, month]
            
        Returns:
            float: Predicted rental price
    """
    
    model = get_model(model_path)
    # Convert the list of features to a pandas DataFrame with the expected columns.
    input_df = pd.DataFrame([{
        'town': features[0],
        'flat_type': features[1],
        'year': features[2],
        'month': features[3]
    }])
    prediction = model.predict(input_df)
    
    return prediction[0]