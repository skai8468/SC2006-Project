from sklearn.ensemble import RandomForestRegressor
from .base_model import BaseModel

class RandomForestModel(BaseModel):
    def __init__(self, n_estimators=100):
        super().__init__()
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            random_state=42
        )
    
    def train(self, X, y):
        self.model.fit(X, y)
        return self.model