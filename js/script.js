const URL_BASE = "https://mock-api.driven.com.br/api/v4/buzzquizz";
const arrQuizzes = [];

function obterQuizzes() {
  const URL = `${URL_BASE}/quizzes`;
  const req = axios.get(URL);

  req.then((res) => renderizarQuizzes(res.data));
}

function renderizarQuizzes(quizzes) {
  const todosQuizzes = document.querySelector(".todos-quizzes");

  todosQuizzes.innerHTML ="";

  quizzes.forEach((quiz) => {
    arrQuizzes.push(quiz);

    const background = 
    `
    background: url(${quiz.image});
    `;

    todosQuizzes.innerHTML +=
     `
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
  const caixaPerguntas = document.getElementsByClassName('caixaPerguntas')[0];
  caixaPerguntas.innerHTML = "";

  main.classList.add("hidden");
  paginaQuizz.classList.remove("hidden");

  // Alterar o header
  const header = paginaQuizz.querySelector(".header");
  const headerTitulo = header.querySelector(".header-titulo");

  header.style.background = `url(${selecionado[0].image})`;
  headerTitulo.innerText = selecionado[0].title;

  // Renderizar as perguntas
  const perguntas = selecionado[0].questions;

  perguntas.forEach((pergunta) => {
    const perguntasEmbaralhadas = pergunta.answers.sort(
      () => Math.random() - 0.5
    );
    let primeiraLinha = "";
    let segundaLinha = "";
    for (let i = 0; i<perguntasEmbaralhadas.length; i++){
      if (perguntasEmbaralhadas[i].isCorrectAnswer){
        primeiraLinha += 
        `
        <div class="alternativa certa" onclick="selecionarAlternativa(this)">
          <img src="${perguntasEmbaralhadas[i].image}"/>
          <p class="texto">${perguntasEmbaralhadas[i].text}</p>
        </div>
        `
      }
      else{
        primeiraLinha += 
        `
        <div class="alternativa" onclick="selecionarAlternativa(this)">
          <img src="${perguntasEmbaralhadas[i].image}"/>
          <p class="texto">${perguntasEmbaralhadas[i].text}</p>
        </div>
        `
      }
    }
    let perguntaElemento = 
    `
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
  })
  
  
}

function selecionarAlternativa(alternativaSelecionada){
  let alternativasElement = alternativaSelecionada.parentElement;
  alternativas = alternativasElement.children;
  let cont = 0;
  for (let i = 0; i<alternativas.length; i++){
    if (alternativas[i].classList.contains('alternativaSelecionada')){
      cont++;
    }
  }
  if(cont == 0){
    alternativaSelecionada.classList.add('alternativaSelecionada')
    for (let i = 0; i<alternativas.length; i++){
      let texto = alternativas[i].querySelector('.texto');
      if(alternativas[i].classList.contains('certa')){
        texto.style.color = '#009C22';
      }
      else{
        texto.style.color ='#FF4B4B';
      }
      if(!alternativas[i].classList.contains('alternativaSelecionada')){
        alternativas[i].classList.add('opaco');
      }
    }
    let perguntas = document.getElementsByClassName('pergunta');
    let pergunta = alternativasElement.parentElement;
    let index = 0;
    for (let i = 0; i<perguntas.length; i++){
      if (perguntas[i] === pergunta){
        index = i;
      }
    }
    if (index < perguntas.length - 1){
      setTimeout(() => perguntas[index+1].scrollIntoView({behavior:'smooth',block:'end'}),2000);
    }
  }
}

obterQuizzes();
