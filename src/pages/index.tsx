import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { ReactElement, useEffect, useState } from 'react'
import { SuapClient } from "../lib/SuapClient"
import { IUser } from '../types/IUser';
import axios from 'axios';
import httpStatus from '../lib/httpStatus';
import Script from 'next/script';

interface PageProps {
    SUAP_URL: string,
    CLIENT_ID: string,
    REDIRECT_URI: string,
    SCOPE: string,
}

export default function Home(props: PageProps): ReactElement {
    const [user, setUser] = useState<IUser>();
    const [presentes, setPresentes] = useState<String[]>();
    const [isAuth, setIsAuth] = useState(false);
    const [codigoAula, setCodigoAula] = useState<String>("");

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
            suapClient.getResource((response: IUser) => {
                setUser(response);
            });
            setIsAuth(true);
        }
    }, []);

    async function handleCriarAula() {
        if (codigoAula) {
            try {
                const response = await axios.post("/api/aulas", {
                    matriculaDocente: user?.identificacao,
                    nomeDocente: user?.nome,
                    campus: user?.campus,
                    codigo: codigoAula
                })

                if (response.status == httpStatus.CREATED) {
                    alert("Aula cadastrada.");
                } else {
                    alert("Não foi possível criar a aula.");
                }
            } catch (error) {
                alert("Não foi possível criar a aula.");
            }
        }
    }

    async function marcarPresenca() {
        if (codigoAula) {
            try {
                const response = await axios.post("/api/presencas", {
                    matriculaDiscente: user?.identificacao,
                    nomeDiscente: user?.nome,
                    codigoAula
                })

                if (response.status == httpStatus.CREATED) {
                    alert("Presença cadastrada.");
                } else if (response.status == httpStatus.NOT_MODIFIED) {
                    alert("Você já marcou a presença.");
                } else {
                    alert("Não foi possível marcar a presença.");
                }
            } catch (error: any) {
                if (error.response.status == httpStatus.NOT_MODIFIED) {
                    alert("Você já marcou a presença.");
                } else {
                    alert("Não foi possível marcar a presença.");
                }
            }
        }
    }

    async function handleListarPresentes() {
        if (codigoAula) {
            try {
                const response = await axios.post("/api/presentes", {
                    matriculaDocente: user?.identificacao,
                    codigoAula
                })

                setPresentes((response.data as any).presentes);
            } catch (error) {
                alert("Você não criou esta aula.");
            }
        }
    }

    function handleLogout() {
        suapClient.init();
        suapClient.logout();
    }

    return (
        <div>
            <Head>
                <title>Presença Suap IFRN</title>
                <meta name="description" content="Contabilizar presenças nas aulas remotas" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {isAuth && (
                <>
                    <h1>Olá, {user?.nome}</h1>
                    <main>
                    <label htmlFor="codigo-aula">Código da aula: </label>
                    <input 
                        id="codigo-aula"
                        type="text"
                        value={String(codigoAula)}
                        onChange={e => setCodigoAula(e.target.value)}
                    />
                    <button
                        onClick={marcarPresenca}
                    >
                        Marcar presença
                    </button>
                    </main>
                    <button onClick={handleCriarAula}>
                        Criar aula
                    </button>
                    <button onClick={handleListarPresentes}>
                        Lista de presentes
                    </button>
                    <button onClick={handleLogout}>
                        Sair
                    </button>
                    <ul>
                    {presentes?.length && (
                        presentes?.map((presente, index) => (
                            <li key={`presente${index}`}>{presente}</li>
                        ))
                    )}
                    </ul>
                </>
            ) || (
                <a href={loginUrl}>Logar no suap</a>
            )}

            <Script defer src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossOrigin="anonymous" referrerPolicy="no-referrer"></Script>
            <Script defer src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></Script>
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