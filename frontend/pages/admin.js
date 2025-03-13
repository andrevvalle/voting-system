import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';

export default function Admin() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const getRandomAvatar = (index) => {
    return index % 2 === 0 
      ? "https://avatar.iran.liara.run/public/boy" 
      : "https://avatar.iran.liara.run/public/girl";
  };
  
  const [newPoll, setNewPoll] = useState({
    name: '',
    description: '',
    isActive: true,
    duration: 24, // Default duration in hours
    participants: [
      { name: 'Participant 1', imageUrl: getRandomAvatar(0) },
      { name: 'Participant 2', imageUrl: getRandomAvatar(1) }
    ]
  });

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        // Redirect to login page if no token exists
        router.push('/admin-login');
        return;
      }
    }
    
    fetchPolls();
  }, [router]);

  async function fetchPolls() {
    try {
      const pollsData = await adminApi.getAllPolls();
      setPolls(Array.isArray(pollsData) ? pollsData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching polls:', err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('adminToken'); // Clear invalid token
        router.push('/admin-login');
      } else {
        setError('Failed to load polls. Please check your admin access.');
        setLoading(false);
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPoll({
      ...newPoll,
      [name]: value
    });
  };

  const handleOptionChange = (index, field, value) => {
    const updatedParticipants = [...newPoll.participants];
    
    if (field === 'imageUrl' && (!value || value === '')) {
      value = getRandomAvatar(index);
    }
    
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [field]: value
    };
    setNewPoll({
      ...newPoll,
      participants: updatedParticipants
    });
  };

  const addOption = () => {
    // For new participants, alternate boy/girl avatar based on index
    const newIndex = newPoll.participants.length;
    
    setNewPoll({
      ...newPoll,
      participants: [
        ...newPoll.participants,
        { name: `Participant ${newIndex + 1}`, imageUrl: getRandomAvatar(newIndex) }
      ]
    });
  };

  const removeOption = (index) => {
    if (newPoll.participants.length <= 2) {
      alert('A poll must have at least 2 participants');
      return;
    }
    const updatedParticipants = newPoll.participants.filter((_, i) => i !== index);
    setNewPoll({
      ...newPoll,
      participants: updatedParticipants
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createPoll(newPoll);
      setNewPoll({
        name: '',
        description: '',
        isActive: true,
        duration: 24,
        participants: [
          { name: 'Participant 1', imageUrl: getRandomAvatar(0) },
          { name: 'Participant 2', imageUrl: getRandomAvatar(1) }
        ]
      });
      fetchPolls();
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll');
    }
  };

  const togglePollStatus = async (pollId, currentStatus) => {
    try {
      await adminApi.updatePoll(pollId, { isActive: !currentStatus, active: !currentStatus });
      fetchPolls();
    } catch (err) {
      console.error('Error updating poll status:', err);
      setError('Failed to update poll status');
    }
  };

  const deletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      try {
        await adminApi.deletePoll(pollId);
        fetchPolls();
      } catch (err) {
        console.error('Error deleting poll:', err);
        setError('Failed to delete poll');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading admin panel...</div>;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin-login');
  };

  return (
    <div className="flex-grow container mx-auto px-4 py-8 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Admin Panel</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-md border border-red-300">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar Novo Paredão
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do paredão</label>
                <input
                  type="text"
                  name="name"
                  value={newPoll.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o nome do paredão"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newPoll.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Digite a descrição do paredão"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  name="duration"
                  value={newPoll.duration}
                  onChange={(e) => setNewPoll({...newPoll, duration: parseInt(e.target.value) || 24})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newPoll.duration ? `Paredão vai durar ${newPoll.duration} horas` : 'Paredão não tem duração definida'}
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active-checkbox"
                  name="isActive"
                  checked={newPoll.isActive}
                  onChange={(e) => setNewPoll({...newPoll, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active-checkbox" className="ml-2 block text-sm text-gray-700">
                  Ativo (o paredão estará imediatamente disponível para votação)
                </label>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium text-gray-800">Participantes do Paredão</h3>
                  <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Participant
                  </button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {newPoll.participants.map((participant, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Participant {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          title="Remove participant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={participant.name}
                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Participant name"
                        required
                      />
                      <input
                        type="text"
                        value={participant.imageUrl}
                        onChange={(e) => handleOptionChange(index, 'imageUrl', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Image URL (optional)"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Criar Paredão
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Gerenciar Paredões
            </h2>
            
            {polls.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Sem paredões disponíveis</p>
                <p className="text-sm text-gray-400 mt-1">Crie um novo paredão acima</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paredão</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {polls.map(poll => (
                      <tr key={poll.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{poll.name || poll.title}</span>
                            {poll.description && (
                              <span className="text-sm text-gray-500 truncate max-w-xs">{poll.description}</span>
                            )}
                            <span className="text-xs text-gray-400 mt-1">
                              {poll.Participants ? `${poll.Participants.length} participants` : 
                               poll.participants ? `${poll.participants.length} participants` : 
                               poll.options ? `${poll.options.length} options` : 
                               poll.participantsCount ? `${poll.participantsCount} participants` : '0 options'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (poll.active || poll.isActive) 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(poll.active || poll.isActive) ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          <button
                            onClick={() => togglePollStatus(poll.id, (poll.active || poll.isActive))}
                            className={`mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                              (poll.active || poll.isActive)
                                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                            }`}
                          >
                            {(poll.active || poll.isActive) ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deletePoll(poll.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            title="Delete poll"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}