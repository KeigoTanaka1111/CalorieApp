import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Button } from "@mui/material";
import Typography from '@mui/material/Typography';
import { Form, FormGroup } from "reactstrap";
import { useForm } from 'react-hook-form';
import  axios  from "axios";
import Grid from "@mui/material/Grid";
import styled from "styled-components";
import StripeCheckout from "react-stripe-checkout"

import RegisteredList from "./RegisteredList";
const { PUB_KEY } = require("../config/app.config").stripe;

const MainDiv = styled.div`
  background-color: #ffe4c4;
  padding-top: 5%;
  height: 100vh;
  width: 100%;
  position: relative;
`

const  Resister = () => {
  useEffect(() => {
    let unmounted = false;

    (async() => {
      if(!unmounted){
        const foodResponse = await axios.get("/registeredFood", {
          // params: { user_id: "115447883818320632394"}
        });
        // console.log("foodResponse：" +foodResponse);
        setUserFoodList(foodResponse.data);

        const userResponse = await axios.get("/user", {
          // params: { user_id: "115447883818320632394"}
        });
        // console.log(foodResponse.data)
        // console.log("user:"+userResponse.data[0])
        setUser(userResponse.data[0]);

        const registerResponse = await axios.get("/registered", {
          // params: { user_id: "115447883818320632394"}
        });
        // console.log("registerResponse.data："+registerResponse.data);
        setRegistererList(registerResponse.data);
      }
    })();
    return () => {unmounted = true;}
  }, [])
  const[user, setUser] = useState();
  const[registererList, setRegistererList] = useState([]);
  const[userFoodList, setUserFoodList] = useState([]);
  const {register: registerFood, handleSubmit: handleSubmitFood} = useForm();
  const {register, handleSubmit} = useForm();

  // stripe関連
  // const [token, setToken] = useState("")
  const handleToken = async(token) =>{
    // setToken(token)
    console.log( "token"+token);
    const response = await axios.post("/api/stripe",
      {token: token, registerable: user.registerable}
    );
    const userResponse = await axios.get("/user");
    setUser(userResponse.data[0]);
  }
  // const addRegisterable = async() => {
  //   console.log( "token"+token);
  //   const response = await axios.post("/api/stripe",
  //   token, {token: token, registerable: user.registerable});
  // }


  const onSubmit = async({date, food_id}, e) => {
    // await axios.get("/register", {
    //   params: { food_id: food_id,
    //             // user_id: "115447883818320632394",
    //             date: date}
    // });
    await axios.post("/register", {
      food_id: food_id,
      date: date
    });
    const response = await axios.get("/registered", {
      // params: { user_id: "115447883818320632394"}
    });
    // console.log(response.data)
    setRegistererList(response.data)
    // console.log(registererList)
  }
  const onSubmitFood = async({foodName, foodCalorie}, e) => {
    // console.log(foodName, foodCalorie);
    // await axios.get("/registerFood", {
    //   params: {
    //             foodName: foodName,
    //             foodCalorie: foodCalorie
    //           }
    // });
    await axios.post("/registerFood", {
      foodName: foodName,
      foodCalorie: foodCalorie
    });
    const response = await axios.get("/registeredFood", {
    });
    // console.log(response.data)
    setUserFoodList(response.data)
    // console.log(userFoodList)
    // console.log("user:"+user)
    // console.log("registerable:"+user.registerable)
    //登録可能数を減らす

    // await axios.get("/registerDecrement", {
    //   params: {
    //     registerable: user.registerable-1
    //   }
    // });
    await axios.post("/registerDecrement", {
      registerable: user.registerable-1
    });
    //登録可能数減少後のユーザ情報を検索
    const userResponse = await axios.get("/user", {
    });
    setUser(userResponse.data[0]);
  }

  return (
    user && (
      <MainDiv>
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={8}>
            <Card variant="outlined">
              <Typography>
                食品名とカロリー登録
              </Typography>
              <CardContent>
                残り登録可能数：{user.registerable}
                <StripeCheckout
                  name="登録可能数の追加"
                  description="100円で10個"
                  amount={100}
                  currency="JPY"
                  locale="ja"
                  token={token =>handleToken(token)}
                  stripeKey={PUB_KEY}
                >
                  <button >登録可能数を追加</button>
                </StripeCheckout>
                <Form onSubmit={handleSubmitFood(onSubmitFood)}>
                  <FormGroup>
                    <input type="text" placeholder="食品名" {...registerFood('foodName', { required: true })}/>
                  </FormGroup>
                  <FormGroup>
                    <input type="number" placeholder="カロリー(kcal)" {...registerFood('foodCalorie', { required: true })}/>
                  </FormGroup>
                    <Button color="primary" type="submit" disabled={user.registerable === 0 ? true : false}>追加</Button>
                </Form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={8}>
            <Card  variant="outlined">
                <Typography>
                  食事内容登録
                </Typography>
                <CardContent>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormGroup>
                    <input className="form-control" type="date"  {...register('date', { required: true })}/>
                      </FormGroup>
                    <FormGroup>
                      <select type="select" {...register('food_id', { required: true , min: 0})}>
                        {
                          userFoodList.map(({food_id, food_name, calorie}) => (
                            <option key={food_id} value={food_id}>{food_name}：{calorie}kcal</option>
                          ))
                        }
                      </select>
                    </FormGroup>
                    <Button color="primary" type="submit">追加</Button>
                  </Form>
                </CardContent>
            </Card>
          </Grid>
          <Grid item xs={8}>
            <RegisteredList registererList={registererList} userFoodList={userFoodList} setRegisteredList={setRegistererList}/>
          </Grid>
        </Grid>
      </MainDiv>
    )
  )
}

export default Resister;
