const URL_BASE = "https://mock-api.driven.com.br/api/v4/buzzquizz";
const arrQuizzes = [];
let arrSeusQuizzes = [];
arrSeusQuizzes = JSON.parse(localStorage.getItem("seusQuizzes"));
let pontuacao = 0;
let niveisQuizz = [];
let pontuacaoMeta = 0;
let quizzSelecionado = "";

function obterQuizzes() {
  const URL = `${URL_BASE}/quizzes`;
  const req = axios.get(URL);

  req.then((res) => {
    renderizarQuizzes(res.data);
    esconderLoader();
  });
  req.catch(() => {
    alert("Erro ao obter os quizzes!");
    obterQuizzes();
  });
}

function obterUmQuiz(id) {
  mostrarLoader();

  const req = axios.get(`${URL_BASE}/quizzes/${id}`);

  req.then(({ data }) => selecionarQuizz(id, [data]));
  req.catch(() => alert("Houve um erro no carregamento do quiz"));
}

function renderizarQuizzes(quizzes) {
  quizzes.forEach((quiz) => {
    arrQuizzes.push(quiz);
  });
  let quizCriado = sessionStorage.getItem("quizCriado");
  if (quizCriado) {
    sessionStorage.removeItem("quizCriado");
    obterUmQuiz(arrSeusQuizzes[arrSeusQuizzes.length - 1].id);
  } else {
    const seusQuizzes = document.querySelector(".seus-quizzes");
    const todosQuizzes = document.querySelector(".todos-quizzes");
    const caixasQuizzesVazios = seusQuizzes.querySelector(
      ".caixaQuizzesVazios"
    );
    const header = document.querySelector(".headerSeusQuizzes");

    todosQuizzes.innerHTML = "";
    if (arrSeusQuizzes != "" || arrSeusQuizzes != null) {
      let qtdSeusQuizzes = arrSeusQuizzes.length;
      for (let j = 0; j<qtdSeusQuizzes;j++) {
        let cont = 0;
        for (let i = 0; i < arrQuizzes.length; i++) {
          if (arrQuizzes[i].id == arrSeusQuizzes[j].id) {
            cont++;
          }
        }
        if (cont == 0) {
          const index = arrSeusQuizzes.indexOf(arrSeusQuizzes[j])
          arrSeusQuizzes.splice(index,1);
          j = j-1;
          qtdSeusQuizzes = arrSeusQuizzes.length;
        }
      };
    }

    if (arrSeusQuizzes && arrSeusQuizzes.length) {
      caixasQuizzesVazios.classList.add("hidden");

      header.classList.remove("hidden");
      header.children[0].classList.remove("hidden");
      header.children[1].classList.remove("hidden");
    }

    quizzes.forEach((quiz) => {
      const estaEmSeusQuizzes = arrSeusQuizzes.find(({ id }) => id === quiz.id);

      if (arrSeusQuizzes && estaEmSeusQuizzes) {
        seusQuizzes.innerHTML += `
          <article class="quizz" onclick="obterUmQuiz(${quiz.id})">
            <img src="${quiz.image}" class="imagem-quiz"/>
            <div class="degrade"></div>
            <p class="quizz-titulo">
              ${quiz.title}
            </p>
            <div class="quiz-opcoes">
              <div class="editar" id="${quiz.id}">
                <ion-icon name="create-outline"></ion-icon>
              </div>
              <div class="deletar" id="${quiz.id}">
                <ion-icon name="trash-outline"></ion-icon>
              </div>
            </div>
          </article>
          `;
      } else {
        todosQuizzes.innerHTML += `
        <article class="quizz" onclick="obterUmQuiz(${quiz.id})">
          <img src="${quiz.image}" class="imagem-quiz"/>
          <div class="degrade"></div>
          <p class="quizz-titulo">
            ${quiz.title}
          </p>
        </article>
        `;
      }
    });

    adicionarEventosNoQuizOpcoes();
  }
}

function adicionarEventosNoQuizOpcoes() {
  const editarQuizzes = document.querySelectorAll(".seus-quizzes .editar");
  const deletarQuizzes = document.querySelectorAll(".seus-quizzes .deletar");

  if (editarQuizzes && deletarQuizzes) {
    editarQuizzes.forEach((el) => {
      el.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });

    deletarQuizzes.forEach((el) => {
      el.addEventListener("click", function (e) {
        abrirModal(e, el.id);
      });
    });
  }
}

function renderizarQuizCriado(quiz) {
  const paginaCriarQuizz = document.querySelector(".info-basica");

  paginaCriarQuizz.innerHTML += `
    <article class="quizz" onclick="selecionarQuizzCriado()">
      <img src="${quiz.image}" class="imagem-quiz">
      <div class="degrade"></div>
      <p class="quizz-titulo">
        ${quiz.title}
      </p>
    </article>
  `;
}

function selecionarQuizz(id, selecionado) {
  quizzSelecionado = id;

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
  let resultados = document.querySelector(".quiz-resultado");
  resultados.innerHTML = "";
  niveis.forEach((nivel) => {
    let resultado = `
    <article class = "nivel hidden" id="${nivel.title + nivel.minValue}">
      <div class="topo">
        <h3 class="texto">${nivel.title}</h3>
      </div>
      <section>
        <img src="${nivel.image}" />
        <div class="mensagem">${nivel.text}</div>
      </section>
    </article>
    `;
    resultados.innerHTML += resultado;
    valorNivel = {
      title: nivel.title + nivel.minValue,
      minValue: nivel.minValue,
    };
    niveisQuizz.push(valorNivel);
  });
  niveisQuizz.sort((a, b) => {
    return a.minValue - b.minValue;
  });
  resultados.innerHTML += `
  <button class="btn-reiniciar" onclick="reiniciarQuizz()">
    Reiniciar Quizz
  </button>
  <button class="btn-voltar" onclick="window.location.reload()">
    Voltar pra home
  </button>
  `;

  window.scroll({ top: 0, behavior: "smooth" });

  esconderLoader();
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
    if (alternativaSelecionada.classList.contains("certa")) {
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
      setTimeout(mostrarResultado, 2000);
    }
  }
}

function mostrarResultado() {
  const paginaQuizz = document.querySelector(".pagina-quizz");
  const pontos = Math.round((pontuacao / pontuacaoMeta) * 100);
  let contador = 1;
  let nivelUsuario = null;
  while (true) {
    if (pontos >= niveisQuizz[niveisQuizz.length - contador].minValue) {
      nivelUsuario = niveisQuizz[niveisQuizz.length - contador].title;
      break;
    }
    contador++;
  }
  nivelUsuario = document.getElementById(nivelUsuario);
  nivelUsuario.classList.remove("hidden");

  const quizResultado = paginaQuizz.querySelector(".quiz-resultado");
  quizResultado.classList.remove("hidden");

  quizResultado.scrollIntoView({ behavior: "smooth" });
}

function reiniciarQuizz() {
  obterUmQuiz(quizzSelecionado);
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
};

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

let questions = [];

function criarPerguntas() {
  if (
    quizEnviar.titulo != "" &&
    quizEnviar.url != "" &&
    quizEnviar.qtdPerguntas != "" &&
    quizEnviar.qtdNiveis != ""
  ) {
    for (let i = 1; i < quizEnviar.qtdPerguntas + 1; i++) {
      let pergunta = {
        texto: "",
        cor: "",
        respostaCorreta: "",
        urlImagemCorreta: "",
        respostaIncorreta1: "",
        urlImagemIncorreta1: "",
        respostaIncorreta2: "",
        urlImagemIncorreta2: "",
        respostaIncorreta2: "",
        urlImagemIncorreta2: "",
        respostaIncorreta3: "",
        urlImagemIncorreta3: "",
        id: i,
      };
      questions.push(pergunta);
    }
    perguntaAnterior = 0;
    preencherPerguntas();
  }
}

let perguntaAnterior = 0;
function preencherPerguntas(numeroPergunta = 1) {
  const paginaCriarQuizz = document.querySelector(".info-basica");
  try {
    var texto = document.getElementById("texto-pergunta").value;
    var cor = document.getElementById("cor-pergunta").value;
    var respostaCorreta = document.getElementById("resposta-correta").value;
    var urlImagemCorreta = document.getElementById("url-imagem").value;
    var respostaIncorreta1 = document.getElementById(
      "resposta-incorreta1"
    ).value;
    var urlImagemIncorreta1 = document.getElementById("url-imagem1").value;
    var respostaIncorreta2 = document.getElementById(
      "resposta-incorreta2"
    ).value;
    var urlImagemIncorreta2 = document.getElementById("url-imagem2").value;
    var respostaIncorreta3 = document.getElementById(
      "resposta-incorreta3"
    ).value;
    var urlImagemIncorreta3 = document.getElementById("url-imagem3").value;
  } catch (e) {}
  if (perguntaAnterior != 0) {
    let pergunta = questions.filter(
      (pergunta) => pergunta.id === perguntaAnterior
    )[0];
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
  paginaCriarQuizz.innerHTML = `
  <h2 class = "titulo container">Crie suas perguntas</h2>
  `;
  for (let i = 1; i < quizEnviar.qtdPerguntas + 1; i++) {
    if (i < numeroPergunta) {
      paginaCriarQuizz.innerHTML += `
      <div class="caixaEditarPergunta" onclick="preencherPerguntas(${i})">
        <h3 class="titulo-input">Pergunta ${i}</h3>
        <ion-icon name="create-outline"></ion-icon>
      </div>
      `;
    } else if (i == numeroPergunta) {
      paginaCriarQuizz.innerHTML += `
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
      `;
    } else {
      paginaCriarQuizz.innerHTML += `
      <div class="caixaEditarPergunta" onclick="preencherPerguntas(${i})">
        <h3 class="titulo-input">Pergunta ${i}</h3>
        <ion-icon name="create-outline"></ion-icon>
      </div>
      `;
    }

    if (i == quizEnviar.qtdPerguntas) {
      paginaCriarQuizz.innerHTML += `
      <div class="btn-container" >
        <button class="btn-enviar" onclick="criarNiveis()" style="margin-top:0px;">
          Prosseguir pra criar níveis
        </button>
      </div>
      `;
    }
  }
  let pergunta = questions.filter(
    (pergunta) => pergunta.id === numeroPergunta
  )[0];
  document.getElementById("texto-pergunta").value = pergunta.texto;
  document.getElementById("cor-pergunta").value = pergunta.cor;
  document.getElementById("resposta-correta").value = pergunta.respostaCorreta;
  document.getElementById("url-imagem").value = pergunta.urlImagemCorreta;
  document.getElementById("resposta-incorreta1").value =
    pergunta.respostaIncorreta1;
  document.getElementById("url-imagem1").value = pergunta.urlImagemIncorreta1;
  document.getElementById("resposta-incorreta2").value =
    pergunta.respostaIncorreta2;
  document.getElementById("url-imagem2").value = pergunta.urlImagemIncorreta2;
  document.getElementById("resposta-incorreta3").value =
    pergunta.respostaIncorreta3;
  document.getElementById("url-imagem3").value = pergunta.urlImagemIncorreta3;
  document.querySelector(".container").scrollIntoView({ behavior: "smooth" });
}

let levels = [];
let nivelAnterior = 0;

function criarNiveis() {
  for (let i = 1; i < quizEnviar.qtdNiveis + 1; i++) {
    let level = {
      title: "",
      image: "",
      text: "",
      minValue: "",
      id: i,
    };
    levels.push(level);
  }
  nivelAnterior = 0;
  let texto = document.getElementById("texto-pergunta").value;
  let cor = document.getElementById("cor-pergunta").value;
  let respostaCorreta = document.getElementById("resposta-correta").value;
  let urlImagemCorreta = document.getElementById("url-imagem").value;
  let respostaIncorreta1 = document.getElementById("resposta-incorreta1").value;
  let urlImagemIncorreta1 = document.getElementById("url-imagem1").value;
  let respostaIncorreta2 = document.getElementById("resposta-incorreta2").value;
  let urlImagemIncorreta2 = document.getElementById("url-imagem2").value;
  let respostaIncorreta3 = document.getElementById("resposta-incorreta3").value;
  let urlImagemIncorreta3 = document.getElementById("url-imagem3").value;

  let pergunta = questions.filter(
    (pergunta) => pergunta.id === perguntaAnterior
  )[0];
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
  preencherNiveis();
}

function preencherNiveis(numeroNivel = 1) {
  if (validarPerguntas()) {
    const paginaCriarQuizz = document.querySelector(".info-basica");
    if (nivelAnterior == 0) {
      paginaCriarQuizz.innerHTML = "";
    }
    if (nivelAnterior != 0) {
      var title = document.getElementById("titulo-nivel").value;
      var image = document.getElementById("imagem-nivel").value;
      var text = document.getElementById("texto-nivel").value;
      var minValue = document.getElementById("valor-nivel").value;
    }
    if (nivelAnterior != 0) {
      let level = levels.filter((level) => level.id === nivelAnterior)[0];
      level.text = text;
      level.image = image;
      level.title = title;
      level.minValue = minValue;
    }
    paginaCriarQuizz.innerHTML = `
    <h2 class = "titulo container">Agora, decida os níveis!</h2>
    `;
    for (let i = 1; i < quizEnviar.qtdNiveis + 1; i++) {
      if (i < numeroNivel) {
        paginaCriarQuizz.innerHTML += `
        <div class="caixaEditarPergunta" onclick="preencherNiveis(${i})">
          <h3 class="titulo-input">Nível ${i}</h3>
          <ion-icon name="create-outline"></ion-icon>
        </div>
        `;
      } else if (i == numeroNivel) {
        paginaCriarQuizz.innerHTML += `
        <form class ="form-criar criar-perguntas" >
          <div class="container">
            <div class="container-niveis">
              <h3 class="titulo-input">Nível ${numeroNivel}</h3>
              <input type="text" id="titulo-nivel" placeholder="Título do nível" />
              <input type="text" id="valor-nivel" placeholder="% de acerto mínima" />
              <input type="text" id="imagem-nivel" placeholder="URL da imagem do nível" />
              <textarea id="texto-nivel" placeholder="Descrição do nível"></textarea>
            </div>
          </div>
        </form>
        `;
      } else {
        paginaCriarQuizz.innerHTML += `
        <div class="caixaEditarPergunta" onclick="preencherNiveis(${i})">
          <h3 class="titulo-input">Nível ${i}</h3>
          <ion-icon name="create-outline"></ion-icon>
        </div>
        `;
      }

      if (i == quizEnviar.qtdNiveis) {
        paginaCriarQuizz.innerHTML += `
        <div class="btn-container" >
          <button class="btn-enviar" onclick="finalizarQuizz()" style="margin-top:0px;">
            Finalizar Quizz
          </button>
        </div>
        `;
      }
    }

    if (nivelAnterior != 0) {
      let level = levels.filter((level) => level.id === numeroNivel)[0];
      document.getElementById("titulo-nivel").value = level.title;
      document.getElementById("imagem-nivel").value = level.image;
      document.getElementById("valor-nivel").value = level.minValue;
      document.getElementById("texto-nivel").value = level.text;
      document
        .querySelector(".container")
        .scrollIntoView({ behavior: "smooth" });
    }
    nivelAnterior = numeroNivel;
  }
}

function finalizarQuizz() {
  let title = document.getElementById("titulo-nivel").value;
  let image = document.getElementById("imagem-nivel").value;
  let text = document.getElementById("texto-nivel").value;
  let minValue = document.getElementById("valor-nivel").value;
  let level = levels.filter((level) => level.id === nivelAnterior)[0];
  level.text = text;
  level.image = image;
  level.title = title;
  level.minValue = minValue;

  if (validarNiveis()) {
    let quizzCompleto = {
      title: quizEnviar.titulo,
      image: quizEnviar.url,
      questions: [],
      levels: [],
    };

    questions.forEach((question) => {
      if (
        question.respostaIncorreta2 == "" ||
        question.urlImagemIncorreta2 == "" ||
        !validarURL(question.urlImagemIncorreta2)
      ) {
        question.respostaIncorreta2 = "";
        question.urlImagemIncorreta2 = "";
      }

      if (
        question.respostaIncorreta3 == "" ||
        question.urlImagemIncorreta3 == "" ||
        !validarURL(question.urlImagemIncorreta3)
      ) {
        question.respostaIncorreta3 = "";
        question.urlImagemIncorreta3 = "";
      }
    });

    questions.forEach((question) => {
      let obj = {
        title: question.texto,
        color: question.cor,
        answers: [
          {
            text: question.respostaCorreta,
            image: question.urlImagemCorreta,
            isCorrectAnswer: true,
          },
          {
            text: question.respostaIncorreta1,
            image: question.urlImagemIncorreta1,
            isCorrectAnswer: false,
          },
        ],
      };

      if (question.respostaIncorreta2) {
        obj.answers.push({
          text: question.respostaIncorreta2,
          image: question.urlImagemIncorreta2,
          isCorrectAnswer: false,
        });
      }

      if (question.respostaIncorreta3) {
        obj.answers.push({
          text: question.respostaIncorreta3,
          image: question.urlImagemIncorreta3,
          isCorrectAnswer: false,
        });
      }
      quizzCompleto.questions.push(obj);
    });

    levels.forEach((level) => {
      let obj = {
        title: level.title,
        image: level.image,
        text: level.text,
        minValue: parseInt(level.minValue),
      };
      quizzCompleto.levels.push(obj);
    });

    let promise = axios.post(`${URL_BASE}/quizzes`, quizzCompleto);
    promise.then((res) => {
      let quizzID = res.data.id;
      let quizzKey = res.data.key;
      arrQuizzes.push();
      armazenarQuiz(quizzID,quizzKey);
      const paginaCriarQuizz = document.querySelector(".info-basica");
      paginaCriarQuizz.innerHTML = `
      <h2 class = "titulo container">Seu quizz está pronto!</h2>
      `;
      renderizarQuizCriado(res.data);
      paginaCriarQuizz.innerHTML += `
      <div class="btn-container" >
        <button class="btn-enviar" onclick="selecionarQuizzCriado()" style="margin-top:0px;">
          Acessar Quizz
        </button>
      </div>

      <button class="btn-voltar" onclick="window.location.reload()">
        Voltar pra home
      </button>
      `;
    });
    promise.catch(() => alert("ERRO! Tente enviar novamente"));
  }
}

function selecionarQuizzCriado() {
  sessionStorage.setItem("quizCriado", "true");
  window.location.reload();
}

function validarNiveis() {
  for (let i = 0; i < levels.length; i++) {
    if (levels[i].title.length < 10) {
      alert("O título do nível deve ter mais de 10 caracteres!");
      preencherNiveis(levels[i].id);
      let titulo = document.getElementById("titulo-nivel");
      titulo.value = "";
      titulo.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (
      isNaN(levels[i].minValue) ||
      (!isNaN(levels[i].minValue) &&
        (levels[i].minValue < 0 || levels[i].minValue > 100))
    ) {
      alert("Insira uma porcentagem válida!");
      preencherNiveis(levels[i].id);
      let porcentagem = document.getElementById("valor-nivel");
      porcentagem.value = "";
      porcentagem.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (!validarURL(levels[i].image)) {
      alert("Insira uma URL válida!");
      preencherNiveis(levels[i].id);
      let url = document.getElementById("imagem-nivel");
      url.value = "";
      url.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (levels[i].text.length < 30) {
      alert("A descrição do nível deve ter mais de 30 caracteres!");
      preencherNiveis(levels[i].id);
      let texto = document.getElementById("texto-nivel");
      texto.value = "";
      texto.setAttribute("style", "border: 1px solid red");
      return false;
    }
    let cont = 0;
    levels.forEach((level) => {
      if (level.minValue == 0) {
        cont++;
      }
    });
    if (cont == 0) {
      alert("Deve existir pelo menos 1 nível com 0% de acerto");
      return false;
    }
  }
  return true;
}

function validarPerguntas() {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].texto.length < 20) {
      alert("O título da pergunta deve ter mais de 20 caracteres!");
      preencherPerguntas(questions[i].id);
      let titulo = document.getElementById("texto-pergunta");
      titulo.value = "";
      titulo.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (!validarHexadecimal(questions[i].cor)) {
      alert("Insira uma cor Hexadecimal válida!");
      preencherPerguntas(questions[i].id);
      let cor = document.getElementById("cor-pergunta");
      cor.value = "";
      cor.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (!questions[i].respostaCorreta) {
      alert("O texto da resposta não pode estar vazio!");
      preencherPerguntas(questions[i].id);
      let texto = document.getElementById("resposta-correta");
      texto.value = "";
      texto.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (!questions[i].respostaIncorreta1) {
      alert("O texto da resposta não pode estar vazio!");
      preencherPerguntas(questions[i].id);
      let texto = document.getElementById("resposta-incorreta1");
      texto.value = "";
      texto.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (!validarURL(questions[i].urlImagemCorreta)) {
      alert("Insira uma URL válida!");
      preencherPerguntas(questions[i].id);
      let url = document.getElementById("url-imagem");
      url.value = "";
      url.setAttribute("style", "border: 1px solid red");
      return false;
    } else if (!validarURL(questions[i].urlImagemIncorreta1)) {
      alert("Insira uma URL válida!");
      preencherPerguntas(questions[i].id);
      let url = document.getElementById("url-imagem1");
      url.value = "";
      url.setAttribute("style", "border: 1px solid red");
      return false;
    }
  }
  return true;
}

function validarHexadecimal(hex) {
  if (hex[0] != "#") {
    return false;
  }

  if (hex.length != 7) {
    return false;
  }

  for (let i = 1; i < hex.length; i++) {
    const ch = hex[i];
    if (
      (!isNaN(ch) && (ch < "0" || ch > "9")) ||
      (isNaN(ch) && (ch < "A" || ch > "F"))
    ) {
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

function armazenarQuiz(id, key) {
  let seusQuizzes = JSON.parse(localStorage.getItem("seusQuizzes"));

  if (typeof id === "number") {
    seusQuizzes.push({ id, key });
  }

  atualizarLocalStorage(seusQuizzes);
}

function abrirModal(e, id) {
  e.stopPropagation();

  const caixaAlerta = document.querySelector(".caixa-alerta");

  if (caixaAlerta) {
    caixaAlerta.classList.remove("hidden");

    caixaAlerta.querySelector(
      ".texto"
    ).innerText = `Você quer deletar o quiz ${id}?`;

    const confirmar = caixaAlerta.querySelector(".confirmar");

    confirmar.setAttribute("onclick", `deletarQuiz(${id})`);
  }
}

function fecharModal() {
  const caixaAlerta = document.querySelector(".caixa-alerta");

  if (caixaAlerta) caixaAlerta.classList.add("hidden");
}

function atualizarLocalStorage(arr) {
  localStorage.setItem("seusQuizzes", JSON.stringify([...arr]));
}

function deletarQuiz(id) {
  mostrarLoader();

  const URL = `${URL_BASE}/quizzes/${id}`;
  const { key } = arrSeusQuizzes.filter((quiz) => quiz.id === id)[0];

  if (key) {
    const req = axios.delete(URL, { headers: { "Secret-Key": key } });

    req.then(() => {
      esconderLoader();

      const novoArray = arrSeusQuizzes.filter((quiz) => quiz.id !== id);

      atualizarLocalStorage(novoArray);

      window.location.reload();
    });

    req.catch(() => alert("Algo deu errado! :("));

    esconderLoader();
  }
}

function mostrarLoader() {
  const loader = document.querySelector(".loader-container");

  loader.classList.remove("hidden");
}

function esconderLoader() {
  const loader = document.querySelector(".loader-container");

  loader.classList.add("hidden");
}

function inicializarLocalStorage() {
  if (!arrSeusQuizzes) {
    localStorage.setItem("seusQuizzes", JSON.stringify([]));
  }
}

inicializarLocalStorage();
obterQuizzes();
