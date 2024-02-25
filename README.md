# Interactive-Text-Classifier
### Flask Backend Setup
1. **Environment Setup**
    - Install virtualenv: `pip install virtualenv`.
    - Inside `flask-server` directory, create a virtual environment: `python -m venv env`.
    - Activate the environment:
        - Windows: `env\Scripts\activate`
        - MacOS/Linux: `source env/bin/activate`
    - Install dependencies: `pip install -r requirements.txt`.
    - For nltk setup: Run `python`, then `import nltk` and `nltk.download()`, choose 'all'.

2. **Running the Server**
    - Start the Flask server: `python server.py`.

### React Frontend Setup
1. **Installation**
    - Install dependencies: `npm install`.

2. **Starting the Application**
    - Launch the app: `npm start`.

## Features
- **Prediction**: Input text to get predictions.
- **Add New Word**: Add a word and its importance.
- **Delete Word**: Remove a word from the dataset.
- **Update Word Importance**: Modify the importance level of words.

## Model Training and Selection
- The application includes 10 different models within the `flask-server` folder. 
- To switch models, modify `server.py` (line 8).
- For retraining, follow the instructions within `server.py`.
