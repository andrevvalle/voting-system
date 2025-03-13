const http = require('http');
const { v4: uuidv4 } = require('uuid');

const VOTES_PER_SECOND = 1000;
const TEST_DURATION_SECONDS = 60;
const TARGET_HOST = 'localhost';
const TARGET_PORT = 4000;
const TARGET_PATH = '/vote';

let totalVotes = 0;
let successCount = 0;
let errorCount = 0;
let startTime = null;

function sendVote() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      userId: `user-${Math.floor(Math.random() * 10000)}`,
      participantId: process.env.PARTICIPANT_ID || "899b6b54-a830-4ea9-af0a-38dfc1a65765",
      pollId: process.env.POLL_ID || "c4fea7bb-1354-40e5-9c54-bab474905a84"
    });
    
    const options = {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: TARGET_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let response = '';
      res.on('data', (chunk) => { response += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          resolve({ 
            success: false, 
            statusCode: res.statusCode,
            response
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}

async function sendBatch(voteCount) {
  const promises = [];
  
  for (let i = 0; i < voteCount; i++) {
    promises.push(sendVote());
  }
  
  const results = await Promise.allSettled(promises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successCount++;
      } else {
        errorCount++;
        if (result.value.statusCode === 429) {
          console.log('Rate limit atingido');
        } else {
          console.error(`Erro: ${result.value.statusCode || result.value.error}`);
        }
      }
    } else {
      errorCount++;
      console.error(`Falha na requisição: ${result.reason}`);
    }
  }
  
  totalVotes += voteCount;
}

async function runTest() {
  console.log(`
===============================================
  TESTE DE CARGA - SISTEMA DE VOTAÇÃO
===============================================
Configuração:
- Votos por segundo: ${VOTES_PER_SECOND}
- Duração do teste: ${TEST_DURATION_SECONDS} segundos
- Endpoint: http://${TARGET_HOST}:${TARGET_PORT}${TARGET_PATH}
===============================================
`);
  
  startTime = Date.now();
  const endTime = startTime + (TEST_DURATION_SECONDS * 1000);
  
  while (Date.now() < endTime) {
    const batchStart = Date.now();
    
    await sendBatch(VOTES_PER_SECOND);
    
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const votesPerSecond = Math.round(totalVotes / elapsedSeconds);
    const successRate = Math.round((successCount / totalVotes) * 100);
    
    process.stdout.write(`\rTempo: ${elapsedSeconds}s | Votos: ${totalVotes} | Taxa: ${votesPerSecond}/s | Sucesso: ${successRate}% | Erros: ${errorCount}   `);
    
    const processingTime = Date.now() - batchStart;
    if (processingTime < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - processingTime));
    }
  }
  
  const totalTime = (Date.now() - startTime) / 1000;
  const finalRate = Math.round(totalVotes / totalTime);
  
  console.log(`\n
===============================================
  RESULTADOS DO TESTE
===============================================
- Tempo total: ${totalTime.toFixed(2)} segundos
- Votos totais: ${totalVotes}
- Votos com sucesso: ${successCount} (${Math.round((successCount/totalVotes)*100)}%)
- Erros: ${errorCount} (${Math.round((errorCount/totalVotes)*100)}%)
- Taxa média: ${finalRate} votos/segundo
===============================================
`);
}

runTest().catch(error => {
  console.error('Erro no teste de carga:', error);
});