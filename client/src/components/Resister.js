import React, { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import Typography from '@mui/material/Typography';
import { Form, FormGroup } from "reactstrap";
import { useForm } from 'react-hook-form';
import  axios  from "axios";
import Grid from "@mui/material/Grid";
import styled from "styled-components";
import StripeCheckout from "react-stripe-checkout";

import RegisteredList from "./RegisteredList";
const { PUB_KEY } = require("../config/app.config").stripe;

const MainDiv = styled.div`
  padding-top: 5%;
  height: 100vh;
  width: 100%;
  position: relative;
`

const  Resister = () => {
  // 初回レンダリング時にユーザの登録内容を取得
  useEffect(() => {
    let unmounted = false;

    (async() => {
      if(!unmounted){
        const foodResponse = await axios.get("/registeredFood", {
        });
        setUserFoodList(foodResponse.data);

        const userResponse = await axios.get("/user", {
        });
        setUser(userResponse.data[0]);

        const registerResponse = await axios.get("/registered", {
        });
        setRegistererList(registerResponse.data);
      }
    })();
    return () => {unmounted = true;}
  }, [])
  // ユーザ
  const[user, setUser] = useState();
  // 食事内容のList
  const[registererList, setRegistererList] = useState([]);
  // 食品のリスト
  const[userFoodList, setUserFoodList] = useState([]);
  const {register: registerFood, handleSubmit: handleSubmitFood} = useForm();
  const {register, handleSubmit} = useForm();

  // stripe関連
  const handleToken = async(token) =>{
    // tokenをサーバに送信
    await axios.post("/api/stripe",
      {token: token, registerable: user.registerable}
    );
    const userResponse = await axios.get("/user");
    setUser(userResponse.data[0]);
  }

  // 食事内容を登録
  const onSubmit = async({date, food_id}, e) => {
    await axios.post("/register", {
      food_id: food_id,
      date: date
    });
    const response = await axios.get("/registered", {
    });
    setRegistererList(response.data)
  }
  // 食品を登録
  const onSubmitFood = async({foodName, foodCalorie}, e) => {
    await axios.post("/registerFood", {
      foodName: foodName,
      foodCalorie: foodCalorie
    });
    const response = await axios.get("/registeredFood", {
    });
    setUserFoodList(response.data);
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
