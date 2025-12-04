import {fetchBaseQuery,createApi} from "@reduxjs/toolkit/query/react"
import { uri } from "./uri"

export const apislice =createApi({
 baseQuery:fetchBaseQuery({baseUrl:uri}),
 tagTypes:["getdata"],
 endpoints:((builder)=> ({}))

})