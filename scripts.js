let nome = "";

function entrarNaSala() {
    nome = prompt("Digite seu nome de usuário");
    const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", { name: nome })
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
}

function tratarErro(erro) {
    if (erro.response.status === 400) {
        alert("Error: 400 \n Nome de usuário inválido ou já está em uso");
        entrarNaSala();
    }
}

function buscarMsg(resposta) {
    const promisse = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages');
    promisse.then(renderizarMsg);
    promisse.catch(tratarErro);
}

function renderizarMsg(resposta) {
    const mensagens = resposta.data;
    const elemento = document.querySelector(".msg-feed");
    elemento.innerHTML = "";
    for (let i = 0; i < mensagens.length; i++) {
        if (mensagens[i].type === "status") {
            elemento.innerHTML += `<li class="msg-box ${mensagens[i].type}">
                                    <span class="time">(${mensagens[i].time})</span>
                                    <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong>&nbsp;${mensagens[i].text}</span>
                                </li>`;
        }
        if (mensagens[i].type === "message") {
            elemento.innerHTML += `<li class="msg-box">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> para <strong>${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
        if ((mensagens[i].type === "private_message") /* && mensagens[i].to === nome */ ) {
            elemento.innerHTML += `<li class="msg-box private">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> reservadamente para <strong>&nbsp;${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
    }
}

function manterConexão() {
    console.log("continuo conectado");
    const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", { name: nome })
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
}

function enviarMsg(msg) {
    let elemento = document.querySelector(".text-bar input").value;
    console.log(elemento);
    const promisse = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages', { from: nome, to: "Todos", text: elemento, type: "message" });
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
    document.querySelector(".text-bar input").value = "";
}

entrarNaSala();
const id = setInterval(manterConexão, 5000);