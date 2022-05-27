import React, {  useState } from "react";
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

const RegisteredList = ( props ) => {
  // 合計カロリー
  let sum = 0
  // 選択された日付
  const[selectedDate, setselectedDate] = useState("");
  // 日付の更新
  const onChangeselectedDate = (e) => {
    setselectedDate(e.target.value)
    sum = 0
  }
  // 指定された食事情報の削除
  const handleDelete = async(id) => {
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
              props.registererList && props.registererList.map(({id, food_id, date}) => (
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