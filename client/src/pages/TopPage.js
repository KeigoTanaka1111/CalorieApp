import React from 'react'

import Login from '../components/Login'
import styled from "styled-components";

const MainDiv = styled.div`
  text-align: center;
  padding: 100px, 50px, 50px, 50%;
  position: relative;
`

const TopPage = () => {
  return (
    <MainDiv>
      <h1>
      カロリー管理App
      </h1>
      <Login />
    </MainDiv>
  )
}

export default TopPage