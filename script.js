// 全局变量
let currentIndex = 0;
let currentBank = []; // 当前题库的题目
let shownAnswers = new Set(); // 跟踪哪些题目的答案已经显示过

// 考试模式全局变量
let currentExamQuestions = []; // 存储考试题目
let currentExamIndex = 0; // 当前考试题目索引
let isExamMode = false; // 当前是否为考试模式
let examScore = 0; // 考试得分
let selectedQuestionBank = null; // 存储选择的题库

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

// 重置题库状态
function resetQuizState() {
    currentIndex = 0;
    currentBank = [];
    shownAnswers.clear();
    currentExamQuestions = [];
    currentExamIndex = 0;
    isExamMode = false;
    examScore = 0;

    // 清空DOM元素
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.innerHTML = '';

    // 重置进度显示
    document.getElementById('progress').textContent = '0 / 0';

    // 隐藏考试控制按钮
    document.getElementById('exam-controls').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';

    // 重置按钮状态
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    prevBtn.disabled = true;
    prevBtn.classList.add('disabled');
    nextBtn.disabled = true;
    nextBtn.classList.add('disabled');
}

// 显示题目数量选择模态框
function showQuestionCountSelector(questionBank) {
    selectedQuestionBank = questionBank;
    const modal = document.getElementById('question-count-selector');
    modal.style.display = 'block';

    // 添加题目数量选择事件
    const countOptions = document.querySelectorAll('.count-option');
    countOptions.forEach(option => {
        option.addEventListener('click', function() {
            const count = parseInt(this.getAttribute('data-count'));
            modal.style.display = 'none';
            initExam(selectedQuestionBank, count);
        });
    });
}

// 初始化测验
function initQuiz(questions) {
    // 返回首页功能
    document.getElementById('back-home').addEventListener('click', function() {
        document.getElementById('cardmain').style.display = 'block';
        document.getElementById('cardtext').style.display = 'none';
        // 退出考试模式
        if (isExamMode) {
            exitExamMode();
        }
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
        const questions = isExamMode ? currentExamQuestions : currentBank;
        questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = `question-item ${index === (isExamMode ? currentExamIndex : currentIndex) ? 'current' : ''}`;
            questionItem.textContent = `${index + 1}. ${question.question.substring(0, 50)}${question.question.length > 50 ? '...' : ''}`;

            questionItem.addEventListener('click', function() {
                if (isExamMode) {
                    currentExamIndex = index;
                    renderQuestions_EXAM(currentExamIndex);
                } else {
                    currentIndex = index;
                    renderQuestions_TEXT(currentIndex);
                }
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

    // 关闭题目数量选择模态框
    document.querySelector('.close-count').addEventListener('click', function() {
        document.getElementById('question-count-selector').style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('question-selector');
        const countModal = document.getElementById('question-count-selector');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        if (event.target === countModal) {
            countModal.style.display = 'none';
        }
    });
}

// 修改 showNextQuestion 函数，处理最后一题的情况
function showNextQuestion() {
    // 如果是填空题，检查答案
    if (currentBank[currentIndex].type === 2) {
        const blankInputs = document.querySelectorAll('.blanks-input');
        let allCorrect = true;

        // 检查当前题目的答案是否已经显示过
        const isAnswerShown = shownAnswers.has(currentIndex);

        // 如果答案已经显示过，直接进入下一题或保持在最后一题
        if (isAnswerShown) {
            if (currentIndex < currentBank.length - 1) {
                currentIndex++;
                renderQuestions_TEXT(currentIndex);
            }
            // 如果是最后一题且答案已显示，就不做任何操作
            return;
        }

        // 如果答案没有显示过，检查答案正确性
        blankInputs.forEach((input, i) => {
            const userAnswer = input.value.trim();
            const correctAnswer = currentBank[currentIndex].answer[i];
            if (userAnswer !== correctAnswer) {
                allCorrect = false;
            }
        });

        if (!allCorrect) {
            // 显示所有答案容器
            const answerContainers = document.querySelectorAll('.answers-Container');
            answerContainers.forEach(container => {
                container.style.display = 'block';
            });

            // 记录当前题目的答案已经显示过
            shownAnswers.add(currentIndex);

            return; // 不进入下一题
        }
    }

    // 如果当前题是填空题且答案正确，或者是选择题，则进入下一题
    if (currentIndex < currentBank.length - 1) {
        currentIndex++;
        renderQuestions_TEXT(currentIndex);
    } else {
        // 如果是最后一题，显示答案
        const answerContainers = document.querySelectorAll('.answers-Container');
        answerContainers.forEach(container => {
            container.style.display = 'block';
        });

        // 记录当前题目的答案已经显示过
        shownAnswers.add(currentIndex);

        // 重新渲染以更新界面状态
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

// 渲染题目 - 修改版本，确保在查看详细时显示答案
function renderQuestions_TEXT(index) {
    const questions = currentBank; // 使用当前题库

    const quizContainer = document.querySelector('.quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progress = document.getElementById('progress');

    if (!questions || questions.length === 0) {
        quizContainer.innerHTML = "<div class='question-card'>当前题库没有题目</div>";
        return;
    }

    // 检查索引是否有效
    if (index < 0 || index >= questions.length) {
        console.log(`索引 ${index} 超出范围`);
        return;
    }

    // 清空容器，确保没有残留的题目
    quizContainer.innerHTML = '';

    // 更新进度显示
    progress.textContent = `${index + 1} / ${questions.length}`;

    // 更新按钮状态和样式 - 修改这部分
    if (index === 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove('disabled');
    }

    // 修改这里：最后一题时不要禁用下一题按钮
    // 这样用户可以点击下一题来显示答案
    nextBtn.disabled = false;
    nextBtn.classList.remove('disabled');

    // 创建问题卡片
    const questionCard = document.createElement('div');
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

    if (questions[index].type === 1){
        // 题型为1时 选择题 遍历选项
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

            // 初始隐藏答案，除非当前题目的答案已经显示过
            if (shownAnswers.has(index)) {
                indicator.style.opacity = '1';
            } else {
                indicator.style.opacity = '0';
            }

            optionItem.appendChild(optionText);
            optionItem.appendChild(indicator);
            optionsList.appendChild(optionItem);
        });
    }
    else if (questions[index].type === 2){
        // 题型为2时 填空题
        questions[index].answer.forEach((answer, ansIndex) => {
            // 创建填空容器 设置类名
            const blanksContainer = document.createElement('div');
            blanksContainer.className = "blanks-container";

            // 创建填空
            const blanks = document.createElement('input');
            blanks.className = "blanks-input";
            blanks.type = 'text';
            blanks.placeholder = `第${ansIndex + 1}空`;
            // 在查看详细时，显示用户填写的答案
            if (questions[index].userAnswers && questions[index].userAnswers[ansIndex]) {
                blanks.value = questions[index].userAnswers[ansIndex];
            }
            // 在查看详细时，输入框设为只读
            if (shownAnswers.has(index)) {
                blanks.readOnly = true;
            }

            // 创建答案容器
            const answersContainer = document.createElement('div');
            answersContainer.className = "answers-Container";

            // 如果当前题目的答案已经显示过，则默认显示答案
            if (shownAnswers.has(index)) {
                answersContainer.style.display = 'block';
            } else {
                answersContainer.style.display = 'none'; // 默认隐藏
            }

            // 创建答案
            const answers = document.createElement('span');
            answers.className = "answers";
            answers.textContent = `第${ansIndex + 1}空 ${answer}`;

            // 容器添加
            blanksContainer.appendChild(blanks);
            answersContainer.appendChild(answers);

            // 将填空容器和答案容器都添加到选项列表中
            optionsList.appendChild(blanksContainer);
            optionsList.appendChild(answersContainer);
        });
    }
    else if (questions[index].type === 3) {
        // 题型为3时 判断题
        let isJudgmentAnswerShown = shownAnswers.has(index); // 当前题目的答案显示状态

        // 创建两个选项
        const options = [
            { text: "正确", value: true },
            { text: "错误", value: false }
        ];

        options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'option-item';

            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;

            // 判断这个选项是否正确：如果option.value等于当前题目的correct，那么这个选项就是正确的
            const isCorrect = option.value === questions[index].correct;
            const indicator = document.createElement('span');
            indicator.className = isCorrect ? 'correct-indicator' : 'incorrect-indicator';
            indicator.title = isCorrect ? '正确答案' : '错误答案';
            indicator.textContent = isCorrect ? ' ✓' : ' ✗';

            // 初始隐藏答案，除非当前题目的答案已经显示过
            if (shownAnswers.has(index)) {
                indicator.style.opacity = '1';
            } else {
                indicator.style.opacity = '0';
            }

            optionItem.appendChild(optionText);
            optionItem.appendChild(indicator);
            optionsList.appendChild(optionItem);

            // 添加点击事件
            optionItem.addEventListener('click', function() {
                // 切换显示状态
                isJudgmentAnswerShown = !isJudgmentAnswerShown;
                // 获取当前选项列表中的所有指示器
                const allIndicators = optionsList.querySelectorAll('.correct-indicator, .incorrect-indicator');
                // 设置所有指示器的透明度
                allIndicators.forEach(ind => {
                    ind.style.opacity = isJudgmentAnswerShown ? '1' : '0';
                });
            });
        });
    }

    questionCard.appendChild(optionsList);
    quizContainer.appendChild(questionCard);

    console.log(`已显示第 ${index + 1} 题`);
}

// 考试模式渲染题目
function renderQuestions_EXAM(index) {
    const questions = currentExamQuestions;
    const quizContainer = document.querySelector('.quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progress = document.getElementById('progress');

    if (!questions || questions.length === 0) {
        quizContainer.innerHTML = "<div class='question-card'>没有考试题目</div>";
        return;
    }

    // 检查索引是否有效
    if (index < 0 || index >= questions.length) {
        console.log(`索引 ${index} 超出范围`);
        return;
    }

    // 清空容器
    quizContainer.innerHTML = '';

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
        // 最后一题时显示提交按钮
        document.getElementById('submit-btn').style.display = 'inline-block';
    } else {
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled');
        document.getElementById('submit-btn').style.display = 'none';
    }

    // 创建问题卡片
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.id = `question-${index}`;
    const currentQuestion = questions[index];

    // 添加问题文本
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = `${index + 1}. ${currentQuestion.question}`;
    questionCard.appendChild(questionText);

    // 创建选项列表
    const optionsList = document.createElement('ul');
    optionsList.className = 'options-list';

    if (currentQuestion.type === 1) {
        // 选择题
        currentQuestion.options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'option-item';
            optionItem.dataset.optionIndex = optionIndex;

            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;

            // 添加点击事件记录用户选择
            optionItem.addEventListener('click', function() {
                // 移除其他选项的选中状态
                optionsList.querySelectorAll('.option-item').forEach(item => {
                    item.classList.remove('selected');
                });
                // 标记当前选项为选中
                this.classList.add('selected');
                // 记录用户答案
                currentQuestion.userAnswer = optionIndex;
            });

            // 如果用户之前已经选择过这个选项，标记为选中
            if (currentQuestion.userAnswer === optionIndex) {
                optionItem.classList.add('selected');
            }

            optionItem.appendChild(optionText);
            optionsList.appendChild(optionItem);
        });
    }
    else if (currentQuestion.type === 2) {
        // 填空题
        currentQuestion.answer.forEach((answer, ansIndex) => {
            const blanksContainer = document.createElement('div');
            blanksContainer.className = "blanks-container";

            const blanks = document.createElement('input');
            blanks.className = "blanks-input";
            blanks.type = 'text';
            blanks.placeholder = `第${ansIndex + 1}空`;
            blanks.dataset.blankIndex = ansIndex;

            // 如果用户之前已经填写过答案，恢复填写内容
            if (currentQuestion.userAnswers && currentQuestion.userAnswers[ansIndex]) {
                blanks.value = currentQuestion.userAnswers[ansIndex];
            }

            // 监听输入变化，记录用户答案
            blanks.addEventListener('input', function() {
                if (!currentQuestion.userAnswers) {
                    currentQuestion.userAnswers = new Array(currentQuestion.answer.length).fill('');
                }
                currentQuestion.userAnswers[ansIndex] = this.value;
            });

            blanksContainer.appendChild(blanks);
            optionsList.appendChild(blanksContainer);
        });
    }
    else if (currentQuestion.type === 3) {
        // 判断题
        const options = [
            { text: "正确", value: true },
            { text: "错误", value: false }
        ];

        options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'option-item';
            optionItem.dataset.optionValue = option.value;

            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;

            // 添加点击事件记录用户选择
            optionItem.addEventListener('click', function() {
                // 移除其他选项的选中状态
                optionsList.querySelectorAll('.option-item').forEach(item => {
                    item.classList.remove('selected');
                });
                // 标记当前选项为选中
                this.classList.add('selected');
                // 记录用户答案
                currentQuestion.userAnswer = option.value;
            });

            // 如果用户之前已经选择过这个选项，标记为选中
            if (currentQuestion.userAnswer === option.value) {
                optionItem.classList.add('selected');
            }

            optionItem.appendChild(optionText);
            optionsList.appendChild(optionItem);
        });
    }

    questionCard.appendChild(optionsList);
    quizContainer.appendChild(questionCard);

    console.log(`已显示考试第 ${index + 1} 题`);
}

// 考试模式下一题
function showNextExamQuestion() {
    if (currentExamIndex < currentExamQuestions.length - 1) {
        currentExamIndex++;
        renderQuestions_EXAM(currentExamIndex);
    }
}

// 考试模式上一题
function showPreviousExamQuestion() {
    if (currentExamIndex > 0) {
        currentExamIndex--;
        renderQuestions_EXAM(currentExamIndex);
    }
}

// 初始化考试 - 修复版本
function initExam(questionBank, questionCount) {
    if (!questionBank || questionBank.length === 0) {
        alert('题库为空，无法开始考试');
        return;
    }

    // 重置状态
    resetQuizState();

    // 随机选择题目
    currentExamQuestions = getRandomQuestions(questionBank, questionCount);
    currentExamIndex = 0;
    isExamMode = true;
    examScore = 0;

    // 重置用户答案
    currentExamQuestions.forEach(question => {
        question.userAnswer = undefined;
        question.userAnswers = []; // 用于填空题
    });

    // 确保考试控制按钮可见
    document.getElementById('exam-controls').style.display = 'flex';
    document.getElementById('submit-btn').style.display = 'none'; // 初始隐藏提交按钮

    // 清空并显示第一题
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.innerHTML = '';
    renderQuestions_EXAM(0);
}

// 随机选择题目的函数
function getRandomQuestions(questionBank, count) {
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 提交考试
function submitExam() {
    if (!currentExamQuestions || currentExamQuestions.length === 0) return;

    let score = 0;
    let total = currentExamQuestions.length;

    // 计算得分
    currentExamQuestions.forEach(question => {
        if (checkAnswer(question)) {
            score++;
        }
    });

    examScore = score;

    // 显示考试结果
    showExamResult(score, total);
}

// 检查单题答案
function checkAnswer(question) {
    switch (question.type) {
        case 1: // 选择题
            const correctOptionIndex = question.options.findIndex(option => option.correct);
            return question.userAnswer === correctOptionIndex;

        case 2: // 填空题
            if (!question.userAnswers || question.userAnswers.length !== question.answer.length) {
                return false;
            }
            return question.userAnswers.every((answer, index) =>
                answer.trim().toLowerCase() === question.answer[index].toLowerCase()
            );

        case 3: // 判断题
            return question.userAnswer === question.correct;

        default:
            return false;
    }
}

// 显示考试结果
function showExamResult(score, total) {
    const quizContainer = document.querySelector('.quiz-container');
    const percentage = ((score / total) * 100).toFixed(1);

    quizContainer.innerHTML = `
        <div class='exam-result'>
            <h2>考试结果</h2>
            <div class='score'>得分: ${score} / ${total}</div>
            <div class='percentage'>正确率: ${percentage}%</div>
            <button onclick="reviewExam()" class='review-btn'>查看详细</button>
            <button onclick="restartExam()" class='restart-btn'>重新考试</button>
        </div>
    `;

    // 隐藏考试控制按钮
    document.getElementById('exam-controls').style.display = 'none';
}

// 查看考试详细 - 修复版本
function reviewExam() {
    isExamMode = false; // 退出考试模式
    currentBank = [...currentExamQuestions]; // 将考试题目设为当前题库
    currentIndex = 0;

    // 在查看详细时，显示所有题目的答案
    // 将当前题库的所有题目索引添加到shownAnswers中
    shownAnswers.clear();
    currentBank.forEach((_, index) => {
        shownAnswers.add(index);
    });

    // 确保考试控制按钮隐藏
    document.getElementById('exam-controls').style.display = 'none';

    // 清空容器并显示第一题（练习模式），并显示答案
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.innerHTML = '';
    renderQuestions_TEXT(currentIndex);
}

// 重新考试 - 修复版本
function restartExam() {
    // 重新初始化考试
    const currentBankName = currentExamQuestions[0]?.name || 1;
    const questionBank = selectQuestions(parseInt(currentBankName));

    // 清空考试结果显示
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.innerHTML = '';

    // 显示题目数量选择模态框
    showQuestionCountSelector(questionBank);
}

// 退出考试模式
function exitExamMode() {
    isExamMode = false;
    document.getElementById('exam-controls').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';

    // 返回首页
    document.getElementById('cardmain').style.display = 'block';
    document.getElementById('cardtext').style.display = 'none';
}

// 添加键盘支持
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        if (isExamMode) {
            showPreviousExamQuestion();
        } else {
            showPreviousQuestion();
        }
    } else if (event.key === 'ArrowRight') {
        if (isExamMode) {
            showNextExamQuestion();
        } else {
            showNextQuestion();
        }
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initQuiz();

    // 绑定按钮事件（只绑定一次）
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (isExamMode) {
            showPreviousExamQuestion();
        } else {
            showPreviousQuestion();
        }
    });

    document.getElementById('next-btn').addEventListener('click', function() {
        if (isExamMode) {
            showNextExamQuestion();
        } else {
            showNextQuestion();
        }
    });

    // 获取DOM元素
    const btnToText1 = document.getElementById('btnToText1');
    const btnToText2 = document.getElementById('btnToText2');
    const btnToText3 = document.getElementById('btnToText3');
    const btnToText4 = document.getElementById('btnToText4');
    const btnToText5 = document.getElementById('btnToText5');
    const btnToText6 = document.getElementById('btnToText6');

    const btnToExam1 = document.getElementById('btnToExam1');
    const btnToExam2 = document.getElementById('btnToExam2');
    const btnToExam3 = document.getElementById('btnToExam3');
    const btnToExam4 = document.getElementById('btnToExam4');
    const btnToExam5 = document.getElementById('btnToExam5');
    const btnToExam6 = document.getElementById('btnToExam6');

    // 通用的练习模式切换函数
    function switchToPracticeMode(cardNumber) {
        resetQuizState();
        showCard();
        showtitle(cardNumber);
        currentBank = selectQuestions(cardNumber);
        isExamMode = false;
        document.getElementById('exam-controls').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'none';

        if (currentBank.length > 0) {
            renderQuestions_TEXT(currentIndex);
        }
    }

    // 通用的考试模式切换函数
    function switchToExamMode(cardNumber) {
        resetQuizState();
        showCard();
        showtitle(cardNumber);
        const questionBank = selectQuestions(cardNumber);
        showQuestionCountSelector(questionBank);
    }

    // 绑定练习模式按钮
    btnToText1.addEventListener('click', () => switchToPracticeMode(1));
    btnToText2.addEventListener('click', () => switchToPracticeMode(2));
    btnToText3.addEventListener('click', () => switchToPracticeMode(3));
    btnToText4.addEventListener('click', () => switchToPracticeMode(4));
    btnToText5.addEventListener('click', () => switchToPracticeMode(5));
    btnToText6.addEventListener('click', () => switchToPracticeMode(6));

    // 绑定考试模式按钮
    btnToExam1.addEventListener('click', () => switchToExamMode(1));
    btnToExam2.addEventListener('click', () => switchToExamMode(2));
    btnToExam3.addEventListener('click', () => switchToExamMode(3));
    btnToExam4.addEventListener('click', () => switchToExamMode(4));
    btnToExam5.addEventListener('click', () => switchToExamMode(5));
    btnToExam6.addEventListener('click', () => switchToExamMode(6));
});

const ALLqts = [
    {
        name: 1,
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
        question: "下面不属于网络拓扑结构的是下列哪一个结构?",
        options: [
            { text: "环形结构", correct: false },
            { text: "总线结构", correct: false },
            { text: "层次结构", correct: true },
            { text: "网状结构", correct: false }
        ]
    },
    {
        name: 1,
        type: 1,
        question: "下面不属于局域网拓扑结构的是什么结构?",
        options: [
            { text: "环形结构", correct: false },
            { text: "总线结构", correct: false },
            { text: "树形结构", correct: false },
            { text: "网状结构", correct: true }
        ]
    },
    {
        name: 1,
        type: 1,
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
        type: 1,
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
        type: 1,
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
        type: 1,
        question: "协议的关键要素不包括下列哪一项?",
        options: [
            { text: "语言", correct: true },
            { text: "语法", correct: false },
            { text: "语义", correct: false },
            { text: "同步", correct: false }
        ]
    },
    {
        name: 1,
        type: 1,
        question: "下列设备不属于资源子网的是哪一个?",
        options: [
            { text: "打印机", correct: false },
            { text: "集线器", correct: true },
            { text: "路由器", correct: false },
            { text: "局域网交换机", correct: false }
        ]
    },
    {
        name: 1,
        type: 1,
        question: "在ISO/OSI参考模型中,数据的压缩、加密等功能由哪层完成( )。",
        options: [
            { text: "应用层", correct: false },
            { text: "表示层", correct: true },
            { text: "会话层", correct: false },
            { text: "传输层", correct: false }
        ]
    },
    {
        name: 1,
        type: 1,
        question: "下列功能中属于表示层提供的功能的是?",
        options: [
            { text: "拥塞控制", correct: false },
            { text: "透明传输", correct: false },
            { text: "死锁处理", correct: false },
            { text: "数据压缩", correct: true }
        ]
    },
    {
        name: 1,
        type: 1,
        question: "TCP/IP体系结构中的第二层是下面哪一层?",
        options: [
            { text: "网络接口层", correct: false },
            { text: "传输层", correct: false },
            { text: "互联网层", correct: true },
            { text: "应用层", correct: false }
        ]
    },
    {
        name: 1,
        type: 2,
        question: "计算机网络是____技术和____技术的结合的产物。",
        answer: ["计算机", "通信"]
    },
    {
        name: 1,
        type: 2,
        question: "电路交换的三个阶段是____、____和____。",
        answer: ["建立连接", "数据传输", "释放连接"]
    },
    {
        name: 1,
        type: 2,
        question: "计算机网络的三种数据交换方式是____交换、____交换和____交换。",
        answer: ["电路", "报文", "分组"]
    },
    {
        name: 1,
        type: 2,
        question: "从逻辑功能上,计算机网络可以分为两个子网____子网和____子网。",
        answer: ["资源", "通信"]
    },
    {
        name: 1,
        type: 2,
        question: "在同一个系统内,相邻层之间交换信息的连接点称之为服务访问点,而低层模块向高层提供功能性的支持称之为____。",
        answer: ["服务"]
    },
    {
        name: 1,
        type: 2,
        question: "____是控制两个对等实体进行通信的规则的集合。",
        answer: ["协议"]
    },
    {
        name: 1,
        type: 2,
        question: "Internet服务供应商简称为____(英文)。",
        answer: ["ISP"]
    },
    {
        name: 1,
        type: 2,
        question: "当今计算机网络两个主要网络体系结构分别是OSI/RM和____。",
        answer: ["TCP/IP"]
    },
    {
        name: 1,
        type: 2,
        question: "国际标准化组织提出的七层网络模型中,从高层到低层依次是____、____、____、____、____、____、____。",
        answer: ["应用层", "表示层", "会话层", "传输层", "网络层", "数据链路层", "物理层"]
    },
    {
        name: 1,
        type: 2,
        question: "网络协议通常采用分层思想进行设计,TCP/IP中协议分为4层,而OSI/RM中的协议分为____层。",
        answer: ["7"]
    },
    {
        name: 1,
        type: 2,
        question: "网络协议通常采用分层思想进行设计,OSI/RM中的协议分为7层,而TCP/IP中协议分为____层。",
        answer: ["4"]
    },
    {
        name: 1,
        type: 2,
        question: "用来描述单位时间内通过网络(信道或接口)的数据量为____。",
        answer: ["吞吐量"]
    },
    {
        name: 1,
        type: 2,
        question: "在节点中产生的时延包括____时延、____时延和____时延。",
        answer: ["发送", "传播", "处理"]
    },
    {
        name: 1,
        type: 2,
        question: "信道能够传送电磁波的有效频率范围称为该信道的____,其单位为____。",
        answer: ["带宽", "赫兹"]
    },
    {
        name: 1,
        type: 2,
        question: "C/S结构模式是对大型主机结构的一次挑战,其中S表示的是____、C表示的是____。",
        answer: ["服务器", "客户机"]
    },
    {
        name: 1,
        type: 2,
        question: "协议的三个要素为____,____和____。",
        answer: ["语法", "语义", "同步"]
    },
    {
        name: 4,
        type: 1,
        question: "波特率等于下列什么?",
        options: [
            { text: "每秒传输的比特", correct: false },
            { text: "每秒钟可能发生的信号变化的次数", correct: true },
            { text: "每秒传输的周期数", correct: false },
            { text: "每秒传输的字节数", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "数据通信中的信道传输速率单位用bps表示下列什么?",
        options: [
            { text: "字节/秒", correct: false },
            { text: "位/秒", correct: true },
            { text: "K位/秒", correct: false },
            { text: "K字节/秒", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "传输速率单位\"bps\"代表什么?",
        options: [
            { text: "BYTES PER SECOND", correct: false },
            { text: "BITS PER SECOND", correct: true },
            { text: "BAUD PER SECOND", correct: false },
            { text: "BILLION PER SECOND", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "半双工支持哪一种类型的数据流?",
        options: [
            { text: "一个方向", correct: false },
            { text: "同时在两个方向上", correct: false },
            { text: "两个方向,但在每一时刻仅可以在一个方向上有数据流", correct: true },
            { text: "以上说法都不对", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "无线电广播采用的通信方式是下列什么通信?",
        options: [
            { text: "单工通信", correct: true },
            { text: "半双工通信", correct: false },
            { text: "全双工通信", correct: false },
            { text: "以上都不是", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "\"指明某条线路上出现某种电压表示何种意义\"指的是什么特性?",
        options: [
            { text: "机械特性", correct: false },
            { text: "电气特性", correct: false },
            { text: "功能特性", correct: true },
            { text: "规程特性", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "信号的电平用+5V~+15V表示二进制0,用-5V~-15V表示二进制1,电缆长度限于15m以内,这体现了物理层接口的下列哪一种特性?",
        options: [
            { text: "机械特性", correct: false },
            { text: "功能特性", correct: false },
            { text: "电气特性", correct: true },
            { text: "规程特性", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "下列传输介质中,哪种最适合长距离信息传输以及要求高度安全的场合。",
        options: [
            { text: "同轴电缆", correct: false },
            { text: "双绞线", correct: false },
            { text: "微波", correct: false },
            { text: "光缆", correct: true }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "利用双绞线连网的网卡采用的接口是下列哪一个?",
        options: [
            { text: "AUI", correct: false },
            { text: "BNC", correct: false },
            { text: "RJ-45", correct: true },
            { text: "SC", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "双绞线分下列哪两类双纹线?",
        options: [
            { text: "基带.宽带", correct: false },
            { text: "基带.窄带", correct: false },
            { text: "屏蔽.非屏蔽", correct: true },
            { text: "屏蔽.基带", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "在局域网中,最常用的、成本最低的传输介质是下列哪一种?",
        options: [
            { text: "双绞线", correct: true },
            { text: "同轴电缆", correct: false },
            { text: "光纤", correct: false },
            { text: "无线通信", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "在以太网中应用光缆作为传输介质的意义在于下列哪一项?",
        options: [
            { text: "增加网络带宽", correct: false },
            { text: "扩大网络传输距离", correct: true },
            { text: "降低连接及使用费用", correct: false },
            { text: "A、B、C都正确。", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "关于微波通信,下列说法错误的是哪个?",
        options: [
            { text: "微波传输信息质量较好", correct: false },
            { text: "微波通信信道容量较大", correct: false },
            { text: "微波信号能够绕过障碍物", correct: true },
            { text: "与电缆通信比较,其保密性较差", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "下列哪一个不是卫星通信的特点?",
        options: [
            { text: "具有较大的传播时延", correct: false },
            { text: "比较适合广播通信", correct: false },
            { text: "卫星通信价格较贵", correct: false },
            { text: "具有较好的保密性", correct: true }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "一次传送一个字符,每个字符用一个起始码引导,一个停止码结束。如果没有数据发送,发送方可以连续发送停止码。这种通信方式为什么传输?",
        options: [
            { text: "异步传输", correct: true },
            { text: "块传输", correct: false },
            { text: "同步传输", correct: false },
            { text: "并行传输", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "在计算机通信中,把直接由计算机产生的数字信号进行传输的方式称为什么传输?",
        options: [
            { text: "基带", correct: true },
            { text: "宽带", correct: false },
            { text: "频带", correct: false },
            { text: "调制/解调", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "主要用于数字信号传输的信号方式是下列哪一项?",
        options: [
            { text: "基带传输", correct: true },
            { text: "宽带传输", correct: false },
            { text: "两者都是", correct: false },
            { text: "两者都不是", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "下列哪一项是实现数字信号和模拟信号转换的设备?",
        options: [
            { text: "路由器", correct: false },
            { text: "调制解调器", correct: true },
            { text: "网络线", correct: false },
            { text: "都不是", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "当通过电话线连接到ISP时,因为电话线路输出信号为下列那一种信号,计算机输出信号只能通过调制解调器同电话网连接。",
        options: [
            { text: "数字", correct: false },
            { text: "模拟", correct: true },
            { text: "音频", correct: false },
            { text: "模拟数字", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "关于统计时分复用的说法错误的是下列哪一个?",
        options: [
            { text: "属于静态信道共享技术", correct: true },
            { text: "线路利用率较高", correct: false },
            { text: "用户数多于时隙数", correct: false },
            { text: "用户时隙的位置固定", correct: false }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "关于信道复用,下列说法正确的是哪个?",
        options: [
            { text: "频分复用的所有用户在不同的时间占用相同的带宽资源", correct: false },
            { text: "时分复用所有用户在不同的时间占用不同的带宽资源", correct: false },
            { text: "波分复用是光信号的时分复用", correct: false },
            { text: "码分复用属于扩频通信方式", correct: true }
        ]
    },
    {
        name: 4,
        type: 1,
        question: "10个9.6Kb/s的信道按时分多路复用在一条线路上传输,如果忽略控制开销,在同步TDM情况下,复用线路的带宽应该是多少Kb/s?",
        options: [
            { text: "32Kb/s", correct: false },
            { text: "64Kb/s", correct: false },
            { text: "72Kb/s", correct: false },
            { text: "96Kb/s", correct: true }
        ]
    },
    {
        name: 4,
        type: 2,
        question: "____层的主要任务是透明地传输比特流。",
        answer: ["物理"]
    },
    {
        name: 4,
        type: 2,
        question: "从双方信息交互的方式来看,通信有以下三个基本方式单工通信、____通信和全双工通信。",
        answer: ["半双工"]
    },
    {
        name: 4,
        type: 2,
        question: "数据传输的技术有两种:____和异步传输。",
        answer: ["同步传输"]
    },
    {
        name: 4,
        type: 2,
        question: "数据传输的技术有两种:同步传输和____。",
        answer: ["异步传输"]
    },
    {
        name: 4,
        type: 2,
        question: "物理层的主要任务是确定与传输介质有关的特性,即____、规程特性、电气特性和功能特性。",
        answer: ["机械特性"]
    },
    {
        name: 4,
        type: 2,
        question: "物理层的主要任务是确定与传输介质有关的特性,即机械特性、____、电气特性和功能特性。",
        answer: ["规程特性"]
    },
    {
        name: 4,
        type: 2,
        question: "物理层的主要任务是确定与传输介质有关的特性,即机械特性、规程特性、____和功能特性。",
        answer: ["电气特性"]
    },
    {
        name: 4,
        type: 2,
        question: "物理层的主要任务是确定与传输介质有关的特性,即机械特性、规程特性、电气特性和____。",
        answer: ["功能特性"]
    },
    {
        name: 4,
        type: 2,
        question: "点到点通信系统模型由____、发送设备、传输系统、接收设备和信宿五部分组成。",
        answer: ["信源"]
    },
    {
        name: 4,
        type: 2,
        question: "点到点通信系统模型由信源、____、传输系统、接收设备和信宿五部分组成。",
        answer: ["发送设备"]
    },
    {
        name: 4,
        type: 2,
        question: "点到点通信系统模型由信源、发送设备、____、接收设备和信宿五部分组成。",
        answer: ["传输系统"]
    },
    {
        name: 4,
        type: 2,
        question: "点到点通信系统模型由信源、发送设备、传输系统、____和信宿五部分组成。",
        answer: ["接收设备"]
    },
    {
        name: 4,
        type: 2,
        question: "点到点通信系统模型由信源、发送设备、传输系统、接收设备和____五部分组成。",
        answer: ["信宿"]
    },
    {
        name: 4,
        type: 2,
        question: "常用的有线介质有____、双绞线和光纤三种。",
        answer: ["同轴电缆"]
    },
    {
        name: 4,
        type: 2,
        question: "常用的有线介质有同轴电缆、____和光纤三种。",
        answer: ["双绞线"]
    },
    {
        name: 4,
        type: 2,
        question: "常用的有线介质有同轴电缆、双绞线和____三种。",
        answer: ["光纤"]
    },
    {
        name: 4,
        type: 2,
        question: "按照光信号在光纤中的传播方式,可将光纤分为两种不同的类型,它们是____和多模光纤。",
        answer: ["单模光纤"]
    },
    {
        name: 4,
        type: 2,
        question: "按照光信号在光纤中的传播方式,可将光纤分为两种不同的类型,它们是单模光纤和____。",
        answer: ["多模光纤"]
    },
    {
        name: 4,
        type: 2,
        question: "单位时间内传输波形个数的量称为____率。",
        answer: ["波特"]
    },
    {
        name: 4,
        type: 2,
        question: "信号可分为模拟信号和____两大类。",
        answer: ["数字信号"]
    },
    {
        name: 4,
        type: 2,
        question: "信号可分为____和数字信号两大类。",
        answer: ["模拟信号"]
    },
    {
        name: 4,
        type: 2,
        question: "通过改变载波信号振幅来表示信号1、0的方法叫调幅,而通过改变载波信号频率来表示信号1、0的方法叫____。",
        answer: ["调频"]
    },
    {
        name: 4,
        type: 2,
        question: "通过改变载波信号振幅来表示信号1、0的方法叫____,而通过改变载波信号频率来表示信号1、0的方法叫调频。",
        answer: ["调幅"]
    },
    {
        name: 4,
        type: 2,
        question: "调制解调器完成数字信号和____信号的转换。",
        answer: ["模拟"]
    },
    {
        name: 4,
        type: 2,
        question: "调制解调器完成____信号和模拟信号的转换。",
        answer: ["数字"]
    },
    {
        name: 4,
        type: 2,
        question: "将数字数据调制为模拟信号,常用的调制方法有____、调频和调相。",
        answer: ["调幅"]
    },
    {
        name: 4,
        type: 2,
        question: "将数字数据调制为模拟信号,常用的调制方法有调幅、____和调相。",
        answer: ["调频"]
    },
    {
        name: 4,
        type: 2,
        question: "将数字数据调制为模拟信号,常用的调制方法有调幅、调频和____。",
        answer: ["调相"]
    },
    {
        name: 4,
        type: 2,
        question: "把基带数字信号的频谱变换成为适合在模拟信道中传输的频谱,最基本的调制方法有____、调频和调相。",
        answer: ["调幅"]
    },
    {
        name: 4,
        type: 2,
        question: "把基带数字信号的频谱变换成为适合在模拟信道中传输的频谱,最基本的调制方法有调幅、____和调相。",
        answer: ["调频"]
    },
    {
        name: 4,
        type: 2,
        question: "把基带数字信号的频谱变换成为适合在模拟信道中传输的频谱,最基本的调制方法有调幅、调频和____。",
        answer: ["调相"]
    },
    {
        name: 4,
        type: 2,
        question: "将模拟信号变换成数字信号的过程称为____调制。",
        answer: ["脉码"]
    },
    {
        name: 4,
        type: 2,
        question: "脉码调制技术PCM技术用____传输系统,传输模拟信号。",
        answer: ["数字"]
    },
    {
        name: 4,
        type: 2,
        question: "脉码调制是将____信号,转换成数字信号。",
        answer: ["模拟"]
    },
    {
        name: 4,
        type: 2,
        question: "脉码调制是将模拟信号,转换成____信号。",
        answer: ["数字"]
    },
    {
        name: 4,
        type: 2,
        question: "PCM技术采样定理要求采样频率不低于电话信号最高频率的____倍。",
        answer: ["2"]
    },
    {
        name: 4,
        type: 2,
        question: "在多路复用技术中,频分多路复用的英文缩写是____。",
        answer: ["FDM"]
    },
    {
        name: 4,
        type: 2,
        question: "在多路复用技术中,时分多路复用的英文缩写是____。",
        answer: ["TDM"]
    },
    {
        name: 4,
        type: 2,
        question: "在多路复用技术中,统计时分多路复用的英文缩写是____。",
        answer: ["STDM"]
    },
    {
        name: 4,
        type: 2,
        question: "在多路复用技术中,波分多路复用的英文缩写是____。",
        answer: ["WDM"]
    },
    {
        name: 4,
        type: 2,
        question: "在多路复用技术中,码分多路复用的英文缩写是____。",
        answer: ["CDM"]
    },
    {
        name: 4,
        type: 2,
        question: "在多路复用技术中,码分多址的英文缩写是____。",
        answer: ["CDMA"]
    },
    {
        name: 4,
        type: 2,
        question: "目前常用的四种信道复用方式是:____、时分复用、码分复用和波分复用。",
        answer: ["频分复用"]
    },
    {
        name: 4,
        type: 2,
        question: "目前常用的四种信道复用方式是:频分复用、____、码分复用和波分复用。",
        answer: ["时分复用"]
    },
    {
        name: 4,
        type: 2,
        question: "目前常用的四种信道复用方式是:频分复用、时分复用、____和波分复用。",
        answer: ["码分复用"]
    },
    {
        name: 4,
        type: 2,
        question: "目前常用的四种信道复用方式是:频分复用、时分复用、码分复用和____。",
        answer: ["波分复用"]
    },
    {
        name: 4,
        type: 3,
        question: "微波通信的特点是微波信号能够绕过障碍物。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "单模光纤的性能优于多模光纤。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "多模光纤的性能优于单模光纤。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "双绞线是目前最常用的带宽最宽、信号传输衰减最小、抗干扰能力最强的一类传输介质。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "光纤是目前最常用的带宽最宽、信号传输衰减最小、抗干扰能力最强的一类传输介质。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "在数字通信中发送端和接收端必需以某种方式保持同步。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "半双工与全双工都有两个传输通道。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "模拟数据只能通过模拟信号进行传输。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "模拟数据也可通过数字信道进行传输。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "数字数据只能通过数字信道进行传输。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "数字数据只能通过数字信号进行传输。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "数字数据也可通过模拟信道进行传输。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "数字数据也可通过模拟信号进行传输。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "码元传输速度的单位是波特率,有时也可称作调制率。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "脉码调制技术PCM技术用于数字传输系统,传输模拟信号。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "脉码调制技术PCM技术用于模拟传输系统,传输模拟信号。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "PCM技术就是将模拟数据转换成数字数据。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "PCM技术就是将数字数据转换成模拟数据。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "脉码调制的第一步是对模拟信号的量化。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "ADSL技术是用数字技术对现有的模拟电话用户线进行了改造的一种宽带接入技术。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "一般来说,ADSL中的上行带宽比下行带宽高。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "香农定理描述的是理想信道的极限信息速率。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "香农公式描述的是理想信道的极限数据传输速率。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "奈奎斯特定理描述的是实际噪声信道的极限信息速率与带宽的关系。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "波特是码元传输的速率单位,1波特相当于1个比特。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "频分复用和码分复用都是所有用户在相同的时间占用不同的带宽资源。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "频分复用和时分复用都是所有用户在相同的时间占用同一的带宽资源。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "时分复用和码分复用都是所有用户在相同的时间占用同一的带宽资源。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "频分复用就是所有用户在相同的时间占用不同的带宽资源,而码分复用则是所有用户在不同的时间占用相同的带宽资源。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "频分复用就是所有用户在相同的时间占用不同的带宽资源,时分复用所有用户在不同的时间占用不同的带宽资源。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "频分复用就是所有用户在相同的时间占用不同的带宽资源,时分复用所有用户在不同的时间占用不同的带宽资源。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "若信道的复用是以信息在一帧中的时间位置(时隙)来区分,不需要另外的信息头来标志信息的身分,则这种复用方式为频分多路复用。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "统计时分复用帧中的时隙数小于连接在集中器上的用户数。",
        correct: true
    },
    {
        name: 4,
        type: 3,
        question: "统计时分复用帧中的时隙数大于连接在集中器上的用户数。",
        correct: false
    },
    {
        name: 4,
        type: 3,
        question: "CDMA系统采用是码分复用技术。",
        correct: true
    },
    //数据链路层习题
    {
        name: 6,
        type: 1,
        question: '数据链路层的三个基本问题不包括下列哪一个?',
        options: [
            {text: '封装成帧', correct: false},
            {text: '差错控制', correct: false},
            {text: '同步传输', correct: true},
            {text: '透明传输', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '接收端发现有差错时,设法通知发送端重发,直到正确的码字收到为止,这种差错控制方法称为什么?',
        options: [
            {text: '前向纠错', correct: false},
            {text: '自动请求重发', correct: true},
            {text: '冗余检验', correct: false},
            {text: '混合差错控制', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '一般认为决定局域网特性的主要技术有三个,它们是下列哪一组?',
        options: [
            {text: '传输媒体、差错检测方法和网络操作系统', correct: false},
            {text: '通信方式、同步方式和拓朴结构', correct: false},
            {text: '传输媒体、拓扑结构和媒体访问控制方法', correct: true},
            {text: '数据编码技术、媒体访问控制方法和数据交换技术', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '下列哪一个不是局域网的特点?',
        options: [
            {text: '具有较高的数据传输速率', correct: false},
            {text: '覆盖范围和站点数量有限', correct: false},
            {text: '具有较高的误码率', correct: true},
            {text: '具有较低的时延', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '一个以太网中有A、B、C、D四台主机,A给B发信息,则有谁收到信息?',
        options: [
            {text: '只有B收到信息', correct: false},
            {text: '四台主机都收到信息', correct: true},
            {text: '四台主机都收不到信息', correct: false},
            {text: 'B、C、D三台主机收到信息', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '下列哪一个不是以太网适配器的功能?',
        options: [
            {text: '数据压缩', correct: true},
            {text: '串行/并行转换', correct: false},
            {text: '实现以太网协议', correct: false},
            {text: '数据缓存', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '以下哪种局域网采用的是受控接入技术。',
        options: [
            {text: '10BASE5', correct: false},
            {text: '10BASE2', correct: false},
            {text: '10BASE-T', correct: false},
            {text: '令牌环网', correct: true}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '100BASE-T使用的是下列哪种传输介质?',
        options: [
            {text: '同轴电缆', correct: false},
            {text: '双绞线', correct: true},
            {text: '光纤', correct: false},
            {text: '都可以', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '网桥及一般的二层交换机在进行数据包转发时,识别的数据包包头中的什么内容进行数据包的转发?',
        options: [
            {text: 'MAC地址', correct: true},
            {text: 'IP地址', correct: false},
            {text: '网络号', correct: false},
            {text: '主机号', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '局域网的协议结构是下列哪一个?',
        options: [
            {text: '包括物理层、数据链路层和网络层', correct: false},
            {text: '包括物理层、LLC子层和MAC子层', correct: true},
            {text: '只有LLC子层和MAC子层', correct: false},
            {text: '只有物理层', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '可扩展到广域网的以太网技术是下列哪一个?',
        options: [
            {text: '以太网', correct: false},
            {text: '快速以太网', correct: false},
            {text: '千兆以太网', correct: false},
            {text: '万兆以太网', correct: true}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '交换机端口可以分为半双工与全双工两类。对于100Mbps的全双工端口,端口带宽为多少Mbps?',
        options: [
            {text: '100', correct: false},
            {text: '200', correct: true},
            {text: '400', correct: false},
            {text: '800', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '判断下列哪一个是错误的Etherner物理地址?',
        options: [
            {text: '00-36-18-A6-E0-CD', correct: false},
            {text: 'E0-106-20-10-79-88', correct: true},
            {text: 'F3-88-E0-06-05-08', correct: false},
            {text: '00-60-08-00-A6-38', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '目前应用最为广泛的一类局域网是Ethernet网。Ethernet的核心技术是它的随机争用型介质访问控制方法,其英文标识是什么?',
        options: [
            {text: 'Token Ring', correct: false},
            {text: 'Token Bus', correct: false},
            {text: 'CSMA/CD', correct: true},
            {text: 'FDDI', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: 'IEEE802.3标准是下列哪一种访问方法和物理层规范?',
        options: [
            {text: '逻辑链路控制', correct: false},
            {text: 'CSMA/CD', correct: true},
            {text: '令牌总线', correct: false},
            {text: '令牌环网', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '下列哪个标准是无线网络的标准?',
        options: [
            {text: '802.3', correct: false},
            {text: '802.11', correct: true},
            {text: '802.12', correct: false},
            {text: '802.1', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '令牌环协议是一种什么样协议?',
        options: [
            {text: '无冲突的', correct: true},
            {text: '有冲突的', correct: false},
            {text: '多令牌的', correct: false},
            {text: '随机争用的', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '虚拟局域网VLAN的技术基础是下列那种技术?',
        options: [
            {text: '冲突检测技术', correct: false},
            {text: '路由技术', correct: false},
            {text: '交换技术', correct: true},
            {text: '多路复用技术', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '下面关于虚拟局域网VLAN的叙述哪一个是错误的?',
        options: [
            {text: 'VLAN是由一些局域网网段构成的与物理位置无关的逻辑组。', correct: false},
            {text: '利用以太网交换机可以很方便地实现VLAN。', correct: false},
            {text: '每一个VLAN的工作站可处在不同的局域网中。', correct: false},
            {text: '虚拟局域网是一种新型局域网。', correct: true}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '下列选项中,哪一个不属于广域网?',
        options: [
            {text: '帧中继', correct: false},
            {text: 'X.25分组网', correct: false},
            {text: 'ISDN', correct: false},
            {text: '以太网', correct: true}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '网卡实现的主要是网络的那层功能?',
        options: [
            {text: '物理层与网络层的功能', correct: false},
            {text: '网络层与应用层的功能', correct: false},
            {text: '物理层与数据链路层的功能', correct: true},
            {text: '网络层与表示层的功能', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '为了将服务器、工作站连接到网络中去,需要在网络通信介质和智能设备间用网络接口设备进行物理连接,局域网中完成这一功能的是下列哪个设备?',
        options: [
            {text: '网卡', correct: true},
            {text: '调制解调器', correct: false},
            {text: '集线器', correct: false},
            {text: '路由器', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '集线器工作在下列那一层?',
        options: [
            {text: '物理层', correct: true},
            {text: '数据链路层', correct: false},
            {text: '网络层', correct: false},
            {text: '高层', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '关于集线器特点的下列说法中,错误的是哪一个?',
        options: [
            {text: '工作在物理层', correct: false},
            {text: '完成数据帧的过滤功能', correct: true},
            {text: '组网的物理拓扑结构多为星型', correct: false},
            {text: '节点共享线路总带宽', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '下列哪种说法是正确的?',
        options: [
            {text: '集线器具有交换功能', correct: false},
            {text: '集线器具有信息过滤功能', correct: false},
            {text: '集线器具有路径检测功能', correct: false},
            {text: '集线器可以对接收到的信号进行放大', correct: true}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '用集线器或交换机连接各计算机的拓扑结构是下列的那一种?',
        options: [
            {text: '总线结构', correct: false},
            {text: '环型结构', correct: false},
            {text: '星型结构', correct: true},
            {text: '网状结构', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '在用于扩展网络覆盖范围的设备中,下列哪一个扩大了冲突域?',
        options: [
            {text: '集线器', correct: true},
            {text: '路由器', correct: false},
            {text: '交换器', correct: false},
            {text: '网关', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '在OSI参考模型中,网桥实现互联的层次为下列那一层?',
        options: [
            {text: '物理层', correct: false},
            {text: '数据链路层', correct: true},
            {text: '网络层', correct: false},
            {text: '高层', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '网桥工作于下列哪一层?',
        options: [
            {text: '物理层', correct: false},
            {text: '网络层', correct: false},
            {text: '数据链路层', correct: true},
            {text: '传输层', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '交换机对应ISO/OSI参考模型的哪个层次?',
        options: [
            {text: '物理层', correct: false},
            {text: '数据链路层', correct: true},
            {text: '网络层', correct: false},
            {text: '运输层', correct: false}
        ]
    },
    {
        name: 6,
        type: 1,
        question: 'LAN交换机被认为是工作在第几层的多端口什么设备?',
        options: [
            {text: '1,中继器', correct: false},
            {text: '2,集线器', correct: false},
            {text: '3,路由器', correct: false},
            {text: '2,网桥', correct: true}
        ]
    },
    {
        name: 6,
        type: 1,
        question: '在数字通信中,使收发双方在时间基准上保持一致的技术是什么技术?',
        options: [
            {text: '交换技术', correct: false},
            {text: '同步技术', correct: true},
            {text: '编码技术', correct: false},
            {text: '传输技术', correct: false}
        ]
    },
    {
        name: 6,
        type: 2,
        question: '数据链路层的同步通信规程可分为面向字符和____两大类。',
        answer: ['面向比特']
    },
    {
        name: 6,
        type: 2,
        question: '____层的主要任务是在相邻结点间的线路上无差错地传送以帧为单位的数据。',
        answer: ['数据链路']
    },
    {
        name: 6,
        type: 2,
        question: '局域网中一般采用广播通信方式;而广域网一般采用____通信方式。',
        answer: ['存储转发']
    },
    {
        name: 6,
        type: 2,
        question: '常见广播式网络的拓扑结构一般采用____、星型、环形和树形结构。',
        answer: ['总线型']
    },
    {
        name: 6,
        type: 2,
        question: '信道共享技术中,动态媒体接入控制分为两大类:随机接入和____。',
        answer: ['受控接入']
    },
    {
        name: 6,
        type: 2,
        question: 'CSMA/CD协议中CS的中文意思为____,CD的中文意思是冲突检测或碰撞检测。',
        answer: ['载波监听']
    },
    {
        name: 6,
        type: 2,
        question: 'CSMA/CD算法中,在检测到冲突,并发完阻塞信号后,为了降低再次冲突的概率,需要等待一个随机时间,这个随机时间是采用____退避算法来产生的。',
        answer: ['二进制指数']
    },
    {
        name: 6,
        type: 2,
        question: '对于基带CSMA/CD而言,为了确保发送站点在传输时能检测到可能存在的冲突,数据帧的传输时延至少要等于信号传播时延的____倍。',
        answer: ['2']
    },
    {
        name: 6,
        type: 2,
        question: '考虑一个基带CSMA/CD,如果位于总线两端的两个站点间的信号传播时延为t那么,在最坏的情况下,检测一个冲突所需的时间为____。',
        answer: ['2t']
    },
    {
        name: 6,
        type: 2,
        question: '以太网数据帧的最短帧长是64字节,最大帧长是____字节。',
        answer: ['1518']
    },
    {
        name: 6,
        type: 2,
        question: '以太网数据帧的最短帧数据的长度是46字节,最大帧数据的长度是____字节。',
        answer: ['1500']
    },
    {
        name: 6,
        type: 2,
        question: '以太网的争用期是____μs。',
        answer: ['51.2']
    },
    {
        name: 6,
        type: 2,
        question: 'IEEE802模型将OSI模型的数据链路层分为LLC子层和____子层。',
        answer: ['MAC']
    },
    {
        name: 6,
        type: 2,
        question: '802标准为局域网规定了(48)bit的全球地址即物理地址。它位于局域网参考模型的____子层。',
        answer: ['MAC']
    },
    {
        name: 6,
        type: 2,
        question: 'IEEE802.3标准的MAC子层采用介质访问控制方法是____。',
        answer: ['CSMA/CD']
    },
    {
        name: 6,
        type: 2,
        question: '10BASET在物理上是一个星型结构局域网,在逻辑结构上则是一个____结构局域网。',
        answer: ['总线']
    },
    {
        name: 6,
        type: 2,
        question: '在10BASE-T网络中的10表示____。',
        answer: ['10Mbps']
    },
    {
        name: 6,
        type: 2,
        question: '在10BASE-T网络中的BASE代表____。',
        answer: ['基带']
    },
    {
        name: 6,
        type: 2,
        question: '在10BASE-T网络中的T代表____。',
        answer: ['双绞线']
    },
    {
        name: 6,
        type: 3,
        question: '局域网中一般采用"广播"传输方式;而广域网一般采用"存储-转发"的传输方式。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '同种局域网可以很容易地相互联接,这里同种局域网的含义是指相同的网络拓扑结构。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '局域网的功能是在相邻结点之间实现可靠的数据帧的传输。以太网技术是目前广泛使用一种局域网技术,所以他实现了可靠的帧的传输。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '以太网的信道利用率与其中的站点数量有关。当站点达到一定数量时,以太网的信道利用率会急剧下降。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '物理地址(又称MAC地址)是物理层的地址,由48bit 二进制数据组成。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: 'MAC地址是数据链路层的地址,其长度为48bit。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '每块网卡都有一个能与其他网卡相互区别的标识字,称为IP。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '局域网中链路传输的信号是数字信号。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '曼彻斯特编码是对数字数据的数字信号编码。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '在脉冲起始时刻,有无跳变来表示"0"和"1",但在脉冲中间时刻始终发生跳变的编码是曼彻斯特编码。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '对局域网来说,网络控制的核心是网络互连设备。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '星形结构的网络采用的是广播式的传播方式。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '集线器的功能是完成数据帧的过滤功能。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '集线器信道是全双工信道,所以不存在争用信道问题,也就不必使用CSMA/CD协议。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '工作在全双工状态下的吉比特以太网不存在争用信道问题,所以不必使用的CSMA/CD协议。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '在CSMA/CD中,站点在发送完帧之后,再对冲突进行检测。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '无线局域网协议802.11采用CSMA/CD 介质访问控制方法。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '无线局域网采用的是IEEE802.11标准。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '在802.3以太网中,如果帧的长度小于64字节时,在发送过程中将无法检测出冲突。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: 'IEEE802.3 标准是 CSMA/CD 访问方法和物理层规范。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '网桥可以通过对不需要传递的数据进行过滤并有效地阻止广播数据。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '网桥能够过滤网络中的广播帧,以防止广播风暴的发生。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '透明网桥内部的转发表是在数据帧的转发过程中建立起来的。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: '透明网桥可以过滤广播帧,防止广播风暴的发生。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '一台集线器连接的两台电脑,该两台电脑最大的距离为100米。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '在一个10BASE-T网络中两个主机间的最大距离为100米。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: '10BASE-T标准中每个节点到集线器的距离不超过150米。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: 'PPP(Point-to-Point Protocol,点到点协议)是一种在同步或异步线路上对数据包进行封装的数据链路层协议,早期的家庭拨号上网主要采用SLIP协议,而现在更多的是用PPP协议。',
        correct: true
    },
    {
        name: 6,
        type: 3,
        question: 'PPP(Point-to-Point Protocol,点到点协议)是一种网络层协议。',
        correct: false
    },
    {
        name: 6,
        type: 3,
        question: 'VLAN的特点有控制广播数据、提高网络性能、实现虚拟工作组和增强了网络的安全性。',
        correct: true
    }

];