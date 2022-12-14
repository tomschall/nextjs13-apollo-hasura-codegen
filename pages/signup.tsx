import React, { useState } from 'react';
import axios from 'axios';
import { accessTokenState, isAuthenticatedState } from './atom';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] =
    useRecoilState(isAuthenticatedState);

  const [accessToken, setAccessToken] =
    useRecoilState<string>(accessTokenState);

  const [errorMessages, setErrorMessages] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const headers = {
    'Content-Type': 'application/json',
  };

  const signup = async (event: any) => {
    event.preventDefault();

    const data = {
      username,
      password,
      name,
    };

    axios
      .post(process.env.NEXT_PUBLIC_SIGNUP_URL as string, data, {
        headers: headers,
        withCredentials: true,
      })
      .then((res: any) => {
        console.log('res', res);
        if (res.data) {
          setAccessToken(res.data);
          setIsAuthenticated(true);
          router.push('/user');
        }
      })
      .catch((err: any) => {
        console.log('err', err);
        setErrorMessages(true);
      });
  };

  const renderErrorMessage = () =>
    errorMessages && <div className="error">invalid username or password</div>;

  return !isAuthenticated ? (
    <div className="form">
      {renderErrorMessage()}
      <form onSubmit={signup}>
        <div className="input-container">
          <label>Name</label>
          <input
            type="text"
            name="name"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <label>Username</label>
          <input
            type="text"
            name="username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-container">
          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-container">
          <input type="submit" />
        </div>
      </form>
    </div>
  ) : (
    <></>
  );
};

export default Login;
