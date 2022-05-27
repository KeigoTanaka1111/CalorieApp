// mainページ
import React from 'react'
import Register from "../components/Resister";
import styled from "styled-components";

const MainDiv = styled.div`
  background-color: #ffe4c4;
  padding-top: 5%;
  height: 100vh;
  width: 100%;
  position: absolute;
`

const MainPage = () => {
  return (
    <MainDiv>
      <Register/>
    </MainDiv>
  )
}

export default MainPage