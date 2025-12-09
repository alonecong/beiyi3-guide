// Admin Logic for Block-Based Editing

let currentData = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof guideData === 'undefined') {
        alert("无法加载 data.js");
        return;
    }
    currentData = JSON.parse(JSON.stringify(guideData));
    initForm();
});

function initForm() {
    // Global Fields
    document.getElementById('hero-title').value = currentData.hero.title;
    document.getElementById('hero-subtitle').value = currentData.hero.subtitle;

    // Render Sections
    renderSections();
}

function renderSections() {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';

    currentData.sections.forEach((section, sIndex) => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'section-item';

        // Ensure blocks array exists
        if (!section.blocks) section.blocks = [];

        let blocksHtml = '';
        section.blocks.forEach((block, bIndex) => {
            blocksHtml += createBlockHtml(block, sIndex, bIndex);
        });

        sectionEl.innerHTML = `
            <div class="section-header">
                <div>
                    <strong>${section.icon} ${section.title}</strong>
                </div>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="moveSection(${sIndex}, -1)">⬆️</button>
                    <button class="btn btn-secondary btn-sm" onclick="moveSection(${sIndex}, 1)">⬇️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSection(${sIndex})">删除板块</button>
                </div>
            </div>
            <div class="section-body">
                <div class="form-group">
                    <label>标题</label>
                    <input type="text" class="form-control" value="${section.title}" oninput="updateSectionTitle(${sIndex}, this.value)">
                </div>
                <div class="form-group">
                    <label>图标</label>
                    <input type="text" class="form-control" style="width: 50px;" value="${section.icon}" oninput="currentData.sections[${sIndex}].icon = this.value">
                </div>
                
                <hr style="border:0; border-top:1px solid #eee; margin: 15px 0;">
                
                <div id="blocks-container-${sIndex}">
                    ${blocksHtml}
                </div>

                <div class="add-block-area">
                    <span>添加内容:</span>
                    <button class="btn btn-secondary btn-sm" onclick="addBlock(${sIndex}, 'subtitle')">+ 📝 小标题</button>
                    <button class="btn btn-secondary btn-sm" onclick="addBlock(${sIndex}, 'text')">+ 📄 纯文本</button>
                    <button class="btn btn-secondary btn-sm" onclick="addBlock(${sIndex}, 'list')">+ 📋 列表</button>
                    <button class="btn btn-secondary btn-sm" onclick="addBlock(${sIndex}, 'alert')">+ ⚠️ 提示框</button>
                </div>
            </div>
        `;
        container.appendChild(sectionEl);
    });
}

function createBlockHtml(block, sIndex, bIndex) {
    let inputHtml = '';

    if (block.type === 'list' || block.type === 'tips') {
        const lines = block.items ? block.items.join('\n') : '';
        inputHtml = `
            <textarea class="form-control" rows="4" 
                placeholder="每行一项"
                onchange="updateBlockList(${sIndex}, ${bIndex}, this.value)">${lines}</textarea>
        `;
    } else {
        const val = block.content || '';
        if (block.type === 'text') {
            inputHtml = `<textarea class="form-control" onchange="updateBlockContent(${sIndex}, ${bIndex}, this.value)">${val}</textarea>`;
        } else {
            inputHtml = `<input type="text" class="form-control" value="${val}" onchange="updateBlockContent(${sIndex}, ${bIndex}, this.value)">`;
        }
    }

    const typeLabels = {
        'subtitle': '小标题',
        'text': '纯文本段落',
        'list': '列表',
        'alert': '警告/提示框',
        'tips': '复杂提示卡'
    };

    return `
        <div class="block-item">
            <div class="block-header">
                <span class="block-type-badge">${typeLabels[block.type] || block.type}</span>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="moveBlock(${sIndex}, ${bIndex}, -1)">⬆️</button>
                    <button class="btn btn-secondary btn-sm" onclick="moveBlock(${sIndex}, ${bIndex}, 1)">⬇️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBlock(${sIndex}, ${bIndex})">×</button>
                </div>
            </div>
            ${inputHtml}
        </div>
    `;
}

// Actions
function updateSectionTitle(sIndex, val) {
    currentData.sections[sIndex].title = val;
}

function updateBlockContent(sIndex, bIndex, val) {
    currentData.sections[sIndex].blocks[bIndex].content = val;
}

function updateBlockList(sIndex, bIndex, val) {
    // Split by newline and filter empty strings
    currentData.sections[sIndex].blocks[bIndex].items = val.split('\n').filter(line => line.trim() !== '');
}

function addBlock(sIndex, type) {
    let newBlock = { type: type };
    if (type === 'list') {
        newBlock.items = ["列表项 1", "列表项 2"];
    } else {
        newBlock.content = "这里输入内容...";
    }
    currentData.sections[sIndex].blocks.push(newBlock);
    renderSections();
}

function deleteBlock(sIndex, bIndex) {
    currentData.sections[sIndex].blocks.splice(bIndex, 1);
    renderSections();
}

function moveBlock(sIndex, bIndex, direction) {
    const blocks = currentData.sections[sIndex].blocks;
    const newIndex = bIndex + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    [blocks[bIndex], blocks[newIndex]] = [blocks[newIndex], blocks[bIndex]];
    renderSections();
}

function addSection() {
    currentData.sections.push({
        id: "new-" + Date.now(),
        icon: "🆕",
        title: "新板块",
        blocks: [{ type: "text", content: "新板块内容..." }]
    });
    renderSections();
}

function deleteSection(index) {
    if (confirm("确定删除此板块？")) {
        currentData.sections.splice(index, 1);
        renderSections();
    }
}

function moveSection(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentData.sections.length) return;
    [currentData.sections[index], currentData.sections[newIndex]] =
        [currentData.sections[newIndex], currentData.sections[index]];
    renderSections();
}

function generateCode() {
    // Sync Hero vals
    currentData.hero.title = document.getElementById('hero-title').value;
    currentData.hero.subtitle = document.getElementById('hero-subtitle').value;

    // Use Auto-Save to Server
    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show toast or alert
                const btn = document.getElementById('save-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ 保存成功！';
                btn.classList.replace('btn-primary', 'btn-success');

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.replace('btn-success', 'btn-primary');
                    // Optional: reload iframe or notify user to refresh
                }, 2000);
            } else {
                alert('保存失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback to manual copy mode if server is not reachable (e.g. running file://)
            fallbackToManualCopy();
        });
}

function fallbackToManualCopy() {
    const jsonStr = JSON.stringify(currentData, null, 4);
    const finalCode = `// 配置文件：在此处修改网页内容
// 由 Admin 编辑器生成

const guideData = ${jsonStr};
`;
    document.getElementById('code-output').value = finalCode;
    document.getElementById('export-modal').classList.add('active');
    alert('连接服务器失败，为您切换到手动复制模式。');
}

function copyCode() {
    document.getElementById('code-output').select();
    document.execCommand('copy');
    alert('代码已复制！');
}
