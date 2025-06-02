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
            <button @click="activeTab = 'lexer'" :class="['tab-button', { active: activeTab === 'lexer' }]">
                词法分析器题题库管理
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

            <table class="page-table">
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

            <table class="page-table">
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

        <!-- 词法分析器题题库管理 -->
        <div v-if="activeTab === 'lexer'" class="lexer-bank">
            <div class="filters">
                <div class="filter-group-inline">
                    <input v-model="lexerFilters.language" placeholder="编程语言" class="input" />
                </div>
                <div class="filter-group-inline">
                    <input v-model="lexerFilters.compLanguage" placeholder="待编译语言" class="input" />
                </div>
                <div class="filter-group-inline">
                    <input v-model="lexerFilters.description" placeholder="题目描述(支持全模糊)" class="input" />
                </div>
                <div class="filter-group-inline">
                    <button @click="fetchLexer" class="btn primary">查询</button>
                </div>
            </div>

            <table class="page-table">
                <thead>
                    <tr>
                        <th>编程语言</th>
                        <th>待编程语言</th>
                        <th>题目描述</th>
                        <th>提交次数</th>
                        <th>通过次数</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="lexer in lexerList" :key="lexer.id">
                        <td>{{ lexer.language }}</td>
                        <td>{{ lexer.compLanguage }}</td>
                        <td>{{ lexer.description }}</td>
                        <td>{{ lexer.commitNum }}</td>
                        <td>{{ lexer.passNum }}</td>
                        <td>
                            <button @click="lexerDetail(lexer.id)" class="btn primary">详情</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="pagination">
                <button @click="lexerPrevPage" :disabled="lexerCurrentPage === 1" class="btn">上一页</button>
                <span class="page-info">第 {{ lexerCurrentPage }} 页 / 共 {{ lexerTotalPages }} 页</span>
                <button @click="lexerNextPage" :disabled="lexerCurrentPage === lexerTotalPages" class="btn">下一页</button>
            </div>


            <!-- 保存词法分析器题表单 -->
            <div class="add-question-form">
                <h3>新增/编辑词法分析器题</h3>
                <!--跳转词法分析器时显示id，新增时不显示，只有显示才能查询用例-->
                <label>词法分析器题id {{ newLexer.id }}</label>
                <input v-model="newLexer.language" placeholder="编程语言" class="input" />
                <input v-model="newLexer.compLanguage" placeholder="待编译语言" class="input" />
                <input v-model="newLexer.description" placeholder="题目描述" class="input" />
                <input v-model="newLexer.terminalInput" placeholder="测试用例终端输入" class="input" />
                <input v-model="newLexer.terminalOutput" placeholder="测试用例终端输出" class="input" />
                <button @click="saveLexer" class="btn primary">保存</button>
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

        // 词法分析器题获取
        const lexerList = ref([]);
        const lexerTotalPages = ref(1);
        const lexerCurrentPage = ref(1);
        const lexerTotalRecords = ref(0);

        const lexerFilters = ref({
            language: '',
            compLanguage: '',
            description: ''
        });

        const fetchLexer = async () => {
            const headers = { token };
            const requestData = {
                ...lexerFilters.value,
                pageIndex: lexerCurrentPage.value,
                pageSize: 10
            };

            Object.keys(requestData).forEach(key => {
                if (requestData[key] === '' || (Array.isArray(requestData[key]) && requestData[key].length === 0)) {
                    delete requestData[key];
                }
            });

            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/lexer-page`, requestData, { headers });

                if (response.data.code === 0) {
                    lexerList.value = response.data.data.lexerList;
                    lexerTotalPages.value = response.data.data.totalPages;
                    lexerTotalRecords.value = response.data.data.totalRecords;
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '获取词法分析题题库失败');
            }
        };

        // 词法分析器题分页
        const lexerNextPage = () => {
            if (lexerCurrentPage.value < lexerTotalPages.value) {
                lexerCurrentPage.value++;
                fetchLexer();
            }
        };

        const lexerPrevPage = () => {
            if (lexerCurrentPage.value > 1) {
                lexerCurrentPage.value--;
                fetchLexer();
            }
        };

        // 新增词法分析器题的表单数据
        const newLexer = ref({
            language: '',
            compLanguage: '',
            description: '',
            terminalInput: '',
            terminalOutput: ''
        });

        // 保存词法分析器题
        const saveLexer = async () => {
            const headers = { token };
            try {
                const response = await axios.post(`${apiUrl}/teacher/question-bank/lexer-add`, newLexer.value, { headers });

                if (response.data.code === 0) {
                    emit('trigger-info', '添加成功');
                    fetchLexer();
                    newLexer.value = { id: '', language: '', compLanguage: '', description: '', terminalInput: '', terminalOutput: '' }; // 清空表单
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                emit('trigger-error', '添加词法分析器题失败');
            }
        };



        onMounted(() => {
            fetchChoose();
            fetchFill();
            fetchLexer();
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
            addFill,
            // 词法分析器题
            lexerFilters,
            lexerNextPage,
            lexerPrevPage,
            lexerCurrentPage,
            lexerTotalPages,
            lexerTotalRecords,
            newLexer,
            saveLexer,
            lexerList,
            fetchLexer
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

.page-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.page-table th,
.page-table td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
}

.page-table th {
    background-color: #4CAF50;
    color: white;
    font-weight: bold;
}

.page-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.page-table tr:hover {
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