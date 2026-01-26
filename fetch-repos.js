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

  // Sadece ilk 6 repoyu al
  const selectedRepos = repos.slice(0, maxRepos);

  // Tablo başlangıcı (Hizalama ve genişlik ayarlı)
  let tableContent = `<table width="100%">\n`;

  // Her satırda 2 repo olacak şekilde döngü kuruyoruz
  for (let i = 0; i < selectedRepos.length; i += 2) {
    const repo1 = selectedRepos[i];
    const repo2 = selectedRepos[i + 1]; // Çift sayıdaysa 2. eleman, yoksa undefined

    tableContent += `  <tr>\n`;

    // 1. Sütun
    tableContent += `    <td width="50%" align="center">\n`;
    tableContent += `      <a href="${repo1.html_url}">\n`;
    // Kartın gölge efektini artırmak ve arka planı kaldırmak için parametreler eklendi
    tableContent += `        <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo1.name}&theme=radical&bg_color=0d1117&border_radius=10" />\n`;
    tableContent += `      </a>\n`;
    tableContent += `    </td>\n`;

    // 2. Sütun (Eğer repo varsa)
    if (repo2) {
      tableContent += `    <td width="50%" align="center">\n`;
      tableContent += `      <a href="${repo2.html_url}">\n`;
      tableContent += `        <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo2.name}&theme=radical&bg_color=0d1117&border_radius=10" />\n`;
      tableContent += `      </a>\n`;
      tableContent += `    </td>\n`;
    } else {
      // Eğer tek sayıda repo varsa, boş bir hücre ekle ki tablo bozulmasın
      tableContent += `    <td width="50%"></td>\n`;
    }

    tableContent += `  </tr>\n`;
  }

  tableContent += `</table>`;

  const readme = fs.readFileSync("README.md", "utf-8");
  
  // Regex ile mevcut bloğu bul ve yeni tablo ile değiştir
  const updated = readme.replace(
    /[\s\S]*/,
    `\n${tableContent}\n`
  );

  fs.writeFileSync("README.md", updated, "utf-8");
  console.log("README.md updated successfully with repositories.");
});
