let nome = "";
let logado = false;
let id2 = null;

function logarEnter() {
    if (event.key === 'Enter') {
        logar();
    }
}


function logar() {
    nome = document.querySelector(".entrada-usuario").value;
    if (nome !== "") {
        const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", { name: nome })
        promisse.then(entrarNaSala);
        promisse.catch(tratarErro);
        hideLogin();
    }
}

function tratarErro(erro) {
    novo = nome.trim();
    if (erro.response.status === 400 && novo === "") {
        alert("Error: 400 \n Nome de usuário inválido");
        showLogin();
        return;
    }
    if (erro.response.status === 400 && logado) {
        alert("Error: 400 \n Ocorreu um problema na conexão com o Servidor")
        window.location.reload();
    }
    if (erro.response.status === 400 && !logado) {
        alert("Error: 400 \n Esse nome de usuário já está em uso")
        window.location.reload();
    }
}

function entrarNaSala(resposta) {
    let elemento = document.querySelector(".login");
    elemento.classList.add("hidden");
    logado = true;
    const id = setInterval(manterConexão, 4500);
    buscarMsg(resposta);
}

function manterConexão() {
    console.log("continuo conectado");
    const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", { name: nome })
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
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
        if ((mensagens[i].type === "private_message") && (mensagens[i].to === nome)) {
            elemento.innerHTML += `<li class="msg-box private">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> reservadamente para <strong>&nbsp;${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
    }
    document.querySelector(".msg-box:last-child").scrollIntoView();
}

function enviarEnter() {
    if (event.key === 'Enter') {
        enviarMsg();
    }
}

function enviarMsg(msg) {
    let elemento = document.querySelector(".text-bar input").value;
    if (document.querySelector(".text-bar input").value === "") return;
    console.log(elemento);
    const promisse = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages', { from: nome, to: "Todos", text: elemento, type: "message" });
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
    document.querySelector(".text-bar input").value = "";
}

function hideLogin() {
    let elemento = document.querySelector(".campo-insercao");
    elemento.classList.add("hidden");
    elemento = document.querySelector(".loading");
    elemento.classList.remove("hidden");
}

function showLogin() {
    let elemento = document.querySelector(".campo-insercao");
    elemento.classList.remove("hidden");
    elemento = document.querySelector(".loading");
    elemento.classList.add("hidden");
    document.querySelector(".entrada-usuario").value = "";
}

function mostrarMenu() {
    const elemento = document.querySelector(".tela-menu");
    elemento.classList.remove("hidden");
    buscarContatos();
    id2 = setInterval(buscarContatos, 8500);
}

function esconderMenu(elemento) {
    elemento.parentNode.classList.add("hidden");
    clearInterval(id2);
}

function buscarContatos() {
    const promisse = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants");
    promisse.then(renderizarContatos);
}

function renderizarContatos(resposta) {
    contatos = resposta.data;
    const elemento = document.querySelector(".contatos");
    elemento.innerHTML = "";
    for (let i = 0; i < contatos.length; i++) {
        elemento.innerHTML += ` <li onclick="selecionarUsuario()">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <p>${contatos[i].name}</p>
                                </li>`;
    }

}

//fazer amanha: funcçao pra selecionar usario na lsita de contatos 

// e funçao para enviar as msgs privadas