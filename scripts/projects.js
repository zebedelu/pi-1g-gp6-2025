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
    items: {}
  };

  return Projeto;
}

function UpdateProjects() {
  // deletar todos os itens
  document.getElementsByClassName("projects")[0].innerHTML = "";

  // criar elementos
  setTimeout(() => {
    Object.keys(profileData["Projetos"]).forEach((projeto) => {
      if (profileData["Projetos"][projeto]["IsTempProject"] == false) {
        var ProjectContainerTextData = document.createElement("p");
        var ProjectContainerText = document.createElement("p");
        var ProjectContainerElement = document.createElement("div");

        // adicionar imagem de fundo
        var _ = true
        Object.keys(profileData["Projetos"][projeto]["items"]).forEach(item => {
          if (profileData["Projetos"][projeto]["items"][item]["type"] == "img" && _) {
            ProjectContainerElement.style.backgroundImage = "url("+imageData["images"][profileData["Projetos"][projeto]["items"][item]["nome"]]+")"
            _ = false;
          }
        });
        
        // adicionar evento para poder entrar no projeto
        ProjectContainerElement.setAttribute("onclick",'window.location.href = "./edicao.html?'+projeto+'"')

        ProjectContainerElement.classList.add("project-card");
        ProjectContainerText.textContent = decodeURIComponent(projeto);
        ProjectContainerTextData.textContent = profileData["Projetos"][projeto]["data_criacao"]

        ProjectContainerElement.appendChild(ProjectContainerText);
        ProjectContainerElement.appendChild(ProjectContainerTextData);
        document.getElementsByClassName("projects")[0].appendChild(ProjectContainerElement);
      } else {
        delete profileData["Projetos"][projeto]
      }
    })
  },100);
}

function main(tempproject) {
  var qt_projetos = Object.keys(profileData["Projetos"]).length


  var defaultName = "BlankedProject({qt_projetos})".replace(
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
    dialog("Deseja realmente apagar TUDO?", ["Sim","Não"], {Enter:true, Escape:true}, async (escolha)=>{
      if (escolha == 0) {
        setTimeout(()=>{
          dialog("Confirme novamente que deseja apagar TUDO", ["Não","Sim"], {Escape:true, Enter:true}, async (escolha1)=>{
            if (escolha1 == 1) {
              await WriteStore(dbs[0], estrutura);
              await UpdateProjects();
              window.location.reload();
            }
          })
        },10)
      }
    })
  });
});
