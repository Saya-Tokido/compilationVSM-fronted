<template>
    <div class="container">
        <!-- 选择语言 -->
        <div class="language-selection">
            <div class="form-group lang-dropdowns">
                <div class="dropdown-container">
                    <label for="compLanguage">选择编译语言：</label>
                    <select id="compLanguage" v-model="selectedCompLanguage">
                        <option v-if="languageMaps.length === 0" disabled>没有可用的编译语言</option>
                        <option v-for="lang in languageMaps" :key="lang.compLanguage" :value="lang.compLanguage">
                            {{ lang.compLanguage }}
                        </option>
                    </select>
                </div>

                <div class="dropdown-container">
                    <label for="language">选择编程语言：</label>
                    <select id="language" v-model="selectedLanguage">
                        <option v-for="lang in availableLanguages" :key="lang" :value="lang">
                            {{ lang }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 题目内容 -->
        <div v-if="problem" class="problem-content">
            <h2 class="section-title">题目描述</h2>
            <p>{{ problem.description }}</p>
            <h3>终端输入</h3>
            <p>{{ problem.terminalInput }}</p>
            <h3>终端输出</h3>
            <p>{{ problem.terminalOutput }}</p>
        </div>

        <!-- 查询学生作答情况 -->
        <div class="student-query">
            <div class="form-group">
                <label for="studentNumber">学生学号：</label>
                <input id="studentNumber" v-model="studentNumber" type="text" placeholder="请输入学号" />
            </div>
            <button @click="fetchStudentAnswer" class="btn btn-primary">查询</button>
        </div>

        <!-- 学生作答情况 -->
        <div v-if="studentAnswer" class="student-answer">
            <h2 class="section-title">学生信息</h2>
            <div class="student-info">
                <p><strong>姓名:</strong> {{ studentAnswer.baseInfo.name }}</p>
                <p><strong>学号:</strong> {{ studentAnswer.baseInfo.number }}</p>
                <p><strong>行政班:</strong> {{ studentAnswer.baseInfo.adminClass }}</p>
                <p><strong>教学班:</strong> {{ studentAnswer.baseInfo.teachClass }}</p>
            </div>

            <h2 class="section-title">源代码</h2>
            <pre v-if="studentAnswer.sourceCode?.code">
                <code v-for="(line, index) in studentAnswer.sourceCode.code" :key="index">{{ line }}</code>
            </pre>
            <p v-else>该学生无作答记录或未通过任何用例</p>

            <h2 class="section-title">得分</h2>
            <p>{{ studentAnswer.score }}</p>
        </div>
    </div>
</template>


<script>
import { ref, watch, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
    setup(props,{emit}) {
        // 响应式数据
        const languageMaps = ref([{ compLanguage: '', language: '' }]); // 确保初始化为空数组
        const selectedCompLanguage = ref(''); // 选择的编译语言
        const selectedLanguage = ref('C++'); // 选择的编程语言
        const availableLanguages = ref(['C++']); // 可用的编程语言列表
        const problem = ref(null); // 题目内容
        const studentNumber = ref(''); // 学生学号
        const studentAnswer = ref(null); // 学生作答情况
        const token = sessionStorage.getItem('token');
        const headers = { 'token': token };
        let apiUrl = '';

        // 监听选择的编译语言，更新可用的编程语言列表，并自动获取题目及学生信息
        watch(selectedCompLanguage, async (newVal) => {
            const selectedMap = languageMaps.value.find(map => map.compLanguage === newVal);
            if (selectedMap) {
                availableLanguages.value = selectedMap.languageList;
                // 每次编译语言变化时，自动获取题目和学生作答
                await fetchProblem();
                if (studentNumber.value) {
                    await fetchStudentAnswer(); // Fetch student answer when a student number exists
                }
            }
        });

        // 获取编程语言列表
        onMounted(async () => {
            try {
                const instance = getCurrentInstance();
                if (instance) {
                    apiUrl = instance.appContext.config.globalProperties.$apiUrl;
                }
                const response = await axios.get(`${apiUrl}/teacher/oj-review/language`, { headers });
                if (response.data.code == 0) {
                    languageMaps.value = response.data.data.languageMaps || [{ compLanguage: '', language: '' }]; // 确保是一个数组
                } else {
                    emit('trigger-error',response.data.message);
                }
            } catch (error) {
                emit('trigger-error','获取编程语言列表失败');
            }
        });

        // 获取题目内容
        const fetchProblem = async () => {
            const selectedMap = languageMaps.value.find(map => map.compLanguage === selectedCompLanguage.value);
            if (selectedMap) {
                try {
                    const response = await axios.get(`${apiUrl}/teacher/oj-review/problem/${selectedMap.lexerId}`, { headers });
                    if (response.data.code == 0) {
                        problem.value = response.data.data;
                    } else {
                        emit('trigger-error',response.data.message);
                    }
                } catch (error) {
                    emit('trigger-error','获取题目失败');
                }
            }
        };

        // 获取学生作答情况
        const fetchStudentAnswer = async () => {
            if (!studentNumber.value) {
                emit('trigger-error','请输入学生学号');
                return;
            }

            const selectedMap = languageMaps.value.find(map => map.compLanguage === selectedCompLanguage.value);
            if (selectedMap) {
                try {
                    const response = await axios.post(`${apiUrl}/teacher/oj-review/answer`, {
                        lexer_id: selectedMap.lexerId,
                        number: studentNumber.value,
                    }, { headers });

                    if (response.data.code === 0) {
                        if (response.data.data) {
                            studentAnswer.value = response.data.data;
                        } else {
                            studentAnswer.value = null;
                            alert('没有找到该学生的作答信息');
                        }
                    } else {
                        emit('trigger-error',response.data.message);
                    }
                } catch (error) {
                    emit('trigger-error','获取学生作答数据时发生错误，请稍后重试');
                }
            }
        };

        return {
            languageMaps,
            selectedCompLanguage,
            selectedLanguage,
            availableLanguages,
            problem,
            studentNumber,
            studentAnswer,
            fetchProblem,
            fetchStudentAnswer
        };
    }
};
</script>

<style scoped>
/* 基本样式和全局样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background-color: #eef1f7;
    margin: 0;
    padding: 0;
    color: #333;
}

.container {
    width: 90%;
    max-width: 1100px;
    margin: 40px auto;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    background-color: #f0f4f8;
    position: relative;
    z-index: 10;
    box-sizing: border-box;
}

/* 标题样式 */
h2,
h3 {
    margin-bottom: 15px;
    color: #333;
}

h2.section-title {
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

/* 语言选择部分 */
.language-selection .form-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
}

.dropdown-container {
    flex: 1;
    min-width: 200px;
}

label {
    display: block;
    font-size: 14px;
    margin-bottom: 5px;
    color: #666;
}

select,
input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f1f1f1;
    transition: border-color 0.3s ease;
}

select:focus,
input:focus {
    border-color: #0099ff;
    outline: none;
}

/* 按钮样式 */
button {
    padding: 12px 20px;
    font-size: 16px;
    background-color: #0099ff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
    background-color: #006bb3;
    transform: translateY(-2px);
}

button:active {
    transform: translateY(0);
}

/* 学生查询部分 */
.student-query {
    margin-top: 30px;
}

.student-query .form-group {
    margin-bottom: 15px;
}

/* 学生作答信息部分 */
.student-answer {
    margin-top: 40px;
}

.student-info p {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
    margin-bottom: 10px;
}

/* 代码显示部分 */
pre {
    background-color: #f1f1f1;
    padding: 20px;
    border-radius: 8px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 14px;
    overflow-x: auto;
}

code {
    display: block;
    margin-bottom: 5px;
}

/* 无作答信息提示 */
.no-answer {
    font-size: 16px;
    color: #ff3333;
    text-align: center;
    margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .language-selection .form-group {
        flex-direction: column;
    }

    .dropdown-container {
        margin-right: 0;
        margin-bottom: 15px;
    }

    .container {
        padding: 20px;
    }

    h2.section-title {
        font-size: 20px;
    }

    button {
        width: 100%;
    }
}

</style>