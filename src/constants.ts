import { Milestone, Post, Game } from './types';

export const MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    description: 'Leading architectural decisions for scale-up fintech platform.',
    date: 'Current Position',
    status: 'current',
  },
  {
    id: '2',
    title: 'Open Source Contributor',
    description: 'Top 5% contributor to React ecosystem core libraries.',
    date: 'April 2023',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Engineering Lead',
    description: 'Managed a distributed team of 12 across 3 timezones.',
    date: 'January 2022',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Chief Technology Officer',
    description: 'Strategic leadership and technical vision.',
    date: 'Planned',
    status: 'planned',
  },
];

export const POSTS: Post[] = [
  {
    id: '1',
    author: 'Marcus Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHqsGdk3cj5cCEKonSidO3jhmNWHrcvgjuNoc3b4w7LPvl4_i0sC5JzTdxAl_OPYyA-w3iFTU31BPeFPOR0zKUiUwoCobqWgzA5wwFzGVnAG0ULTAjUJEPsUYw3irbwWRSasEgozFvUUuvuqdFivrOrQVD332nofEpZsvuSGCBErF7-VjIk4jDpBWIh-GkbQjlPIpLB_DrQBov1uGreEYg8pqaxJwVnj0ha0i-tFhcCqujnW7_0YNEYjpggfNLL6gFdvOsLuIrQ',
    content: 'Just completed the advanced AI path. The final challenge on neural architecture was intense but the tactical roadmap really helped. #FutureBound',
    timestamp: '2 hours ago',
    likes: 12,
    comments: 4,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB2irx8CSMPUiB2ZClwzK4kB4PUH403ZKUJMoh_umeKy5Tzyi5zG6og7mhPsNzNMQffyhaoW6EY7Kmg04l90UnVnKBw30yMn4n2HyH-iMTYj-vivaG_dxYq-bUS_OC-ly7iEvBgx7CFINPBolMBfJCyPr6cg_p4f6uFtM_6fZmHdzUque1ADPIAKChW7ooBUHuJoVtxo2-9fRD7OsCR757sHhDeM-3L4DdUXFXqLfPnUcC3ncU0sBROsILkZNKD-TK0aJLT7PmbBw'],
  },
  {
    id: '2',
    author: 'Elena Vance',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL3z1hf8sevlhvnk949INkEDvpI0m---EV6WiU7p8ZFJo0_ybxXHHa-8i58kIyFiP0xFYMIQJih3qyGY4DatPk2wqi7OjgInUJlimexQMAdm_3Ik9AN_53qXczsOxsXFmNi3W1cVeaMTNdzA3Qo9VmmTFX3N1ZIYOtJMyvXDJyW3yJmnIql8vSUfI4zcJ345xArEnpcWtKZt_FdB6xwffvmWsjqBtsNPQDx7eMV2aMKS3nzC_YQaZZEAHqCUJuHduerquB4eb5sg',
    content: 'Field research from the Neo-Tokyo district. The kinetic signage here is exactly what we were discussing in the urban design module.',
    timestamp: '5 hours ago',
    likes: 24,
    comments: 8,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6R8BUWjBwvSfV6Hte8C2IUofenQOo2qEoEP0GPWyGJaRryLunW1onG9LJF5ye35KZYIiORerpz7s4YUgF3EF9XmDEO7yHZ5XdfmcTtOxDFGxkQmHn0YW0Z0AZND3ZkEhSsaUsKKq6qpdRU3v41Kj_FYWsvAlPUFxfTIzgamcO0OICutmGcBqTlVssdKcCZHeAl_DVdrUPE0GB_6tRmmDAylHr_g0vQXsg6wXyk1iIFqyLzlckTKr3XxzKEsc595ADKem2GnCbVw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA973SJLoTZu7gMuPUpSCH_ZvQMlsvir7hSqd7nE6ixSTEYj6VJ2aN3DbisIf1MMs0X9x1zCQaqtwKs0y42-v7Btysx57UuhwQKEf6XOPisl2t3q8ztqwXNVWarHsleyM5XEhyk_u1dNf49Ens1-wQRowSGxFaNHkyw-HDOZRCP_0rzpmj1koo2MV26d3ipZtbKyXDv_mrV95E9r2bZy7WGDRtJHjdPCADMf_QuZlrm234IU1Lvxp-F1kAGkWiMKhcj1NAtko1o1A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4P3XsYYNbkB5k1Bmy0w4EqIMDgkKRn9wTAX4ftw0r-1_U1q5ZjzXztSjSk89H59VEmrlQEjinMGuBeUp3pw57IM-awU_2vOCqc_ci00iJRoWzjHV-mRqKtKTxP7WZPVjTnCxGMlqXbRJ1e8s8p69XHHPbId2ervAfwbJG7svt_h4vZIvp-AJD_YT6rTEEAjjELPZaGrxYAsRcO0AI6zQCU-eOq3wpDrFa1U1_46KDBuAyxX3A94XWZ6pyLlXR-igAWt8Gtq8v7w',
    ],
  },
  {
    id: '3',
    author: 'Jordan Smith',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAErHXYBkD2F4UrLAGUTy9emaREGQYqsovq7VhAhdmMsAMH0Bwlu3t1rGs1_7c9U1uTXNWH2d1gcR9FbJNR00SBmWewmdGmtWRJwOsbFsTNE2dbmLiMaVV1J1mgqYEyZqHmnXdSmV5x3TlvgtK8Lb0Ivk5jUJBiNAEqO6Eozrjt5t4ZjhzqkWfxyju8E6izl0-Cu-NxobdzRgx_j7NFFPNldITH_n8NxSuVR0Cy36gEG8yzXBrpEMorhEMq2VPcUw72Ai_O4tGs9w',
    content: '"The map is not the territory, but the kinetic path reveals the destination." — Feeling inspired by the new curriculum update.',
    timestamp: 'Yesterday',
    likes: 5,
    comments: 1,
  },
];

export const GAMES: Game[] = [
  {
    id: '1',
    title: '2048 Classic',
    category: 'Puzzle',
    stats: { label: 'Best', value: '16,384' },
    color: 'from-amber-400 to-yellow-200',
    icon: 'grid_on',
  },
  {
    id: '2',
    title: 'Pro Sudoku',
    category: 'Logic',
    stats: { label: 'Rank', value: 'Expert' },
    color: 'from-blue-500 to-cyan-300',
    icon: 'grid_on',
  },
  {
    id: '3',
    title: 'Block Fall',
    category: 'Arcade',
    stats: { label: 'High', value: '45,000' },
    color: 'from-purple-600 to-pink-400',
    icon: 'widgets',
  },
  {
    id: '4',
    title: 'Mine Finder',
    category: 'Strategy',
    stats: { label: 'Mode', value: 'Extreme' },
    color: 'from-emerald-600 to-green-300',
    icon: 'explosion',
  },
];
