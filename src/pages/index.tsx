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

export default function Home(props: PageProps): ReactElement {
    const router = useRouter();
    const [user, setUser] = useState<IUser>();
    const [presentes, setPresentes] = useState<String[]>();
    const [isDocente, setIsDocente] = useState(false);
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

        if (!suapClient.isAuthenticated()) {
            router.push("/login");
        }
        
        suapClient.getResource((response: IUser) => {
            setUser(response);
            setIsDocente(response.identificacao.length < 13);
        });
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
        router.push("/login");
    }

    return (
        <div className="bg-primary p-8 min-h-screen nax-w-screen grid place-items-center">
            <Head>
                <title>Presença Suap IFRN</title>
                <meta name="description" content="Contabilizar presenças nas aulas remotas" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="text-white grid gap-12">
                <header className="grid gap-4 w-full max-w-xs text-center">
                    <h1 className="text-2xl font-bold">
                        Olá, {user?.nome}
                    </h1>
                    {isDocente && (
                        <h2>Docente no IFRN.</h2>
                    ) || (
                        <h2>Discente no IFRN.</h2>
                    )}
                </header>
                <div className="input-container">
                    <label
                        htmlFor="input-codigo-aula"
                        className="font-bold"
                    >
                        Código da aula
                    </label>
                    <input
                        id="input-codigo-aula"
                        type="text"
                        className="input"
                        placeholder="Aula super legal"
                        value={String(codigoAula)}
                        onChange={e => setCodigoAula(e.target.value)}
                    />
                </div>
                <div className="grid gap-4">
                    {!isDocente && (
                        <button
                            onClick={marcarPresenca}
                            className="bg-green-700 block p-4 rounded-md border-2 border-green-600 text-center"
                        >
                            Marcar presença
                        </button>
                    ) || (
                        <section className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={handleCriarAula}
                                className="btn-cta"
                            >
                                Criar aula
                            </button>
                            <button
                                onClick={handleListarPresentes}
                                className="btn-cta"
                            >
                                Listar presentes
                            </button>
                        </section>
                    )}
                    <button
                        onClick={handleLogout}
                        className="btn-ghost"
                    >
                        Deslogar
                    </button>
                </div>
                {isDocente && presentes?.length && (
                    <section className="grid gap-6">
                        <header>
                            <h2 className="font-bold text-xl">Presentes</h2>
                            <h3>{presentes.length} alunos</h3>
                        </header>
                        <ul className="rounded-md overflow-hidden border-2 border-gray-800">
                            {presentes.map((presente, index) => (
                                <li 
                                    key={`aluno${index}`}
                                    className={`
                                        px-6 py-4 
                                        ${index % 2 === 0 ? "bg-secondary" : "bg-primary-dark"} 
                                    `}
                                >
                                    {presente}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>

            {/* <>
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
                {isDocente && (
                    <>
                        <button onClick={handleCriarAula}>
                            Criar aula
                        </button>
                        <button onClick={handleListarPresentes}>
                            Lista de presentes
                        </button>
                    </>
                )}
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
            </> */}

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