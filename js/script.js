const URL_BASE = "https://mock-api.driven.com.br/api/v4/buzzquizz";
const arrQuizzes = [];
let pontuacao = 0;
let niveisQuizz = [];
let pontuacaoMeta = 0;
let quizzSelecionado = "";

function obterQuizzes() {
  const URL = `${URL_BASE}/quizzes`;
  const req = axios.get(URL);

  req.then((res) => renderizarQuizzes(res.data));
}

function renderizarQuizzes(quizzes) {
  const seusQuizzes = document.querySelector(".seus-quizzes");
  const todosQuizzes = document.querySelector(".todos-quizzes");
  const caixasQuizzesVazios = seusQuizzes.querySelector(".caixaQuizzesVazios");
  const header = seusQuizzes.querySelector(".header");

  todosQuizzes.innerHTML = "";

  if (!localStorage.getItem("seusQuizzes")) {
    localStorage.setItem("seusQuizzes", JSON.stringify(null));
  }

  if (JSON.parse(localStorage.getItem("seusQuizzes"))) {
    caixasQuizzesVazios.classList.add("hidden");

    header.classList.remove("hidden");
    header.children[0].classList.remove("hidden");
    header.children[1].classList.remove("hidden");
  }

  quizzes.forEach((quiz) => {
    arrQuizzes.push(quiz);

    const background = `
    background: url(${quiz.image});
    `;

    todosQuizzes.innerHTML += `
    <div class="quizz" style="${background}" onclick="selecionarQuizz(${quiz.id})">
      <p class="quizz-titulo">
        ${quiz.title}
      </p>
    </div>
    `;
  });
}

function selecionarQuizz(id) {
  quizzSelecionado = id;
  const selecionado = arrQuizzes.filter((elemento) => elemento.id === id);
  const paginaQuizz = document.querySelector(".pagina-quizz");
  const main = document.querySelector("main");
  const caixaPerguntas = document.getElementsByClassName("caixaPerguntas")[0];
  caixaPerguntas.innerHTML = "";
  pontuacao = 0;
  niveisQuizz = [];

  main.classList.add("hidden");
  paginaQuizz.classList.remove("hidden");

  // Alterar o header
  const header = paginaQuizz.querySelector(".header");
  const headerTitulo = header.querySelector(".header-titulo");

  header.style.background = `url(${selecionado[0].image}) no-repeat left top`;
  header.style.backgroundSize = "cover";
  header.style.objectFit = "cover";
  headerTitulo.innerText = selecionado[0].title;

  // Renderizar as perguntas
  const perguntas = selecionado[0].questions;
  pontuacaoMeta = perguntas.length;

  perguntas.forEach((pergunta) => {
    const perguntasEmbaralhadas = pergunta.answers.sort(
      () => Math.random() - 0.5
    );
    let alternativas = "";
    // let segundaLinha = "";
    for (let i = 0; i < perguntasEmbaralhadas.length; i++) {
      if (perguntasEmbaralhadas[i].isCorrectAnswer) {
        alternativas += `
        <div class="alternativa certa" onclick="selecionarAlternativa(this)">
          <img src="${perguntasEmbaralhadas[i].image}"/>
          <p class="texto">${perguntasEmbaralhadas[i].text}</p>
        </div>
        `;
      } else {
        alternativas += `
        <div class="alternativa" onclick="selecionarAlternativa(this)">
          <img src="${perguntasEmbaralhadas[i].image}"/>
          <p class="texto">${perguntasEmbaralhadas[i].text}</p>
        </div>
        `;
      }
    }
    let perguntaElemento = `
    <div class = "pergunta">
      <p class="pergunta-texto" style="background-color:${pergunta.color}">
        ${pergunta.title}
      </p>
      <div class="alternativas">
        ${alternativas}
      </div>
    </div>
    `;
    caixaPerguntas.innerHTML += perguntaElemento;
  });

  let niveis = selecionado[0].levels;
  let resultados = document.querySelector('.quiz-resultado');
  resultados.innerHTML = '';
  niveis.forEach((nivel) => {
    let resultado = 
    `
    <div class = "nivel hidden" id="${nivel.title + nivel.minValue}">
      <div class="topo">
        <h3 class="texto">${nivel.title}</h3>
      </div>
      <section>
        <img src="${nivel.image}" />
        <p class="mensagem">${nivel.text}</p>
      </section>
    </div>
    `
    resultados .innerHTML += resultado;
    valorNivel = {
      title: nivel.title + nivel.minValue,
      minValue: nivel.minValue
    };
    niveisQuizz.push(valorNivel);
  });
  niveisQuizz.sort((a,b) => {
    return a.minValue - b.minValue;
  });
  resultados.innerHTML += 
   `
  <button class="btn-reiniciar" onclick="reiniciarQuizz()">
    Reiniciar Quizz
  </button>
  <button class="btn-voltar" onclick="voltarParaHome()">
    Voltar pra home
  </button>
  `;

  window.scrollTo(0, 0);
}

function selecionarAlternativa(alternativaSelecionada) {
  let alternativasElement = alternativaSelecionada.parentElement;
  const alternativas = alternativasElement.children;
  let cont = 0;
  for (let i = 0; i < alternativas.length; i++) {
    if (alternativas[i].classList.contains("alternativaSelecionada")) {
      cont++;
    }
  }
  if (cont == 0) {
    alternativaSelecionada.classList.add("alternativaSelecionada");
    if (alternativaSelecionada.classList.contains('certa')) {
      pontuacao++;
    }
    for (let i = 0; i < alternativas.length; i++) {
      let texto = alternativas[i].querySelector(".texto");
      if (alternativas[i].classList.contains("certa")) {
        texto.style.color = "#009C22";
      } else {
        texto.style.color = "#FF4B4B";
      }
      if (!alternativas[i].classList.contains("alternativaSelecionada")) {
        alternativas[i].classList.add("opaco");
      }
    }
    let perguntas = document.getElementsByClassName("pergunta");
    let qtdPerguntasSelecionadas = null;
    let pergunta = alternativasElement.parentElement;
    let index = 0;
    for (let i = 0; i < perguntas.length; i++) {
      if (perguntas[i] === pergunta) {
        index = i;
      }
    }
    if (index < perguntas.length - 1) {
      setTimeout(
        () =>
          perguntas[index + 1].scrollIntoView({
            behavior: "smooth",
            block: "end",
          }),
        2000
      );
    }

    qtdPerguntasSelecionadas = document.querySelectorAll(
      ".alternativaSelecionada"
    ).length;

    if (qtdPerguntasSelecionadas === perguntas.length) {
      setTimeout(mostrarResultado,2000);
    }
  }
}

function mostrarResultado() {
  const paginaQuizz = document.querySelector(".pagina-quizz");
  const pontos = Math.round((pontuacao/pontuacaoMeta)*100);
  let contador = 1;
  let nivelUsuario = null;
  while(true){
    if (pontos >= niveisQuizz[niveisQuizz.length - contador].minValue) {
      nivelUsuario = niveisQuizz[niveisQuizz.length - contador].title;
      break;
    };
    contador++;
  }
  nivelUsuario = document.getElementById(nivelUsuario);
  nivelUsuario.classList.remove('hidden');

  const quizResultado = paginaQuizz.querySelector(".quiz-resultado");
  quizResultado.classList.remove("hidden");

  quizResultado.scrollIntoView({ behavior: "smooth" });
}

function reiniciarQuizz() {
  selecionarQuizz(quizzSelecionado);
}

function voltarParaHome() {
  const main = document.querySelector("main");
  const paginaQuiz = document.querySelector(".pagina-quizz");

  window.scrollTo(0, 0);
  main.classList.remove("hidden");
  paginaQuiz.classList.add("hidden");
}

function criarQuizz() {
  const paginaCriarQuizz = document.querySelector(".pagina-criar-quiz");
  const main = document.querySelector("main");

  if (paginaCriarQuizz && main) {
    paginaCriarQuizz.classList.remove("hidden");
    main.classList.add("hidden");
  }

  const quizCriar = paginaCriarQuizz.querySelector(".form-criar");
  quizCriar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    cadastrarQuiz();
  });
}

let quizEnviar = {
  titulo: "",
  url: "",
  qtdPerguntas: "",
  qtdNiveis: "",
}

function cadastrarQuiz() {
  const paginaCriarQuizz = document.querySelector(".pagina-criar-quiz");
  const quizCriar = paginaCriarQuizz.querySelector(".form-criar");
  quizEnviar = {
    titulo: "",
    url: "",
    qtdPerguntas: "",
    qtdNiveis: "", 
  };
  questions = [];
  if (quizCriar) {
    const titulo = quizCriar.querySelector(".titulo-quiz");
    const url = quizCriar.querySelector(".url-imagem");
    const qtdPerguntas = quizCriar.querySelector(".qtd-perguntas");
    const qtdNiveis = quizCriar.querySelector(".qtd-niveis");

    if (titulo.value.length >= 20 && titulo.value.length <= 65) {
      quizEnviar.titulo = titulo.value;
    } else {
      titulo.value = "";
      alert("O título deve ter um tamanho de no mínimo 20 a 65 caracteres");
    }

    if (validarURL(url.value)) {
      quizEnviar.url = url.value;
    } else {
      url.value = "";
      alert("A URL da imagem não é válida!");
    }

    if (+qtdPerguntas.value >= 3) {
      quizEnviar.qtdPerguntas = parseInt(qtdPerguntas.value);
    } else {
      qtdPerguntas.value = "";
      alert("A quantidade mínima de perguntas é 3.");
    }

    if (+qtdNiveis.value >= 2) {
      quizEnviar.qtdNiveis = parseInt(qtdNiveis.value);
    } else {
      qtdNiveis.value = "";
      alert("A quantidade mínima de níveis é 2.");
    }
  }
}

let questions = []

function criarPerguntas(){
  if (quizEnviar.titulo != "" && quizEnviar.url != "" && quizEnviar.qtdPerguntas != "" && quizEnviar.qtdNiveis != ""){
    for (let i = 1 ; i < quizEnviar.qtdPerguntas + 1; i++) {
      let pergunta = {
        texto:"",
        cor:"",
        respostaCorreta:"",
        urlImagemCorreta:"",
        respostaIncorreta1:"",
        urlImagemIncorreta1:"",
        respostaIncorreta2:"",
        urlImagemIncorreta2:"",
        respostaIncorreta2:"",
        urlImagemIncorreta2:"",
        respostaIncorreta3:"",
        urlImagemIncorreta3:"",
        id:i
      }
      questions.push(pergunta);
    }
    perguntaAnterior=0;
    preencherPerguntas();
  }
}

let perguntaAnterior = 0;
function preencherPerguntas(numeroPergunta = 1){
  const paginaCriarQuizz = document.querySelector(".info-basica");
  try{
    var texto = document.getElementById('texto-pergunta').value
    var cor = document.getElementById('cor-pergunta').value
    var respostaCorreta = document.getElementById('resposta-correta').value
    var urlImagemCorreta = document.getElementById('url-imagem').value
    var respostaIncorreta1 = document.getElementById('resposta-incorreta1').value
    var urlImagemIncorreta1 = document.getElementById('url-imagem1').value
    var respostaIncorreta2 = document.getElementById('resposta-incorreta2').value
    var urlImagemIncorreta2 = document.getElementById('url-imagem2').value
    var respostaIncorreta3 = document.getElementById('resposta-incorreta3').value
    var urlImagemIncorreta3 = document.getElementById('url-imagem3').value
  }
  catch(e){};
  if (perguntaAnterior != 0){
    let pergunta = questions.filter((pergunta) => pergunta.id === perguntaAnterior)[0]
    pergunta.texto = texto;
    pergunta.cor = cor.toUpperCase();
    pergunta.respostaCorreta = respostaCorreta;
    pergunta.urlImagemCorreta = urlImagemCorreta;
    pergunta.respostaIncorreta1 = respostaIncorreta1;
    pergunta.urlImagemIncorreta1 = urlImagemIncorreta1;
    pergunta.respostaIncorreta2 = respostaIncorreta2;
    pergunta.urlImagemIncorreta2 = urlImagemIncorreta2;
    pergunta.respostaIncorreta2 = respostaIncorreta2;
    pergunta.urlImagemIncorreta2 = urlImagemIncorreta2;
    pergunta.respostaIncorreta3 = respostaIncorreta3;
    pergunta.urlImagemIncorreta3 = urlImagemIncorreta3;
  }
  perguntaAnterior = numeroPergunta;
  paginaCriarQuizz.innerHTML = 
  `
  <h2 class = "titulo container">Crie suas perguntas</h2>
  `;
  for (let i = 1 ; i < quizEnviar.qtdPerguntas + 1; i++) {
    if (i < numeroPergunta){
      paginaCriarQuizz.innerHTML+=
      `
      <div class="caixaEditarPergunta" onclick="preencherPerguntas(${i})">
        <h3 class="titulo-input">Pergunta ${i}</h3>
        <ion-icon name="create-outline"></ion-icon>
      </div>
      `
    }
    else if (i == numeroPergunta){
      paginaCriarQuizz.innerHTML += 
      `
      <form class ="form-criar criar-perguntas" >
        <div class="container">
          <div>
            <h3 class="titulo-input">Pergunta ${numeroPergunta}</h3>
            <input type="text" id="texto-pergunta" placeholder="Texto da pergunta" required />
            <input type="text" id="cor-pergunta" placeholder="Cor de fundo da pergunta" required />
          </div>
  
          <div>
            <h3 class="titulo-input">Resposta correta</h3>
            <input type="text" id="resposta-correta" placeholder="Resposta Correta" required />
            <input type="text" id="url-imagem" placeholder="URL da imagem" required />
          </div>
  
          <div>
            <h3 class="titulo-input">Respostas incorretas</h3>
            <input type="text" id="resposta-incorreta1" placeholder="Resposta incorreta 1" required />
            <input type="text" id="url-imagem1" placeholder="URL da imagem 1" required />
          </div>
  
          <div>
            <input type="text" id="resposta-incorreta2" placeholder="Resposta incorreta 2" />
            <input type="text" id="url-imagem2" placeholder="URL da imagem 2" />
          </div> 
  
          <div>
            <input type="text" id="resposta-incorreta3" placeholder="Resposta incorreta 3" />
            <input type="text" id="url-imagem3" placeholder="URL da imagem 3" />
          </div>
        </div>
      </form>
      `
    }
    else{
      paginaCriarQuizz.innerHTML+=
      `
      <div class="caixaEditarPergunta" onclick="preencherPerguntas(${i})">
        <h3 class="titulo-input">Pergunta ${i}</h3>
        <ion-icon name="create-outline"></ion-icon>
      </div>
      ` 
    }

    if (i == quizEnviar.qtdPerguntas) {
      paginaCriarQuizz.innerHTML += 
      `
      <div class="btn-container" >
        <button class="btn-enviar" onclick="criarNiveis()" style="margin-top:0px;">
          Prosseguir pra criar níveis
        </button>
      </div>
      `
    }
  }
  let pergunta = questions.filter((pergunta) => pergunta.id === numeroPergunta)[0];
  document.getElementById('texto-pergunta').value = pergunta.texto;
  document.getElementById('cor-pergunta').value = pergunta.cor;
  document.getElementById('resposta-correta').value = pergunta.respostaCorreta;
  document.getElementById('url-imagem').value = pergunta.urlImagemCorreta;
  document.getElementById('resposta-incorreta1').value = pergunta.respostaIncorreta1;
  document.getElementById('url-imagem1').value = pergunta.urlImagemIncorreta1;
  document.getElementById('resposta-incorreta2').value = pergunta.respostaIncorreta2;
  document.getElementById('url-imagem2').value = pergunta.urlImagemIncorreta2;
  document.getElementById('resposta-incorreta3').value = pergunta.respostaIncorreta3;
  document.getElementById('url-imagem3').value = pergunta.urlImagemIncorreta3;
  document.querySelector('.container').scrollIntoView({behavior:'smooth'});
}

function criarNiveis(){
  let texto = document.getElementById('texto-pergunta').value
  let cor = document.getElementById('cor-pergunta').value
  let respostaCorreta = document.getElementById('resposta-correta').value
  let urlImagemCorreta = document.getElementById('url-imagem').value
  let respostaIncorreta1 = document.getElementById('resposta-incorreta1').value
  let urlImagemIncorreta1 = document.getElementById('url-imagem1').value
  let respostaIncorreta2 = document.getElementById('resposta-incorreta2').value
  let urlImagemIncorreta2 = document.getElementById('url-imagem2').value
  let respostaIncorreta3 = document.getElementById('resposta-incorreta3').value
  let urlImagemIncorreta3 = document.getElementById('url-imagem3').value

  let pergunta = questions.filter((pergunta) => pergunta.id === perguntaAnterior)[0]
  pergunta.texto = texto;
  pergunta.cor = cor.toUpperCase();
  pergunta.respostaCorreta = respostaCorreta;
  pergunta.urlImagemCorreta = urlImagemCorreta;
  pergunta.respostaIncorreta1 = respostaIncorreta1;
  pergunta.urlImagemIncorreta1 = urlImagemIncorreta1;
  pergunta.respostaIncorreta2 = respostaIncorreta2;
  pergunta.urlImagemIncorreta2 = urlImagemIncorreta2;
  pergunta.respostaIncorreta2 = respostaIncorreta2;
  pergunta.urlImagemIncorreta2 = urlImagemIncorreta2;
  pergunta.respostaIncorreta3 = respostaIncorreta3;
  pergunta.urlImagemIncorreta3 = urlImagemIncorreta3;
  for (let i = 0; i<questions.length;i++){
    if (questions[i].texto.length < 20){
      alert('O título da pergunta deve ter mais de 20 caracteres!');
      preencherPerguntas(questions[i].id)
      let titulo = document.getElementById('texto-pergunta');
      titulo.value = "";
      titulo.setAttribute('style','border: 1px solid red');
      break;
    }

    if (!(validarHexadecimal(questions[i].cor))){
      alert ('Insira uma cor Hexadecimal válida!');
      preencherPerguntas(questions[i].id);
      let cor = document.getElementById('cor-pergunta');
      cor.value ="";
      cor.setAttribute('style','border: 1px solid red');
      break;
    }

    if (!questions[i].respostaCorreta){
      alert('O texto da resposta não pode estar vazio!')
      preencherPerguntas(questions[i].id);
      let texto = document.getElementById('resposta-correta');
      texto.value = "";
      texto.setAttribute('style','border: 1px solid red');
      break;
    }

    if (!questions[i].respostaIncorreta1){
      alert('O texto da resposta não pode estar vazio!')
      preencherPerguntas(questions[i].id);
      let texto = document.getElementById('resposta-incorreta1');
      texto.value = "";
      texto.setAttribute('style','border: 1px solid red');
      break;
    }

    if(!validarURL(questions[i].urlImagemCorreta)){
      alert('Insira uma URL válida!');
      preencherPerguntas(questions[i].id);
      let url = document.getElementById('url-imagem');
      url.value = "";
      url.setAttribute('style','border: 1px solid red');
      break;
    }

    if(!validarURL(questions[i].urlImagemIncorreta1)){
      alert('Insira uma URL válida!');
      preencherPerguntas(questions[i].id);
      let url = document.getElementById('url-imagem1');
      url.value = "";
      url.setAttribute('style','border: 1px solid red');
      break;
    }
  }
}

function validarHexadecimal(hex){
  if (hex[0] != '#'){
    return false;
  }

  if (hex.length != 7){
    return false;
  }

  for (let i = 1; i < hex.length; i++){
    const ch = hex[i];
    if ((!(isNaN(ch)) && (ch < '0' || ch > '9')) || (isNaN(ch) && (ch < 'A' || ch > 'F'))) {
      return false;
    }
  }
  return true;
}

function validarURL(url) {
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(
    url
  );
}

obterQuizzes();