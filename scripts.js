let nome = "";
let logado = false;
let id2 = null;
let userSelected = "Todos";
let contatoAntigo = "";
let visibilidadeAntigo = "";
let msgType = "message";
let auto = false;

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
    const promisse = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", { name: nome })
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
}

function buscarMsg(resposta) {
    const promisse = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages');
    promisse.then(renderizarMsgAutoEnabled); // se quiser desabilitar o bot trocar pra renderizarMsg() 
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
        if ((mensagens[i].type === "private_message") && ((mensagens[i].to === nome) || (mensagens[i].from === nome))) {
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
    if (userSelected === "Todos" && msgType === "private_message") {
        alert("Impossivel mandar menssagens privadas para todos \n\nVisibilidade alterada para Público")
        let visibilidade = document.querySelector(".visivel");
        selecionarVisibilidade(visibilidade);
    }
    let elemento = document.querySelector(".text-bar input").value;
    if (document.querySelector(".text-bar input").value === "") return;
    if (document.querySelector(".text-bar input").value === "!bot=on") auto = true; // liga o bot
    if (document.querySelector(".text-bar input").value === "!bot=off") auto = false; // desliga o bot
    const promisse = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages', { from: nome, to: userSelected, text: elemento, type: msgType });
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
    id2 = setInterval(buscarContatos, 5000);
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
    elemento.innerHTML = `<li class="user-selected" onclick="selecionarContato(this)">
                                <ion-icon name="people"></ion-icon>
                                <p>Todos</p>
                                <ion-icon class="check ${userSelected === "Todos"?"":"hidden"}" name="checkmark"></ion-icon>
                            </li>`;
    for (let i = 0; i < contatos.length; i++) {
        if (contatos[i].name === nome) {
            continue;
        }
        elemento.innerHTML += `<li onclick="selecionarContato(this)">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <p>${contatos[i].name}</p>
                                    <ion-icon class="check ${userSelected === contatos[i].name?"":"hidden"}" name="checkmark"></ion-icon>
                                </li>`;

    }
    // codigo abaixo comentado pois bateu 20:30 de sexta-feira e não deu tempo de implementar

    // if (msgType === "private_message") {
    //     document.querySelector(".text-bar p").innerHTML = "Enviando para " + userSelected + " (reservadamente)";
    // }
    // if (msgType === "message") {
    //     document.querySelector(".text-bar p").innerHTML = "Enviando para" + userSelected;
    // }
}

function selecionarContato(contato) {
    if (contatoAntigo === "") {
        contatoAntigo = document.querySelector(".user-selected");
    }
    userSelected = contato.querySelector("p").innerHTML;
    contatoAntigo = contato;
    buscarContatos();
}

function selecionarVisibilidade(visibilidade) {
    if (visibilidadeAntigo === "") {
        visibilidadeAntigo = document.querySelector(".selected");
    }
    visibilidadeAntigo.classList.remove("selected");
    visibilidadeAntigo.querySelector(".check").classList.add("hidden");
    visibilidade.classList.add("selected");
    visibilidade.querySelector(".check").classList.remove("hidden");
    if (document.querySelector(".selected").classList.contains("visivel")) {
        msgType = "message";

        // codigo abaixo comentado pois não tive tempo para implementar

        // if (userSelected !== "Todos") {
        //     document.querySelector(".text-bar p").classList.add("hidden");
        // }
    }
    if (document.querySelector(".selected").classList.contains("privado")) {
        msgType = "private_message";

        // linha abaixo comentada pois não tive tempo para implementar
        // document.querySelector(".text-bar p").classList.remove("hidden");
    }
    console.log(msgType);
    visibilidadeAntigo = visibilidade;
}

//daqui pra baixo apenas funções do chat-bot

function renderizarMsgAutoEnabled(resposta) {
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
        if ((mensagens[i].type === "private_message") && ((mensagens[i].to === nome) || (mensagens[i].from === nome))) {
            elemento.innerHTML += `<li class="msg-box private">
                                        <span class="time">(${mensagens[i].time})</span>
                                        <span class="message-text"><strong>&nbsp;${mensagens[i].from}</strong> reservadamente para <strong>&nbsp;${mensagens[i].to}</strong>: ${mensagens[i].text}</span>
                                    </li>`
        }
    }
    if (auto) { // casos de mensagem automática
        if (mensagens[mensagens.length - 1].from !== nome && mensagens[mensagens.length - 1].text === "entra na sala...") {
            enviarMsgAuto("Olá seja bem vindo " + mensagens[mensagens.length - 1].from + ". Não deixe de comparecer ao bootbar hoje a noite! Contamos com sua presença.", mensagens[mensagens.length - 1].from);
        }
        if (mensagens[mensagens.length - 1].from !== nome && (mensagens[mensagens.length - 1].text === "oi" || mensagens[mensagens.length - 1].text === "ola" || mensagens[mensagens.length - 1].text === "oii" || mensagens[mensagens.length - 1].text === "olá" || mensagens[mensagens.length - 1].text === "alo")) {
            enviarMsgAuto("Oii :D " + mensagens[mensagens.length - 1].from, mensagens[mensagens.length - 1].from);
        }
    }
    document.querySelector(".msg-box:last-child").scrollIntoView();
}

function enviarMsgAuto(msg, to) {
    if (userSelected === "Todos" && msgType === "private_message") {
        alert("Impossivel mandar menssagens privadas para todos \n\nVisibilidade alterada para Público")
        let visibilidade = document.querySelector(".visivel");
        selecionarVisibilidade(visibilidade);
    }
    const promisse = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages', { from: nome, to: to, text: msg, type: msgType });
    promisse.then(buscarMsg);
    promisse.catch(tratarErro);
    document.querySelector(".text-bar input").value = "";
}