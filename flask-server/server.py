import numpy as np
import pandas as pd
import math
from nltk import word_tokenize, WordNetLemmatizer
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.metrics import precision_recall_fscore_support as score
from collections import Counter
from sklearn.model_selection import train_test_split
import itertools 
from sklearn.metrics import accuracy_score
from tqdm import tqdm
from sklearn.model_selection import KFold
from keras.models import load_model
from flask import Flask
from tensorflow.keras.preprocessing.image import load_img

app = Flask(__name__)

Model1 = load_model('./model.h5')
path = './image.jpg'

image = load_img(path, target_size=(224,224))

@app.route("/api/concepts")
def accuracy():
    print(Model1.predict())
    return {"concepts": Model1.predict()}

# print(Model1.summary())

if __name__ == "__main__":
    app.run(debug=True)

