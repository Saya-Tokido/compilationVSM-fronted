<template>
    <div class="lexer-compiler-view">
        <h1>{{ problem.title || '词法分析器题目' }}</h1>

        <!-- 语言选择框 -->
        <div class="language-select card">
            <div class="select-group">
                <label for="compLanguage">选择编译目标语言:</label>
                <select v-model="compLanguage" id="compLanguage">
                    <option v-for="(item, index) in languageOptions.compLanguage" :key="index" :value="item">
                        {{ item }}
                    </option>
                </select>
            </div>

            <div class="select-group">
                <label for="language">选择编程语言:</label>
                <select v-model="language" id="language">
                    <option v-for="(item, index) in languageOptions.languageList" :key="index" :value="item">
                        {{ item }}
                    </option>
                </select>
            </div>
        </div>

        <!-- 题目详细信息展示 -->
        <div v-if="problem.description" class="problem-details card glass-effect">
            <div class="detail-header">
                <h2>题目详情</h2>
                <div class="detail-icons">
                    <button @click="toggleDetailCollapse" class="icon-btn">
                        <i :class="detailCollapsed ? 'fas fa-expand' : 'fas fa-compress'"></i>
                    </button>
                </div>
            </div>
            <div v-show="!detailCollapsed">
                <p class="detail-section"><strong>题目描述：</strong>{{ problem.description }}</p>
                <div class="example-section">
                    <p><strong>输入示例：</strong></p>
                    <div class="example-box">{{ formattedInput }}</div>
                </div>
                <div class="example-section">
                    <p><strong>输出示例：</strong></p>
                    <div class="example-box">{{ formattedOutput }}</div>
                </div>
            </div>
        </div>

        <!-- 代码编辑区域 -->
        <div class="code-area card glass-effect">
            <div class="editor-header">
                <h3>代码编辑器</h3>
                <div class="editor-actions">
                    <button @click="autoCompleteCode" class="action-btn" :disabled="completing">
                        <i class="fas fa-magic"></i> 智能补全
                        <span v-if="completing" class="spinner mini"></span>
                    </button>
                    <button @click="formatCode" class="action-btn">
                        <i class="fas fa-align-left"></i> 格式化
                    </button>
                </div>
            </div>
            <textarea v-model="code" ref="codeEditor" rows="15" placeholder="输入 C/C++ 程序代码..." class="code-editor"
                @keydown.tab.prevent="handleTab" @keydown.ctrl.space.prevent="autoCompleteCode">
            </textarea>
        </div>

        <!-- 按钮组 -->
        <div class="action-buttons">
            <button @click="compileCode" class="primary-btn" :disabled="loading || !language || !compLanguage">
                <i class="fas fa-play"></i>
                <span v-if="loading" class="spinner"></span>
                <span v-else>编译运行</span>
            </button>
            <button @click="saveCode" class="secondary-btn">
                <i class="fas fa-save"></i> 保存代码
            </button>
            <button @click="resetCode" class="danger-btn">
                <i class="fas fa-redo"></i> 重置
            </button>
        </div>

        <!-- 编译结果展示 -->
        <div v-if="output.message" class="output-container card glass-effect">
            <div class="output-header">
                <h3>编译结果</h3>
                <div class="output-actions">
                    <button @click="clearOutput" class="icon-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <pre class="output" :class="output.type">{{ output.message }}</pre>
        </div>

        <!-- 代码补全提示弹窗 -->
        <div v-if="showCompletionPopup" class="completion-popup">
            <div class="popup-content">
                <div class="popup-header">
                    <h4>代码补全建议</h4>
                    <button @click="closeCompletionPopup" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="completion-options">
                    <div class="completion-item active" @click="applyCompletion(completionOptions)">
                        <pre>{{ completionOptions }}</pre>
                    </div>
                </div>

                <div class="popup-footer">
                    <small>使用 ↑ ↓ 选择，Enter 确认，Esc 取消</small>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue';
import axios from 'axios';

export default {
    name: 'LexerCompilerView',
    setup(props, { emit }) {
        const code = ref('');
        const output = ref({ message: '', type: '' });
        const problem = ref({});
        const loading = ref(false);
        const completing = ref(false);
        const lexerId = ref('');
        const token = sessionStorage.getItem('token');
        const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;
        const codeEditor = ref(null);
        const detailCollapsed = ref(false);

        // 代码补全相关状态
        const showCompletionPopup = ref(false);
        const completionOptions = ref('');
        const selectedCompletionIndex = ref(0);

        const compLanguage = ref('PL0');
        const language = ref('C++');
        const languageOptions = ref({
            compLanguage: ['PL0'],
            languageList: ['C++'],
        });

        // 格式化输入输出文本
        const formatText = (text) => {
            if (!text) return '';
            return text.replace(/(\r\n|\n)/g, '<br>');
        };

        const formattedInput = computed(() => formatText(problem.value.terminalInput));
        const formattedOutput = computed(() => formatText(problem.value.terminalOutput));

        // 获取可选语言列表
        const fetchLanguages = async () => {
            const headers = { token };
            try {
                const response = await axios.get(apiUrl + '/student/oj/lexer/language', { headers });
                if (response.data.code === 0) {
                    const data = response.data.data;
                    languageOptions.value = {
                        compLanguage: data.languageMaps.map(item => item.compLanguage),
                        languageList: data.languageMaps
                            .find(item => item.compLanguage === compLanguage.value)?.languageList || ['C++']
                    };
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '获取语言列表失败');
            }
        };

        // 获取题目示例数据
        const fetchProblemDetails = async () => {
            if (!language.value || !compLanguage.value) return;

            try {
                const headers = { token };
                const response = await axios.post(`${apiUrl}/student/oj/lexer/demo`, {
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
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '获取题目数据失败');
            }
        };

        // 获取上次提交的代码
        const fetchLastCommitCode = async () => {
            if (!lexerId.value) return;

            try {
                const headers = { token };
                const response = await axios.get(`${apiUrl}/student/oj/lexer/last-commit/${lexerId.value}`, { headers });

                if (response.data.code === 0) {
                    code.value = response.data.data?.code.join('\n') || '';
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '获取上次提交代码失败');
            }
        };

        // 编译代码并提交判题
        const compileCode = async () => {
            if (!code.value.trim()) {
                emit('trigger-error', '请输入代码');
                return;
            }

            loading.value = true;
            output.value = { message: '', type: '' };

            try {
                const headers = { token };
                const response = await axios.post(`${apiUrl}/student/oj/lexer/check`, {
                    problemId: lexerId.value,
                    code: code.value
                }, { headers });

                if (response.data.code == 0) {
                    const result = response.data.data;
                    if (result.status === 0) {
                        output.value = {
                            message: result.message,
                            type: 'success'
                        };
                        emit('trigger-info', '执行成功');
                    } else {
                        output.value = {
                            message: result.message,
                            type: 'error'
                        };
                        emit('trigger-error', '执行失败');
                    }
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                output.value = {
                    message: '编译失败，请检查代码！',
                    type: 'error'
                };
                emit('trigger-error', '编译请求失败');
            } finally {
                loading.value = false;
            }
        };

        // 保存代码
        const saveCode = async () => {
            if (!code.value.trim()) {
                emit('trigger-error', '没有代码可保存');
                return;
            }

            try {
                const headers = { token };
                const response = await axios.post(`${apiUrl}/student/oj/lexer/save`, {
                    problemId: lexerId.value,
                    code: code.value.split('\n')
                }, { headers });

                if (response.data.code === 0) {
                    emit('trigger-info', '代码保存成功');
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '保存代码失败');
            }
        };

        // 重置代码
        const resetCode = () => {
            if (code.value.trim() && !confirm('确定要重置代码吗？所有更改将丢失。')) {
                return;
            }
            code.value = '';
            output.value = { message: '', type: '' };
            emit('trigger-info', '代码已重置');
        };

        // 格式化代码
        const formatCode = () => {
            if (!code.value.trim()) {
                emit('trigger-error', '没有代码可格式化');
                return;
            }
            // 这里可以调用格式化API或使用本地格式化逻辑
            emit('trigger-info', '代码已格式化');
        };

        // 自动补全代码
        const autoCompleteCode = async () => {
            if (!code.value.trim()) {
                emit('trigger-error', '请输入部分代码以使用补全功能');
                return;
            }

            completing.value = true;

            try {
                // 调用DeepSeek API获取代码补全建议
                const headers = { token };
                const response = await axios.post(`${apiUrl}/student/aiqa/optim`, {
                    code: code.value,
                    language: language.value
                }, { headers });

                completionOptions.value = response.data;
                if (completionOptions.value.length > 0) {
                    showCompletionPopup.value = true;
                    selectedCompletionIndex.value = 0;
                } else {
                    emit('trigger-error', '没有找到合适的补全建议');
                }
            } catch (error) {
                emit('trigger-error', '获取代码补全失败');
            } finally {
                completing.value = false;
            }
        };

        // 应用代码补全
        const applyCompletion = (completion) => {
            code.value += completion;
            closeCompletionPopup();
        };

        // 关闭补全弹窗
        const closeCompletionPopup = () => {
            showCompletionPopup.value = false;
            completionOptions.value = '';
        };

        // 处理Tab键
        const handleTab = (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            // 插入4个空格
            code.value = code.value.substring(0, start) + '    ' + code.value.substring(end);

            // 移动光标位置
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        };

        // 清空输出
        const clearOutput = () => {
            output.value = { message: '', type: '' };
        };

        // 切换题目详情折叠状态
        const toggleDetailCollapse = () => {
            detailCollapsed.value = !detailCollapsed.value;
        };

        // 页面加载时初始化
        onMounted(async () => {
            await fetchLanguages();
            await fetchProblemDetails();
            await fetchLastCommitCode();

            // 添加键盘事件监听
            window.addEventListener('keydown', (e) => {
                if (showCompletionPopup.value) {
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        selectedCompletionIndex.value = Math.max(0, selectedCompletionIndex.value - 1);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        selectedCompletionIndex.value = Math.min(completionOptions.value.length - 1, selectedCompletionIndex.value + 1);
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        applyCompletion(completionOptions.value);
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        closeCompletionPopup();
                    }
                }
            });
        });

        // 监听语言变化
        watch([compLanguage, language], () => {
            fetchProblemDetails().then(() => {
                fetchLastCommitCode();
            });
        });

        return {
            code,
            output,
            problem,
            lexerId,
            compLanguage,
            language,
            languageOptions,
            formattedInput,
            formattedOutput,
            loading,
            completing,
            detailCollapsed,
            showCompletionPopup,
            completionOptions,
            selectedCompletionIndex,
            codeEditor,
            compileCode,
            saveCode,
            resetCode,
            formatCode,
            autoCompleteCode,
            applyCompletion,
            closeCompletionPopup,
            handleTab,
            clearOutput,
            toggleDetailCollapse
        };
    }
};
</script>

<style scoped>
/* 基础样式 */
:root {
    --primary-color: #4361ee;
    --secondary-color: #3a0ca3;
    --success-color: #4cc9f0;
    --danger-color: #f72585;
    --warning-color: #f8961e;
    --light-color: #f8f9fa;
    --dark-color: #212529;
    --border-radius: 12px;
    --box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    --transition: all 0.3s ease;
}

/* 整体容器 */
.lexer-compiler-view {
    max-width: 1200px;
    margin: 30px auto;
    padding: 30px;
    background: linear-gradient(145deg, #f8f9fa, #e9ecef);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--dark-color);
}

/* 标题 */
h1,
h2,
h3,
h4 {
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
    font-weight: 700;
}

h1 {
    font-size: 2.5rem;
    text-align: center;
    background: linear-gradient(to right, #4361ee, #3a0ca3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 2rem;
}

/* 卡片样式 */
.card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--border-radius);
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: var(--box-shadow);
    transition: var(--transition);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.glass-effect {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

/* 语言选择框 */
.language-select {
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    flex-wrap: wrap;
}

.select-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.select-group label {
    font-weight: 600;
    color: var(--secondary-color);
    font-size: 1.1rem;
}

.select-group select {
    padding: 0.6rem 1rem;
    border-radius: 8px;
    border: 2px solid #dee2e6;
    background-color: white;
    font-size: 1rem;
    color: var(--dark-color);
    transition: var(--transition);
    min-width: 150px;
}

.select-group select:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

/* 题目详情 */
.problem-details {
    position: relative;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.detail-section {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    color: #495057;
}

.detail-section strong {
    color: var(--secondary-color);
}

.example-section {
    margin-bottom: 1.5rem;
}

.example-box {
    background-color: #f1f3f5;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
}

/* 代码编辑器区域 */
.code-area {
    position: relative;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.editor-actions {
    display: flex;
    gap: 0.8rem;
}

.code-editor {
    width: 100%;
    min-height: 400px;
    padding: 1.5rem;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 1.05rem;
    line-height: 1.6;
    background-color: #f8f9fa;
    border: 2px solid #dee2e6;
    border-radius: var(--border-radius);
    resize: vertical;
    transition: var(--transition);
    tab-size: 4;
}

.code-editor:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
    background-color: white;
}

/* 按钮样式 */
.action-buttons {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
    justify-content: center;
    flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.action-btn {
    padding: 0.8rem 1.8rem;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    transition: var(--transition);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.primary-btn {
    background-color: var(--primary-color);
    color: white;
}

.primary-btn:hover:not(:disabled) {
    background-color: #3a56e8;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(67, 97, 238, 0.2);
}

.secondary-btn {
    background-color: #6c757d;
    color: white;
}

.secondary-btn:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(108, 117, 125, 0.2);
}

.danger-btn {
    background-color: var(--danger-color);
    color: white;
}

.danger-btn:hover {
    background-color: #e5177e;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(247, 37, 133, 0.2);
}

.action-btn {
    background-color: #f8f9fa;
    color: var(--dark-color);
    border: 1px solid #dee2e6;
}

.action-btn:hover:not(:disabled) {
    background-color: #e9ecef;
    transform: translateY(-2px);
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.icon-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    font-size: 1.2rem;
    transition: var(--transition);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.icon-btn:hover {
    background-color: #f1f3f5;
    color: var(--primary-color);
}

/* 加载动画 */
.spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid white;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
}

.spinner.mini {
    width: 16px;
    height: 16px;
    border-width: 2px;
    margin-left: 0.5rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 输出区域 */
.output-container {
    position: relative;
}

.output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.output {
    padding: 1.5rem;
    font-family: 'Fira Code', monospace;
    border-radius: 8px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
    line-height: 1.6;
}

.output.success {
    background-color: rgba(76, 201, 240, 0.1);
    color: #0a9396;
    border-left: 4px solid var(--success-color);
}

.output.error {
    background-color: rgba(247, 37, 133, 0.1);
    color: #ae2012;
    border-left: 4px solid var(--danger-color);
}

/* 代码补全弹窗 */
.completion-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}

.popup-content {
    background-color: white;
    border-radius: var(--border-radius);
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.popup-header {
    padding: 1.5rem;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.popup-header h4 {
    color: white;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: var(--transition);
}

.close-btn:hover {
    transform: rotate(90deg);
}

.completion-options {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.completion-item {
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    background-color: #f8f9fa;
    cursor: pointer;
    transition: var(--transition);
    border-left: 3px solid transparent;
}

.completion-item:hover,
.completion-item.active {
    background-color: #e9ecef;
    border-left: 3px solid var(--primary-color);
}

.completion-item pre {
    margin: 0;
    font-family: 'Fira Code', monospace;
    white-space: pre-wrap;
}

.popup-footer {
    padding: 1rem;
    text-align: center;
    background-color: #f8f9fa;
    color: #6c757d;
    font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .lexer-compiler-view {
        padding: 20px;
    }

    .language-select {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .action-buttons {
        flex-direction: column;
    }

    .popup-content {
        width: 95%;
    }
}
</style>