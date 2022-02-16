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
    <div class="quizz" style="${background}">
      <p class="quizz-titulo">
        ${quiz.title}
      </p>
    </div>
    `;
  });
}

obterQuizzes();
