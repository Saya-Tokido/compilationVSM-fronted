<template>
    <div class="container">
        <h1 class="title">学生客观题答题情况</h1>

        <div class="input-container">
            <label for="studentNumber" class="input-label">学生学号:</label>
            <input type="text" id="studentNumber" v-model="studentNumber" class="input-field" placeholder="请输入学号" />
            <button @click="fetchStudentData" class="search-button">查询</button>
        </div>

        <div v-if="loading" class="loading-spinner"></div>
        <div v-else-if="error" class="error-message">{{ error }}</div>

        <div v-else-if="studentNumber && studentData.baseInfo?.name" class="result-card">
            <!-- 客观题成绩放到前面 -->
            <h2 class="score">
                客观题成绩: <span>{{ studentData.score }}</span>
                <!-- 调分按钮 -->
                <button @click="showScoreAdjustModal = true" class="adjust-score-button">调分</button>
            </h2>

            <!-- 调分弹框 -->
            <div v-if="showScoreAdjustModal" class="score-adjust-modal">
                <div class="modal-content">
                    <h3>调整成绩</h3>
                    <div class="input-container">
                        <label for="adjustedScore" class="input-label">调整后的成绩:</label>
                        <input type="number" id="adjustedScore" v-model="adjustedScore" class="input-field" placeholder="请输入调整后的成绩" />
                    </div>
                    <div class="modal-buttons">
                        <button @click="modifyScore" class="confirm-button">确认</button>
                        <button @click="showScoreAdjustModal = false" class="cancel-button">取消</button>
                    </div>
                </div>
            </div>

            <h2 class="section-title">学生基本信息</h2>
            <div class="info-box">
                <p>姓名: <span>{{ studentData.baseInfo?.name }}</span></p>
                <p>学号: <span>{{ studentData.baseInfo?.number }}</span></p>
                <p>行政班: <span>{{ studentData.baseInfo?.adminClass }}</span></p>
                <p>教学班: <span>{{ studentData.baseInfo?.teachClass }}</span></p>
            </div>

            <h2 class="section-title">选择题作答情况</h2>
            <ul class="question-list">
                <li v-for="(choose, index) in studentData.chooseList" :key="index" class="question-item">
                    <p class="question-title">{{ choose.title }}</p>
                    <div class="options">
                        <p>A. {{ choose.choose0 }}</p>
                        <p>B. {{ choose.choose1 }}</p>
                        <p>C. {{ choose.choose2 }}</p>
                        <p>D. {{ choose.choose3 }}</p>
                    </div>
                    <p>学生答案: <strong>{{ choose.answer || '未作答' }}</strong></p>
                    <p v-if="!choose.mark">标准答案: {{ choose.keyAnswer }} </p>
                    <div class="mark-icon">
                        <span v-if="choose.mark" class="correct-icon">✅答案正确</span>
                        <span v-else class="incorrect-icon">❌答案错误</span>
                    </div>
                </li>
            </ul>

            <h2 class="section-title">填空题作答情况</h2>
            <ul class="question-list">
                <li v-for="(fill, index) in studentData.fillList" :key="index" class="question-item">
                    <p class="question-title">{{ fill.title }}</p>
                    <p>学生答案: <strong>{{ fill.answer || '未作答' }}</strong></p>
                    <p v-if="!fill.mark">标准答案: {{ fill.keyAnswer }}</p>
                    <div class="mark-icon">
                        <span v-if="fill.mark" class="correct-icon">✅答案正确</span>
                        <span v-else class="incorrect-icon">❌答案错误</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { ref, getCurrentInstance, onMounted } from 'vue';
import axios from 'axios';

export default {
    name: 'ObjReview',
    setup(props,{emit}) {
        const studentNumber = ref('');
        const studentData = ref({
            baseInfo: {},
            chooseList: [],
            fillList: [],
            score: 0,
        });
        const adjustedScore = ref('');
        const loading = ref(false);
        const error = ref(null);
        const showScoreAdjustModal = ref(false); // 控制调分弹框的显示与隐藏
        const token = sessionStorage.getItem('token');
        const headers = { 'token': token };
        let apiUrl = '';

        const fetchStudentData = async () => {
            if (!studentNumber.value) {
                error.value = '请输入学生学号';
                return;
            }

            loading.value = true;
            error.value = null;

            try {
                const response = await axios.get(`${apiUrl}/teacher/obj-review/info/${studentNumber.value}`, { headers });
                if (response.data.code == 0) {
                    studentData.value = response.data.data;
                } else {
                    emit('trigger-error',response.data.message);
                }
            } catch (err) {
                error.value = '获取数据失败，请稍后重试';
            } finally {
                loading.value = false;
            }
        };

        const modifyScore = async () => {
            if (!adjustedScore.value && adjustedScore.value!='0') {
                error.value = '请输入调整后的成绩';
                return;
            }

            loading.value = true;
            error.value = null;

            try {
                const response = await axios.post(
                    `${apiUrl}/teacher/obj-review/score-modify`,
                    {
                        number: studentNumber.value,
                        score: adjustedScore.value,
                    },
                    { headers }
                );

                if (response.data.code == 0) {
                    emit('trigger-info', '成绩调整成功');
                    fetchStudentData();
                    adjustedScore.value = ''; // 清空输入框
                    showScoreAdjustModal.value = false; // 关闭弹框
                } else {
                    emit('trigger-error',response.data.message);
                }
            } catch (err) {
                error.value = '调整成绩失败，请稍后重试';
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            const instance = getCurrentInstance();
            if (instance) {
                apiUrl = instance.appContext.config.globalProperties.$apiUrl;
            }
        });

        return {
            studentNumber,
            studentData,
            adjustedScore,
            showScoreAdjustModal,
            loading,
            error,
            fetchStudentData,
            modifyScore,
        };
    },
};
</script>

<style scoped>

.score {
    text-align: center;
    font-size: 1.8em;
    font-weight: bold;
    color: #0069d9;
    margin-bottom: 20px;
}

.score span {
    font-size: 2em;
    color: #2ecc71;
    /* 成绩颜色 */
}

.adjust-score-button {
    font-size: 1em;
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #f39c12;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.adjust-score-button:hover {
    background-color: #e67e22;
}

.score-adjust-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
}

.modal-buttons {
    margin-top: 20px;
}

.confirm-button,
.cancel-button {
    padding: 10px 20px;
    margin: 5px;
    font-size: 1em;
    cursor: pointer;
    border-radius: 5px;
    border: none;
}

.confirm-button {
    background-color: #2ecc71;
    color: white;
}

.confirm-button:hover {
    background-color: #27ae60;
}

.cancel-button {
    background-color: #e74c3c;
    color: white;
}

.cancel-button:hover {
    background-color: #c0392b;
}
body {
    font-family: 'Arial', sans-serif;
    background-color: #eef1f7;
    /* 更明亮的背景色 */
    margin: 0;
    padding: 0;
    color: #333;
}

.container {
    width: 100%;
    max-width: 900px;
    margin: 30px auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.title {
    text-align: center;
    font-size: 2.4em;
    margin-bottom: 30px;
    color: #0069d9;
    /* 更饱和的蓝色 */
    text-transform: uppercase;
    letter-spacing: 2px;
}

/* 输入框和按钮 */
.input-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.input-field {
    padding: 12px;
    font-size: 1.1em;
    width: 240px;
    border: 2px solid #ddd;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.input-field:focus {
    border-color: #0069d9;
    outline: none;
}

.search-button {
    padding: 12px 18px;
    font-size: 1.2em;
    color: #fff;
    background-color: #0069d9;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    transform: scale(1);
}

.search-button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
}

.search-button:active {
    transform: scale(0.95);
}

/* Loading与错误消息 */
.loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #0069d9;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-message {
    text-align: center;
    font-size: 1.2em;
    color: #d9534f;
    /* 更鲜明的红色 */
    padding: 15px;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 5px;
    margin: 20px 0;
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-10px);
    }

    50% {
        transform: translateX(10px);
    }

    75% {
        transform: translateX(-10px);
    }
}

/* 动画 */
.result-card {
    margin-top: 20px;
    animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.section-title {
    font-size: 1.6em;
    margin-bottom: 10px;
    color: #333;
    font-weight: bold;
}

.info-box {
    background-color: #f1f3f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.info-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.question-item {
    background-color: #f8f9fa;
    padding: 15px;
    margin: 10px 0;
    border-radius: 8px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.5s ease-out;
    transition: all 0.3s ease;
}

.question-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 新增样式 */
.input-label {
    font-size: 1.1em;
    color: #333;
    margin-right: 10px;
}

.question-title {
    font-size: 1.2em;
    margin-bottom: 8px;
    color: #0069d9;
    /* 题目颜色 */
    font-weight: bold;
}

.options p {
    margin: 5px 0;
    font-size: 1em;
    color: #555;
    /* 选项颜色 */
}

.question-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.section-title {
    font-size: 1.6em;
    margin-bottom: 10px;
    color: #333;
    font-weight: bold;
}

/* 成绩样式 */
.score {
    text-align: center;
    font-size: 1.8em;
    font-weight: bold;
    color: #0069d9;
    margin-bottom: 20px;
}

.score span {
    font-size: 2em;
    color: #2ecc71;
    /* 成绩颜色 */
}

/* 卡通画风图标 */
.mark-icon {
    text-align: center;
    margin-top: 10px;
}

.correct-icon {
    font-size: 1.5em;
    color: #2ecc71;
    /* 正确图标颜色 */
}

.incorrect-icon {
    font-size: 1.5em;
    color: #e74c3c;
    /* 错误图标颜色 */
}
</style>