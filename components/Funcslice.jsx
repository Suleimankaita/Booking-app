import RemoveCookie from "@/app/hooks/RemoveCookie";
import { createSlice } from "@reduxjs/toolkit";
import { router } from "expo-router";

const initialState = {
  shows: false,
  theame: false,
  Route: null,
  token: null,
  userdata: {
     username: '',
    id: '',
    password: '',
    role: '',
  
  },
  user_Transactionfound: null,
};

const Funcslice = createSlice({
  name: "Auths",
  initialState,
  reducers: {
    clearAuth: (state) => {

        // alert('logout')
         RemoveCookie()
        // state.token = null;
      // state.userdata = {username:'', id:'', password:'', Role:''};
      router.replace('/(Reg)/Sign')
    },

    setTheame: (state, action) => {
      state.theame = action.payload;
    },

    toggleShows: (state) => {
      state.shows = !state.shows;
    },

    settoken: (state, action) => {
      state.token = action.payload;
    },

    clearToken: (state) => {
      state.token = null;
    },

    Setuserdata: (state, action) => {
      state.userdata = action.payload;
      console.log("action  ",action.payload)
    },

    setUserfound: (state, action) => {
      state.user_Transactionfound = action.payload;
    },

    SetRoute: (state, action) => {
      state.Route = action.payload;
    },
  },
});

export const {
  clearAuth,
  toggleShows,
  settoken,
  clearToken,
  Setuserdata,
  setTheame,
  setUserfound,
  SetRoute,
} = Funcslice.actions;

// Selectors
export const selectShows = (state) => state.Auths.shows;
export const getuserfound = (state) => state.Auths.userdata;
export const get_transaction_found = (state) => state.Auths.user_Transactionfound;
export const gettoken = (state) => state.Auths.token;
export const GetRoute = (state) => state.Auths.Route;
export const getTheame = (state) => state.Auths.theame;

export default Funcslice.reducer;
    