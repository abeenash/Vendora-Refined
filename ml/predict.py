import sys #sys module is used to get command line arguments 
import joblib #joblib is used to load the model. joblib full form is job library
import pandas as pd

model = joblib.load('model.pkl')

input_date = pd.to_datetime(sys.argv[1]).toordinal()

prediction = model.predict([[input_date]])

print(float(prediction[0]))
# import sys
# import joblib
# import pandas as pd
# import os

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# model_path = os.path.join(BASE_DIR,"model.pkl")
# model = joblib.load(model_path)

# input_date = sys.argv[1]
# input_date = pd.to_datetime(input_date).toordinal()

# prediction = model.predict([[input_date]])

# print(prediction[0])



