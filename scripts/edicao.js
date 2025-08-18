const efeitos = {
  Brilho: ["number",0, -1, 1],
  Desfoque: ["number",0, 0, 10],
  Contraste: ["number",0, -1, 1],
  ["Escala preto e branco"]: ["boolean", false],
  Saturação: ["number",0, -10, 10],
  ["Inverter Cores"]: ["boolean", false],
};
var ProjectName = window.location.search.slice(1, LimitCharsInName);
var ProjectOpen;

var imagespace;

function changeName() {
  dialog("Deseja trocar o nome do projeto?",["Sim","Não"],{ Enter: true, Escape: true }, (option)=>{
    if (option == 0) {
      let nome = prompt("Qual nome:")
      if (nome != null && nome != "") {
        if (nome.length > 3 && nome.length < 30) {
          nome = encodeURIComponent(nome)
          if (!Object.keys(profileData["Projetos"]).includes(nome)) {
            delete profileData["Projetos"][ProjectName]

            ProjectName = nome;

            profileData["Projetos"][ProjectName] = ProjectOpen;

            WriteStore(dbs[0], profileData);
            WriteStore(dbs[1], imageData);

            window.location.href = "edicao.html?"+nome;
          } else{
            alert("Você está colocando o mesmo nome para outro projeto!")
          }
        } else {
          setTimeout(() => {
            dialog("O nome tem que ter entre 3 à 30 letras!: "+nome.length+" letras",["Ok"],{ Enter: true },()=>{})
          }, 10);
        }
      }
    }
  })
}

function back() {
  window.location.href = "./projects.html";
}

function camadaClick(camadaelement) {
  if (document.getElementById("selected"))
    document.getElementById("selected").removeAttribute("id");

  camadaelement.setAttribute("id", "selected");
  ShowPropriets();
  LoadProject("efeitos");

  obj = imagespace
    .getObjects()
    .find((o) => o.name === camadaelement.getAttribute("name"));

  imagespace.setActiveObject(obj);
  imagespace.requestRenderAll();
}

function SaveOnChange(element) {
  if (element.type === "text") {
    // salvar texto corretamente
    ProjectOpen["items"][element.name]["css"]["fontSize"] = element.fontSize;
  } else {
    // salvar height/width para imagens e formas
    ProjectOpen["items"][element.name]["css"]["height"] = element.height * element.scaleY;
    ProjectOpen["items"][element.name]["css"]["width"] = element.width * element.scaleX;
  }

  ProjectOpen["items"][element.name]["css"]["scaleX"] = element.scaleX;
  ProjectOpen["items"][element.name]["css"]["scaleY"] = element.scaleY;

  ProjectOpen["items"][element.name]["css"]["left"] = element.left;
  ProjectOpen["items"][element.name]["css"]["top"] = element.top;
  
  ProjectOpen["items"][element.name]["css"]["rotation"] = element.angle;

  ProjectOpen["items"][element.name]["css"]["background-color"] = element.fill;

  ProjectOpen["items"][element.name]["ordem"] = element.camada;

  profileData["Projetos"][ProjectName] = ProjectOpen;
  LoadProject("camadas");
}

function dialog(paragrafo, lista_buttons, keys, callback) {
  // detectar teclas
  function keyHandler(keypressed) {
    if (Object.keys(keys).includes(keypressed.key)) {
      let index = Object.keys(keys).indexOf(keypressed.key);
      if (index >= 0) call(index);
    }
  }

  // função de retorno com a opção escolhida
  function call(i) {
    callback(i);
    dialogEl.style.zIndex = -1;
    document.removeEventListener("keydown", keyHandler);
  }

  let dialogEl = document.getElementById("dialog"); // Renomeado
  dialogEl.style.zIndex = 9999;
  dialogEl.querySelector("div").innerHTML = "<p></p>";
  dialogEl.querySelector("p").textContent = paragrafo;

  document.addEventListener("keydown", keyHandler);

  for (let i = 0; i < lista_buttons.length; i++) {
    let buttonelement = document.createElement("button");
    buttonelement.innerHTML =
      lista_buttons[i] +
      " <span style='font-size: 50%;'>(" +
      Object.keys(keys)[i] +
      ")</span>";
    dialogEl.querySelector("div").appendChild(buttonelement);

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
        let nome = item.parentElement.getAttribute("name");
        delete imageData["images"][nome];
        delete ProjectOpen["items"][nome];
        LoadProject("all");
      }
    }
  );
}

async function LoadProject(parttoload) {
  while (profileData === undefined) await new Promise(r => setTimeout(r, 10));
  while (imageData === undefined) await new Promise(r => setTimeout(r, 10));

  ProjectOpen = profileData["Projetos"][ProjectName];
  if (ProjectOpen["IsTempProject"]) {
    document.getElementById("Backbtn2").style.textDecoration = "line-through";
    document.getElementById("Backbtn2").style.color = "orange";
  } else {
    document.getElementById("disabletemp").style.display = "none"
  }

  // camadas
  let selectedelement = document.getElementById("selected");
  if (parttoload == "camadas" || parttoload == "all") {
    while (document.getElementById("container-items").children.length > 2) {
      document.getElementById("container-items").lastChild.remove();
    }
    Object.keys(ProjectOpen["items"]).forEach((key) => {
      let cam = document
        .getElementsByClassName("container-items-item")[0]
        .cloneNode(true);

      let imageBas64 = imageData["images"][ProjectOpen["items"][key]["nome"]];
      cam.style.display = "";

      if (ProjectOpen["items"][key]["type"] == "img") {
        cam.querySelector("p").textContent = ProjectOpen["items"][key]["nome"];
        cam.querySelectorAll("img")[0].src = imageBas64;
      } else {
        cam.querySelector("p").textContent = ProjectOpen["items"][key]["nome"];
        cam.querySelectorAll("img")[0].src = "";
      }

      cam.setAttribute("name", ProjectOpen["items"][key]["nome"]);
      if (selectedelement) {
        if (cam.getAttribute("name") == selectedelement.getAttribute("name")) {
          cam.setAttribute("id", "selected");
        }
      }
      cam.setAttribute("onmouseup", "camadaClick(this);");
      cam.querySelector("input").value = parseInt(ProjectOpen["items"][key]["ordem"])
      cam
        .querySelectorAll("img")[1]
        .setAttribute("onclick", "RemoveItem(this);");

      document.getElementById("container-items").appendChild(cam);
    });
    ShowPropriets();
  }

  // imagem
  if (parttoload == "imagem" || parttoload == "all") {
    imagespace.clear();
    for (const key of Object.keys(ProjectOpen["items"])) {
      let item = ProjectOpen["items"][key];
      let itemelement;

      if (item["type"] == "img") {
        itemelement = await new Promise((resolve) => {
          fabric.Image.fromURL(imageData["images"][item["nome"]], (img) => {
            img.set({
              left: Number(item["css"]["left"]),
              top: Number(item["css"]["top"]),
              scaleX: Number(item["css"]["scaleX"]),
              scaleY: Number(item["css"]["scaleY"]),
              angle: Number(item["css"]["rotation"]),
              selectable: true
            });
            resolve(img);
          }, { crossOrigin: "anonymous" });
        });
      } else {
        if (item["css"]["type"] == "text") {
          itemelement = new fabric.Text(item["css"]["text"],{
            left: item["css"]["left"],
            top: item["css"]["top"],
            fill: item["css"]["background-color"],
            width: item["css"]["width"],
            fontSize: item["css"]["fontSize"],
            angle: item["css"]["rotation"],
            selectable: true,
            scaleX: 1,
            scaleY: 1,
            lockUniScaling: true
          });
        } else {
          itemelement = new fabric.Rect({
            left: item["css"]["left"],
            top: item["css"]["top"],
            fill: item["css"]["background-color"],
            width: item["css"]["width"],
            height: item["css"]["height"],
            selectable: true,
            rx: item["css"]["border-radius"],
            ry: item["css"]["border-radius"],
            angle: item["css"]["rotation"],
            scaleX: 1,
            scaleY: 1,
          });
        }
      }

      // Garantir filtros
      itemelement.name = item["nome"];
      itemelement.camada = item["ordem"];

      if (itemelement.type == 'image') {
        let filters = [
          new fabric.Image.filters.Brightness({ brightness: item["efeitos"]["Brilho"][1] }),
          new fabric.Image.filters.Blur({ blur: item["efeitos"]["Desfoque"][1] }),
          new fabric.Image.filters.Contrast({ contrast: item["efeitos"]["Contraste"][1] }),
          new fabric.Image.filters.Saturation({ saturation: item["efeitos"]["Saturação"][1] })
        ];

        if (item["efeitos"]["Escala preto e branco"][1]) {
          filters.push(new fabric.Image.filters.Grayscale());
        }

        if (item["efeitos"]["Inverter Cores"][1]) {
          filters.push(new fabric.Image.filters.Invert());
        }

        itemelement.filters = filters;
        itemelement.applyFilters();
      }

      imagespace.add(itemelement);
      imagespace.moveTo(itemelement, itemelement.camada);
      imagespace.renderAll();
    }
  }

  // efeitos
  if (parttoload == "efeitos" || parttoload == "all") {
    while (document.getElementById("container-efeitos").children.length > 2) {
      document.getElementById("container-efeitos").lastChild.remove();
    }

    let imagemaberta;
    if (document.getElementById("selected"))
      imagemaberta = document
        .getElementById("selected")
        .querySelector("p").textContent;

    if (ProjectOpen["items"][imagemaberta] != undefined) {
      let efeitosIt = ProjectOpen["items"][imagemaberta]["efeitos"];
      Object.keys(efeitosIt).forEach((efeito) => {
        let effectContainer = document
          .getElementById("container-efeito")
          .cloneNode(true);
        effectContainer.querySelector("h1").textContent = efeito;
        effectContainer.style.display = "flex";
        document
          .getElementById("container-efeitos")
          .appendChild(effectContainer);
        
        if (efeitos[efeito][0] == "number"){
          effectContainer.querySelector("input").value = efeitosIt[efeito][1] * (100/efeitos[efeito][3]);
          effectContainer.querySelector("input").setAttribute("type","number")
        }

        if (efeitos[efeito][0] == "boolean") {
          effectContainer.querySelector("input").setAttribute("type","checkbox")
          effectContainer.querySelector("input").checked = efeitosIt[efeito][1];
        }

        effectContainer
          .querySelector("input")
          .setAttribute("oninput", "ChangeEffect(this, 1)");
      });
    }
  }

  profileData["Projetos"][ProjectName] = ProjectOpen;

  if (ProjectOpen["IsTempProject"] == false) {
    WriteStore(dbs[0], profileData);
    WriteStore(dbs[1], imageData);
  }
}

function ChangeEffect(elementoinput, indice) {
  // limite do usuario
  let valor = elementoinput.getAttribute("type") == "checkbox" ?elementoinput.checked:parseInt(elementoinput.value);

  if (typeof(valor) != typeof(true)) {
    valormax = efeitos[elementoinput.parentElement.querySelector("h1").textContent][3]
    valormin = efeitos[elementoinput.parentElement.querySelector("h1").textContent][2]

    valor = valor/(100/valormax)

    if (valormin > valor) {
      valor = valormin
      elementoinput.value = valormin*100;
    }
    if (valormax < valor) {
      valor = valormax
      elementoinput.value = 100;
    }
  }

  ProjectOpen["items"][
    document.getElementById("selected").getAttribute("name")
  ]["efeitos"][elementoinput.parentElement.querySelector("h1").textContent][indice] =
    valor;

  LoadProject("imagem");
}

function AppendDraw(i) {
  let variations = {
    Quadrado: {
      type: "rect",
      "background-color": "#000000",
      left: 50,
      top: 50,
      height: 100,
      width: 100,
      "border-radius": 0,
      "aspect-radio": "1/1",
      rotation:0
    },
    Circulo: {
      type: "circle",
      "background-color": "#000000",
      left: 50,
      top: 50,
      height: 100,
      width: 100,
      "border-radius": 10000,
      rotation:0
    },
    Text: {
      type: "text",
      text: "insira texto...",
      "background-color": "#000000",
      left: 50,
      top: 50,
      fontSize: 24,
      rotation:0
    },
  };

  let desenho = Object.keys(variations)[i];

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
    efeitos: JSON.parse(JSON.stringify(efeitos)),
    css: variations[desenho],
  };

  LoadProject("all");
}

async function UploadImage(imageFiles) {
  for (let i = 0; i < imageFiles.length; i++) {
    let imagemfile = imageFiles[i];

    // salvar imagem no cache
    let base64 = await imageToBase64(imagemfile);

    let indice = 1;
    while (true) {
      let nome = indice + imagemfile["name"];
      console.log(imagemfile)
      if (!Object.keys(ProjectOpen["items"]).includes(nome)) {
        imageData["images"][nome] = base64;
        ProjectOpen["items"][nome] = {
        type: "img",
        nome: nome,
        efeitos: JSON.parse(JSON.stringify(efeitos)),
        ordem: 0,
        css: {
          "background-color": "#FFFFFF",
          left: "0",
          top: "0",
          scaleX: "0.5",
          scaleY: "0.5",
          height: "1",
          width: "1",
          rotation: 0,
          "border-radius": "0",
        },
      };
        break;
      }
      indice++
    }
  }
  LoadProject("all");
}

function ShowPropriets() {
  let name;
  if (document.getElementById("selected")) {
    name = document.getElementById("selected").getAttribute("name");
  } else {
    document.getElementById("container-selected").style.display = "none";
    document.getElementById("container-efeitos").style.display = "none";
    return;
  }

  if (name != null) {
    if (ProjectOpen["items"][document.getElementById("selected").getAttribute("name")]["type"] == "img") {
      document.getElementById("container-efeitos").style.display = "block";
    } else {
      document.getElementById("container-efeitos").style.display = "none";
    }
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
      document.getElementById("container-selected").querySelectorAll("input")[i].value =
        !isNaN(ProjectOpen["items"][imagemname]["css"][propriety])
        ? parseInt(ProjectOpen["items"][imagemname]["css"][propriety]).toFixed(2)
        : ProjectOpen["items"][imagemname]["css"][propriety];
      i++;
    });
  }
}

function changePropriet(input, propriety) {
  let valor = input.value;
  let nome = input.parentElement.parentElement.parentElement.getAttribute("name");

  ProjectOpen["items"][nome]["css"][propriety] = !isNaN(valor)? parseInt(valor): valor;

  LoadProject("imagem");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("Backbtn2").textContent += " - " + decodeURIComponent(ProjectName);

  document.getElementById("Backbtn1").addEventListener("click", back);
  document.getElementById("Backbtn2").addEventListener("click", changeName);

  imagespace = new fabric.Canvas("imagespace", {
    selection: false
  });

  if (ProjectName != "") {
    LoadProject("all");
    ShowPropriets();
  } else {
    alert("Projeto não existe!");
    back();
  }

  // SELECIONAR A IMAGEM AO CLICA-LA
  imagespace.on("mouse:down", function (e) {
    if (e.target) {
      let element = document
        .getElementById("container-items")
        .querySelector('[name="' + e.target["name"] + '"]');
      if (document.getElementById("selected"))
        document.getElementById("selected").removeAttribute("id");
      element.setAttribute("id", "selected");
      LoadProject("camadas");
      LoadProject("efeitos");
    }
  });

  // MUDAR TEXTO AO DUPLO CLICK
  imagespace.on("mouse:dblclick", function (e) {
    const obj = e.target;
    if (obj.type === 'text') {
      let text = prompt("Insira texto: ")
      if (text != null && text != "") {
        ProjectOpen["items"][obj.name]["css"]["text"] = text
        LoadProject("imagem")
      }
    }
  })
  
  // SALVAR A IMAGEM AO MUDA-LA
  imagespace.on("object:modified", function (e) {
    const obj = e.target;
    if (obj.type === 'text') {
      obj.fontSize = obj.fontSize * obj.scaleX;
      obj.scaleX = 1;
      obj.scaleY = 1;
      imagespace.renderAll();
    }
    SaveOnChange(e.target);
  });

  // DESELECIONAR AO CLICAR ESC // DELETAR AO CLICAR DELETE
  document.addEventListener("keydown", (key) => {
    if (key.key == "Delete") {
      if (document.getElementById("selected"))
        RemoveItem(document.getElementById("selected").querySelector("p"));
        document.getElementById("selected").removeAttribute("id");
        LoadProject("all")
    }
    if (key.key == "Escape") {
      if (imagespace.getActiveObject()) {
        imagespace.discardActiveObject();
        imagespace.requestRenderAll();
      }
      document.getElementById("container-selected").style.display = "none";
      document.getElementById("container-efeitos").style.display = "none";
      if (document.getElementById("selected"))
        document.getElementById("selected").removeAttribute("id");
    }
  });

  // SOLTAR A IMAGEM E FAZER UPLOAD
  window.addEventListener("dragover", e => e.preventDefault());
  window.addEventListener("drop", e => e.preventDefault());
  window.addEventListener("drop", e => {
    e.preventDefault();

    let allimages = true;
    Object.keys(e.dataTransfer.files).forEach(archive => {
      let file = e.dataTransfer.files[archive];
      if (file && !file.type.startsWith("image/")) {
        allimages = false
      }
    });

    if (allimages) {
      UploadImage(e.dataTransfer.files)
    }
  });

  // DESATIVAR PROJETO TEMPORARIO
  document.getElementById("disabletemp").addEventListener("click", ()=>{
    document.getElementById("Backbtn2").style.textDecoration = "none";
    document.getElementById("Backbtn2").style.color = "var(--branco2)";

    document.getElementById("disabletemp").style.display = "none";
    ProjectOpen = profileData["Projetos"][ProjectName];
    ProjectOpen["IsTempProject"] = false

    WriteStore(dbs[0], profileData);
    WriteStore(dbs[1], imageData);
  })

  // CONFIGURAÇÔES
  document.getElementById("configs").addEventListener("click", ()=>{
    dialog("Configurações",["Arquivo","Projeto","Cancelar"],{1:true,2:true,Escape:true}, (option)=>{
      setTimeout(()=>{
        if (option == 0) {
          dialog("Arquivo",["Exportar Imagem (PNG)", "Exportar Imagem (JPG)", "Importar Imagem", "Cancelar"], {1: true, 2: true, 3:true, Escape: true}, (option1)=>{
            if (option1 == 0) {
              CaptureImage("png",true);
            }
            if (option1 == 1) {
              CaptureImage("jpg",false);
            }
            if (option1 == 2) {
              document.getElementById("fileuploader").click()
            }
          })
        }
        if (option == 1) {
          dialog("Arquivo",["Descartar Projeto", "Criar Cópia", "Sair do Projeto", "Cancelar"], {1: true, 2: true, 3:true, Escape: true}, (option1)=>{
            if (option1 == 0) {
              setTimeout(() => {
                dialog("Tem certeza que quer deletar esse projeto para sempre?",["Sim","Cancelar"],{Enter: true, Escape: true}, (option2)=>{
                  if (option2 == 0) {
                    delete profileData["Projetos"][ProjectName]
                    WriteStore(dbs[0], profileData);
                    WriteStore(dbs[1], imageData);
                    window.location.href = "projects.html"
                  }
                })
              }, 20);
            }
            if (option1 == 1) {
              let indice = 1;
              while (true) {
                let nome = ProjectName+indice;
                if (!Object.keys(profileData["Projetos"]).includes(nome)) {
                  profileData["Projetos"][nome] = ProjectOpen;
                  WriteStore(dbs[0], profileData);
                  WriteStore(dbs[1], imageData);
                  alert("Uma cópia "+ProjectName+" foi criada!: "+nome)
                  break;
                }
                indice++;
              }
            }
            if (option1 == 2) {
              window.location.href = "projects.html"
            }
          })
        }
      },10)
    })
  })

  // adicionar camadas.
  document
    .getElementById("container-items-info")
    .querySelector("button")
    .addEventListener("click", () => {
      dialog(
        "Oque deseja inserir?",
        ["Imagem", "Forma", "Imagem por IA", "Cancelar"],
        { 1: true, 2: true, 3: true, Escape: true },
        async (indice) => {
          if (indice == 0) {
            document.getElementById("fileuploader").click();
          } else if (indice == 1) {
            setTimeout(() => {
              dialog(
                "Qual Forma?",
                ["Quadrado", "Circulo", "Texto", "Cancelar"],
                { 1: true, 2: true, 3: true, Escape: true },
                (indice1) => {
                  if (indice1 != 3) {
                    AppendDraw(indice1);
                  }
                }
              );
            }, 10);
          } else if (indice == 2) {
            promp = prompt("Insira um prompt: ")
            if (promp != "" && promp != null) {
              var link = "https://image.pollinations.ai/prompt/"+promp;

              const response = await fetch(link);
              const blob = await response.blob();
              const filename = link.split('/').pop();
              const file = new File([blob], filename, { type: blob.type });

              alert("Imagem gerada!");
              UploadImage([file])
            }
          }
        }
      );
    });
});


function CaptureImage(formato, transparentfundo) {
  const tempCanvas = new fabric.StaticCanvas(null, {
    width: imagespace.width,
    height: imagespace.height
  });

  // fundo branco
  const fundo = new fabric.Rect({
    left: 0,
    top: 0,
    width: imagespace.width,
    height: imagespace.height,
    fill: transparentfundo?"transparent":"white"
  });
  tempCanvas.add(fundo);

  // clona os objetos (incluindo imagens)
  imagespace.getObjects().forEach(obj => {
    obj.clone(clone => tempCanvas.add(clone));
  });

  // espera um pouco para garantir que imagens carreguem
  setTimeout(() => {
    const dataURL = tempCanvas.toDataURL({ format: formato });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = ProjectName+"."+formato;
    link.click();
  }, 100); // 100ms normalmente é suficiente
}