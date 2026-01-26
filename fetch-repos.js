const fs = require("fs");
const https = require("https");

const username = "erogluyusuf"; 
const maxRepos = 6; 

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
    console.log("No repositories found.");
    return;
  }

  // Kartları oluştur
  const repoCards = repos
    .slice(0, maxRepos)
    .map(
      (repo) => `
    <a href="${repo.html_url}">
      <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical" width="400" alt="${repo.name}" />
    </a>`
    )
    .join("\n");

  // Hepsini bir kutuya koy (Yan yana dizilmesi için)
  const finalContent = `
<div align="center">
${repoCards}
</div>
`;

  const readme = fs.readFileSync("README.md", "utf-8");

  // ⚠️ DÜZELTİLEN KISIM BURASI ⚠️
  // Tüm dosyayı değil, sadece iki etiket arasını seçiyoruz:
  const updated = readme.replace(
    /[\s\S]*?/,
    `\n${finalContent}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully (safe mode).");
});
