
const fs = require("fs");
const https = require("https");

const username = "erogluyusuf"; // GitHub kullanıcı adın
const maxRepos = 6; // En fazla kaç proje gösterilsin

function fetchRepos(callback) {
  const options = {
    hostname: "api.github.com",
    path: `/users/${username}/repos?sort=updated`,
    method: "GET",
    headers: { "User-Agent": "Node.js" }
  };

  const req = https.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      try {
        const repos = JSON.parse(body);
        callback(repos);
      } catch (error) {
        console.error("JSON parse error:", error);
      }
    });
  });

  req.on("error", (e) => console.error("Request error:", e));
  req.end();
}

fetchRepos((repos) => {
  if (!repos || repos.length === 0) {
    console.log("No repositories found or failed to fetch data.");
    return;
  }

const list = repos
  .slice(0, maxRepos)
  .map((repo, index) => {
    return `
<div align="center">
  <samp>
    <b>${(index + 1).toString().padStart(2, '0')}</b> —————————————————— 🛠️ <b>${repo.name.toUpperCase()}</b>
    <br />
    <kbd>${repo.language || 'SYSTEM'}</kbd> ❯❯ ${repo.description || 'No logs available for this module.'}
    <br />
    <span>LOC: <i>Calculating...</i> | STATUS: <font color="#2ea44f">STABLE</font> | ADDR: <a href="${repo.html_url}">source_code</a></span>
    <br />
    <br />
  </samp>
</div>`;
  })
  .join("\n");



  const readme = fs.readFileSync("README.md", "utf-8");
  const updated = readme.replace(
    /<!--START_SECTION:repos-->[\s\S]*<!--END_SECTION:repos-->/,
    `<!--START_SECTION:repos-->\n${list}\n<!--END_SECTION:repos-->`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});

