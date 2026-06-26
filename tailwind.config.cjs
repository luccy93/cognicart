module.exports = {
content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
theme: {
extend: {
colors: {
gear: {
bg: '#0C0C0E',
surface: '#1A1A1F',
card: 'rgba(255,255,255,0.05)',
primary: '#FF5C00',
secondary: '#00D9FF',
metallic: '#C0C0C8',
success: '#22C55E',
warning: '#F59E0B',
danger: '#EF4444',
text: '#F0F0F0',
muted: '#A0A0A0',
},
},
fontFamily: {
heading: ['Bebas Neue', 'sans-serif'],
display: ['Barlow Condensed', 'sans-serif'],
body: ['Inter', 'sans-serif'],
},
boxShadow: {
glass: '0 8px 32px rgba(0,0,0,0.5)',
neon: '0 0 40px rgba(255,92,0,0.15)',
neonBlue: '0 0 40px rgba(0,217,255,0.15)',
glow: '0 0 60px rgba(255,92,0,0.08)',
card: '0 4px 24px rgba(0,0,0,0.4)',
},
backgroundImage: {
'gear-gradient': 'linear-gradient(135deg, #FF5C00 0%, #FF8C42 100%)',
'gear-gradient-blue': 'linear-gradient(135deg, #00D9FF 0%, #0099CC 100%)',
'gear-dark': 'linear-gradient(180deg, #0C0C0E 0%, #121214 100%)',
},
},
},
plugins: [],
}
