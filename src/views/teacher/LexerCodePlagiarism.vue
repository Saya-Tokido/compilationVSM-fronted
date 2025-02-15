<template>
    <div class="lexer-code-plagiarism">
        <h1>教学班查重信息</h1>
        <table v-if="pdInfoList.length > 0">
            <thead>
                <tr>
                    <th>教学班</th>
                    <th>高查重率代码对数</th>
                    <th>查重</th>
                    <th>导出抄袭数据</th> <!-- 新增导出按钮列 -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in pdInfoList" :key="index">
                    <td>{{ item.teachClass }}</td>
                    <td>{{ item.plagiarismNum }}</td>
                    <td>
                        <button :disabled="item.isTaskSubmitted" @click="startPlagiarismCheck(item.teachClass, index)"
                            :class="{ 'submitted': item.isTaskSubmitted }">
                            {{ item.isTaskSubmitted ? '已提交查重任务' : '开始查重' }}
                        </button>
                    </td>
                    <td>
                        <button @click="exportPlagiarismData(item.teachClass)">
                            导出抄袭数据
                        </button>
                    </td> <!-- 导出按钮 -->
                </tr>
            </tbody>
        </table>
        <p v-else>没有查重数据</p>

        <!-- 弹窗 -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal">
                <h2>查重任务已提交</h2>
                <p>预计对 {{ expectedPlagiarismNum }} 串代码进行查重，请耐心等待，勿重复提交</p>
                <button @click="closeModal">关闭</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
    name: 'LexerCodePlagiarism',
    setup(props, { emit }) {
        const pdInfoList = ref([]);  // 响应式的pdInfoList
        const errorMessage = ref('');
        const token = sessionStorage.getItem('token');
        const headers = { 'token': token };
        let apiUrl = '';

        // Modal相关状态
        const showModal = ref(false);
        const expectedPlagiarismNum = ref(0);

        // 获取数据的函数
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/teacher/oj-review/pd/info`, { headers });
                if (response.data.code == 0) {
                    pdInfoList.value = response.data.data.pdInfoList || [];
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                errorMessage.value = '数据加载失败，请稍后再试！';
            }
        };

        // 开始查重的函数
        const startPlagiarismCheck = async (teachClass, index) => {
            try {
                const response = await axios.post(`${apiUrl}/teacher/oj-review/pd/execute`, { 'teachClass': teachClass }, { headers });
                if (response.data.code === 0) {
                    // 成功时，弹窗显示，并更新按钮状态
                    expectedPlagiarismNum.value = response.data.data;
                    showModal.value = true;
                    pdInfoList.value[index].isTaskSubmitted = true;
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                errorMessage.value = '查重任务提交失败，请稍后再试！';
            }
        };

        // 导出抄袭数据的函数
        const exportPlagiarismData = async (teachClass) => {
            try {
                const response = await axios.post(`${apiUrl}/teacher/oj-review/pd/export`, { 'teachClass': teachClass }, {
                    headers,
                    responseType: 'blob'  // 重要，表示响应是一个二进制文件
                });

                // 获取文件名（从响应头中提取）
                const disposition = response.headers.get('Content-Disposition');
                let filename = teachClass+'词法分析器代码抄袭数据.xlsx';  // 默认文件名
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const regex = /filename="(.+)"/;
                    const matches = regex.exec(disposition);
                    if (matches && matches[1]) {
                        filename = matches[1];  // 获取文件名
                    }
                }

                // 创建下载链接
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;  // 使用提取的文件名
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);  // 清理URL对象
            } catch (error) {
                emit('trigger-error', '导出数据失败，请稍后再试！');
            }
        };

        // 关闭弹窗
        const closeModal = () => {
            showModal.value = false;
        };

        // 在组件挂载后请求数据
        onMounted(() => {
            const instance = getCurrentInstance();
            if (instance) {
                apiUrl = instance.appContext.config.globalProperties.$apiUrl;
            }
            fetchData();
        });

        return {
            pdInfoList,
            errorMessage,
            startPlagiarismCheck,
            showModal,
            closeModal,
            expectedPlagiarismNum,
            exportPlagiarismData  // 新方法
        };
    }
};
</script>

<style scoped>
.lexer-code-plagiarism {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
}

th {
    background-color: #f4f4f4;
}

button {
    padding: 8px 16px;
    border: none;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
}

button:disabled {
    background-color: #ccc;
}

button.submitted {
    background-color: #6c757d;
}

p {
    color: red;
    text-align: center;
}

/* 弹窗样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    width: 100%;
}

.modal h2 {
    margin-bottom: 15px;
}

.modal button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>
