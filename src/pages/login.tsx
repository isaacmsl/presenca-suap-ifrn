import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { ReactElement, useEffect, useState } from 'react'
import { SuapClient } from "../lib/SuapClient"
import { IUser } from '../types/IUser';
import axios from 'axios';
import httpStatus from '../lib/httpStatus';
import Script from 'next/script';
import { useRouter } from 'next/dist/client/router';

interface PageProps {
    SUAP_URL: string,
    CLIENT_ID: string,
    REDIRECT_URI: string,
    SCOPE: string,
}

export default function Login(props: PageProps): ReactElement {
    const router = useRouter();

    const suapClient = new SuapClient(
        props.SUAP_URL, 
        props.CLIENT_ID, 
        props.REDIRECT_URI, 
        props.SCOPE
    );
    const loginUrl = suapClient.getLoginURL();

    useEffect(() => {
        suapClient.init();

        if (suapClient.isAuthenticated()) {
            router.push("/");
        }
    }, []);

    return (
        <div className="bg-primary h-screen w-screen grid place-items-center">
            <Head>
                <title>Presença | Login</title>
                <meta name="description" content="Contabilizar presenças nas aulas remotas" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="text-white text-center grid gap-12">
                <header className="grid gap-4 w-full max-w-xs">
                    <h1 className="text-2xl font-bold">Marque sua presença nas aulas do IFRN</h1>
                    <h2>Simplicidade para docentes e discentes.</h2>
                </header>
                <a 
                    href={suapClient.getLoginURL()}
                    className="btn-cta"
                >
                    Logar com o SUAP
                </a>
            </main>

            <Script 
                src="/scripts/jquery-3.6.0.min.js"
                strategy="beforeInteractive"
            />
            <Script 
                src="/scripts/js.cookie.min.js"
                strategy="beforeInteractive"
            />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async () => {

  const SUAP_URL = String(process.env.SUAP_URL);
  const CLIENT_ID = String(process.env.CLIENT_ID);
  const REDIRECT_URI = String(process.env.REDIRECT_URI);
  const SCOPE = String(process.env.SCOPE);

  return {
    props: {
      SUAP_URL,
      CLIENT_ID,
      REDIRECT_URI,
      SCOPE,
    }
  }
}