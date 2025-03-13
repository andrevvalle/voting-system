import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getActivePolls } from '../lib/api';

export default function Home() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPolls() {
      try {
        const data = await getActivePolls();
        setPolls(data.polls || []);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar votações ativas:', err);
        setError('Não foi possível carregar as votações ativas.');
        setLoading(false);
      }
    }

    fetchPolls();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Sistema de Votação - Home</title>
        <meta name="description" content="Sistema de votação em alta escala" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <div className="hero">
          <h1 className="title">Sistema de Votação</h1>
          <p className="description">
            Plataforma de votação em tempo real de alta performance
          </p>
          <div className="cta-buttons">
            <Link href="/polls" className="btn btn-primary">
              Ver Votações Ativas
            </Link>
            <Link href="/admin" className="btn btn-primary">
              Administrar
            </Link>
          </div>
        </div>

        <div className="features">
          <h2 className="section-title">Recursos</h2>
          <div className="grid">
            <div className="card">
              <h3>Votação em Tempo Real</h3>
              <p>
                Acompanhe os resultados das votações instantaneamente, com atualizações em tempo real.
              </p>
            </div>
            <div className="card">
              <h3>Alta Performance</h3>
              <p>
                Sistema projetado para suportar milhares de votos por segundo, sem latência.
              </p>
            </div>
            <div className="card">
              <h3>Fácil Administração</h3>
              <p>
                Interface amigável para criar e gerenciar votações de forma rápida e eficiente.
              </p>
            </div>
          </div>
        </div>

        <div className="active-polls">
          <h2 className="section-title">Votações Ativas</h2>
          
          {loading ? (
            <p className="loading">Carregando votações...</p>
          ) : error ? (
            <p className="error" role="alert">{error}</p>
          ) : polls.length === 0 ? (
            <p>Nenhuma votação ativa no momento.</p>
          ) : (
            <div className="polls-grid">
              {polls.map((poll) => (
                <Link href={`/polls/${poll.id}`} key={poll.id}>
                  <div className="poll-card">
                    <h3>{poll.name}</h3>
                    <p>Participantes: {poll.participantsCount}</p>
                    <p className="poll-date">
                      Iniciado em: {new Date(poll.startDate).toLocaleDateString()}
                    </p>
                    <div className="view-btn">Ver detalhes</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

