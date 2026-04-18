const https = require('https');

https.get('https://site.api.espn.com/apis/site/v2/sports/cricket/8039/scoreboard', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Events API 8039 (IPL limits check):', parsed.events ? parsed.events.length : 0, 'events.');
    } catch (e) { console.error('Parse error'); }
  });
}).on("error", (err) => { console.log("Error: " + err.message); });

https.get('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Soccer scoreboards:', parsed.events ? parsed.events.length : 0);
    } catch (e) {}
  });
});
