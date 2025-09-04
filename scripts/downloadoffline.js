document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("footer"))
    document.querySelector("footer").remove();
  const url = document.location.href;
  var a = fetch("header/offlineversion.json");
  console.log(a);
  if (url.startsWith("file:///")) {
    if (document.getElementById("downloadBtn")) {
      document.querySelector("a[href='tutorial.html']").remove();
    } else {
      document.querySelector("header").remove();
      document.querySelector("nav").style.position = "absolute";
      document.querySelector("nav").style.left = "0%";
      document.querySelector("nav").style.top = "0%";
      document.querySelector("nav").style.height = "100%";
      document.getElementById("downofflinebutton").remove();
    }
  }
});

async function baixarProjeto() {
  const zip = new JSZip();
  let html = document.documentElement.outerHTML;

  // Defina aqui os arquivos que você quer baixar
  const meusArquivos = [
    "edicao.html",

    "header/header.css",

    "styles/projects.css",
    "styles/edicao.css",

    "scripts/main.js",
    "scripts/projects.js",
    "scripts/edicao.js",
    "scripts/downloadoffline.js",

    "images/IFClogo.webp",

    "images/config.svg",
    "images/Forms/arrow.webp",
    "images/Forms/Circulo.svg",
    "images/Forms/Quadrado.svg",
    "images/Forms/star.webp",
    "images/Forms/Texto.svg",
    "images/Forms/triangle.webp",
    "images/logo32x32.webp",
    "images/logo32x32.jpg",
    "bloxy.jpg",

    "images/lixeira.png",

    "header/Roboto/static/Roboto-Bold.ttf",
    "header/Fredoka/static/Fredoka-Bold.ttf",
    "header/Fredoka/static/Fredoka-Light.ttf",

    "libraries/aos.js",
    "libraries/aos.css",
    "libraries/fabric.min.js",

    "favicon.ico",
  ];

  async function baixarArquivo(url) {
    const response = await fetch(url);

    // Se for arquivo de texto
    if (url.match(/\.(html|css|js|svg)$/i)) {
      return await response.text();
    }

    // Se for imagem ou fonte (binário)
    return await response.arrayBuffer();
  }

  zip.file("header/offlineversion.json",  
    agora.getSeconds().toString().padStart(2, "0") +":" +agora.getMinutes().toString().padStart(2, "0") +":" +agora.getHours().toString().padStart(2, "0") +"/" +
    agora.getDate().toString().padStart(2, "0") +"/" +(agora.getMonth() + 1).toString().padStart(2, "0") +"/" +agora.getFullYear());
    
  for (const caminho of meusArquivos) {
    try {
      const conteudo = await baixarArquivo(caminho);
      zip.file(caminho, conteudo);

      // Corrige o HTML substituindo se encontrar a referência
      if (caminho.endsWith(".css")) {
        html = html.replace(
          new RegExp(`<link[^>]+${caminho}[^>]*>`, "i"),
          `<link rel="stylesheet" href="${caminho}">`
        );
      } else if (caminho.endsWith(".js")) {
        html = html.replace(
          new RegExp(`<script[^>]+${caminho}[^>]*></script>`, "i"),
          `<script src="${caminho}"></script>`
        );
      }
    } catch (err) {
      console.warn("Erro ao baixar:", caminho, err);
    }
  }

  zip.file("projects.html", html);

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "Artephy.zip");
  });
}
