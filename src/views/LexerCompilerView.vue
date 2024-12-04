<template>
    <div class="lexer-compiler-view">
        <h1>{{ problem.title || '词法分析器题目' }}</h1>

        <!-- 题目详细信息展示 -->
        <div v-if="problem.description" class="problem-details">
            <p><strong>题目描述：</strong>{{ problem.description }}</p>
            <p><strong>输入示例：</strong>{{ problem.terminalInput }}</p>
            <p><strong>输出示例：</strong>{{ problem.terminalOutput }}</p>
        </div>

        <!-- 代码编辑框，显示初始代码 -->
        <div class="editor">
            <textarea v-model="code" rows="15" cols="80" placeholder="输入 C/C++ 程序代码..." class="code-editor"></textarea>
        </div>

        <!-- 编译按钮 -->
        <div class="compile-btn-container">
            <button @click="compileCode" class="compile-btn">
                <span v-if="loading" class="spinner"></span> 编译
            </button>
        </div>

        <!-- 编译结果展示 -->
        <div v-if="output" class="output-container">
            <h3>编译结果：</h3>
            <pre class="output" :class="output.type">{{ output.message }}</pre>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
    name: 'LexerCompilerView',
    setup() {
        const code = ref('');
        const output = ref({ message: '', type: '' });
        const problem = ref({});
        const loading = ref(false);
        const lexerId = ref('');
        const token = sessionStorage.getItem('token');
        const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;

        // 获取题目示例数据
        const fetchProblemDetails = async () => {
            try {
                const headers = { 'token': token };
                const response = await axios.post(`${apiUrl}/master/question/lexer`, {
                    language: 'C++',
                    compLanguage: 'PL0'
                }, { headers });

                if (response.data.code === 0) {
                    const data = response.data.data;
                    problem.value = {
                        terminalInput: data.terminalInput,
                        terminalOutput: data.terminalOutput,
                        description: data.description,
                        title: `词法分析器题目 ${data.lexerId}`
                    };
                    lexerId.value = data.lexerId;
                } else {
                    console.error('获取题目失败:', response.data.message);
                }
            } catch (error) {
                console.error('获取题目数据失败', error);
            }
        };

        // 编译代码并提交判题
        const compileCode = async () => {
            loading.value = true;
            try {
                const headers = { 'token': token };
                const response = await axios.post(`${apiUrl}/master/question/lexer/check`, {
                    problemId: lexerId.value,
                    code: code.value
                }, { headers });

                const result = response.data.data;
                if (result.status === 0) {
                    output.value = { message: result.message, type: 'success' };
                } else if (result.status === 1) {
                    output.value = { message: result.message, type: 'error' };
                } else if (result.status === 2) {
                    output.value = { message: result.message, type: 'error' };
                }
            } catch (error) {
                console.error('编译代码失败', error);
                output.value = { message: '编译失败，请检查代码！', type: 'error' };
            } finally {
                loading.value = false;
            }
        };

        // 页面加载时获取题目数据
        onMounted(fetchProblemDetails);

        return {
            code,
            output,
            problem,
            lexerId,
            compileCode,
            loading
        };
    }
};
</script>

<style scoped>
/* 整体容器 */
.lexer-compiler-view {
    max-width: 1000px;
    margin: 30px auto;
    padding: 25px;
    background: linear-gradient(145deg, #f0f4f8, #e1e9f0);
    border-radius: 15px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.lexer-compiler-view:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
}

/* 标题 */
h1 {
    font-size: 2.4rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

/* 题目详细信息 */
.problem-details p {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 15px;
    line-height: 1.7;
}

.problem-details strong {
    font-weight: 700;
    color: #2c3e50;
}

/* 代码编辑框 */
.editor {
    margin: 30px 0;
}

.code-editor {
    width: 100%;
    padding: 18px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.15rem;
    background-color: #fbfbfb;
    border: 1px solid #ddd;
    border-radius: 10px;
    resize: vertical;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.code-editor:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

/* 编译按钮 */
.compile-btn-container {
    text-align: center;
    margin-top: 25px;
}

.compile-btn {
    padding: 12px 35px;
    font-size: 1.3rem;
    background: linear-gradient(45deg, #4CAF50, #8BC34A);
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease, transform 0.2s ease;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.compile-btn:hover {
    background: linear-gradient(45deg, #66bb6a, #388e3c);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
}

.compile-btn:focus {
    outline: none;
}

/* 编译结果 */
.output-container {
    margin-top: 30px;
}

h3 {
    font-size: 1.7rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
}

.output {
    background-color: #f4f8fc;
    padding: 20px;
    border-radius: 10px;
    font-size: 1.2rem;
    color: #333;
    word-wrap: break-word;
    white-space: pre-wrap;
    box-sizing: border-box;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.output.success {
    background-color: #dff0d8;
    color: #3c763d;
}

.output.error {
    background-color: #f2dede;
    color: #a94442;
}

/* 加载动画 */
.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4CAF50;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    animation: spin 1s linear infinite;
    margin-right: 10px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .lexer-compiler-view {
        padding: 15px;
    }

    h1 {
        font-size: 2rem;
    }

    .code-editor {
        font-size: 1rem;
    }

    .compile-btn {
        font-size: 1.1rem;
        padding: 10px 30px;
    }
}
</style>
