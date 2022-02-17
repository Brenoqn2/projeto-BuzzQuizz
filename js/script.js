const URL_BASE = "https://mock-api.driven.com.br/api/v4/buzzquizz";
const arrQuizzes = [];

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
  const selecionado = arrQuizzes.filter((elemento) => elemento.id === id);
  const paginaQuizz = document.querySelector(".pagina-quizz");
  const main = document.querySelector("main");
  const caixaPerguntas = document.getElementsByClassName("caixaPerguntas")[0];
  caixaPerguntas.innerHTML = "";

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

  perguntas.forEach((pergunta) => {
    const perguntasEmbaralhadas = pergunta.answers.sort(
      () => Math.random() - 0.5
    );
    let primeiraLinha = "";
    // let segundaLinha = "";
    for (let i = 0; i < perguntasEmbaralhadas.length; i++) {
      if (perguntasEmbaralhadas[i].isCorrectAnswer) {
        primeiraLinha += `
        <div class="alternativa certa" onclick="selecionarAlternativa(this)">
          <img src="${perguntasEmbaralhadas[i].image}"/>
          <p class="texto">${perguntasEmbaralhadas[i].text}</p>
        </div>
        `;
      } else {
        primeiraLinha += `
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
        ${primeiraLinha}
      </div>
    </div>
    `;
    caixaPerguntas.innerHTML += perguntaElemento;
  });

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
      mostrarResultado();
    }
  }
}

function mostrarResultado() {
  const paginaQuizz = document.querySelector(".pagina-quizz");

  const quizResultado = paginaQuizz.querySelector(".quiz-resultado");
  quizResultado.classList.remove("hidden");

  quizResultado.scrollIntoView({ behavior: "smooth" });
}

function reiniciarQuizz() {
  const paginaQuizz = document.querySelector(".pagina-quizz");

  const quizResultado = paginaQuizz.querySelector(".quiz-resultado");
  quizResultado.classList.add("hidden");

  const todasAsPerguntas = paginaQuizz.querySelectorAll(".pergunta");

  todasAsPerguntas.forEach((pergunta) => {
    const alternativas = pergunta.querySelectorAll(".alternativa");

    const tam = alternativas.length;
    let condicao = null;

    for (let i = 0; i < tam; i++) {
      condicao =
        alternativas[i].classList.contains("opaco") ||
        alternativas[i].classList.contains("alternativaSelecionada");

      if (condicao) {
        alternativas[i].classList.remove("alternativaSelecionada");
        alternativas[i].classList.remove("opaco");
        alternativas[i].children[1].style = "";
      }
    }
  });

  window.scrollTo(0, 0);
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
}

obterQuizzes();
