const sharp = require('sharp');

const svg = Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#1a2a4a'/>
      <stop offset='1' stop-color='#4a6fa5'/>
    </linearGradient>
  </defs>
  <rect width='180' height='180' rx='36' fill='url(#g)'/>
  <text x='90' y='122' font-family='Arial' font-size='90' font-weight='bold' fill='#7dd3fc' text-anchor='middle'>AI</text>
</svg>`);

(async () => {
  await sharp(svg).png().toFile('source/img/favicon.png');
  await sharp(svg).resize(32, 32).png().toFile('source/img/favicon-32.png');
  console.log('favicon done');
})();
