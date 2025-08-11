function back() {
  window.location.href = "./projects.html";
}

function dialog(paragrafo, lista_buttons, keys, callback) {
  // detectar teclas
  function keyHandler(keypressed) {
    if (keypressed.key in keys) {
      call(Object.keys(keys).indexOf(keypressed["key"]));
    }
  }

  // função de retorno com a opção escolhida
  function call(i) {
    callback(i);
    dialog.style.zIndex = -1;
    document.removeEventListener("keydown", keyHandler);
  }

  var dialog = document.getElementById("dialog");
  dialog.style.zIndex = 9999;
  dialog.querySelector("div").innerHTML = "<p></p>";
  dialog.querySelector("p").textContent = paragrafo;

  // função para receber teclas também
  document.addEventListener("keydown", keyHandler);

  // detectar click dos botões
  for (let i = 0; i < lista_buttons.length; i++) {
    var buttonelement = document.createElement("button");
    buttonelement.innerHTML =
      lista_buttons[i] +
      " <span style='font-size: 50%;'>(" +
      Object.keys(keys)[i] +
      ")</span>";
    dialog.querySelector("div").appendChild(buttonelement);

    buttonelement.addEventListener("click", () => {
      call(i);
    });
  }
}

function RemoveItem(item) {
  dialog(
    "Deseja realmente apagar esse item para sempre?",
    ["Apagar", "Cancelar"],
    { Enter: true, Escape: true },
    (indice) => {
      if (indice == 0) {
        let ProjectOpen = profileData["Projetos"][ProjectName];
        // deletar do cache
        let nome = item.parentElement.getAttribute("name");
        delete imageData["images"][nome];

        // deletar do projeto
        delete ProjectOpen["items"][nome];

        // recarregar a parte das camadas
        LoadProject("all");
      }
    }
  );
}

async function LoadProject(parttoload) {
  let ProjectOpen = profileData["Projetos"][ProjectName];

  // camadas
  if (parttoload == "camadas" || parttoload == "all") {
    while (document.getElementById("container-items").children.length - 2) {
      document.getElementById("container-items").lastChild.remove();
    }
    var _;
    Object.keys(ProjectOpen["items"]).forEach((_) => {
      var cam = document
        .getElementsByClassName("container-items-item")[0]
        .cloneNode(true);

      let imageBas64 = imageData["images"][ProjectOpen["items"][_]["nome"]];

      cam.style.display = "";

      if (ProjectOpen["items"][_]["type"] == "img") {
        cam.querySelector("p").textContent = ProjectOpen["items"][_]["nome"];
        cam.querySelectorAll("img")[0].src = imageBas64;
      } else {
        cam.querySelector("p").textContent = ProjectOpen["items"][_]["nome"];
        cam.querySelectorAll("img")[0].src = "";
      }

      cam.setAttribute("name", ProjectOpen["items"][_]["nome"]);
      cam.setAttribute(
        "onmouseup",
        "if (document.getElementById('selected')) {document.getElementById('selected').removeAttribute('id');} this.setAttribute('id','selected'); ShowPropriets(); LoadProject('efeitos');"
      );
      cam
        .querySelectorAll("img")[1]
        .setAttribute("onclick", "RemoveItem(this);");

      if (document.getElementById("selected"))
        document.getElementById("selected").removeAttribute("id");
      cam.setAttribute("id", "selected");

      document.getElementById("container-items").appendChild(cam);
    });
    ShowPropriets();
  }
  if (parttoload == "imagem" || parttoload == "all") {
    document.getElementById("imagespace").innerHTML = "";
    var _;
    Object.keys(ProjectOpen["items"]).forEach((_) => {
      var itemelement;

      if (ProjectOpen["items"][_]["type"] == "img") {
        itemelement = document.createElement("img");
        let imageBas64 = imageData["images"][ProjectOpen["items"][_]["nome"]];
        itemelement.src = imageBas64;
      } else {
        itemelement = document.createElement("div");
      }
      let cssitem = ProjectOpen["items"][_]["css"];

      let csstext = "";
      // adicionar css de posição tamanho e rotação
      Object.keys(cssitem).forEach((atribute) => {
        csstext += atribute + ":" + cssitem[atribute] + ";";
      });

      const efeitos = {
        Brilho: ["brightness()", "%", 1, [100], "filter"],
        ["Escala preto e branco"]: ["grayscale()", "%", 1, [0], "filter"],
        Desfoque: ["blur()", "px", 1, [0], "filter"],
        Contraste: ["contrast()", "%", 1, [0], "filter"],
        Saturação: ["saturate()", "%", 1, [100], "filter"],
        ["Inverter Cores"]: ["invert()", "%", 1, [0], "filter"],
      };

      // adicionar efeitos
      csstext += "filter:";
      Object.keys(ProjectOpen["items"][_]["efeitos"]).forEach((key) => {
        let atribute = ProjectOpen["items"][_]["efeitos"][key];

        let formatedtext = "";
        atribute[3].forEach((valor) => {
          formatedtext += valor + atribute[1] + ",";
        });

        csstext += atribute[0].replace("()", "(" + formatedtext + ") ");
        csstext = csstext.replace(",)", ")");
        console.log(csstext);
      });
      csstext += ";";
      console.log(csstext);

      itemelement.setAttribute("style", csstext);
      itemelement.style.zIndex = ProjectOpen["items"][_]["ordem"];

      itemelement.setAttribute("onmousedown", "console.log('a')");

      document.getElementById("imagespace").prepend(itemelement);
    });
    ShowPropriets();
  }
  if (parttoload == "efeitos" || parttoload == "all") {
    while (document.getElementById("container-efeitos").children.length - 2) {
      document.getElementById("container-efeitos").lastChild.remove();
    }

    let imagemaberta;
    if (document.getElementById("selected"))
      imagemaberta = document
        .getElementById("selected")
        .querySelector("p").textContent;

    if (ProjectOpen["items"][imagemaberta] != undefined) {
      let efeitos = ProjectOpen["items"][imagemaberta]["efeitos"];
      Object.keys(efeitos).forEach((efeito) => {
        let effectContainer = document
          .getElementById("container-efeito")
          .cloneNode(true);
        effectContainer.querySelector("h1").textContent = efeito;
        effectContainer.style.display = "flex";
        document
          .getElementById("container-efeitos")
          .appendChild(effectContainer);

        // evento de escuta para poder alterar a propriedade da imagem
        effectContainer
          .querySelector("input")
          .setAttribute("oninput", "ChangeEffect(this, 0)");
      });
    }
  }

  // salvar o projeto ao carrega-lo
  profileData["Projetos"][ProjectName] = ProjectOpen;
  WriteStore(dbs[0], profileData);
  WriteStore(dbs[1], imageData);
}

function ChangeEffect(elementoinput, indice) {
  let valor = elementoinput.value;
  let ProjectOpen = profileData["Projetos"][ProjectName];
  ProjectOpen["items"][
    document.getElementById("selected").getAttribute("name")
  ]["efeitos"][elementoinput.parentElement.querySelector("h1").textContent][3][
    indice
  ] = valor;

  LoadProject("imagem");
}

function AppendDraw(i) {
  let variations = {
    Quadrado: {
      "background-color": "#FFFFFF",
      left: "50%",
      top: "50%",
      height: "25%",
      width: "25%",
      "border-radius": "0px",
      "aspect-radio": "1/1",
    },
    Circulo: {
      "background-color": "#FFFFFF",
      left: "50%",
      top: "50%",
      height: "25%",
      width: "25%",
      "border-radius": "100%",
    },
    Linha: {
      "background-color": "#FFFFFF",
      left: "50%",
      top: "50%",
      height: "25%",
      width: "25%",
    },
  };

  let desenho = Object.keys(variations)[i];

  let ProjectOpen = profileData["Projetos"][ProjectName];

  let len;
  let nome;
  let num = 1;
  while (true) {
    len = Object.keys(ProjectOpen["items"]).length + num;
    nome = desenho + " (" + len + ")";
    if (!Object.keys(ProjectOpen["items"]).includes(nome)) {
      break;
    }
    num++;
  }

  ProjectOpen["items"][nome] = {
    type: "draw",
    nome: nome,
    ordem: 0,
    efeitos: {},
    css: variations[desenho],
  };

  LoadProject("all");
}

async function UploadImage(imageFiles) {
  let ProjectOpen = profileData["Projetos"][ProjectName];

  for (let i = 0; i < imageFiles.length; i++) {
    let imagemfile = imageFiles[i];

    // salvar imagem no cache
    imageData["images"][imagemfile["name"]] = await imageToBase64(imagemfile);

    let nome = imagemfile["name"];
    ProjectOpen["items"][nome] = {
      type: "img",
      nome: imagemfile["name"],
      efeitos: {},
      ordem: 0,
      css: {
        "background-color": "#FFFFFF",
        left: "50%",
        top: "50%",
        height: "25%",
        width: "25%",
        "border-radius": "0%",
      },
    };
  }
  LoadProject("all");
}

function ShowPropriets() {
  let ProjectOpen = profileData["Projetos"][ProjectName];
  let name;
  if (document.getElementById("selected")) {
    name = document.getElementById("selected").getAttribute("name");
  } else {
    document.getElementById("container-selected").style.display = "none";
    document.getElementById("container-efeitos").style.display = "none";
    return;
  }

  if (name != null) {
    document.getElementById("container-efeitos").style.display = "block";
    document.getElementById("container-selected").style.display = "block";
    document.getElementById("container-selected").setAttribute("name", name);
    document
      .getElementById("container-selected")
      .querySelector("h1").textContent = name;

    var imagemname = ProjectOpen["items"][name]["nome"];

    inputstypes = [
      "left",
      "top",
      "height",
      "width",
      "background-color",
      "border-radius",
    ];

    // ajustar os valores dos inputs
    var i = 0;
    inputstypes.forEach((propriety) => {
      document.getElementById("container-selected").querySelectorAll("input")[
        i
      ].value =
        ProjectOpen["items"][imagemname]["css"][propriety].split("%")[0];
      i++;
    });
  }
}

function changePropriet(input, propriety) {
  let valor = input.value;
  let nome = input.parentElement.getAttribute("name");

  let ProjectOpen = profileData["Projetos"][ProjectName];

  Object.keys(ProjectOpen["items"]).forEach((imagem) => {
    if (ProjectOpen["items"][imagem]["nome"] == nome) {
      if (propriety == "background-color") {
        ProjectOpen["items"][imagem]["css"][propriety] = valor;
      } else {
        ProjectOpen["items"][imagem]["css"][propriety] = valor + "%";
      }
    }
  });
  LoadProject("imagem");
}

function RemoveEffect(element) {
  dialog(
    "Deseja realmente apagar esse efeito?",
    ["Apagar", "Cancelar"],
    { Enter: true, Espace: true },
    (indice) => {
      if (indice == 0) {
        let ProjectOpen = profileData["Projetos"][ProjectName];
        let nameeffect = element.parentElement.querySelector("h1").textContent;

        delete ProjectOpen["items"][
          document.getElementById("selected").getAttribute("name")
        ]["efeitos"][nameeffect];

        LoadProject("all");
      } else {return}
    }
  );
}
function AddEffect() {
  let ProjectOpen = profileData["Projetos"][ProjectName];
  const efeitos = {
    Brilho: ["brightness()", "%", 1, [100], "filter"],
    ["Escala preto e branco"]: ["grayscale()", "%", 1, [0], "filter"],
    Desfoque: ["blur()", "px", 1, [0], "filter"],
    Contraste: ["contrast()", "%", 1, [0], "filter"],
    Saturação: ["saturate()", "%", 1, [100], "filter"],
    ["Inverter Cores"]: ["invert()", "%", 1, [0], "filter"],
  };

  dialog(
    "Deseja inserir que efeito?",
    ["Cancelar", ...Object.keys(efeitos)],
    {
      Escape: true,
      q: true,
      w: true,
      e: true,
      a: true,
      s: true,
      d: true,
    },
    (indice) => {
      if (indice == 0) return;
      let efeito = efeitos[Object.keys(efeitos)[indice - 1]];
      let nomeefeito = Object.keys(efeitos)[indice - 1];

      let nome = document
        .getElementById("selected")
        .querySelector("p").textContent;
      nome = ProjectOpen["items"][nome]["nome"];

      if (!ProjectOpen["items"][nome]["efeitos"][nomeefeito])
        ProjectOpen["items"][nome]["efeitos"][nomeefeito] = efeito;
      LoadProject("all");
    }
  );
}

const ProjectName = window.location.search.slice(1, LimitCharsInName);
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("Backbtn2").textContent += " - " + ProjectName;

  document.getElementById("Backbtn1").addEventListener("click", back);
  document.getElementById("Backbtn2").addEventListener("click", back);

  if (ProjectName != "") {
    setTimeout(LoadProject, 30, "all");
  } else {
    alert("Projeto não existe!");
    back();
  }

  document.addEventListener("keydown", (key) => {
    if (key.key == "Escape") {
      document.getElementById("container-selected").style.display = "none";
      document.getElementById("container-efeitos").style.display = "none";
      if (document.getElementById("selected"))
        document.getElementById("selected").removeAttribute("id");
      if (document.getElementById("selectedImage"))
        document.getElementById("selectedImage").removeAttribute("id");
    }
  });

  // adicionar camadas.
  document
    .getElementById("container-items-info")
    .querySelector("button")
    .addEventListener("click", () => {
      dialog(
        "Oque deseja inserir?",
        ["Imagem", "Forma", "Cancelar"],
        { 1: true, 2: true, Escape: true },
        (indice) => {
          if (indice == 0) {
            document.getElementById("fileuploader").click();
          } else if (indice == 1) {
            setTimeout(() => {
              dialog(
                "Qual Forma?",
                ["Quadrado", "Circulo", "Linha", "Cancelar"],
                { 1: true, 2: true, 3: true, 4: true, Escape: true },
                (indice1) => {
                  if (indice1 != 4) {
                    AppendDraw(indice1);
                  }
                }
              );
            }, 10);
          }
        }
      );
    });
});
