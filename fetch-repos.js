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

  // 1. ADIM: Her repoyu sadece bir Link ve Resim olarak hazırla (Tabloyu kaldırdık)
  const repoCards = repos
    .slice(0, maxRepos)
    .map(
      (repo) => `
  <a href="${repo.html_url}">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical" width="400" alt="${repo.name}" />
  </a>`
    )
    .join("\n");

  // 2. ADIM: Tüm kartları tek bir ortalanmış DIV içine al
  // Bu sayede ekran genişliğine göre yan yana dizilirler.
  const finalContent = `
<div align="center">
${repoCards}
</div>
`;

  const readme = fs.readFileSync("README.md", "utf-8");
  
  // 3. ADIM: README dosyasındaki alanı güncelle
  const updated = readme.replace(
    /[\s\S]*/,
    `\n${finalContent}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});
