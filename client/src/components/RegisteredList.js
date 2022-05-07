import React, { useEffect, useState } from "react";
import { Card, CardBody, Button } from "reactstrap";
// import { Card, CardBody, Table } from "@material-ui/core";
import { FormControl, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// import { IconButton } from "@chakra-ui/react";
// import { DeleteIcon } from "@chakra-ui/icons";

// import {CardCard, CardTh} from "./UI/Card";

const RegisteredList = ( props ) => {
  let sum = 0
  const[selectedDate, setselectedDate] = useState("");
  const onChangeselectedDate = (e) => {
    setselectedDate(e.target.value)
    sum = 0
    // console.log(e.target.value)
  }

  const handleDelete = async(id) => {
    // console.log(id)
    // await axios.get("/delete", {
    //   params: { id: id}
    // });
    await axios.post("/delete", {
      id: id
    });
    const response = await axios.get("/registered", {
    });
    props.setRegisteredList(response.data)
  }
  return (
    <>
      <FormControl variant="outlined">
        <input type="date" variant="outlined" value={selectedDate} onChange={e=>onChangeselectedDate(e)}/>
      </FormControl>
      <TableContainer component={Paper}>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan="2">食事名</TableCell>
              <TableCell align="right" >カロリー</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              props.registererList && props.registererList.map(({id, food_id, user_id, date}) => (
                selectedDate === date && (sum+=props.userFoodList.find((elem) => elem.food_id === food_id).calorie) && (
                <TableRow key={id}>
                  <TableCell >
                    <IconButton onClick={() => handleDelete(id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>{props.userFoodList.find((elem) => elem.food_id === food_id).food_name}</TableCell>
                  <TableCell align="right">{props.userFoodList.find((elem) => elem.food_id === food_id).calorie}</TableCell>
                </TableRow>
                )
              ))
            }
            <TableRow>
              <TableCell rowSpan={1} />
              <TableCell >総摂取カロリー</TableCell>
              <TableCell align="right">{sum}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer >
    </>
  )
}

export default RegisteredList;