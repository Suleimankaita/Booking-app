import AsyncStorage from '@react-native-async-storage/async-storage';
// Remove 'useRouter' import and call from here
// import { useRouter } from 'expo-router'; 
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth as Clear, clearToken, gettoken, getuserfound, Setuserdata } from '../../components/Funcslice';

const JWT_CHECK_INTERVAL = 30000; // Check every 30 seconds

const Useauth = () => {
  const token = useSelector(gettoken);
  let ids=''
  const dispatch = useDispatch();
  // const router = useRouter(); // ❌ REMOVED: This was causing the Hook Order Error
  const usess=useSelector(getuserfound)
  const [userData, setUserData] = useState({
    username: '',
    id: '',
    password: '',
    role: '',
    account_no: '',
    account_name: ''
  });

  // 1. Modified clearAuth to accept a router instance
  const clearAuth = useCallback(async (routerInstance) => {
    try {
      await AsyncStorage.removeItem('cokkie');
      dispatch(clearToken());
      setUserData({ account_no:'',username: '', id: '', password: '', role: '',account_name:'' });
      ids=''
     dispatch(Clear())
     
    } catch (error) {
      console.log('Error during logout:', error);
    }
  }, [dispatch]); // ✅ Dependency array is now stable without 'router'

  // 2. Modified checkAndDecodeToken to accept a router instance
  const checkAndDecodeToken = useCallback((tk, routerInstance = null) => {
    try {
      if (!tk) {
        // Pass the router instance to clearAuth
        clearAuth(routerInstance); 
        return null;
      }

      const decoded = jwtDecode(tk);
      const { exp, UserInfo } = decoded;
      const currentTime = Date.now() / 1000;

      if (exp < currentTime) {
        console.log('Token expired');
        // Pass the router instance to clearAuth
        clearAuth(routerInstance); 
        return null;
      }

      const { username, id, password, Role, } = UserInfo;
      setUserData({ username, id, password, Role, });
      ids=id
      dispatch(Setuserdata({ username, id, password, Role, }));
      console.log(id)
      console.log(UserInfo)
      return username;
    } catch (err) {
      console.log('Invalid token:', err);
      clearAuth(routerInstance); 
      return null;
    }
  }, [clearAuth]);


  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      // No router needed here, as it's just checking/setting data
      checkAndDecodeToken(token); 
    };

    checkTokenExpiration();

    const intervalId = setInterval(checkTokenExpiration, JWT_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token, checkAndDecodeToken]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('cokkie');
        if (storedToken) {
          // No router needed here
          checkAndDecodeToken(storedToken); 
        }
      } catch (error) {
        console.log('Error loading token:', error);
      }
    };

    fetchToken();
  }, [checkAndDecodeToken]);

  
      useEffect(() => {
        console.log("User authenticated:", usess);
  
        // If Username is empty, null, or undefined → redirect
        if (!usess.username || !usess?.id) {
          const timer = setTimeout(() => {
            console.log("username empty → redirecting...", usess?.username);
          }, 150);
      
          return () => clearTimeout(timer);
        }
      
        console.log("User authenticated:", usess);
      
      }, [ usess,usess.username, router]);
      
       const id=userData.id
      

  // Return the updated clearAuth function
  return {role:userData.role, userData, username: userData.username, clearAuth,id,ids };
};

export default Useauth;

// Stylesheet remains unchanged as it contains no logic
// const styles = StyleSheet.create({});