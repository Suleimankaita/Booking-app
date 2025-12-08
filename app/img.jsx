import { useGetUsersQuery } from '@/components/api/Getslice'
import { uri } from '@/components/api/uri'
import React, { useEffect, useState } from 'react'
import { Image } from 'react-native'
import { getuserfound } from '@/components/Funcslice'
import { router } from 'expo-router'
import Useauth from './hooks/Useauth'
import { useSelector } from 'react-redux'

const Img = () => {
    const { data } = useGetUsersQuery('', {
        pollingInterval: 1000,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    const user=useSelector(getuserfound)
    const [all,setall]=useState([])



    const [img, setImg] = useState('');

    

    useEffect(() => {
        if (!data ) return;
        // const found = data.find(res => res?._id === id);
        setall(data)


    }, [data,]);
    
    useEffect(() => {
        if(!all)return;
        const found = all.find(res => res?._id === user?.id);

        if (found) {
            setImg(found?.NameId?.img)
        console.log(found)
        }

    }, [all,user]);

    useEffect(()=>{
        console.log(img)
    },[img])

    return (
        <Image 
            style={{ width: 35, height: 35, borderRadius: 50, marginRight: 10 }}
            source={{ uri: `${uri}/img/${img}` }}
        />
    );
};

export default Img;


