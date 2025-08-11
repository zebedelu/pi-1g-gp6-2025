function createProject(tempproject) {
  const agora = new Date();

  const dataFormatada =
    agora.getSeconds().toString().padStart(2, "0") +
    ":" +
    agora.getMinutes().toString().padStart(2, "0") +
    ":" +
    agora.getHours().toString().padStart(2, "0") +
    "/" +
    agora.getDate().toString().padStart(2, "0") +
    "/" +
    (agora.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    agora.getFullYear();

  var Projeto = {
    IsTempProject: tempproject,
    data_criacao: dataFormatada,
    items: {},
    imgsincluidas: {},
  };

  return Projeto;
}

function UpdateProjects() {
  // deletar todos os itens
  document.getElementsByClassName("projects")[0].innerHTML = "";

  // criar elementos
  setTimeout(() => {
    Object.keys(profileData["Projetos"]).forEach((projeto) => {
      let nomeprojeto = projeto;
      var ProjectContainerElement = document.createElement("div");

      // adicionar imagem de fundo
      var _ = true
      Object.keys(profileData["Projetos"][nomeprojeto]["items"]).forEach(item => {
        if (profileData["Projetos"][nomeprojeto]["items"][item]["type"] == "img" && _) {
          ProjectContainerElement.style.backgroundImage = "url("+imageData["images"][profileData["Projetos"][nomeprojeto]["items"][item]["nome"]]+")"
          _ = false;
        }
      });
      
      // adicionar evento para poder entrar no projeto
      ProjectContainerElement.setAttribute("onclick",'window.location.href = "./edicao.html?'+nomeprojeto+'"')

      ProjectContainerElement.classList.add("project-card");
      ProjectContainerElement.textContent = nomeprojeto;
      document
        .getElementsByClassName("projects")[0]
        .appendChild(ProjectContainerElement);
    })
  },100);
}

function main(tempproject) {
  var qt_projetos = Object.keys(profileData["Projetos"]).length
  const defaultName = "BlankedProject({qt_projetos})".replace(
    "{qt_projetos}",
    qt_projetos + 1
  );

  profileData["Projetos"][defaultName] = createProject(tempproject);

  // cria o projeto com as configurações vindas do profileData.
  WriteStore(dbs[0], profileData);
  window.location.href = "./edicao.html?" + defaultName;
}

var qt_projetos;

document.addEventListener("DOMContentLoaded", function () {
  UpdateProjects();
  document.getElementById("newproject").addEventListener("click", () => {
    main(false);
  });
  document.getElementById("newtempproject").addEventListener("click", () => {
    main(true);
  });
  document.getElementById("clearProjects").addEventListener("click", () => {
    WriteStore(dbs[0], estrutura);
    UpdateProjects();
    window.location.reload();
  });
});
