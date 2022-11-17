import React, { useEffect } from 'react';
import { getMainDefinition } from '@apollo/client/utilities';
import {
  InMemoryCache,
  createHttpLink,
  split,
  ApolloClient,
  ApolloProvider,
  HttpOptions,
} from '@apollo/client';
import { WebSocketLink, WebSocketParams } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { JwtPayload } from 'jwt-decode';
import { useRecoilState } from 'recoil';
import { accessTokenState, isAuthenticatedState } from '../pages/atom';
import axios from 'axios';

interface Definition {
  kind: string;
  operation?: string;
}

interface Claims {
  'https://hasura.io/jwt/claims'?: {
    'x-hasura-allowed-roles'?: string;
    'x-hasura-default-role'?: string;
    'x-hasura-user-id'?: string;
    'x-hasura-org-id'?: string;
    'x-hasura-username'?: string;
  };
}

type ParsedTokenUser = JwtPayload & Claims;

interface ApolloHeaders {
  Authorization: string;
}

interface ApolloWrapperProps {
  children: any;
}

const ApolloWrapper: React.FC<ApolloWrapperProps> | any = ({
  children,
}: any) => {
  const [isAuthenticated, setIsAuthenticated] =
    useRecoilState<boolean>(isAuthenticatedState);

  const [accessToken, setAccessToken] =
    useRecoilState<string>(accessTokenState);

  useEffect(() => {
    const checkForValidJWT = async () => {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (!accessToken && !isAuthenticated && typeof window !== 'undefined') {
        console.log('useEffect', typeof window !== 'undefined');
        const token = await axios.get('http://localhost:3000/auth/refresh', {
          headers,
          withCredentials: true,
        });
        if (token) {
          console.log('token', token);
          setIsAuthenticated(true);
          setAccessToken(token.data);
        }
      }
    };

    checkForValidJWT();
  }, [isAuthenticated, setIsAuthenticated, setAccessToken, accessToken]);

  useEffect(() => {
    /*
      Query logic
      */
    console.log('i fire once');
  }, []);

  const getHeaders = async () => {
    const headers = {} as ApolloHeaders;
    if (isAuthenticated) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
  };

  const authMiddleware = setContext(async (operation, { originalHeaders }) => {
    return {
      headers: {
        ...originalHeaders,
        ...(await getHeaders()),
      },
    };
  });

  const httpLinkOptions: HttpOptions = {
    uri: 'http://localhost:8080/v1/graphql',
  };

  const wsLinkOptions: WebSocketParams = {
    uri: 'ws://localhost:8080/v1/graphql',
    options: {
      reconnect: true,
      lazy: true,
      connectionParams: async () => {
        return { headers: await getHeaders() };
      },
    },
  };

  const httpLink = createHttpLink(httpLinkOptions);
  const wsLink =
    typeof window !== 'undefined' ? new WebSocketLink(wsLinkOptions) : null;

  const link =
    typeof window !== 'undefined' && wsLink !== null
      ? split(
          // split based on operation type
          ({ query }) => {
            const { kind, operation }: Definition = getMainDefinition(query);
            return (
              kind === 'OperationDefinition' && operation === 'subscription'
            );
          },
          wsLink,
          authMiddleware.concat(httpLink),
        )
      : authMiddleware.concat(httpLink);

  /* Set up local cache */
  const cache = new InMemoryCache();

  /* Create Apollo Client */
  const client = new ApolloClient({
    link,
    cache,
    ssrMode: false,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloWrapper;
