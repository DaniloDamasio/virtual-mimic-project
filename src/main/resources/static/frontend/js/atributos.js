/**
 * Configurações de Estado dos Atributos e suas Descrições de RPG
 */
const attributesData = [
    { 
        id: 'forca', 
        name: 'Força', 
        value: 8,
        description: "O atributo de Força representa o poder físico bruto de um personagem. Ele é usado principalmente para determinar a eficácia em ataques corpo a corpo, a capacidade de causar dano com armas pesadas e a facilidade em realizar ações como empurrar, escalar, puxar ou levantar objetos."
    },
    { 
        id: 'inteligencia', 
        name: 'Inteligência', 
        value: 8,
        description: "A Inteligência mede a agudeza mental, raciocínio lógico e conhecimento acumulado. É crucial para magos para conjurar magias e para todos os personagens em testes de conhecimento, investigação e habilidades analíticas."
    },
    { 
        id: 'constituicao', 
        name: 'Constituição', 
        value: 8,
        description: "A Constituição representa a saúde, vigor e força vital. Ela determina seus pontos de vida máximos, resistência física a venenos, doenças e fadiga."
    },
    { 
        id: 'sabedoria', 
        name: 'Sabedoria', 
        value: 8,
        description: "A Sabedoria reflete a intuição, percepção e força de vontade. Ela é fundamental para clérigos e druidas para conjurar magias e é usada para testes de percepção, sobrevivência e para resistir a efeitos mentais."
    },
    { 
        id: 'destreza', 
        name: 'Destreza', 
        value: 8,
        description: "A Destreza mede a agilidade, reflexos e coordenação. É vital para ladinos e arqueiros, e é usada para testes de acrobacia, furtividade, esquiva de ataques e para manusear armas ágeis e de longo alcance."
    },
    { 
        id: 'carisma', 
        name: 'Carisma', 
        value: 8,
        description: "O Carisma representa a força de personalidade, capacidade de liderança e charme. É essencial para bardos, feiticeiros e paladinos para conjurar magias e é usado para testes de diplomacia, intimidação, engano e atuação."
    }
];

let remainingPoints = 24;

/**
 * Tabela de Custos do Sistema Point Buy (Padrão D&D 5e)
 */
const costTable = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

/**
 * Calcula o modificador matemático com base no valor atual do atributo
 */
function calculateModifier(val) {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
}

/**
 * Abre a janela modal populando com as informações dinâmicas do atributo
 */
function openModal(attributeId) {
    const attr = attributesData.find(a => a.id === attributeId);
    
    const modalTitle = document.getElementById('modal-title-text');
    const modalBody = document.getElementById('modal-body-text');
    
    if (modalTitle && modalBody && attr) {
        modalTitle.innerText = attr.name;
        modalBody.innerText = attr.description;
    }

    const modalOverlay = document.getElementById('attribute-modal');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

/**
 * Fecha a janela modal ativa
 */
function closeModal() {
    const modalOverlay = document.getElementById('attribute-modal');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

/**
 * Renderiza os cards e reconstrói a UI dinamicamente
 */
function updateUI() {
    const container = document.getElementById('attributes-container');
    if (!container) return;

    container.innerHTML = '';

    attributesData.forEach(attr => {
        const card = document.createElement('div');
        card.className = 'attribute-card';
        
        card.innerHTML = `
            <div class="shield">
                <div class="shield-inner">
                    <button class="attr-name-btn" onclick="openModal('${attr.id}')">${attr.name.toUpperCase()}</button>
                    <span class="attr-value">${attr.value}</span>
                </div>
            </div>
            <div class="modifier-group">
                <button class="btn-circle" onclick="changeValue('${attr.id}', -1)">-</button>
                <div class="modifier-circle">${calculateModifier(attr.value)}</div>
                <button class="btn-circle" onclick="changeValue('${attr.id}', 1)">+</button>
            </div>
        `;
        container.appendChild(card);
    });

    const pointsDisplay = document.getElementById('points-value');
    if (pointsDisplay) {
        pointsDisplay.innerText = remainingPoints;
    }
}

/**
 * Trata o incremento ou decremento dos atributos validando a regra de negócios
 */
function changeValue(id, delta) {
    const attr = attributesData.find(a => a.id === id);
    const newValue = attr.value + delta;

    if (newValue < 8 || newValue > 15) {
        return;
    }

    const currentTotalCost = attributesData.reduce((sum, a) => sum + costTable[a.value], 0);
    const newTotalCost = currentTotalCost - costTable[attr.value] + costTable[newValue];

    if (newTotalCost > 24) {
        console.warn("Pontos insuficientes para realizar esta alteração.");
        return;
    }

    attr.value = newValue;
    remainingPoints = 24 - newTotalCost;

    updateUI();
}

/**
 * Event Listeners de Inicialização e Atalhos Globais
 */
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    // Fecha o modal ao clicar fora da área utilizável da caixinha
    const modalOverlay = document.getElementById('attribute-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Atalho físico: fecha o modal usando a tecla ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});