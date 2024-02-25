import React, { useState } from "react";

function DeleteWord(props) {
  const [word, setWord] = useState(null);
  const deleteWord = (e) => {
    if (word === null || !isNaN(parseFloat(word))) {
      alert("Enter correct input!");
      return;
    }
    props.setLoading(true);
    fetch("/api/deleteword", {
      method: "POST",
      body: JSON.stringify({
        word: word,
        class_no: props.class_no,
      }),
    })
      .then((response) => {
        response.json();
      })
      .then((res) => {
        props.setBox(0);
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
  };

  return (
    <>
      <div
        className="box text-center"
        style={{
          backgroundColor: "#f0ffe0",
          boxShadow: "rgb(136 136 136) 5px 10px 24px 9px",
          width: "40vw",
          height: "30vh",
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "0.5vw",
          padding: "2vw",
          zIndex: "1",
          fontSize: "1.2vw",
        }}
      >
        <h3 style={{ marginBottom: "2vw" }}>Delete Word</h3>
        Enter word to delete: &nbsp;&nbsp;&nbsp;
        <input type="text" onChange={(e) => setWord(e.target.value)}></input>
        <br />
        <button
          className="btn btn-success"
          style={{ margin: "1vw" }}
          type="submit"
          onClick={(e) => deleteWord()}
        >
          Submit
        </button>
        <button
          className="btn btn-danger"
          style={{ margin: "1vw" }}
          type="submit"
          onClick={(e) => {
            props.setBox(0);
          }}
        >
          Close
        </button>
      </div>
    </>
  );
}

export default DeleteWord;
