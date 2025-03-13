import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { getPollDetails, vote } from '../../lib/api'

export default function PollDetail() {
  const router = useRouter()
  const { pollId } = router.query

  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalVotes, setTotalVotes] = useState(0)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [votedFor, setVotedFor] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [pendingVoteInfo, setPendingVoteInfo] = useState(null)
  const recaptchaRef = useRef(null)

  const COLORS = ['#FF7300', '#0088FE', '#00C49F', '#FFBB28', '#AF19FF', '#8884D8']

  useEffect(() => {
    if (!pollId) return

    const fetchPollDetails = async () => {
      try {
        setLoading(true)
        const data = await getPollDetails(pollId)
        setPoll(data.poll)
        setResults(data.results || [])
        setTotalVotes(data.totalVotes || 0)
        setLoading(false)

        if (data.poll.endDate) {
          updateTimeLeft(new Date(data.poll.endDate))
          const interval = setInterval(() => {
            const remaining = updateTimeLeft(new Date(data.poll.endDate))
            if (remaining <= 0) clearInterval(interval)
          }, 1000)
          return () => clearInterval(interval)
        }
      } catch {
        setError('Failed to load poll details')
        setLoading(false)
      }
    }

    fetchPollDetails()

    const checkPreviousVote = () => {
      const voted = localStorage.getItem(`vote_${pollId}`)
      if (voted) {
        setVoteSubmitted(true)
        setVotedFor(voted)
      }
    }
    checkPreviousVote()
  }, [pollId])

  const updateTimeLeft = (endDate) => {
    const now = new Date()
    const difference = endDate - now
    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return 0
    }
    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / (1000 * 60)) % 60)
    const seconds = Math.floor((difference / 1000) % 60)
    setTimeLeft({ days, hours, minutes, seconds })
    return difference
  }

  const renderTimeLeft = () => {
    if (!timeLeft) return null
    const { days, hours, minutes, seconds } = timeLeft
    if (days > 0) return `${days}d ${hours}h ${minutes}m restantes`
    return `${hours}h ${minutes}m ${seconds}s restantes`
  }

  const handleCaptchaChange = (token) => {
    if (token) {
      setCaptchaVerified(true)
      if (pendingVoteInfo) {
        processVote(pendingVoteInfo.participantId, pendingVoteInfo.participantName, token)
      }
    }
  }

  const handleSendVoteClick = () => {
    if (voteSubmitted) return
    if (!poll.isActive) return

    if (!selectedParticipant) {
      alert('Por favor, selecione um participante!')
      return
    }

    const participant = results.find((p) => p.id === selectedParticipant)
    if (!participant) {
      alert('Participante inválido!')
      return
    }
    setPendingVoteInfo({ participantId: participant.id, participantName: participant.name })
    setShowCaptcha(true)

    if (captchaVerified && recaptchaRef.current) {
      const token = recaptchaRef.current.getValue()
      if (token) {
        processVote(participant.id, participant.name, token)
      } else {
        recaptchaRef.current.reset()
        setCaptchaVerified(false)
      }
    }
  }

  const processVote = async (participantId, participantName, recaptchaToken) => {
    try {
      setShowCaptcha(false)
      await vote(pollId, participantId, recaptchaToken)
      localStorage.setItem(`vote_${pollId}`, participantName)
      setVoteSubmitted(true)
      setVotedFor(participantName)

      const updatedData = await getPollDetails(pollId)
      setResults(updatedData.results || [])
      setTotalVotes(updatedData.totalVotes || 0)
      setPendingVoteInfo(null)
      setCaptchaVerified(false)
    } catch {
      setError('Falha ao registrar seu voto. Tente novamente.')
      setSelectedParticipant(null)
      setPendingVoteInfo(null)
      setShowCaptcha(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Head>
          <title>Loading paredão | Voting System</title>
          <meta name="description" content="Loading paredão details" />
        </Head>
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            <p className="mt-4 text-lg">Loading paredão details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Head>
          <title>Error | Voting System</title>
          <meta name="description" content="An error occurred" />
        </Head>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Go back
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex flex-col">
        <Head>
          <title>Paredão Not Found | Voting System</title>
          <meta name="description" content="The requested paredao was not found" />
        </Head>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Paredão Not Found</h1>
            <p className="mb-4">
              The Paredão you're looking for might have been removed or doesn't exist.
            </p>
            <button
              onClick={() => router.push('/polls')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Ver todos os paredões
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (voteSubmitted) {
    const chartData = results.map((participant, index) => {
      const color = COLORS[index % COLORS.length]
      return {
        name: participant.name,
        value: participant.percentage || 0,
        imageUrl: participant.imageUrl,
        color
      }
    })

    const renderTimeInsideChart = () => {
      if (!timeLeft || !poll.isActive) return null
      const { days, hours, minutes, seconds } = timeLeft
      const dStr = days > 0 ? `${days}d ` : ''
      const h = String(hours).padStart(2, '0')
      const m = String(minutes).padStart(2, '0')
      const s = String(seconds).padStart(2, '0')
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-base font-semibold mb-0">Faltam</p>
          <p className="text-2xl font-bold mb-0">{dStr}{h}:{m}:{s}</p>
          <p className="text-sm">para encerrar a votação</p>
        </div>
      )
    }

    const renderPieLabel = (props) => {
      const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
      const RAD = Math.PI / 180
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos(-midAngle * RAD)
      const y = cy + radius * Math.sin(-midAngle * RAD)
      const val = (percent * 100).toFixed(0) + '%'
      return (
        <text
          x={x}
          y={y}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14px"
          fontWeight="bold"
        >
          {val}
        </text>
      )
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Head>
          <title>{poll.name} | Voting System</title>
          <meta name="description" content={`Vote for your favorite in ${poll.name}`} />
        </Head>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{poll.name}</h1>
                {poll.description && (
                  <p className="text-gray-600 mb-4">{poll.description}</p>
                )}
                <div className="flex items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      poll.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {poll.isActive ? 'Active' : 'Closed'}
                  </span>
                  {timeLeft && poll.isActive && (
                    <span className="ml-2 text-sm text-gray-600">
                      {renderTimeLeft()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push('/polls')}
                className="text-sm text-blue-500 hover:underline"
              >
                Ver todos os paredões
              </button>
            </div>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <h2 className="text-xl font-semibold text-green-700 mb-2">
                Parabéns! Seu voto para {votedFor} foi enviado com sucesso!
              </h2>
              <p className="text-green-600">Confira os resultados atuais da votação abaixo.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className="rounded-full border-4 p-1 mb-2"
                      style={{ borderColor: item.color }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-full"
                        />
                      )}
                    </div>
                    <p className="font-semibold">{item.name}</p>
                  </div>
                ))}
              </div>

              <div className="relative" style={{ width: 300, height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={140}
                      startAngle={300}
                      endAngle={-300}
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {renderTimeInsideChart()}
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              Total votes: {totalVotes}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{poll.name} | Voting System</title>
        <meta name="description" content={`Vote for your favorite in ${poll.name}`} />
      </Head>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{poll.name}</h1>
              {poll.description && (
                <p className="text-gray-600 mb-4">{poll.description}</p>
              )}
              <div className="flex items-center mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    poll.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {poll.isActive ? 'Active' : 'Closed'}
                </span>
                {timeLeft && poll.isActive && (
                  <span className="ml-2 text-sm text-gray-600">
                    {renderTimeLeft()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push('/polls')}
              className="text-sm text-blue-500 hover:underline"
            >
              Ver todos os paredões
            </button>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Quem deve ser eliminado?
            </h2>
            <p className="text-blue-600 mb-1">
              Selecione um participante abaixo e clique em “Envie seu voto agora”.
            </p>
            {!poll.isActive && (
              <p className="text-red-500 text-sm">
                Este paredão está encerrado para votação
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            {results.map((participant) => {
              const isSelected = selectedParticipant === participant.id
              return (
                <div
                  key={participant.id}
                  onClick={() => {
                    if (!voteSubmitted && poll.isActive) {
                      setSelectedParticipant(participant.id)
                    }
                  }}
                  className={`
                    w-40 p-2 border-2 rounded-md text-center cursor-pointer
                    flex flex-col items-center
                    ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200'
                    }
                    ${!voteSubmitted && poll.isActive
                      ? 'hover:border-orange-300'
                      : ''
                    }
                  `}
                >
                  {participant.imageUrl && (
                    <img
                      src={participant.imageUrl}
                      alt={participant.name}
                      className="w-32 h-32 object-cover rounded-full mb-2"
                    />
                  )}
                  <span className="font-medium text-sm">{participant.name}</span>
                </div>
              )
            })}
          </div>
          <div className="text-center">
            <button
              onClick={handleSendVoteClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!poll.isActive}
            >
              Envie seu voto agora
            </button>
          </div>
        </div>
      </main>
      {showCaptcha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-center">Verificação de Segurança</h3>
            <p className="mb-4 text-center">
              Para registrar seu voto, complete a verificação abaixo:
            </p>
            <div className="flex justify-center mb-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={
                  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                  '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
                }
                onChange={handleCaptchaChange}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowCaptcha(false)
                  setSelectedParticipant(null)
                  setPendingVoteInfo(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
