import React, { useEffect } from 'react';
import {
  useGetTomSubscription,
  useUsersSubscription,
} from '../src/api/generated/graphql';
import { useRecoilState } from 'recoil';
import { isAuthenticatedState } from './atom';
import Logout from './Logout';
import { useRouter } from 'next/router';

const User: React.FC = () => {
  const [isAuthenticated] = useRecoilState(isAuthenticatedState);

  const { data, loading, error } = useGetTomSubscription({
    variables: {},
  });

  const router = useRouter();

  if (loading) {
    return <>loading yeah...</>;
  }

  if (error) {
    console.log('error', error);
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <p>
            <Logout />
          </p>
          <p>users from database:</p>
          <ul>
            {data?.users.map((user, index) => {
              return <li key={index}>hi {user.firstname}</li>;
            })}
          </ul>
        </>
      ) : (
        <>
          <p>Not Authenticated!</p>
          <button
            onClick={() => {
              router.push('/login');
            }}
          >
            Login
          </button>
        </>
      )}
    </>
  );
};

export default User;
