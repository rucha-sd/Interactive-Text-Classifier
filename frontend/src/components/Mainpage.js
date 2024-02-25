import React, { useState, useEffect, useCallback } from "react";
import "./mainpage.css";
import "react-contexify/dist/ReactContexify.css";
import CanvasJSReact from "./canvasjs.react";
import $ from "jquery";
import DeleteWord from "./BoxForDelete";
import AddNewWord from "./Add";
import Load from "./Fadinglines.gif";

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

var chart;

function UI() {
  const classes = {
    Company: 0,
    "Education Institution": 1,
    Artist: 2,
    Athlete: 3,
    "Office Holder": 4,
    "Mean of Transportation": 5,
    Building: 6,
    "Natural Place": 7,
  };

  const [accuracy, setAccuracy] = useState(0);
  const [predicted_class, setPrediction] = useState(null);
  const [prediction_accuracy, setPredictionAccuracy] = useState(null);
  const [text, setText] = useState("");
  const [topwords, setTopwords] = useState([]);
  const [datapoints, setDatapoints] = useState(null);
  const [add, setAdd] = useState(0);
  const [box, setBox] = useState(0);
  const [no_pred, setNopred] = useState("");
  const [maxHeight, setMaxheight] = useState(1);
  const [loading, setLoading] = useState(false);
  var mouseDown = false;
  var selected = null;
  const xSnapDistance = 0.5;
  const ySnapDistance = 3;
  var yValue = null;
  var xValue = null;
  var changeCursor = false;
  var timerId = null;

  useEffect(() => {
    fetch("/api/accuracy", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setAccuracy(res.accuracy);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }, [accuracy]);

  const getData = (e) => {
    setLoading(true);
    setAccuracy(0);
    setNopred("Loading");
    setPrediction(null);
    setDatapoints(null);
    setTopwords([]);
    setPredictionAccuracy(null);
    console.log("In predict");
    fetch("/api", {
      method: "POST",
      body: JSON.stringify(text),
    })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setPredictionAccuracy(res.prediction_probability);
        setPrediction(res.predicted_class);
        setLoading(false);
        setTopwords(res.top_words);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  };

  useEffect(() => {
    if (predicted_class) {
      setDatapoints(getDatapoints());
    }
  }, [predicted_class]);

  const getDatapoints = () => {
    let newDatapoints = [];
    if (topwords.length) {
      console.log(topwords);
      for (const [key, value] of Object.entries(topwords[0]).sort(
        ([, b], [, a]) => a - b
      )) {
        console.log(key, value);
        newDatapoints.push({ label: key, y: value });
        setMaxheight(newDatapoints.at(0).y * 1.5);
      }
    }
    return newDatapoints;
  };

  const getPosition = (e) => {
    var parentOffset = document
      .getElementsByClassName("canvasjs-chart-canvas")[0]
      .getBoundingClientRect();
    var relX = e.pageX - parentOffset.left;
    var relY = e.pageY - parentOffset.top;
    xValue =
      Math.round(chart.chart.axisX[0].convertPixelToValue(relX) * 10000) /
      10000;
    yValue =
      Math.round(chart.chart.axisY[0].convertPixelToValue(relY) * 10000) /
      10000;
  };

  const searchDataPoint = () => {
    var dps = chart.chart.data[0].dataPoints;
    for (var i = 0; i < dps.length; i++) {
      if (
        xValue >= dps[i].x - xSnapDistance &&
        xValue <= dps[i].x + xSnapDistance &&
        yValue >= dps[i].y - ySnapDistance &&
        yValue <= dps[i].y + ySnapDistance
      ) {
        if (mouseDown) {
          selected = i;
          break;
        } else {
          changeCursor = true;
          break;
        }
      } else {
        selected = null;
        changeCursor = false;
      }
    }
  };

  function updateWord(word, class_no, new_importance) {
    setLoading(true);
    fetch("/api/updateWord", {
      method: "POST",
      body: JSON.stringify({
        word: word,
        importance: new_importance,
        class_no: class_no,
      }),
    })
      .then((response) => {
        console.log(response);
        setLoading(false);
        response.json();
      })
      .then((res) => {
        console.log(res);
        getData();
        setPredictionAccuracy(res.prediction_probability);
        setPrediction(res.predicted_class);
        setTopwords(res.top_words);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  useEffect(() => {
    if (1) {
      $("#canvasjs-react-chart-container-0 > .canvasjs-chart-container").on({
        mousedown: function (e) {
          mouseDown = true;
          getPosition(e);
          searchDataPoint();
        },
        mousemove: function (e) {
          getPosition(e);
          if (mouseDown) {
            clearTimeout(timerId);
            timerId = setTimeout(function () {
              if (selected != null) {
                chart.chart.data[0].dataPoints[selected].y = yValue;
                chart.chart.render();
              }
            }, 0);
          } else {
            searchDataPoint();
            if (changeCursor) {
              chart.chart.data[0].set("cursor", "n-resize");
            } else {
              chart.chart.data[0].set("cursor", "default");
            }
          }
        },
        mouseup: function (e) {
          if (selected != null) {
            chart.chart.data[0].dataPoints[selected].y = yValue;
            chart.chart.render();
            updateWord(
              datapoints[selected].label,
              classes[predicted_class],
              yValue
            );
            mouseDown = false;
          }
        },
      });
    }
  }, [xValue, yValue, selected, changeCursor, mouseDown, timerId, chart]);

  return (
    <div className="Main">
      <h2>Naive Bayes Text Classifier</h2>
      <div
        className="container d-flex"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <h3>
          <b>
            Model Accuracy ={" "}
            {(parseFloat(accuracy) * 100).toString().slice(0, 5)}%
          </b>
        </h3>
        <div className="row align-items-center">
          <div className="col-md-10">
            <textarea
              style={{
                width: "100%",
                height: "9vw",
                padding: "1vw",
                fontSize: "1.1vw",
              }}
              placeholder="Enter your text here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>
          <div
            className="col-md-2"
            style={{
              flexWrap: "wrap",
              alignContent: "center",
              height: "5vw",
            }}
          >
            <button
              className="btn btn-success ml-auto"
              onClick={(e) => {
                setAdd(1);
                setBox(0);
              }}
              style={{
                width: "100%",
                marginBottom: "0.1vw",
                height: "4vw",
                fontSize: "1.2vw",
              }}
            >
              Add word
            </button>
            <button
              className="btn btn-danger"
              onClick={(e) => {
                setBox(1);
                setAdd(0);
              }}
              style={{
                width: "100%",
                marginTop: "0.1w",
                marginBottom: "0.1vw",
                height: "4vw",
                fontSize: "1.2vw",
              }}
            >
              Delete word
            </button>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={(e) => getData()}
          style={{ height: "4vw", width: "8vw", fontSize: "1.2vw" }}
        >
          Predict
        </button>
        <h3>
          <b>
            {predicted_class ? (
              <>
                {" "}
                Prediction: {predicted_class} (
                {(parseFloat(prediction_accuracy) * 100).toString().slice(0, 5)}
                %)
              </>
            ) : (
              <></>
            )}
          </b>
        </h3>
        <>
          {topwords.length ? (
            <>
              <div className="row">
                <div className="col-md-6 text-right"></div>
                <div className="col-md-6 text-left"></div>
              </div>
              <div>
                <h4>
                  <i>Drag the bars to update word importance</i>
                </h4>
              </div>
              <div id="chartContainer">
                <CanvasJSChart
                  options={{
                    animationEnabled: true,
                    exportEnabled: true,
                    theme: "light2",
                    title: {
                      text: "",
                    },
                    axisY: {
                      includeZero: true,
                      minimum: 0,
                      maximum: maxHeight,
                      title: "Word Importance",
                    },
                    axisX: {
                      title: "Words",
                    },
                    data: [
                      {
                        type: "column",
                        indexLabelFontColor: "#5A5757",
                        indexLabelPlacement: "outside",
                        dataPoints: datapoints,
                      },
                    ],
                  }}
                  ref={(x) => (chart = x)}
                />
              </div>
            </>
          ) : (
            <></>
          )}

          {loading ? (
            <img
              src={Load}
              style={{
                zIndex: 10000,
                position: "absolute",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            ></img>
          ) : null}

          {add ? (
            <AddNewWord
              text={text}
              class_no={classes[predicted_class]}
              predict={getData}
              setAdd={setAdd}
              setLoading={setLoading}
            ></AddNewWord>
          ) : (
            <></>
          )}
        </>
      </div>
      {box ? (
        <DeleteWord
          setBox={setBox}
          class_no={classes[predicted_class]}
          predict={getData}
          setLoading={setLoading}
        ></DeleteWord>
      ) : (
        <></>
      )}
    </div>
  );
}

export default UI;
