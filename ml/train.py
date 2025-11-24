import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor

df = pd.read_csv("sales_daily.csv")

# convert dates
df['date'] = pd.to_datetime(df['date'])
df['date_int'] = df['date'].map(pd.Timestamp.toordinal)

X = df[['date_int']]
y = df['total_qty_sold']

model = RandomForestRegressor(n_estimators=200)
model.fit(X, y)

joblib.dump(model, "model.pkl")
print("DONE")



# import pandas as pd
# from sklearn.linear_model import LinearRegression
# import joblib
# import os

# BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 

# # Load data
# data_path = os.path.join(BASE_DIR,"sales_dummy.csv")
# model_path = os.path.join(BASE_DIR,"model.pkl")

# data = pd.read_csv(data_path)

# # Convert date to number
# data['date'] = pd.to_datetime(data['date'])
# data['date_int'] = data['date'].map(pd.Timestamp.toordinal)

# # Features (X) and target (y)
# X = data[['date_int']]
# y = data['qty_sold']

# # Train model
# model = LinearRegression()
# model.fit(X, y)

# # Save model
# joblib.dump(model, 'model.pkl')

# print("Model trained and saved successfully!")
