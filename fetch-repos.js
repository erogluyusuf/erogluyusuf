
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

const list = `
\`\`\`zsh
erogluyusuf:~/projects $ list-active-repositories --limit=${maxRepos}

${repos.slice(0, maxRepos).map(repo => {
  const date = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `[EXE] ${repo.name.padEnd(25)} | ${repo.language || 'Plain'} | Last_Update: ${date}
      ┗━━> ${repo.html_url}`;
}).join('\n')}

[SYSTEM] Status: All systems operational.
\`\`\`
`;



  const readme = fs.readFileSync("README.md", "utf-8");
  const updated = readme.replace(
    /<!--START_SECTION:repos-->[\s\S]*<!--END_SECTION:repos-->/,
    `<!--START_SECTION:repos-->\n${list}\n<!--END_SECTION:repos-->`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});

