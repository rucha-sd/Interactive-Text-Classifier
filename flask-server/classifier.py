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
import pickle

class MN_NaiveBayes:
    """
    Constructor for MN_NaiveBayes.
    Initializes vocabulary, overall word count for in each classes, prior probabilities,
    word count dictionaries, smoothing parameters for all words, class names, accuracy of classifier 
    and test data
    """
    
    def __init__(self):
        self.num_classes = 0
        self.class_names = {0: "Company", 1: "Education Institution", 2: "Artist", 3: "Athlete", 4: "Office Holder", 5:"Mean of Transportation", 6:"Building", 7:"Natural Place"}
        self.prior_probabilities = []
        self.word_counts_per_class = []
        self.cateogory_word_counts =  []
        self.vocab = []
        self.word_alpha_values = []
        self.word_probabilities_per_class = []
        self.accuracy = 0       
        self.X_test = []
        self.y_test = []
        
    def preprocess(self, data):
        """
        Preprocesses text by removing symbols, punctuation marks
        Tokenizes text 
        Returns tokens
        """
        lemmatizer = WordNetLemmatizer()
        text = data.lower()
        text = re.sub(r"(@\[A-Za-z]+)|([^A-Za-z \t])|(\w+:\/\/\S+)|^rt|http.+?", "", text)
        stop = stopwords.words('english')
        text = " ".join([word for word in text.split() if word not in (stop)])
        tokens = word_tokenize(text)
        temp = [lemmatizer.lemmatize(word.lower()) for word in tokens]
        return temp
    
    def count_words(self, X, y):
        """
        Counts frquency of words in each class
        Returns top 1000 most frequent words
        """
        counts = {}
        for document, category in zip(X,y):
            for token in self.preprocess(document):
                if token not in counts:
                    counts[token] = [0 for n in range(self.num_classes)]
                counts[token][category] += 1
        counts = {k: v for k, v in sorted(counts.items(), key=lambda item: sum(item[1]), reverse=True)}
        counts = dict(itertools.islice(counts.items(), 1000)) 
        return counts
    

    def prior_prob(self, data):
        "Calculates prior probabilities of each class"
        total = len(data)
        priors = data.groupby(['train_label']).count()
        prior_probabilitites = []
        for x in range(len(priors)):
            prior_probabilitites.append(priors.train_content[x]/total)
        return prior_probabilitites

    def cat_word_counts(self):
        "Calculates total number of words in each class"
        cat_word_count = [0 for i in range(self.num_classes)]
        for i in self.word_counts_per_class:
            for j in range(self.num_classes):
                cat_word_count[j]+=self.word_counts_per_class[i][j]
        return cat_word_count
    
    def word_alphas(self):
        "Initializes smoothing parameters for all words in each class"
        alpha_vals = {}
        alpha_word = [1 for i in range(self.num_classes)]
        for word in self.vocab:
            alpha_vals[word] = alpha_word.copy()
        return alpha_vals
    
    
    def word_class_probabilities(self):
        "Calculates likelihoods of all words"
        alpha_sum = list(pd.DataFrame(self.word_alpha_values).transpose().sum().to_numpy())
        return {word: [(self.word_counts_per_class[word][i] + self.word_alpha_values[word][i])/
                       (self.cateogory_word_counts[i] + alpha_sum[i]) 
                       for i in range(self.num_classes)]
                       for word, cat in self.word_counts_per_class.items()}
    
    def predict(self,data):
        top_probabilities = []
        outputs = []
        output_probs = []
        output_classes = []
        for row in data:
            text = self.preprocess(row)
            class_probs = []
            for i in range(self.num_classes):
                p_class = self.prior_probabilities[i]
                for token in text:
                    if token in self.word_probabilities_per_class:
                        p_class = p_class*self.word_probabilities_per_class[token][i]
                class_probs.append(p_class)
            outputs.append(np.argmax(class_probs))
            output = np.argmax(class_probs)
            output_probs.append(round(max(class_probs)/sum(class_probs),2))
            word_class_probs = {j : self.word_probabilities_per_class[j][output] if j in self.vocab else 0 for j in text}
            word_class_probs = {k: v for k, v in sorted(word_class_probs.items(), key=lambda item: item[1], reverse=True)}
            word_class_probs = dict(itertools.islice(word_class_probs.items(), 10)) 
            top_probabilities.append(word_class_probs)
            for i in outputs:
                output_classes.append(self.class_names[i])
        return {"outputs":outputs, "output_classnames": output_classes,"top_probabilities": top_probabilities, "output_probability":output_probs, "accuracy":self.accuracy}
    

    def update_word_importance(self, word, importance, class_no):
        word = word.lower()
        if word not in self.vocab:
            self.add_word(word, importance, class_no)
            return
        alpha_sum = list(pd.DataFrame(self.word_alpha_values).transpose().sum().to_numpy())
        alpha_new = (self.word_counts_per_class[word][class_no] - (float(importance))*(alpha_sum[class_no] - self.word_alpha_values[word][class_no] + self.cateogory_word_counts[class_no]))/(float(importance)-1)
        self.word_alpha_values[word][class_no] = alpha_new
        alpha_sum = list(pd.DataFrame(self.word_alpha_values).transpose().sum().to_numpy())
        self.update_word_probs(class_no)            
        self.recalculate_accuracy()


    def update_word_probs(self, class_no):
        alpha_sum = list(pd.DataFrame(self.word_alpha_values).transpose().sum().to_numpy())
        for word, cat in self.word_counts_per_class.items():
            new_prob = (self.word_counts_per_class[word][class_no] + self.word_alpha_values[word][class_no])/(self.cateogory_word_counts[class_no] + alpha_sum[class_no]) 
            self.word_probabilities_per_class[word][class_no] = new_prob  

            
    def add_word(self, word, importance, class_no):
        word = word.lower()
        if word in self.vocab:
            self.update_word_importance(word, importance, class_no)
            return
        alpha_sum = list(pd.DataFrame(self.word_alpha_values).transpose().sum().to_numpy())
        self.cateogory_word_counts[class_no]+=1
        new_word_class_prob = []
        new_alpha_values = []
        new_word_counts = []
        for i in range(self.num_classes):
            new_word_class_prob.append((1)/ (alpha_sum[i] + self.cateogory_word_counts[i]))
            new_alpha_values.append(1)
            if i== class_no:
                new_word_counts.append(1)
            else:
                new_word_counts.append(0)
                
        self.word_counts_per_class[word] = new_word_counts
        self.word_alpha_values[word] = new_alpha_values 
        self.vocab.append(word)
        self.word_probabilities_per_class[word] = new_word_class_prob
        self.update_word_importance(word, importance, class_no)
        self.recalculate_accuracy()


    def fit(self, data):
        self.num_classes = data.train_label.nunique()
        self.prior_probabilities = self.prior_prob(data)
        self.word_counts_per_class = self.count_words(data['train_content'], data['train_label'])
        self.cateogory_word_counts =  self.cat_word_counts()
        self.vocab = list(self.word_counts_per_class.keys())
        self.word_alpha_values = self.word_alphas()
        self.word_probabilities_per_class = self.word_class_probabilities()
    
        
    def set_accuracy(self, accuracy):
        self.accuracy = accuracy
        
    def recalculate_accuracy(self):
        output = self.predict(self.X_test)
        accuracy = accuracy_score(self.y_test, output['outputs'])
        self.set_accuracy(accuracy)
        
    def remove_word(self, word, class_no):
        word = word.lower()
        if word not in self.vocab:
            return
        self.cateogory_word_counts[class_no]-= self.word_counts_per_class[word][class_no]
        self.word_counts_per_class[word][class_no] = 0
        self.word_alpha_values[word][class_no] = 1
        self.update_word_probs(class_no)
        self.recalculate_accuracy()
        

    def dataset_cross_val(self):
        data = pd.read_csv('./dbpedia_8K.csv')
        data = data.drop(columns=['title'])
        data = data.rename(columns={'label': 'train_label', 'content': 'train_content'})
        X = data.train_content
        y = data.train_label
        kf = KFold(n_splits=10, shuffle=True, random_state=None)
        kf.get_n_splits(X)
        accuracies = []
        i = 0
        X_test_1 = []
        y_test_1 = []
        X_train_1 = []
        y_train_1 = []


        for train_index, test_index in tqdm(kf.split(X)):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]
            if(i==0):
                X_test_1 = X_test
                y_test_1 = y_test
                X_train_1 = X_train
                y_train_1 = y_train
            df_train = pd.DataFrame({'train_content': X_train, 'train_label': y_train})
            df_test = pd.DataFrame({'train_content': X_test, 'train_label': y_test})
            self.fit(df_train)
            output = self.predict(X_test)
            accuracy = accuracy_score(y_test, output['outputs'])
            filename="Model"+str(i)+".pkl"
            pickle.dump(self, open(filename,'wb'))
            self.X_test = X_test
            self.y_test = y_test
            self.accuracy = accuracy
            i+=1
            accuracies.append(accuracy)

        df_train = pd.DataFrame({'train_content': X_train_1, 'train_label': y_train_1})
        self.fit(df_train)
        self.X_test = X_test_1
        self.y_test = y_test_1
        self.recalculate_accuracy()
        self.set_accuracy(np.array(accuracies).mean())
        return np.array(accuracies).mean()
