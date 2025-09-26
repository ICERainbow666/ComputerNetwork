// 全局变量
let currentIndex = 0;
let currentBank = []; // 当前题库的题目

// 显示卡片界面
function showCard(){
    document.getElementById('cardmain').style.display = 'none';
    document.getElementById('cardtext').style.display = 'block';
}

// 设置标题
function showtitle(card){
    const title = document.getElementById('title');
    const cardTitle = document.querySelector(`#Card${card} h3`).textContent;
    title.textContent = cardTitle;
    
    title.style.transform = 'scale(1.05)';
    setTimeout(() => {
        title.style.transform = 'scale(1)';
    }, 300);
}

// 根据题库名称筛选题目
function selectQuestions(name){
    const questionBank = ALLqts.filter(qt => qt.name === name);
    
    if (questionBank.length === 0) {
        console.log(`未找到name为${name}的题库`);
        return [];
    } else {
        console.log(`找到name为${name}的题库，共${questionBank.length}道题目`);
        return questionBank;
    }
}

// 初始化测验
function initQuiz(questions) {
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    // 返回首页功能
    document.getElementById('back-home').addEventListener('click', function() {
        document.getElementById('cardmain').style.display = 'block';
        document.getElementById('cardtext').style.display = 'none';
    });
    
    // 选择题目功能
    document.getElementById('select-question').addEventListener('click', function() {
        showQuestionSelector();
    });
    
    // 显示题目选择器
    function showQuestionSelector() {
        const modal = document.getElementById('question-selector');
        const questionList = document.getElementById('question-list');
        
        // 清空现有列表
        questionList.innerHTML = '';
        
        // 生成题目列表
        currentBank.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = `question-item ${index === currentIndex ? 'current' : ''}`;
            questionItem.textContent = `${index + 1}. ${question.question.substring(0, 50)}${question.question.length > 50 ? '...' : ''}`;
            
            questionItem.addEventListener('click', function() {
                currentIndex = index;
                renderQuestions_TEXT(currentIndex);
                modal.style.display = 'none';
            });
            
            questionList.appendChild(questionItem);
        });
        
        modal.style.display = 'block';
    }
    
    // 关闭模态框功能
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('question-selector').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('question-selector');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 显示下一题
function showNextQuestion() {
    if (currentIndex < currentBank.length - 1) {
        currentIndex++;
        renderQuestions_TEXT(currentIndex);
    }
}

// 显示上一题
function showPreviousQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestions_TEXT(currentIndex);
    }
}

// 渲染题目
function renderQuestions_TEXT(index) {
    const questions = currentBank; // 使用当前题库
    
    const quizContainer = document.querySelector('.quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progress = document.getElementById('progress');
    
    // console.log(`当前题库题目个数：${questions.length}`);
    
    if (!questions || questions.length === 0) {
        // console.log('当前题库为空');
        quizContainer.innerHTML = '<div class="question-card">当前题库没有题目</div>';
        return;
    }
    
    // 检查索引是否有效
    if (index < 0 || index >= questions.length) {
        console.log(`索引 ${index} 超出范围`);
        return;
    }
    
    // 更新进度显示
    progress.textContent = `${index + 1} / ${questions.length}`;
    
    // 更新按钮状态和样式
    if (index === 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove('disabled');
    }
    
    if (index === questions.length - 1) {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled');
    }
    
    // 隐藏所有问题卡片
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.add('hidden');
    });
    
    // 检查是否已经创建了该问题的卡片
    let questionCard = document.getElementById(`question-${index}`);
    
    if (!questionCard) {
        // 创建问题卡片
        questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.id = `question-${index}`;
        
        // 添加问题文本
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.textContent = `${index + 1}. ${questions[index].question}`;
        questionCard.appendChild(questionText);
        
        // 创建选项列表
        const optionsList = document.createElement('ul');
        optionsList.className = 'options-list';
        
        // 遍历选项
        questions[index].options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'option-item';
            
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;
            
            const indicator = document.createElement('span');
            indicator.className = option.correct ? 'correct-indicator' : 'incorrect-indicator';
            indicator.title = option.correct ? '正确答案' : '错误答案';
            indicator.textContent = option.correct ? ' ✓' : ' ✗';
            
            // 添加点击事件显示/隐藏答案
            optionItem.addEventListener('click', function() {
                indicator.style.opacity = indicator.style.opacity === '0' ? '1' : '0';
            });
            
            // 初始隐藏答案
            indicator.style.opacity = '0';
            
            optionItem.appendChild(optionText);
            optionItem.appendChild(indicator);
            optionsList.appendChild(optionItem);
        });
        
        questionCard.appendChild(optionsList);
        quizContainer.appendChild(questionCard);
    }
    
    // 显示当前问题卡片
    questionCard.classList.remove('hidden');
    
    console.log(`已显示第 ${index + 1} 题`);
}

// 添加键盘支持
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        showPreviousQuestion();
    } else if (event.key === 'ArrowRight') {
        showNextQuestion();
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initQuiz();
    
    // 获取DOM元素
    const btnToText1 = document.getElementById('btnToText1');
    const btnToText2 = document.getElementById('btnToText2');
    
    // 切换到题库1
    btnToText1.addEventListener('click', function() {
        showCard();
        showtitle(1);
        currentBank = selectQuestions(1); // 设置当前题库
        currentIndex = 0; // 重置索引
        renderQuestions_TEXT(currentIndex);
    });
    
    // 切换到题库2
    btnToText2.addEventListener('click', function() {
        showCard();
        showtitle(2);
        currentBank = selectQuestions(2); // 设置当前题库
        currentIndex = 0; // 重置索引
        renderQuestions_TEXT(currentIndex);
    });

});




const ALLqts = [
    {
        name: 1,
        question: "计算机网络最基本的功能是下列哪一个?",
        options: [
            { text: "降低成本", correct: false },
            { text: "打印文件", correct: false },
            { text: "资源共享", correct: true },
            { text: "文件调用", correct: false }
        ]
    },
    {
        name: 1,
        question: "信息高速公路是指下列什么?",
        options: [
            { text: "装备有通讯设备的高速公路", correct: false },
            { text: "电子邮政系统", correct: false },
            { text: "快速专用通道", correct: false },
            { text: "国家信息基础设施", correct: true }
        ]
    },
    {
        name: 1,
        question: "下面哪一个不是分组交换的优点?",
        options: [
            { text: "高效", correct: false },
            { text: "灵活", correct: false },
            { text: "开销小", correct: true },
            { text: "快速", correct: false }
        ]
    },
    {
        name: 1,
        question: "校园网按照作用范围分属于哪一种网络?",
        options: [
            { text: "局域网", correct: true },
            { text: "广域网", correct: false },
            { text: "城域网", correct: false },
            { text: "个人区域网", correct: false }
        ]
    },
    {
        name: 1,
        question: "局域网的英文缩写为下列哪一个?",
        options: [
            { text: "LAN", correct: true },
            { text: "WAN", correct: false },
            { text: "ISDN", correct: false },
            { text: "MAN", correct: false }
        ]
    },
    {
        name: 1,
        question: "广域网的英文缩写为什么?",
        options: [
            { text: "LAN", correct: false },
            { text: "WAN", correct: true },
            { text: "ISDN", correct: false },
            { text: "MAN", correct: false }
        ]
    },
    {
        name: 1,
        question: "计算机网络中广域网和局域网的分类是以什么来划分的?",
        options: [
            { text: "信息交换方式", correct: false },
            { text: "网络使用者", correct: false },
            { text: "网络连接距离", correct: true },
            { text: "传输控制方法", correct: false }
        ]
    },
    {
        name: 1,
        question: "从分类角度上看,下面哪一种网络与其它三个不同?",
        options: [
            { text: "局域网", correct: false },
            { text: "城域网", correct: false },
            { text: "广域网", correct: false },
            { text: "校园网", correct: true }
        ]
    },
    {
        name: 1,
        question: "下列哪一个不是按照作用范围划分的网络?",
        options: [
            { text: "局域网", correct: false },
            { text: "城域网", correct: false },
            { text: "专用网", correct: true },
            { text: "广域网", correct: false }
        ]
    },
    {
        name: 1,
        question: "计算机网络的逻辑组成是由下列哪一组组成?",
        options: [
            { text: "局域网、城域网和广域网", correct: false },
            { text: "计算机、网线和通信设备", correct: false },
            { text: "通信子网和资源子网", correct: true },
            { text: "客户机和服务器", correct: false }
        ]
    },
    {
        name: 1,
        question: "表征数据传输可靠性的指标是下列什么?",
        options: [
            { text: "误码率", correct: true },
            { text: "频带利用率", correct: false },
            { text: "传输速", correct: false },
            { text: "信道容量", correct: false }
        ]
    },
    {
        name: 1,
        question: "关于客户/服务器通信方式的错误说法是下列哪一个?",
        options: [
            { text: "描述的是通信进程间的服务和被服务的关系", correct: false },
            { text: "客户是服务的请求方", correct: false },
            { text: "服务器是服务的提供方", correct: false },
            { text: "通信进程间的身份对等", correct: true }
        ]
    },
    {
        name: 1,
        question: "客户/服务器机制的英文名称是下列哪一个?",
        options: [
            { text: "Client/Server", correct: true },
            { text: "Guest/Server", correct: false },
            { text: "Guest/Administrator", correct: false },
            { text: "Slave/Master", correct: false }
        ]
    },
    {
        name: 1,
        question: "Intranet是什么?",
        options: [
            { text: "Internet发展的一个阶段", correct: false },
            { text: "企业内部网络", correct: true },
            { text: "Internet发展的一种新的技术", correct: false },
            { text: "企业外部网络", correct: false }
        ]
    },
    {
        name: 1,
        question: "关于TCP/IP协议集,下列说法不正确的是下列哪一项?",
        options: [
            { text: "由美国国防部高级研究计划局DARPA开发的", correct: false },
            { text: "该协议的体系结构分为5个层次", correct: true },
            { text: "TCP 和UDP位于传输层", correct: false },
            { text: "IP 协议是一个面向无连接的协议", correct: false }
        ]
    },
    {
        name: 1,
        question: "关于实体、协议、服务和服务访问点的正确说法是下列哪一个?",
        options: [
            { text: "实体指的是硬件设备", correct: false },
            { text: "协议是控制上下层之间通信的规则", correct: true },
            { text: "服务的方向是由下而上的", correct: false },
            { text: "服务访问点是对等实体间的接口", correct: false }
        ]
    },
    {
        name: 1,
        question: "在系统中,上下层之间通过接口进行通信,用下列什么来定义接口?",
        options: [
            { text: "服务原语", correct: true },
            { text: "服务访问点", correct: false },
            { text: "服务数据单元", correct: false },
            { text: "协议数据单元", correct: false }
        ]
    },
    {
        name: 1,
        question: "计算机网络体系结构可以定义为?",
        options: [
            { text: "一种计算机网络的实现", correct: false },
            { text: "执行计算机数据处理的软件模块", correct: false },
            { text: "建立和使用通信硬件和软件的一套规则和规范", correct: true },
            { text: "由ISO 制定的一个标准", correct: false }
        ]
    },
    {
        name: 1,
        question: "下面不属于网络拓扑结构的是下列哪一个结构?",
        options: [
            { text: "环形结构", correct: false },
            { text: "总线结构", correct: false },
            { text: "层次结构", correct: true },
            { text: "网状结构", correct: false }
        ]
    },
    {
        name: 2,
        question: "下面不属于局域网拓扑结构的是什么结构?",
        options: [
            { text: "环形结构", correct: false },
            { text: "总线结构", correct: false },
            { text: "树形结构", correct: false },
            { text: "网状结构", correct: true }
        ]
    },
    {
        name: 2,
        question: "关于实体、协议、服务和服务访问点的正确说法是下列哪一个?",
        options: [
            { text: "实体指的是硬件设备", correct: false },
            { text: "协议是控制上下层之间通信的规则", correct: true },
            { text: "服务的方向是由下而上的", correct: false },
            { text: "服务访问点是对等实体间的接口", correct: false }
        ]
    },
    {
        name: 2,
        question: "计算机网络体系结构可以定义为?",
        options: [
            { text: "一种计算机网络的实现", correct: false },
            { text: "执行计算机数据处理的软件模块", correct: false },
            { text: "建立和使用通信硬件和软件的一套规则和规范", correct: true },
            { text: "由ISO 制定的一个标准", correct: false }
        ]
    },
    {
        name: 2,
        question: "关于TCP/IP协议集,下列说法不正确的是下列哪一项?",
        options: [
            { text: "由美国国防部高级研究计划局DARPA开发的", correct: false },
            { text: "该协议的体系结构分为5个层次", correct: true },
            { text: "TCP 和UDP位于传输层", correct: false },
            { text: "IP 协议是一个面向无连接的协议", correct: false }
        ]
    },
    {
        name: 2,
        question: "协议的关键要素不包括下列哪一项?",
        options: [
            { text: "语言", correct: true },
            { text: "语法", correct: false },
            { text: "语义", correct: false },
            { text: "同步", correct: false }
        ]
    },
    {
        name: 2,
        question: "下列设备不属于资源子网的是哪一个?",
        options: [
            { text: "打印机", correct: false },
            { text: "集线器", correct: true },
            { text: "路由器", correct: false },
            { text: "局域网交换机", correct: false }
        ]
    },
    {
        name: 2,
        question: "在ISO/OSI参考模型中,数据的压缩、加密等功能由哪层完成( )。",
        options: [
            { text: "应用层", correct: false },
            { text: "表示层", correct: true },
            { text: "会话层", correct: false },
            { text: "传输层", correct: false }
        ]
    },
    {
        name: 2,
        question: "下列功能中属于表示层提供的功能的是?",
        options: [
            { text: "拥塞控制", correct: false },
            { text: "透明传输", correct: false },
            { text: "死锁处理", correct: false },
            { text: "数据压缩", correct: true }
        ]
    },
    {
        name: 2,
        question: "TCP/IP体系结构中的第二层是下面哪一层?",
        options: [
            { text: "网络接口层", correct: false },
            { text: "传输层", correct: false },
            { text: "互联网层", correct: true },
            { text: "应用层", correct: false }
        ]
    }
];

// 导出数组（如果在模块环境中使用）
// export default networkQuestions;
// // 当DOM加载完成后执行
// document.addEventListener('DOMContentLoaded', function() {
//     renderQuestions(ALLqts, '.quiz-container',1);
// });
