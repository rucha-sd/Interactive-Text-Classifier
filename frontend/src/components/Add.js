import React, { useState } from "react";

function AddNewWord(props) {
  const [word, setWord] = useState(null);
  const [importance, setImportance] = useState(null);

  const addthisword = () => {
    if (props) {
      if (
        word === null ||
        importance === null ||
        isNaN(parseFloat(importance)) ||
        !isNaN(parseFloat(word))
      ) {
        alert("Enter correct input!");
        return;
      }
      props.setLoading(true);
      fetch("/api/addword", {
        method: "POST",
        body: JSON.stringify({
          word: word,
          importance: importance,
          class_no: props.class_no,
          text: props.text,
        }),
      })
        .then((response) => {
          response.json();
        })
        .then((res) => {
          props.setAdd(0);
          props.predict();
          props.setLoading(false);
        })
        .catch((error) => {
          if (error.response) {
            console.log(error.response);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        });
    }
  };
  return (
    <div>
      <>
        <div
          className="box"
          style={{
            backgroundColor: "#f0ffe0",
            boxShadow: "rgb(136 136 136) 5px 10px 24px 9px",
            width: "40vw",
            height: "40vh",
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "0.5vw",
            padding: "2vw",
            zIndex: "1",
            textAlign: "center",
            fontSize: "1.2vw",
          }}
        >
          <h3 style={{ marginBottom: "2vw" }}>Add a new Word</h3>
          <div>
            <div className="row">
              <div className="col-md-5 text-left">Enter word:</div>
              <div className="col-md-7 text-left">
                <input
                  type="text"
                  onChange={(e) => setWord(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="row" style={{ marginTop: "1vw" }}>
              <div className="col-md-5 text-left">Enter word importance </div>
              <div className="col-md-7 text-left">
                <input
                  type="text"
                  onChange={(e) => setImportance(e.target.value)}
                ></input>
              </div>
            </div>
          </div>
          <button
            className="btn btn-success"
            style={{ margin: "1vw" }}
            type="submit"
            onClick={(e) => addthisword()}
          >
            Submit
          </button>
          <button
            className="btn btn-danger"
            style={{ margin: "1vw" }}
            type="submit"
            onClick={(e) => {
              props.setAdd(0);
            }}
          >
            Close
          </button>
        </div>
      </>
    </div>
  );
}

export default AddNewWord;
