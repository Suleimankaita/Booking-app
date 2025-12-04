import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apislice } from "./Apislice";

const getsliceadapter = createEntityAdapter({});
const initialState = getsliceadapter.getInitialState();

export const getslice = apislice.injectEndpoints({
  endpoints: ((builder) => ({
    getdata: builder.query({
      query: () => "/getdata",
      transformResponse: (responseData) => {
        const loadeddata = responseData.map((item) => {
          item.id = item._id;
          return item;
        });
        return getsliceadapter.setAll(initialState, loadeddata);
      },
      providesTags: (result) =>
        result?.ids
          ? [
              ...result.ids.map((id) => ({ type: "getdata", id })),
              { type: "getdata", id: "LIST" },
            ]
          : [{ type: "getdata", id: "LIST" }],
    }),

    RemoveAllCategories: builder.mutation({
      query: ({}) => ({
        method: "DELETE",
        url: "/Remove_all_categories",
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
    GetBooks: builder.query({
      query:(id)=>`/GetBooks?id=${id}`,
      providesTags:[{type:'getdata',id:"LIST"}]
    }),
    GetPurchased: builder.query({
      query:()=>"/GetPurchased",
      providesTags:[{type:'getdata',id:"LIST"}]
    }),

    
    GetTrials: builder.query({
      query:()=>"/GetTrials",
      providesTags:[{type:'getdata',id:"LIST"}]
    }),
    GetUsers: builder.query({
      query:()=>"/AllUsers",
      providesTags:[{type:'getdata',id:"LIST"}]
    }),

    

    AUTH: builder.mutation({
      query: ({ username, password }) => ({
        method: "POST",
        url: "/Auth",
        body: { username, password },
      }),
    }),

    Send_otp: builder.mutation({
      query: ({ email ,Device}) => ({
        method: "POST",
        url: "/send_otp",
        body: { email,Device },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
    verify_otp: builder.mutation({
      query: ({ email,otp }) => ({
        method: "POST",
        url: "/verify-otp",
        body: { email,otp },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
    reset_password: builder.mutation({
      query: ({ newPassword,email }) => ({
        method: "POST",
        url: "/reset-password",
        body: { newPassword,email },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

      Reg: builder.mutation({
      query: ({ username,Email,Password }) => ({
        method: "POST",
        url: "/Reg",
        body: { username,email:Email,password:Password },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
     AddBooks: builder.mutation({
      query: ({form}) => ({
        method: "POST",
        url: "/Buy/AddBooks",
        body: form
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),
      StartTrial: builder.mutation({
      query: ({ userId,bookId,BookName,Username }) => ({
        method: "POST",
        url: "/api/startTrial",
        body: { userId,bookId,BookName,Username },
      }),
      invalidatesTags: [{ type: "getdata", id: "LIST" }],
    }),

    edit_profile: builder.mutation({
      query: ({ username, password, id, image }) => ({
        method: "PATCH",
        url: "/edit_profile",
        body:image,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "getdata", id: arg.id }],
    }),
    RemoveBookmark: builder.mutation({
      query: ({ BookName, id  }) => ({
        method: "DELETE",
        url: "/RemoveBookmark",
        body:{BookName, id},
      }),
      invalidatesTags: (result, error, arg) => [{ type: "getdata", id: arg.id }],
    }),
   UpdateBookPage: builder.mutation({
      query: ({ cfi,chapter,progress,BookName,BookMarks }) => ({
        method: "PATCH",
        url: "/UpdateBookPage",
        body:{cfi,chapter,progress,BookName,BookMarks},
      }),
      invalidatesTags: (result, error, arg) => [{ type: "getdata", id: arg.id }],
    }),
    Resets: builder.mutation({
      query: ({ email, password  }) => ({
        method:"PATCH",
        url: "/Reset",
        body:{email, password},
      }),
      invalidatesTags:[{ type: "getdata", id: "LIST" }],
    }),

 
    GetUser: builder.query({
      query: ({}) => "/GetUser",
      providesTags: [{ type: "getdata", id: "LIST" }],
    }),
  })),
});

export const {
  useRegMutation,
  useGetUserQuery,
  useAUTHMutation,
  useEdit_profileMutation,
  useResetsMutation,
  useGetBooksQuery,
  useGetdataQuery,
  useStartTrialMutation,
  useReset_passwordMutation,
  useSend_otpMutation,
  useGetPurchasedQuery,
  useVerify_otpMutation,
  useUpdateBookPageMutation,
  useGetTrialsQuery,
  useGetUsersQuery,
  useAddBooksMutation,
  useRemoveBookmarkMutation
} = getslice;

const selectgetdataresult = getslice.endpoints.getdata.select();

export const selectgetdata = createSelector(
  selectgetdataresult,
  (getdataresult) => getdataresult.data
) ?? initialState;

export const {
  selectAll: selectAlldata,
  selectById: selectdataById,
  selectIds: selectdataIds,
} = getsliceadapter.getSelectors((state) => selectgetdata(state));
