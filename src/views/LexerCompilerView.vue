<template>
    <div class="lexer-compiler-view">
        <h1>{{ problem.title || '词法分析器题目' }}</h1>

        <!-- 语言选择框 -->
        <div class="language-select">
            <label for="compLanguage">选择编译目标语言:</label>
            <select v-model="compLanguage" id="compLanguage">
                <option v-for="(item, index) in languageOptions.compLanguage" :key="index" :value="item">
                    {{ item }}
                </option>
            </select>

            <label for="language">选择编程语言:</label>
            <select v-model="language" id="language">
                <option v-for="(item, index) in languageOptions.languageList" :key="index" :value="item">
                    {{ item }}
                </option>
            </select>
        </div>

        <!-- 题目详细信息展示 -->
        <div v-if="problem.description" class="problem-details">
            <p><strong>题目描述：</strong>{{ problem.description }}</p>
            <p><strong>输入示例：</strong>{{ problem.terminalInput }}</p>
            <p><strong>输出示例：</strong>{{ problem.terminalOutput }}</p>
        </div>

        <!-- 代码编辑框 -->
        <div class="editor">
            <textarea v-model="code" rows="15" cols="80" placeholder="输入 C/C++ 程序代码..." class="code-editor"></textarea>
        </div>

        <!-- 编译按钮 -->
        <div class="compile-btn-container">
            <button @click="compileCode" class="compile-btn" :disabled="loading || !language || !compLanguage">
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
import { ref, onMounted, getCurrentInstance, watch } from 'vue';
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

        const compLanguage = ref('PL0'); // Default compilation language
        const language = ref('C++'); // Default programming language

        const languageOptions = ref({
            compLanguage: ['PL0'], // Default to 'PL0'
            languageList: ['C++'], // Default to 'C++'
        });

        // 获取可选语言列表
        const fetchLanguages = async () => {
            const headers = { 'token': token };
            try {
                const response = await axios.get(apiUrl + '/master/question/lexer/language', { headers });
                if (response.data.code === 0) {
                    const data = response.data.data;
                    languageOptions.value = {
                        compLanguage: data.languageMaps.map(item => item.compLanguage),
                        languageList: data.languageMaps
                            .find(item => item.compLanguage === compLanguage.value)?.languageList || ['C++']
                    };
                }
            } catch (error) {
                console.error('获取语言列表失败', error);
            }
        };

        // 获取题目示例数据
        const fetchProblemDetails = async () => {
            if (!language.value || !compLanguage.value) return; // Ensure both languages are selected

            try {
                const headers = { 'token': token };
                const response = await axios.post(`${apiUrl}/master/question/lexer`, {
                    language: language.value,
                    compLanguage: compLanguage.value
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
                } else if (result.status === 1 || result.status === 2) {
                    output.value = { message: result.message, type: 'error' };
                }
            } catch (error) {
                console.error('编译代码失败', error);
                output.value = { message: '编译失败，请检查代码！', type: 'error' };
            } finally {
                loading.value = false;
            }
        };

        // 页面加载时获取语言列表和题目数据
        onMounted(() => {
            fetchLanguages();
            fetchProblemDetails();
        });

        // Watchers to refetch problem details when language or compLanguage changes
        watch([compLanguage, language], () => {
            fetchProblemDetails();
        });

        return {
            code,
            output,
            problem,
            lexerId,
            compLanguage,
            language,
            languageOptions,
            compileCode,
            loading
        };
    }
};
</script>

<style scoped>
/* 保留原有样式 */

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

/* 语言选择框样式 */
.language-select {
    margin: 20px 0;
    font-size: 1.2rem;
}

.language-select label {
    margin-right: 10px;
    font-weight: 600;
    color: #333;
}

.language-select select {
    font-size: 1.1rem;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ddd;
    margin-right: 15px;
    background-color: #fff;
    color: #333;
}

.language-select select:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
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
    margin-top: 20px;
}

.compile-btn {
    background-color: #4CAF50;
    color: white;
    font-size: 1.2rem;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
}

.compile-btn:disabled {
    background-color: #ddd;
    cursor: not-allowed;
}

.compile-btn:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-3px);
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4CAF50;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 编译结果展示 */
.output-container {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    border: 1px solid #ddd;
}

.output-container h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
}

.output {
    padding: 10px;
    font-family: 'Courier New', Courier, monospace;
    border-radius: 8px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.output.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.output.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
</style>
