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

  const selectedRepos = repos.slice(0, maxRepos);
  
  // -- TASARIM KISMI BAŞLANGICI --
  // .map yerine döngü ile TEK BİR tablo oluşturuyoruz.
  // Bu sayede "list" değişkeni düzgün bir HTML yapısı tutacak.
  
  let list = `<table width="100%">\n`;

  for (let i = 0; i < selectedRepos.length; i += 2) {
    const repo1 = selectedRepos[i];
    const repo2 = selectedRepos[i + 1];

    list += `  <tr>\n`;
    
    // 1. Repo (Sol Taraf)
    list += `    <td width="50%" align="center">\n`;
    list += `      <a href="${repo1.html_url}">\n`;
    list += `        <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo1.name}&theme=radical" />\n`;
    list += `      </a>\n`;
    list += `    </td>\n`;

    // 2. Repo (Sağ Taraf - Varsa)
    if (repo2) {
      list += `    <td width="50%" align="center">\n`;
      list += `      <a href="${repo2.html_url}">\n`;
      list += `        <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo2.name}&theme=radical" />\n`;
      list += `      </a>\n`;
      list += `    </td>\n`;
    } else {
      list += `    <td width="50%"></td>\n`; // Boş hücre (hizalama bozulmasın diye)
    }

    list += `  </tr>\n`;
  }
  
  list += `</table>`; 
  // -- TASARIM KISMI BİTİŞİ --


  // BURASI SENİN ORİJİNAL KODUN (Mantığı bozmadık)
  const readme = fs.readFileSync("README.md", "utf-8");
  
  // Senin kullandığın regex ve replace mantığı aynen duruyor
  const updated = readme.replace(
    /[\s\S]*/,
    `\n${list}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});
