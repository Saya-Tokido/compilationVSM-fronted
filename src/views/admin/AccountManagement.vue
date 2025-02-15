<template>
    <div class="admin-account-management">
        <h1>账号管理</h1>
        <div class="function-nav">
            <button v-for="tab in tabs" :key="tab.id" :class="['nav-button', { 'active': activeTab === tab.id }]"
                @click="activeTab = tab.id">
                {{ tab.label }}
            </button>
        </div>

        <div class="function-content">
            <!-- 单个学生账号添加 -->
            <div v-if="activeTab === 'addStudent'" class="function-section">
                <h2>添加学生账号</h2>
                <form @submit.prevent="addStudentAccount" class="account-form">
                    <div class="form-group">
                        <label for="studentNumber">学号</label>
                        <input id="studentNumber" v-model="studentForm.number" placeholder="请输入学号" required
                            :class="['form-control', { 'invalid': !studentForm.number && formSubmitted }]" />
                        <span v-if="!studentForm.number && formSubmitted" class="error-message">学号不能为空</span>
                    </div>
                    <div class="form-group">
                        <label for="studentName">学生姓名</label>
                        <input id="studentName" v-model="studentForm.name" placeholder="请输入学生姓名" required
                            :class="['form-control', { 'invalid': !studentForm.name && formSubmitted }]" />
                        <span v-if="!studentForm.name && formSubmitted" class="error-message">学生姓名不能为空</span>
                    </div>
                    <div class="form-group">
                        <label for="adminClass">行政班</label>
                        <input id="adminClass" v-model="studentForm.adminClass" placeholder="请输入行政班" required
                            :class="['form-control', { 'invalid': !studentForm.adminClass && formSubmitted }]" />
                        <span v-if="!studentForm.adminClass && formSubmitted" class="error-message">行政班不能为空</span>
                    </div>
                    <div class="form-group">
                        <label for="teachClass">教学班</label>
                        <input id="teachClass" v-model="studentForm.teachClass" placeholder="请输入教学班" required
                            :class="['form-control', { 'invalid': !studentForm.teachClass && formSubmitted }]" />
                        <span v-if="!studentForm.teachClass && formSubmitted" class="error-message">教学班不能为空</span>
                    </div>
                    <button type="submit" class="submit-button">添加学生</button>
                </form>
            </div>

            <!-- 单个教师账号添加 -->
            <div v-if="activeTab === 'addTeacher'" class="function-section">
                <h2>添加教师账号</h2>
                <form @submit.prevent="addTeacherAccount" class="account-form">
                    <div class="form-group">
                        <label for="teacherNumber">工号</label>
                        <input id="teacherNumber" v-model="teacherForm.number" placeholder="请输入工号" required
                            :class="['form-control', { 'invalid': !teacherForm.number && formSubmitted }]" />
                        <span v-if="!teacherForm.number && formSubmitted" class="error-message">工号不能为空</span>
                    </div>
                    <div class="form-group">
                        <label for="teacherName">教师姓名</label>
                        <input id="teacherName" v-model="teacherForm.name" placeholder="请输入教师姓名" required
                            :class="['form-control', { 'invalid': !teacherForm.name && formSubmitted }]" />
                        <span v-if="!teacherForm.name && formSubmitted" class="error-message">教师姓名不能为空</span>
                    </div>
                    <div class="form-group">
                        <label for="teachClass">所带教学班</label>
                        <div class="tag-input-container">
                            <div class="tag-list">
                                <span v-for="(tag, index) in teacherForm.teachClass" :key="index" class="tag">
                                    {{ tag }}
                                    <span class="tag-remove" @click="removeTeachClass(index)">×</span>
                                </span>
                            </div>
                            <input id="teachClass" v-model="teacherForm.teachClassInput"
                                placeholder="请输入教学班，按回车键添加，不要带空格" @keydown.enter.prevent="addTeachClass"
                                class="tag-input" />
                        </div>
                        <span v-if="!teacherForm.teachClass.length && formSubmitted"
                            class="error-message">至少添加一个教学班</span>
                    </div>
                    <button type="submit" class="submit-button">添加教师</button>
                </form>
            </div>

            <!-- 批量学生账号导入 -->
            <div v-if="activeTab === 'batchImport'" class="function-section">
                <h2>批量导入学生账号</h2>
                <div class="upload-section">
                    <label for="fileUpload" class="upload-label">
                        <span>点击上传文件</span>
                        <input id="fileUpload" type="file" accept=".xlsx" @change="handleFileUpload"
                            class="upload-input" />
                    </label>
                    <p class="upload-hint">支持 Excel 文件格式</p>

                    <!-- 显示已选择的文件 -->
                    <div v-if="fileData" class="file-info">
                        <p>已选择文件: <strong>{{ fileData.name }}</strong></p>
                    </div>
                </div>
                <button @click="submitBatchImport" class="submit-button">开始导入</button>
            </div>
        </div>

        <!-- 用于展示通知的区域 -->
        <div v-if="showToast" :class="['toast', toastType]">
            {{ toastMessage }}
        </div>
    </div>
</template>

<script>
import { ref, getCurrentInstance, watch } from 'vue';
import axios from 'axios';

export default {
    name: 'AccountManagement',
    setup(props, { emit }) {
        const activeTab = ref('addStudent');
        const token = sessionStorage.getItem('token');
        const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;

        const tabs = ref([
            { id: 'addStudent', label: '添加学生账号' },
            { id: 'addTeacher', label: '添加教师账号' },
            { id: 'batchImport', label: '批量导入学生' },
        ]);

        const studentForm = ref({
            number: '',
            name: '',
            adminClass: '',
            teachClass: '',
        });

        const teacherForm = ref({
            number: '',
            name: '',
            teachClassInput: '',
            teachClass: [],
        });

        const fileData = ref(null);
        const formSubmitted = ref(false);

        const showToast = ref(false);
        const toastMessage = ref('');
        const toastType = ref('');

        const showNotification = (message, type) => {
            toastMessage.value = message;
            toastType.value = type;
            showToast.value = true;
            setTimeout(() => showToast.value = false, 3000);
        };

        const handleFileUpload = (event) => {
            const file = event.target.files[0];
            if (file) {
                const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
                if (validTypes.includes(file.type)) {
                    fileData.value = file;
                    showNotification(`已选择文件: ${file.name}`, 'success');
                } else {
                    showNotification('请上传有效的 Excel 文件（.xlsx 格式）', 'error');
                    fileData.value = null;
                }
            } else {
                fileData.value = null;
            }
        };

        const submitBatchImport = () => {
            const fileInput = document.getElementById('fileUpload');
            const file = fileInput.files[0];

            if (!file) {
                showNotification('请先选择文件', 'warning');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            axios.post(`${apiUrl}/admin/account/add-student-by-excel`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'token': token }
            })
                .then(response => {
                    if (response.data.code == 0) {
                        showNotification('文件上传成功', 'success');
                        fileData.value = null;
                        fileInput.value = '';
                    } else {
                        emit('trigger-error',response.data.message);
                    }
                })
                .catch(error => {
                    showNotification('文件上传失败，请稍后重试', 'error');
                    console.error('上传失败:', error);
                });
        };

        const addStudentAccount = async () => {
            formSubmitted.value = true;
            if (!studentForm.value.number || !studentForm.value.name || !studentForm.value.adminClass || !studentForm.value.teachClass) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }

            try {
                const headers = { 'token': token };
                const response = await axios.post(`${apiUrl}/admin/account/add-student`, studentForm.value, { headers });
                if (response.data.code == 0) {
                    showNotification('学生账号添加成功', 'success');
                    studentForm.value = { number: '', name: '', adminClass: '', teachClass: '' };
                    formSubmitted.value = false;
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                showNotification('添加学生账号时出错，请稍后重试', 'error');
                console.error('添加学生账号时出错:', error);
            }
        };

        const addTeachClass = () => {
            if (teacherForm.value.teachClassInput.trim()) {
                teacherForm.value.teachClass.push(teacherForm.value.teachClassInput.trim());
                teacherForm.value.teachClassInput = '';
            }
        };

        const removeTeachClass = (index) => {
            teacherForm.value.teachClass.splice(index, 1);
        };

        const addTeacherAccount = async () => {
            formSubmitted.value = true;

            if (!teacherForm.value.number || !teacherForm.value.name || !teacherForm.value.teachClass.length) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }

            try {
                const headers = { 'token': token };
                const response = await axios.post(`${apiUrl}/admin/account/add-teacher`, {
                    number: teacherForm.value.number,
                    name: teacherForm.value.name,
                    teachClass: teacherForm.value.teachClass,
                }, { headers });

                if (response.data.code == 0) {
                    showNotification('教师账号添加成功', 'success');
                    teacherForm.value = { number: '', name: '', teachClassInput: '', teachClass: [] };
                    formSubmitted.value = false;
                } else {
                    emit('trigger-error', response.data.message);
                }
            } catch (error) {
                showNotification('添加教师账号时出错，请稍后重试', 'error');
                console.error('添加教师账号时出错:', error);
            }
        };

        // Watch activeTab and reset form data
        watch(activeTab, (newTab, oldTab) => {
            if (newTab !== oldTab) {
                studentForm.value = { number: '', name: '', adminClass: '', teachClass: '' };
                teacherForm.value = { number: '', name: '', teachClassInput: '', teachClass: [] };
                fileData.value = null;
                formSubmitted.value = false;
                const fileInput = document.getElementById('fileUpload');
                if (fileInput) {
                    fileInput.value = ''; // Reset file input
                }
            }
        });

        return {
            activeTab,
            tabs,
            studentForm,
            teacherForm,
            fileData,
            formSubmitted,
            showToast,
            toastMessage,
            toastType,
            handleFileUpload,
            submitBatchImport,
            addStudentAccount,
            addTeachClass,
            removeTeachClass,
            addTeacherAccount
        };
    }
};
</script>


<style scoped>
/* Toast 样式 */
.toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    color: white;
    border-radius: 5px;
    display: inline-block;
    max-width: 300px;
    text-align: center;
    font-size: 1em;
}

.toast.success {
    background-color: #28a745;
}

.toast.error {
    background-color: #dc3545;
}

.toast.warning {
    background-color: #ffc107;
}

/* 文件上传样式 */
.upload-input {
    display: none;
}

.upload-label {
    background-color: #007bff;
    color: rgb(19, 223, 124);
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.upload-label:hover {
    background-color: #0056b3;
}

.upload-hint {
    color: #888;
    font-size: 0.9em;
    margin-top: 5px;
}

/* 错误信息 */
.error-message {
    color: red;
    font-size: 12px;
}

.invalid {
    border: 1px solid red;
}

/* 提交按钮 */
.submit-button {
    background-color: #007bff;
    color: white;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
}

.submit-button:hover {
    background-color: #0056b3;
}

/* 标签样式 */
.tag {
    display: inline-block;
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    margin: 2px;
    font-size: 0.9em;
    transition: background-color 0.3s ease;
}

.tag:hover {
    background-color: #0056b3;
}

.tag-remove {
    margin-left: 5px;
    cursor: pointer;
    font-size: 1.1em;
}

.tag-input {
    margin-top: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
    font-size: 1em;
}

/* 页面布局和整体设计 */
.admin-account-management {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    color: #333;
    font-size: 2.5em;
    margin-bottom: 20px;
}

/* 功能导航 */
.function-nav {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.nav-button {
    padding: 10px 20px;
    background-color: #e0e0e0;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
}

.nav-button.active {
    background-color: #4caf50;
    color: white;
}

.nav-button:hover {
    background-color: #45a049;
    color: white;
}

/* 功能内容 */
.function-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.function-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 表单样式 */
.account-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

label {
    font-weight: bold;
    color: #333;
}

.form-control {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1em;
    transition: border-color 0.3s ease;
}

.form-control:focus {
    border-color: #4caf50;
    outline: none;
}

.form-control.invalid {
    border-color: red;
}

.error-message {
    color: red;
    font-size: 0.9em;
}

/* 文件上传部分 */
.upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px;
    border: 2px dashed #ddd;
    border-radius: 5px;
    background-color: #fafafa;
}

.upload-label {
    cursor: pointer;
    padding: 10px 20px;
    background-color: #e0e0e0;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.upload-label:hover {
    background-color: #d0d0d0;
}

/* 标签输入样式 */
.tag-input-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px;
    background-color: #fff;
    transition: border-color 0.3s ease;
}

.tag-input-container:focus-within {
    border-color: #4caf50;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
}

.tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background-color: #e0f7fa;
    border-radius: 12px;
    font-size: 0.9em;
    color: #00796b;
    animation: fadeIn 0.3s ease;
}

.tag-remove {
    margin-left: 4px;
    cursor: pointer;
    color: #00796b;
    font-weight: bold;
}

.tag-remove:hover {
    color: #004d40;
}

.tag-input {
    border: none;
    outline: none;
    width: 100%;
    padding: 8px;
    font-size: 1em;
    background-color: transparent;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
