/**
 * Checagem ao vivo do LoL — rode DURANTE uma partida para ver o que a Riot
 * API reporta (útil para conferir modos novos, ex.: ARAM: Desordem/Mayhem).
 *
 *   node scripts/check-lol-live.mjs
 *
 * Lê RIOT_API_KEY e LOL_RIOT_ID do .env.local. Não imprime a API key.
 */
import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const apiKey = env.RIOT_API_KEY;
const [gameName, tagLine] = (env.LOL_RIOT_ID ?? '').split('#');
if (!apiKey || !gameName || !tagLine) {
  console.error('RIOT_API_KEY ou LOL_RIOT_ID ausentes/inválidos no .env.local');
  process.exit(1);
}

const REGIONAL = 'https://americas.api.riotgames.com';
const PLATFORM = 'https://br1.api.riotgames.com';

// Espelho do QUEUE_LABELS de src/lib/lol.ts + tabela oficial
// https://static.developer.riotgames.com/docs/lol/queues.json
const QUEUE_LABELS = {
  400: 'Normal',
  420: 'Ranked Solo',
  430: 'Normal Blind',
  440: 'Ranked Flex',
  450: 'ARAM',
  480: 'Swiftplay',
  490: 'Quickplay',
  720: 'ARAM Clash',
  900: 'URF',
  1020: 'One for All',
  2400: 'ARAM: Desordem (Mayhem)',
};

const get = async (url) => {
  const r = await fetch(url, { headers: { 'X-Riot-Token': apiKey } });
  if (r.status === 404) return null;
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} em ${url.replaceAll(apiKey, '***')}`);
  }
  return r.json();
};

const account = await get(
  `${REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName,
  )}/${encodeURIComponent(tagLine)}`,
);
if (!account) {
  console.error(`Conta ${gameName}#${tagLine} não encontrada.`);
  process.exit(1);
}
console.log(`Conta: ${account.gameName}#${account.tagLine}`);

// 1) Partida ao vivo (spectator-v5)
const live = await get(
  `${PLATFORM}/lol/spectator/v5/active-games/by-summoner/${account.puuid}`,
);
if (live) {
  const label = QUEUE_LABELS[live.gameQueueConfigId] ?? '(fila não mapeada)';
  console.log('\n🎮 EM PARTIDA AGORA:');
  console.log(`   gameMode           = ${live.gameMode}`);
  console.log(`   gameQueueConfigId  = ${live.gameQueueConfigId}  →  ${label}`);
  console.log(`   duração            = ${Math.floor(live.gameLength / 60)}min`);
  if (!QUEUE_LABELS[live.gameQueueConfigId]) {
    console.log(
      '   ⚠️ fila não está no QUEUE_LABELS de src/lib/lol.ts — vale adicionar.',
    );
  }
} else {
  console.log('\nNão está em partida agora (spectator retornou 404).');
}

// 2) Últimas partidas no histórico (match-v5) — para comparar depois do jogo
const ids =
  (await get(
    `${REGIONAL}/lol/match/v5/matches/by-puuid/${account.puuid}/ids?count=3`,
  )) ?? [];
console.log('\nÚltimas 3 partidas no match-v5 (histórico):');
for (const id of ids) {
  const m = await get(`${REGIONAL}/lol/match/v5/matches/${id}`);
  if (!m) continue;
  const label = QUEUE_LABELS[m.info.queueId] ?? '(fila não mapeada)';
  const end = new Date(m.info.gameEndTimestamp).toISOString().replace('T', ' ').slice(0, 16);
  console.log(
    `   ${id}  queueId=${m.info.queueId} (${label})  mode=${m.info.gameMode}  fim=${end}`,
  );
}
console.log(
  '\nDica: se a partida ao vivo apareceu acima mas nunca entra no histórico,',
);
console.log(
  'a Riot ainda não indexou esse modo no match-v5 (comum em modos recém-lançados).',
);
