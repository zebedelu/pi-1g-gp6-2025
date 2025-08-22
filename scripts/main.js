const dbName = "DB_Artephy";

const LimitCharsInName = 20;

const dbs = ["ProfileConfig", "ImagesCache"];

var estrutura = {
    "Projetos":{}
}
var estruturaIMG = {
    "images":{
    }
}

var profileData;
var imageData;

let db = null;

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

function moverItemNoObjeto(objeto, chave, direcao) {
  // Converte o objeto em um array de entradas [chave, valor]
  const entradas = Object.entries(objeto);
  
  // Encontra o índice do item que queremos mover
  const indexAtual = entradas.findIndex(([key]) => key === chave);
  
  // Se a chave não existir ou não puder ser movida na direção desejada, retorna o objeto original
  if (indexAtual === -1 || 
      (direcao === 1 && indexAtual === 0) || 
      (direcao === -1 && indexAtual === entradas.length - 1)) {
    return {...objeto};
  }
  
  // Calcula o novo índice
  const novoIndex = indexAtual + direcao;
  
  // Remove o item da posição atual e insere na nova posição
  const [itemMovido] = entradas.splice(indexAtual, 1);
  entradas.splice(novoIndex, 0, itemMovido);
  
  // Converte de volta para objeto
  return Object.fromEntries(entradas);
}

function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function LoadDataBase() {
  db = await new Promise((resolve, reject) => {
    const request = indexedDB.open("DB_Artephy", 2);

    request.onerror = () => reject("Erro ao abrir o banco.");

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(dbs[0])) {
        db.createObjectStore(dbs[0]);
      }
      if (!db.objectStoreNames.contains(dbs[1])) {
        db.createObjectStore(dbs[1]);
      }
    };
  });
}

async function WriteStore(storeName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(value, "singleton"); // chave fixa
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject("Erro ao escrever no store " + storeName);
  });
}

async function ReadStore(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get("singleton"); // mesma chave fixa
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Erro ao ler do store " + storeName);
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await LoadDataBase();

  // await WriteStore(dbs[0], estrutura);
  // await WriteStore(dbs[1], {"images":{}});

  profileData = await ReadStore(dbs[0]);
  imageData = await ReadStore(dbs[1]);

  console.log("Perfil carregado:", profileData);
  console.log("Imagem carregada:", imageData);

  if (profileData == undefined) {
    await WriteStore(dbs[0], estrutura);
  }
  if (imageData == undefined) {
    await WriteStore(dbs[1], estruturaIMG);
  }
});
