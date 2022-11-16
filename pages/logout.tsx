import axios from 'axios';
import React from 'react';
import { useRecoilState } from 'recoil';
import { accessTokenState, isAuthenticatedState } from './atom';

const Logout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] =
    useRecoilState(isAuthenticatedState);

  const [accessToken, setAccessToken] =
    useRecoilState<string>(accessTokenState);

  const logout = () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
    };

    axios
      .get('http://localhost:3000/auth/logout', {
        headers: headers,
      })
      .then((res: any) => {
        console.log('logged out', res);
        setIsAuthenticated(false);
      })
      .catch((err: any) => {
        console.log('err', err);
      });
  };

  return (
    <>
      <button
        onClick={() => {
          logout();
        }}
      >
        Logout
      </button>
    </>
  );
};

export default Logout;
