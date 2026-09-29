import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#07111F', panel:'#0D1B2E', line:'#20334B', sky:'#60B7FF', cloud:'#D8E9F8', amber:'#FFB84D' }, boxShadow: { glow:'0 10px 45px rgba(63,154,238,.18)' } } }, plugins: [] };
export default config;
