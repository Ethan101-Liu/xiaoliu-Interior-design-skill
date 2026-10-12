"use strict";
(() => {
  const data = window.SKILL_DATA;
  const $ = id => document.getElementById(id);
  const stages = [
    {title:"需求分析", en:"DEFINE", desc:"把空间、面积、成员、预算与核心诉求整理成需求摘要，明确未知信息与假设，让设计有依据。",delivery:"交付：结构化需求摘要"},
    {title:"方案策划", en:"DESIGN", desc:"按风格定位、布局、配色、材质、灯光、家具、预算与待确认项组织方案。全屋定制另附柜体功能、五金与尺寸。",delivery:"交付：八部分设计方案"},
    {title:"效果图生成", en:"VISUALIZE", desc:"从方案提取设计参数，由 build_prompt.py 组装中英文与负面提示词，再通过 AI 生图工具生成效果图并附提示词。",delivery:"交付：效果图与提示词"},
    {title:"改图迭代", en:"REFINE", desc:"在参考图上进行风格转换、局部修改、配色调整或画质增强。优先一次改变一个维度，保留原图比例。",delivery:"交付：图生图修改结果"},
    {title:"建模落地", en:"BUILD", desc:"根据酷家乐、SketchUp、3ds Max 或 Blender 输出软件操作流程，涵盖单位、墙体、门窗、硬装、家具、材质、灯光与渲染。",delivery:"交付：建模与改图步骤"}
  ];
  const routeNames = {full:"需求分析 → 方案策划 → 效果图生成 → 建模落地；按反馈进入改图迭代",render:"无参考图：效果图生成；有参考图：改图迭代",edit:"参考图 → 改图迭代 → 交付修改图与提示词",model:"直接进入建模落地，按目标软件输出步骤",style:"直接查阅风格库，给出配色、材质与搭配建议"};
  let currentStyle = 0, output = "brief", language = "cn", imageURL = null, toastTimer;
  const button = (label, attributes = {}) => {
    const node = document.createElement("button"); node.type = "button"; node.textContent = label;
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  };
  function bindSwitch(node, activate) {
    node.addEventListener("click", activate);
    node.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") activate();
    });
  }
  stages.forEach((stage, i) => {
    const node = button("", {class:"stage","aria-pressed":String(i === 0)});
    const number = document.createElement("span"); number.className = "number"; number.textContent = `0${i+1}`;
    const title = document.createElement("h3"); title.textContent = stage.title;
    const sub = document.createElement("p"); sub.textContent = stage.en;
    node.append(number, title, sub); bindSwitch(node, () => showStage(i)); $("stage-grid").append(node);
  });
  function showStage(index) {
    $("stage-grid").querySelectorAll("button").forEach((node,i) => node.setAttribute("aria-pressed",String(i === index)));
    $("stage-tag").textContent = `STAGE 0${index+1} / ${stages[index].en}`;
    $("stage-title").textContent = stages[index].title;
    $("stage-copy").textContent = stages[index].desc;
    $("stage-delivery").textContent = stages[index].delivery;
  }
  data.styles.forEach((style,i) => {
    const node = button(style.name, {"aria-pressed":String(i === 0)});
    const dot = document.createElement("i"); dot.style.background = style.palette[5]; node.prepend(dot);
    bindSwitch(node,() => setStyle(i)); $("style-picker").append(node);
    const small = button("", {"aria-label":`切换到${style.name}`,"aria-pressed":String(i === 0),title:style.name});
    small.style.background = style.palette[5]; bindSwitch(small,() => setStyle(i)); $("hero-styles").append(small);
  });
  function setStyle(index, force = false) {
    if (currentStyle === index && !force) return;
    currentStyle = index;
    const style = data.styles[index];
    ["wall","floor","sofa","rug","wood","accent"].forEach((key,i) => document.documentElement.style.setProperty(`--room-${key}`,style.palette[i]));
    $("scene-index").textContent = `${String(index+1).padStart(2,"0")} — 09`;
    $("scene-style").textContent = `${style.name} `;
    const en = document.createElement("i"); en.textContent = style.en; $("scene-style").append(en);
    $("room-title").textContent = `${style.name}空间示意`;
    ["style-picker","hero-styles"].forEach(id => $(id).querySelectorAll("button").forEach((node,i) => node.setAttribute("aria-pressed",String(index === i))));
    $("style-name").textContent = style.name; $("style-english").textContent = style.en.toUpperCase();
    $("style-position").textContent = style.position; $("style-materials").textContent = style.materials; $("style-lighting").textContent = style.lighting;
    $("palette").replaceChildren();
    style.palette.forEach(color => {const swatch = document.createElement("span");swatch.style.background = color;swatch.title = `示意色值 ${color}`;$("palette").append(swatch);});
    $("materials").value = style.materials; $("lighting").value = style.lighting;
    $("mood").value = style.position.split("，").slice(0,2).join("、");
    render();
  }
  function parameters() {
    const value = id => $(id).value.trim();
    return {space:value("space"),area:value("area") ? `${value("area")}㎡` : "面积待确认",style:data.styles[currentStyle].name,materials:value("materials"),lighting:value("lighting"),mood:value("mood"),view:value("view"),extras:value("extras"),negative:value("negative"),needs:value("needs") || "核心诉求待确认",budget:value("budget"),residents:value("residents") || "居住成员待确认",software:value("software"),task:value("task")};
  }
  function prompts(p) {
    let cn = `${p.space}，${p.style}风格，${p.area}，${p.materials}，${p.lighting}，${p.mood}，${p.view}视角，超写实室内效果图，高清渲染，细节丰富，无人空镜`;
    let en = `${p.space}, ${data.styleEN[p.style] || p.style}, ${p.area}, ${p.materials}, ${p.lighting}, ${p.mood}, ${data.viewEN[p.view] || p.view} view, photorealistic interior render, highly detailed, no people`;
    if(p.extras){cn += `，${p.extras}`;en += `, ${p.extras}`;}
    const negative = data.negativeBase + (p.negative ? `, ${p.negative}` : "");
    return {cn,en,negative};
  }
  function brief(p) {
    return `空间 / ${p.space} · ${p.area}\n风格 / ${p.style}\n预算 / ${p.budget}（未提供具体金额）\n成员 / ${p.residents}\n核心诉求 / ${p.needs}\n目标软件 / ${p.software}\n任务 / ${$("task").selectedOptions[0].textContent}\n\n${p.space === "全屋定制" ? "定制方案需补充：柜体功能分区、柜门材质、五金、尺寸标注。\n" : ""}请在 AI 助手中提供以上信息，由 Skill 按任务生成方案。`;
  }
  function editPrompt() {
    const style = data.styles[currentStyle], type = $("edit-type").value, change = $("change").value.trim();
    if(type === "style") return `以提供的参考图进行图生图修改：整体转换为${style.name}。\n目标关键词：${style.keywords}。\n保留原图空间结构、门窗位置与家具位置；只调整目标风格对应的配色与材质，保持原图比例。`;
    if(type === "quality") return "以提供的参考图增强画质：改善清晰度、材质细节与光影质量。保留原图空间结构、家具、配色、构图与画幅比例，不新增元素。";
    return `以提供的参考图进行${type === "color" ? "颜色调整" : "局部编辑"}：${change || "［请描述要改变的部分］"}。仅修改指定部分，保留其他元素、空间结构和构图，保持原图比例。`;
  }
  function renderModels(software) {
    $("model-title").textContent = `${software} · 建模与渲染指南`;
    $("model-content").replaceChildren();
    data.guides[software].forEach((section,i) => {
      const detail = document.createElement("details");detail.open = i === 0;
      const summary = document.createElement("summary");summary.textContent = section.title;
      const paragraph = document.createElement("p");paragraph.textContent = section.body.replace(/`/g,"");
      detail.append(summary,paragraph);$("model-content").append(detail);
    });
  }
  function render() {
    const p = parameters();
    $("route").textContent = `推荐路径：${routeNames[p.task]}`;
    $("brief-text").textContent = brief(p);$("prompt-text").textContent = prompts(p)[language];
    $("edit-text").textContent = editPrompt();
    if($("model-content").dataset.software !== p.software){renderModels(p.software);$("model-content").dataset.software=p.software;}
  }
  function setOutput(name) {
    output = name;
    document.querySelectorAll("[data-output]").forEach(node => {const active = node.dataset.output === name;node.setAttribute("aria-selected",String(active));node.tabIndex = active ? 0 : -1;});
    ["brief","prompt","edit","model"].forEach(key => $(`${key}-pane`).hidden = key !== name);
    $("output-content").setAttribute("aria-labelledby",`tab-${name}`);
  }
  document.querySelectorAll("[data-output]").forEach(node => {
    bindSwitch(node,() => setOutput(node.dataset.output));
    node.addEventListener("keydown",event => {
      const tabs = [...document.querySelectorAll("[data-output]")],index = tabs.indexOf(node);
      let next;
      if(event.key === "ArrowRight") next = (index+1)%tabs.length;
      if(event.key === "ArrowLeft") next = (index-1+tabs.length)%tabs.length;
      if(event.key === "Home") next = 0;
      if(event.key === "End") next = tabs.length-1;
      if(next !== undefined){event.preventDefault();setOutput(tabs[next].dataset.output);tabs[next].focus();}
    });
  });
  document.querySelectorAll("[data-language]").forEach(node => bindSwitch(node,() => {
    language = node.dataset.language;
    document.querySelectorAll("[data-language]").forEach(n => n.setAttribute("aria-pressed",String(n === node)));
    render();
  }));
  $("design-form").addEventListener("input",render);$("design-form").addEventListener("submit",event => event.preventDefault());
  $("task").addEventListener("change",() => setOutput({full:"brief",render:"prompt",edit:"edit",model:"model",style:"brief"}[$("task").value]));
  $("edit-type").addEventListener("change",() => {$("change-label").hidden = !["local","color"].includes($("edit-type").value);render();});
  $("change").addEventListener("input",render);
  function toast(message) {clearTimeout(toastTimer);$("toast").textContent = message;$("toast").classList.add("visible");toastTimer = setTimeout(() => $("toast").classList.remove("visible"),3200);}
  async function copy(text) {
    try {await navigator.clipboard.writeText(text);toast("已复制，可以粘贴到 AI 助手中使用。");}
    catch {
      const temporary = document.createElement("textarea");temporary.value = text;temporary.style.position="fixed";temporary.style.opacity="0";document.body.append(temporary);temporary.select();
      const success = document.execCommand("copy");temporary.remove();toast(success ? "已复制。" : "复制不可用，请选中输出文字手动复制。");
    }
  }
  function modelText(p) {return `${p.software} 建模指南\n\n`+data.guides[p.software].map(s => `${s.title}\n${s.body}`).join("\n\n");}
  $("copy").addEventListener("click",() => {const p=parameters();copy({brief:`${brief(p)}\n\n推荐路径：${routeNames[p.task]}\n待确认：户型结构、承重墙、门窗与管线位置。`,prompt:prompts(p)[language],edit:editPrompt(),model:modelText(p)}[output]);});
  $("export").addEventListener("click",() => {
    const p=parameters(), pp=prompts(p),style=data.styles[currentStyle];
    const text=`# ${p.space}设计需求与提示词\n\n> 由小刘 Interior Design Skill 交互介绍页按规则整理。此文件为设计输入，不是已完成的设计方案。\n\n## 需求摘要\n${brief(p)}\n\n推荐路径：${routeNames[p.task]}\n\n## 风格参考\n${style.position}\n色彩：${style.colors}\n材质：${p.materials}\n灯光：${p.lighting}\n\n## 待确认项与假设\n- 户型结构、承重墙、门窗与管线未提供。\n- 预算为定位，具体金额待确认。\n- 需在真实户型下核对家具、柜体与通道尺寸。\n- ${$("area").value ? "面积为用户当前输入。" : "面积未提供，待确认。"}\n\n## 方案交付结构（供 AI 助手填充）\n1. 风格定位\n2. 空间布局\n3. 色彩方案\n4. 材质清单\n5. 灯光设计\n6. 家具清单\n7. 预算分配\n8. 待确认项\n\n## 中文提示词\n${pp.cn}\n\n## 英文模板\n${pp.en}\n\n英文模板仅翻译原脚本已映射的风格和视角，其他输入保持原文。\n\n## 负面提示词\n${pp.negative}\n\n## 改图指令\n${editPrompt()}\n\n## 建模指南\n${modelText(p)}\n\n原始 Skill 含完整 AI 工作流，实际出图与图生图编辑需生图工具。\n`;
    const url=URL.createObjectURL(new Blob([text],{type:"text/markdown;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`小刘-${p.style}-${p.space}-设计输入.md`;a.click();setTimeout(() => URL.revokeObjectURL(url),1000);toast("需求与提示词已导出为 Markdown 文件。");
  });
  function removeImage(){if(imageURL)URL.revokeObjectURL(imageURL);imageURL=null;$("reference-image").removeAttribute("src");$("reference-preview").hidden=true;$("reference-file").value="";}
  $("reference-file").addEventListener("change",event => {
    const file=event.target.files[0];if(!file){removeImage();return;}
    if(!file.type.startsWith("image/")){removeImage();toast("请选择图片文件。");return;}
    if(file.size>20*1024*1024){removeImage();toast("请选择小于 20MB 的参考图。");return;}
    if(imageURL)URL.revokeObjectURL(imageURL);imageURL=URL.createObjectURL(file);$("reference-image").src=imageURL;$("reference-preview").hidden=false;
  });
  $("reference-image").addEventListener("error",() => {removeImage();toast("这张图片无法预览，请换用 JPG、PNG 或 WebP。");});
  $("remove-image").addEventListener("click",removeImage);
  $("reset-example").addEventListener("click",() => {
    $("design-form").reset();$("edit-type").value="style";$("change").value="";$("change-label").hidden=true;removeImage();
    language="cn";document.querySelectorAll("[data-language]").forEach(node=>node.setAttribute("aria-pressed",String(node.dataset.language === language)));setOutput("brief");setStyle(0,true);toast("已恢复奶油风客厅示例。");
  });
  $("copy-example").addEventListener("click",() => copy("帮我设计一个 25㎡ 的奶油风客厅，增加收纳，保留采光，附上效果图提示词和酷家乐建模步骤。"));
  showStage(0);setStyle(0,true);setOutput("brief");
})();
