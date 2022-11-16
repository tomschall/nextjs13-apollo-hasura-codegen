import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import ApolloWrapper from '../src/ApolloWrapper';
import ErrorBoundary from './error';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <ApolloWrapper>
          <Component {...pageProps} />
        </ApolloWrapper>
      </ErrorBoundary>
    </RecoilRoot>
  );
}
