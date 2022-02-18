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
  const todosQuizzes = document.querySelector(".todos-quizzes");

  todosQuizzes.innerHTML = "";

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
  const pontos = Math.round(pontuacao/pontuacaoMeta)*100;
  console.log(niveisQuizz);
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
  console.log(pontos);

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

obterQuizzes();
