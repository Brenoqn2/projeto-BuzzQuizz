const URL_BASE = "https://mock-api.driven.com.br/api/v4/buzzquizz";
const arrQuizzes = [];

function obterQuizzes() {
  const URL = `${URL_BASE}/quizzes`;
  const req = axios.get(URL);

  req.then((res) => renderizarQuizzes(res.data));
}

function renderizarQuizzes(quizzes) {
  const todosQuizzes = document.querySelector(".todos-quizzes");

  todosQuizzes.innerHTML = "";

  quizzes.forEach((quiz) => {
    arrQuizzes.push(quiz);

    const background = `background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 0.5) 64.58%,
      #000000 100%
    ),
    url(${quiz.image});`;

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

  main.classList.add("hidden");
  paginaQuizz.classList.remove("hidden");

  // Alterar o header
  const header = paginaQuizz.querySelector(".header");
  const headerTitulo = header.querySelector(".header-titulo");

  header.style = `background: linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("${selecionado[0].image}"); background-size: cover; background-position: center;`;
  headerTitulo.innerText = selecionado[0].title;

  // Renderizar as perguntas
  const perguntas = selecionado[0].questions;

  perguntas.forEach((pergunta) => {
    let perguntasHTML = "";
    const perguntasEmbaralhadas = pergunta.answers.sort(
      () => Math.random() - 0.5
    );

    perguntasEmbaralhadas.forEach((alternativa) => {
      perguntasHTML += `
        <div class="alternativa">
          <img src="${alternativa.image}"/>
          <p class="texto">${alternativa.text}</p>
        </div>
      `;
    });

    const perguntaElemento = `
      <div class="pergunta">
        <p class="pergunta-texto" style="background-color: ${pergunta.color}">
          ${pergunta.title}
        </p>
        <div class="alternativas">
          ${perguntasHTML}
        </div>
      </div>
    `;

    paginaQuizz.innerHTML += perguntaElemento;
  });
}

obterQuizzes();
