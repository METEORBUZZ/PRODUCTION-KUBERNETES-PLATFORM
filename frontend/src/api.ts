import { VoteData, SystemHealth, VersionInfo } from './types';

const API_BASE = '';

export async function fetchVotes(): Promise<VoteData> {
  const res = await fetch(`${API_BASE}/api/votes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch votes: ${res.statusText}`);
  }
  return await res.json();
}

export async function voteForCat(): Promise<VoteData> {
  const res = await fetch(`${API_BASE}/api/vote/cat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to cast vote for Cat: ${res.statusText}`);
  }
  return await res.json();
}

export async function voteForDog(): Promise<VoteData> {
  const res = await fetch(`${API_BASE}/api/vote/dog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to cast vote for Dog: ${res.statusText}`);
  }
  return await res.json();
}

export async function resetVotes(): Promise<VoteData> {
  const res = await fetch(`${API_BASE}/api/votes/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to reset votes: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchVersion(): Promise<VersionInfo> {
  const res = await fetch(`${API_BASE}/version`);
  if (!res.ok) {
    throw new Error(`Version check failed: ${res.statusText}`);
  }
  return await res.json();
}
