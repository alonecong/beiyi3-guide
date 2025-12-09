#!/usr/bin/env node

/**
 * 构建脚本：将 content.md 转换为 data.js
 * 运行: node build-content.js
 */

const fs = require('fs');
const path = require('path');

// 简单的 frontmatter 解析器
function parseFrontmatter(content) {
    const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(fmRegex);

    if (!match) {
        throw new Error('未找到 YAML frontmatter');
    }

    const yamlContent = match[1];
    const markdownContent = match[2];

    // 简单的 YAML 解析（支持基本的嵌套结构）
    const metadata = {};
    const lines = yamlContent.split('\n');
    let currentKey = null;
    let currentObj = metadata;
    let indent = 0;

    lines.forEach(line => {
        if (!line.trim()) return;

        const lineIndent = line.search(/\S/);
        const trimmed = line.trim();

        if (trimmed.includes(':')) {
            const [key, ...valueParts] = trimmed.split(':');
            const value = valueParts.join(':').trim();

            if (lineIndent === 0) {
                // 顶级键
                if (value) {
                    metadata[key] = value;
                } else {
                    metadata[key] = {};
                    currentKey = key;
                    currentObj = metadata[key];
                    indent = lineIndent;
                }
            } else if (lineIndent > indent && currentKey) {
                // 嵌套键
                if (value) {
                    currentObj[key] = value;
                }
            }
        }
    });

    return { metadata, markdown: markdownContent };
}

// 解析 Markdown 内容为 sections
function parseMarkdownToSections(markdown) {
    const sections = [];
    const sectionPattern = /^# (.*?)$/gm;
    const parts = markdown.split(sectionPattern).filter(p => p.trim());

    for (let i = 0; i < parts.length; i += 2) {
        if (i + 1 < parts.length) {
            const titleWithIcon = parts[i].trim();
            const content = parts[i + 1].trim();

            // 提取 emoji 图标和标题
            const iconMatch = titleWithIcon.match(/^([\u{1F000}-\u{1F9FF}])\s+(.+)$/u);
            const icon = iconMatch ? iconMatch[1] : '📄';
            const title = iconMatch ? iconMatch[2] : titleWithIcon;

            // 生成 ID
            const id = title.toLowerCase()
                .replace(/\s+&\s+/g, '-')
                .replace(/\s+/g, '-')
                .replace(/[^\w\u4e00-\u9fa5-]/g, '');

            // 解析板块内容
            const blocks = parseBlocks(content);

            sections.push({ id, icon, title, blocks });
        }
    }

    return sections;
}

// 解析板块内容为 blocks
function parseBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        if (!line) {
            i++;
            continue;
        }

        // 二级标题 (subtitle)
        if (line.startsWith('## ')) {
            blocks.push({
                type: 'subtitle',
                content: line.replace(/^## /, '')
            });
            i++;
        }
        // 引用块 - 提示/警告
        else if (line.startsWith('> ')) {
            let quoteContent = '';
            while (i < lines.length && (lines[i].trim().startsWith('> ') || lines[i].trim().startsWith('>'))) {
                quoteContent += lines[i].trim().replace(/^>\s*/, '') + ' ';
                i++;
            }
            quoteContent = quoteContent.trim();

            // 判断是提示还是警告
            const type = quoteContent.startsWith('**警告**') || quoteContent.startsWith('**注意**') ? 'alert' : 'text';
            const cleanContent = quoteContent.replace(/^\*\*(提示|警告|注意)\*\*[：:]\s*/, '');

            blocks.push({
                type: type,
                content: cleanContent
            });
        }
        // 有序列表
        else if (/^\d+\.\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
                i++;
            }
            blocks.push({
                type: 'list',
                ordered: true,
                items: items
            });
        }
        // 无序列表
        else if (line.startsWith('- ')) {
            const items = [];
            while (i < lines.length && lines[i].trim().startsWith('- ')) {
                items.push(lines[i].trim().replace(/^- /, ''));
                i++;
            }
            blocks.push({
                type: 'list',
                items: items
            });
        }
        // 分隔线 (跳过)
        else if (line.startsWith('---')) {
            i++;
        }
        // 加粗开头的特殊块 (tips)
        else if (line.startsWith('**') && line.includes('：')) {
            const title = line;
            const items = [];
            i++;

            // 收集后续的列表项
            while (i < lines.length && lines[i].trim().startsWith('- ')) {
                items.push(lines[i].trim().replace(/^- /, ''));
                i++;
            }

            if (items.length > 0) {
                blocks.push({
                    type: 'tips',
                    content: title.replace(/\*\*/g, '').replace(/：$/, ''),
                    items: items
                });
            } else {
                blocks.push({
                    type: 'text',
                    content: title.replace(/\*\*/g, '')
                });
            }
        }
        // 普通文本
        else {
            blocks.push({
                type: 'text',
                content: line
            });
            i++;
        }
    }

    return blocks;
}

// 主函数
function build() {
    console.log('🔨 开始构建...');

    // 读取 content.md
    const contentPath = path.join(__dirname, 'content.md');
    if (!fs.existsSync(contentPath)) {
        console.error('❌ 错误: 找不到 content.md 文件');
        process.exit(1);
    }

    const rawContent = fs.readFileSync(contentPath, 'utf-8');

    // 解析内容
    const { metadata, markdown } = parseFrontmatter(rawContent);
    const sections = parseMarkdownToSections(markdown);

    // 构建 data 对象
    const guideData = {
        meta: {
            title: metadata.title || '北医三院病友经验指南',
            description: metadata.description || ''
        },
        hero: metadata.hero || {},
        footer: metadata.footer || {},
        sections: sections
    };

    // 生成 data.js 内容
    const dataJsContent = `// 配置文件：在此处修改网页内容
// 由构建脚本从 content.md 自动生成
// ⚠️ 不要直接编辑此文件，请编辑 content.md

const guideData = ${JSON.stringify(guideData, null, 4)};
`;

    // 写入 data.js
    const outputPath = path.join(__dirname, 'beiyi3-guide-deploy', 'data.js');
    fs.writeFileSync(outputPath, dataJsContent, 'utf-8');

    console.log('✅ 构建完成！');
    console.log(`📝 生成文件: ${outputPath}`);
    console.log(`📊 板块数量: ${sections.length}`);
}

// 运行构建
try {
    build();
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
}
