<template>
    <div class="management-container">
        <!-- 切换按钮 -->
        <div class="tabs">
            <button @click="activeTab = 'choose'" :class="['tab-button', { active: activeTab === 'choose' }]">
                选择题题库管理
            </button>
            <button @click="activeTab = 'fill'" :class="['tab-button', { active: activeTab === 'fill' }]">
                填空题题库管理
            </button>
        </div>

        <!-- 选择题题库管理 -->
        <div v-if="activeTab === 'choose'" class="choose-bank">
            <div class="filters">
                <div class="filter-group-inline">
                    <input v-model="chooseFilters.title" placeholder="题目名称(支持全模糊)" class="input" />
                </div>
                <div class="filter-group-inline">
                    <button @click="fetchChoose" class="btn primary">查询</button>
                </div>
            </div>

            <table class="obj-table">
                <thead>
                    <tr>
                        <th>题目</th>
                        <th>选项A</th>
                        <th>选项B</th>
                        <th>选项C</th>
                        <th>选项D</th>
                        <th>标准答案</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="choose in chooseList" :key="choose.id">
                        <td>{{ choose.title }}</td>
                        <td>{{ choose.choice0 }}</td>
                        <td>{{ choose.choice1 }}</td>
                        <td>{{ choose.choice2 }}</td>
                        <td>{{ choose.choice3 }}</td>
                        <td>{{ choose.keyAnswer }}</td>
                        <td>
                            <button @click="deleteChoose(choose.id)" class="btn danger">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="pagination">
                <button @click="choosePrevPage" :disabled="chooseCurrentPage === 1" class="btn">上一页</button>
                <span class="page-info">第 {{ chooseCurrentPage }} 页 / 共 {{ chooseTotalPages }} 页</span>
                <button @click="chooseNextPage" :disabled="chooseCurrentPage === chooseTotalPages"
                    class="btn">下一页</button>
            </div>


            <!-- 新增选择题表单 -->
            <div class="add-question-form">
                <h3>新增选择题</h3>
                <input v-model="newChoose.title" placeholder="题目" class="input" />
                <input v-model="newChoose.choice0" placeholder="选项A" class="input" />
                <input v-model="newChoose.choice1" placeholder="选项B" class="input" />
                <input v-model="newChoose.choice2" placeholder="选项C" class="input" />
                <input v-model="newChoose.choice3" placeholder="选项D" class="input" />
                <input v-model="newChoose.keyAnswer" placeholder="标准答案" class="input" />
                <button @click="addChoose" class="btn primary">添加</button>
            </div>
        </div>

        <!-- 填空题题库管理 -->
        <div v-if="activeTab === 'fill'" class="fill-bank">
            <div class="filters">
                <div class="filter-group-inline">
                    <input v-model="fillFilters.title" placeholder="题目名称(支持全模糊)" class="input" />
                </div>
                <div class="filter-group-inline">
                    <button @click="fetchFill" class="btn primary">查询</button>
                </div>
            </div>

            <table class="obj-table">
                <thead>
                    <tr>
                        <th>题目</th>
                        <th>标准答案</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="fill in fillList" :key="fill.id">
                        <td>{{ fill.title }}</td>
                        <td>{{ fill.keyAnswer }}</td>
                        <td>
                            <button @click="deleteFill(fill.id)" class="btn danger">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="pagination">
                <button @click="fillPrevPage" :disabled="fillCurrentPage === 1" class="btn">上一页</button>
                <span class="page-info">第 {{ fillCurrentPage }} 页 / 共 {{ fillTotalPages }} 页</span>
                <button @click="fillNextPage" :disabled="fillCurrentPage === fillTotalPages" class="btn">下一页</button>
            </div>


            <!-- 新增填空题表单 -->
            <div class="add-question-form">
                <h3>新增填空题</h3>
                <input v-model="newFill.title" placeholder="题目" class="input" />
                <input v-model="newFill.keyAnswer" placeholder="标准答案" class="input" />
                <button @click="addFill" class="btn primary">添加</button>
            </div>

        </div>
    </div>
</template>


<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
    setup(props, { emit }) {
        const activeTab = ref('choose'); // 默认显示学生管理
        const chooseList = ref([]);
        const chooseTotalPages = ref(1);
        const chooseCurrentPage = ref(1);
        const chooseTotalRecords = ref(0);
        const token = sessionStorage.getItem('token');
        const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;

        const chooseFilters = ref({
            title: ''
        });

        // 填空题相关状态
        const fillList = ref([]);
        const fillTotalPages = ref(1);
        const fillCurrentPage = ref(1);
        const fillTotalRecords = ref(0);
        const fillFilters = ref({
            title: ''
        });



        const fetchChoose = async () => {
            const headers = { token };
            const requestData = {
                ...chooseFilters.value,
                pageIndex: chooseCurrentPage.value,
                pageSize: 10
            };

            Object.keys(requestData).forEach(key => {
                if (requestData[key] === '' || (Array.isArray(requestData[key]) && requestData[key].length === 0)) {
                    delete requestData[key];
                }
            });

            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/choose-page`, requestData, { headers });

                if (response.data.code === 0) {
                    chooseList.value = response.data.data.chooseList;
                    chooseTotalPages.value = response.data.data.totalPages;
                    chooseTotalRecords.value = response.data.data.totalRecords;
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '获取选择题题库失败');
            }
        };

        const deleteChoose = async (id) => {
            const headers = { token };
            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/choose-delete`, { id }, { headers });

                if (response.data.code === 0) {
                    // 删除成功后，移除该题目信息
                    chooseList.value = chooseList.value.filter(choose => choose.id !== id);
                    emit('trigger-info', '删除成功');
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '删除选择题失败');
            }
        };


        const chooseNextPage = () => {
            if (chooseCurrentPage.value < chooseTotalPages.value) {
                chooseCurrentPage.value++;
                fetchChoose();
            }
        };

        const choosePrevPage = () => {
            if (chooseCurrentPage.value > 1) {
                chooseCurrentPage.value--;
                fetchChoose();
            }
        };


        // 获取填空题题库
        const fetchFill = async () => {
            const headers = { token };
            const requestData = {
                ...fillFilters.value,
                pageIndex: fillCurrentPage.value,
                pageSize: 10
            };

            Object.keys(requestData).forEach(key => {
                if (requestData[key] === '' || (Array.isArray(requestData[key]) && requestData[key].length === 0)) {
                    delete requestData[key];
                }
            });

            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/fill-page`, requestData, { headers });

                if (response.data.code === 0) {
                    fillList.value = response.data.data.fillList;
                    fillTotalPages.value = response.data.data.totalPages;
                    fillTotalRecords.value = response.data.data.totalRecords;
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '获取填空题题库失败');
            }
        };

        // 删除填空题
        const deleteFill = async (id) => {
            const headers = { token };
            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/fill-delete`, { id }, { headers });

                if (response.data.code === 0) {
                    // 删除成功后，移除该题目信息
                    fillList.value = fillList.value.filter(fill => fill.id !== id);
                    emit('trigger-info', '删除成功');
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '删除填空题失败');
            }
        };

        // 填空题分页
        const fillNextPage = () => {
            if (fillCurrentPage.value < fillTotalPages.value) {
                fillCurrentPage.value++;
                fetchFill();
            }
        };

        const fillPrevPage = () => {
            if (fillCurrentPage.value > 1) {
                fillCurrentPage.value--;
                fetchFill();
            }
        };

        // 新增选择题的表单数据
        const newChoose = ref({
            title: '',
            choice0: '',
            choice1: '',
            choice2: '',
            choice3: '',
            keyAnswer: ''
        });

        // 新增填空题的表单数据
        const newFill = ref({
            title: '',
            keyAnswer: ''
        });

        // 添加选择题
        const addChoose = async () => {
            const headers = { token };
            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/choose-add`, newChoose.value, { headers });

                if (response.data.code === 0) {
                    emit('trigger-info', '添加成功');
                    fetchChoose(); // 重新获取选择题列表
                    newChoose.value = { title: '', choice0: '', choice1: '', choice2: '', choice3: '', keyAnswer: '' }; // 清空表单
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '添加选择题失败');
            }
        };

        // 添加填空题
        const addFill = async () => {
            const headers = { token };
            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/fill-add`, newFill.value, { headers });

                if (response.data.code === 0) {
                    emit('trigger-info', '添加成功');
                    fetchFill(); // 重新获取填空题列表
                    newFill.value = { title: '', keyAnswer: '' }; // 清空表单
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '添加填空题失败');
            }
        };



        onMounted(() => {
            fetchChoose();
            fetchFill();
        });

        return {
            activeTab,
            chooseList,
            chooseCurrentPage,
            chooseTotalPages,
            chooseTotalRecords,
            chooseFilters,
            fetchChoose,
            deleteChoose,
            choosePrevPage,
            chooseNextPage,
            fillList,
            fillCurrentPage,
            fillTotalPages,
            fillTotalRecords,
            fillFilters,
            fetchFill,
            deleteFill,
            fillPrevPage,
            fillNextPage,
            newChoose,
            newFill,
            addChoose,
            addFill
        };
    }
};
</script>


<style scoped>
.management-container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tabs {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.tab-button {
    padding: 10px 20px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease, color 0.3s ease;
    font-weight: bold;
}

.tab-button:hover {
    background-color: #4CAF50;
    color: white;
}

.tab-button.active {
    background-color: #4CAF50;
    color: white;
}

.filters {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
}

.filter-group-inline {
    display: inline-block;
    margin-right: 10px;
}

.input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
}

.btn {
    padding: 8px 16px;
    background-color: #47a14a;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    font-weight: bold;
}

.btn.primary {
    background-color: #4CAF50;
    color: white;
}

.btn.primary:hover {
    background-color: #4CAF50;
    transform: translateY(-1px);
}

.btn.danger {
    background-color: #dc3545;
    color: white;
}

.btn.danger:hover {
    background-color: #a71d2a;
    transform: translateY(-1px);
}

.obj-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.obj-table th,
.obj-table td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
}

.obj-table th {
    background-color: #4CAF50;
    color: white;
    font-weight: bold;
}

.obj-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.obj-table tr:hover {
    background-color: #f1f1f1;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.page-info {
    margin: 0 10px;
    font-weight: bold;
}

.btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
}

.btn:disabled:hover {
    background-color: #ccc;
}

.add-question-form {
    margin-bottom: 20px;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.add-question-form h3 {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: bold;
}

.add-question-form .input {
    margin-bottom: 10px;
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.add-question-form .input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
}

.upload-section {
    margin-bottom: 20px;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.upload-section h3 {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: bold;
}

.upload-section input[type="file"] {
    margin-bottom: 10px;
}

.upload-section .btn {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    font-weight: bold;
}

.upload-section .btn:hover {
    background-color: #45a049;
    transform: translateY(-1px);
}
</style>