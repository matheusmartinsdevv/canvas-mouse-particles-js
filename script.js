// Função construtora que cria um objeto responsável por calcular um valor senoidal para animação
function n(e) {
    this.init(e || {});
}

n.prototype = {
    // Inicializa os parâmetros do objeto (fase, offset, frequência e amplitude)
    init: function (e) {
        this.phase = e.phase || 0;           // fase inicial do seno
        this.offset = e.offset || 0;         // valor base do seno
        this.frequency = e.frequency || 0.001; // frequência da oscilação
        this.amplitude = e.amplitude || 1;  // amplitude da oscilação
    },
    // Atualiza a fase e calcula o valor do seno multiplicado pela amplitude e somado ao offset
    update: function () {
        this.phase += this.frequency;
        e = this.offset + Math.sin(this.phase) * this.amplitude;
        return e;
    },
    // Retorna o valor atual calculado
    value: function () {
        return e;
    },
};

// Função construtora que cria uma linha com vários "nós" (nodes) para simular uma mola
function Line(e) {
    this.init(e || {});
}

Line.prototype = {
    init: function (e) {
        // Parâmetros de física da linha: mola e atrito com pequenas variações aleatórias
        this.spring = e.spring + 0.1 * Math.random() - 0.02;
        this.friction = E.friction + 0.01 * Math.random() - 0.002;

        this.nodes = [];
        // Cria os nós da linha, todos inicialmente na posição do mouse (pos)
        for (var t, n = 0; n < E.size; n++) {
            t = new Node();
            t.x = pos.x;
            t.y = pos.y;
            this.nodes.push(t);
        }
    },
    // Atualiza as posições e velocidades dos nós da linha aplicando as forças da mola e atrito
    update: function () {
        var e = this.spring,
            t = this.nodes[0];

        // Aplica força da mola entre o primeiro nó e o ponteiro do mouse
        t.vx += (pos.x - t.x) * e;
        t.vy += (pos.y - t.y) * e;

        // Para cada nó da linha (exceto o primeiro), aplica forças baseadas na posição e velocidade do nó anterior
        for (var n, i = 0, a = this.nodes.length; i < a; i++) {
            t = this.nodes[i];
            if (i > 0) {
                n = this.nodes[i - 1];
                t.vx += (n.x - t.x) * e;
                t.vy += (n.y - t.y) * e;
                t.vx += n.vx * E.dampening;
                t.vy += n.vy * E.dampening;
            }
            // Aplica atrito nas velocidades e atualiza posições
            t.vx *= this.friction;
            t.vy *= this.friction;
            t.x += t.vx;
            t.y += t.vy;
            e *= E.tension; // Diminui a força da mola ao longo dos nós
        }
    },
    // Desenha a linha no canvas usando curvas quadráticas entre os nós
    draw: function () {
        var e,
            t,
            n = this.nodes[0].x,
            i = this.nodes[0].y;

        ctx.beginPath();
        ctx.moveTo(n, i);

        for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
            e = this.nodes[a];
            t = this.nodes[a + 1];
            n = 0.5 * (e.x + t.x);
            i = 0.5 * (e.y + t.y);
            ctx.quadraticCurveTo(e.x, e.y, n, i);
        }

        e = this.nodes[a];
        t = this.nodes[a + 1];
        ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
        ctx.stroke();
        ctx.closePath();
    },
};

// Evento disparado quando o mouse se move ou toca a tela - controla a posição do ponteiro
function onMousemove(e) {
    // Função que cria as linhas animadas com base na quantidade de "trails"
    function o() {
        lines = [];
        for (var e = 0; e < E.trails; e++)
            lines.push(new Line({ spring: 0.4 + (e / E.trails) * 0.025 }));
    }

    // Função que atualiza a posição do ponteiro com base no mouse ou toque na tela
    function c(e) {
        if (e.touches) {
            pos.x = e.touches[0].pageX;
            pos.y = e.touches[0].pageY;
        } else {
            pos.x = e.clientX;
            pos.y = e.clientY;
        }
        e.preventDefault();
    }

    // Função que atualiza posição apenas se houver um toque na tela (para dispositivos touch)
    function l(e) {
        if (e.touches.length == 1) {
            pos.x = e.touches[0].pageX;
            pos.y = e.touches[0].pageY;
        }
    }

    // Remove antigos event listeners para evitar múltiplas chamadas
    document.removeEventListener('mousemove', onMousemove);
    document.removeEventListener('touchstart', onMousemove);

    // Adiciona novos event listeners para atualizar a posição do ponteiro
    document.addEventListener('mousemove', c);
    document.addEventListener('touchmove', c);
    document.addEventListener('touchstart', l);

    // Atualiza a posição inicial com o evento recebido
    c(e);

    // Cria as linhas animadas
    o();

    // Começa a animação
    render();
}

// Função que desenha tudo no canvas a cada frame da animação
function render() {
    if (ctx.running) {
        ctx.globalCompositeOperation = 'source-over'; // Modo de composição padrão
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Limpa o canvas
        ctx.globalCompositeOperation = 'lighter'; // Modo que deixa as cores mais claras e brilhantes

        // Cor do traço muda baseado no valor senoidal da função 'f'
        ctx.strokeStyle = 'hsla(' + Math.round(f.update()) + ',50%,20%,0.8)';
        ctx.lineWidth = 3;

        // Atualiza e desenha todas as linhas
        for (var e, t = 0; t < E.trails; t++) {
            e = lines[t];
            e.update();
            e.draw();
        }

        ctx.frame++;
        window.requestAnimationFrame(render); // Solicita o próximo frame
    }
}

// Ajusta o tamanho do canvas para preencher a janela do navegador
function resizeCanvas() {
    ctx.canvas.width = window.innerWidth - 20;
    ctx.canvas.height = window.innerHeight;
}

// Variáveis globais usadas no script
var ctx,        // contexto do canvas para desenho
    f,          // objeto para cálculo da cor oscilante
    e = 0,      // variável auxiliar para valor oscilante
    pos = {},   // posição atual do mouse ou toque
    lines = [], // array que guarda as linhas animadas
    E = {       // configurações do efeito
        debug: true,
        friction: 0.5,
        trails: 20,
        size: 50,
        dampening: 0.25,
        tension: 0.98,
    };

// Objeto que representa um nó da linha, com posição e velocidade
function Node() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.vx = 0;
}

// Função que inicializa tudo: pega o canvas, configura os eventos e começa a animação
const renderCanvas = function () {
    ctx = document.getElementById('canvas').getContext('2d');
    ctx.running = true;
    ctx.frame = 1;

    // Cria o objeto 'f' responsável pela cor que oscila baseado em função seno
    f = new n({
        phase: Math.random() * 2 * Math.PI,
        amplitude: 85,
        frequency: 0.0015,
        offset: 285,
    });

    // Adiciona eventos para atualizar a posição do mouse/toque
    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('touchstart', onMousemove);

    // Eventos para ajustar o canvas ao redimensionar ou girar o dispositivo
    document.body.addEventListener('orientationchange', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

    // Quando a aba ganhar foco, garante que a animação continue rodando
    window.addEventListener('focus', () => {
        if (!ctx.running) {
            ctx.running = true;
            render();
        }
    });

    // Quando a aba perder foco, mantém ctx.running como true (pode ser ajustado)
    window.addEventListener('blur', () => {
        ctx.running = true;
    });

    resizeCanvas(); // Ajusta o canvas inicialmente
};

// Quando a página carregar, chama a função que inicia o canvas e animação
window.onload = function () {
    renderCanvas();
};
