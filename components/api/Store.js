import { configureStore } from "@reduxjs/toolkit";
import {apislice }from "./Apislice";
import Auth from "../Funcslice"
export const store=configureStore({
    reducer:{
        Auths:Auth,
        [apislice.reducerPath]:apislice.reducer,
    },
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware().concat(apislice.middleware),
    devTools:true
},
)