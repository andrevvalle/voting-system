import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getActivePolls } from '../lib/api';

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const router = useRouter();
  const { page = 1, limit = 9, filterActive = 'false' } = router.query;

  useEffect(() => {
    async function fetchPolls() {
      try {
        setLoading(true);
        const data = await getActivePolls(page, limit, filterActive);
        setPolls(data.polls || []);
        setMeta(data.meta || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: parseInt(limit),
          hasNextPage: false,
          hasPrevPage: false
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching polls:', err);
        setError('Failed to load polls');
        setLoading(false);
      }
    }

    if (router.isReady) {
      fetchPolls();
    }
  }, [router.isReady, page, limit, filterActive]);

  const navigateToPage = (newPage) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage }
    });
  };

  const toggleActiveFilter = () => {
    router.push({
      pathname: router.pathname,
      query: { 
        ...router.query, 
        filterActive: filterActive === 'true' ? 'false' : 'true',
        page: 1 
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Available Polls | Voting System</title>
        <meta name="description" content="Browse all available voting polls in our system" />
      </Head>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center p-8">Loading polls...</div>
      </main>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Error | Voting System</title>
        <meta name="description" content="An error occurred while loading polls" />
      </Head>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center p-8 text-red-500">{error}</div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Available Polls | Voting System</title>
        <meta name="description" content="Browse all available voting polls in our system" />
      </Head>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Available Polls</h1>
          <div className="flex items-center">
            <button 
              onClick={toggleActiveFilter}
              className={`px-4 py-2 rounded-md ${
                filterActive === 'true' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {filterActive !== 'true' ? 'Apenas ativos' : 'Ver todos'}
            </button>
          </div>
        </div>
        
        {polls.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">No paredão available with the current filters.</p>
            {filterActive === 'true' && (
              <button 
                onClick={toggleActiveFilter} 
                className="mt-2 text-blue-500 hover:underline"
              >
                Ver todos os paredões
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {polls.map(poll => (
                <div key={poll.id} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold mb-2">{poll.name}</h2>
                  <p className="text-gray-600 mb-4">{poll.description || "No description available"}</p>
                  <p className="mb-2">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      poll.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {poll.isActive ? 'Active' : 'Closed'}
                    </span>
                  </p>
                  
                  {poll.participants && poll.participants.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Participants:</h3>
                      <div className="flex flex-wrap gap-1">
                        {poll.participants.map(participant => (
                          <span 
                            key={participant.id} 
                            className="bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs"
                          >
                            {participant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-3">
                    <Link href={`/polls/${poll.id}`} className="text-blue-500 hover:underline">
                      View Details
                    </Link>
                    {poll.isActive && (
                      <Link href={`/polls/${poll.id}`} className="text-green-500 hover:underline">
                        Vote
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {meta.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateToPage(parseInt(page) - 1)}
                    disabled={!meta.hasPrevPage}
                    className={`px-3 py-1 rounded-md ${
                      meta.hasPrevPage 
                        ? 'bg-gray-200 hover:bg-gray-300' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {[...Array(meta.totalPages).keys()].map(num => (
                      <button
                        key={num + 1}
                        onClick={() => navigateToPage(num + 1)}
                        className={`w-8 h-8 rounded-md ${
                          parseInt(page) === num + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {num + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => navigateToPage(parseInt(page) + 1)}
                    disabled={!meta.hasNextPage}
                    className={`px-3 py-1 rounded-md ${
                      meta.hasNextPage
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}