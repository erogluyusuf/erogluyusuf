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

  // --- TASARIM DEĞİŞİKLİĞİ BURADA ---
  // Tablo yerine 'div' ve 'img' kullanıldı.
  // Bu sayede projeler alt alta değil, yan yana dizilecek.
  const list = repos
    .slice(0, maxRepos)
    .map(
      (repo) => `
    <a href="${repo.html_url}">
      <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=radical" height="120" alt="${repo.name}" />
    </a>
`
    )
    .join("\n");
  
  // Tüm kartları ortalanmış bir div içine alıyoruz
  const finalContent = `<div align="center">\n${list}\n</div>`;

  const readme = fs.readFileSync("README.md", "utf-8");
  
  // Regex ile iki yorum satırı arasını bulup güncelliyoruz.
  // Tagları (START ve END) koruyarak içine yeni listeyi yazıyoruz.
  const updated = readme.replace(
    /[\s\S]*/,
    `\n${finalContent}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});
