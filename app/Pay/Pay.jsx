import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';

const Checkout = ({amount,email}) => {
  
  const refr=Date.now();
  const { popup } = usePaystack();
  const id=userData.id;
  

    popup.checkout({
      email,
      amount: Number(amount),
      reference:refr,
      // invoice_limit: 3,
      // subaccount: 'ACCT_iskhq4np3wpwy31',
    //   split_code: 'SPL_def456',
    //   split: {
    //     type: 'percentage',
    //     bearer_type: 'account',
    
    //   },
      metadata: {
        custom_fields: [
          {
            display_name: 'Order ID',
            variable_name: 'order_id',
            value: 'OID1234'
          }
        ]
      },
      onSuccess: async(res) => {
        if(res.status==="success"){
          console.log('Success:', res)
        }
        
      },
      onCancel: () => console.log('User cancelled'),
      onLoad: (res) => console.log('WebView Loaded:', res),
      onError: (err) => console.log('WebView Error:', err)
    });
  };
  


export default Checkout