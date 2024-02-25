import React, { useState, useEffect, useCallback } from "react";


const MainPage = () =>{
    const [image, setImage] = useState(null)

    const getConcepts = () =>{
        console.log('clicked')
        fetch("/api/concepts", {
            method: "GET",
            })
            .then((response) => response.json())
            .then((res) => {
            console.log(res);
            })
            .catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
          
    }

    return(
        <>
        <input type="file" name="upload"  onChange={(event)=> setImage(event.target.files[0])} />
        {
            image ? <img src={URL.createObjectURL(image)} /> : <></>
        }
        <button onClick={() => getConcepts()}>Predict</button>
        <button>Rerun</button>
        </>
    )
}

export default MainPage