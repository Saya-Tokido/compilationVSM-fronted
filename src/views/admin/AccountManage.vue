<template>
    <div class="student-management">
        <div class="filters">
            <div class="filter-group-inline">
                <input
                    v-model="filters.stuName"
                    placeholder="学生姓名(支持右模糊)"
                    class="input"
                />
                <input
                    v-model="filters.number"
                    placeholder="学生学号"
                    class="input"
                />
            </div>
            <div class="filter-group-inline">
                <div class="tag-select">
                    <input
                        v-model="classSearch"
                        @focus="handleFocus"
                        @input="filterClasses"
                        :placeholder="getPlaceholder()"
                        class="input"
                        @blur="onBlurInput"
                    />
                    <div class="selected-tags-inside" v-if="filters.classList.length > 0">
                        <span v-for="(tag, index) in filters.classList" :key="index" class="tag-inside">
                            {{ tag }}
                            <span class="remove-tag-inside" @click="removeTag(index)">×</span>
                        </span>
                    </div>
                    <div v-if="showDropdown && filteredClasses.length > 0" class="dropdown">
                        <div
                            v-for="(cls, index) in filteredClasses"
                            :key="index"
                            class="dropdown-item"
                            @click="addTag(cls)"
                        >
                            {{ cls }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="filter-group-inline">
                <button @click="fetchStudents" class="btn primary">查询</button>
            </div>
        </div>

        <table class="student-table">
            <thead>
                <tr>
                    <th>学号</th>
                    <th>姓名</th>
                    <th>行政班</th>
                    <th>教学班</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in studentInfoList" :key="student.number">
                    <td>{{ student.number }}</td>
                    <td>{{ student.name }}</td>
                    <td>{{ student.adminClass }}</td>
                    <td>{{ student.teachClass }}</td>
                </tr>
            </tbody>
        </table>

        <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1" class="btn">上一页</button>
            <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="btn">下一页</button>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
    setup(props,{emit}) {
        const studentInfoList = ref([]);
        const classList = ref([]);
        const totalPages = ref(1);
        const currentPage = ref(1);
        const totalRecords = ref(0);
        const token = sessionStorage.getItem('token');
        const apiUrl = getCurrentInstance().appContext.config.globalProperties.$apiUrl;

        const filters = ref({
            stuName: '',
            number: '',
            classList: []
        });

        const classSearch = ref('');
        const showDropdown = ref(false);
        const filteredClasses = ref([]);

        const fetchStudents = async () => {
            const headers = { token };
            const requestData = {
                ...filters.value,
                pageIndex: currentPage.value,
                pageSize: 10
            };

            Object.keys(requestData).forEach(key => {
                if (requestData[key] === '' || (Array.isArray(requestData[key]) && requestData[key].length === 0)) {
                    delete requestData[key];
                }
            });

            try {
                const response = await axios.post(`${apiUrl}/admin/account/student-page`, requestData, { headers });

                if (response.data.code === 0) {
                    studentInfoList.value = response.data.data.studentInfoList;
                    classList.value = response.data.data.classList;
                    filteredClasses.value = classList.value;
                    totalPages.value = response.data.data.totalPages;
                    totalRecords.value = response.data.data.totalRecords;
                } else {
                    emit('trigger-error',response.data.message);
                }
            } catch (error) {
                emit('trigger-error','获取学生信息失败');
            }
        };

        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++;
                fetchStudents();
            }
        };

        const prevPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--;
                fetchStudents();
            }
        };

        const addTag = (tag) => {
            if (!filters.value.classList.includes(tag)) {
                filters.value.classList.push(tag);
            }
            classSearch.value = '';
            showDropdown.value = false;
        };

        const removeTag = (index) => {
            filters.value.classList.splice(index, 1);
        };

        const filterClasses = () => {
            if (classSearch.value.trim()) {
                filteredClasses.value = classList.value.filter(cls =>
                    cls.toLowerCase().includes(classSearch.value.toLowerCase())
                );
            } else {
                filteredClasses.value = classList.value;
            }
        };

        const onBlurInput = () => {
            setTimeout(() => {
                if (!filteredClasses.value.length) {
                    showDropdown.value = false;
                }
            }, 200);
        };

        const handleFocus = () => {
            showDropdown.value = true;
        };

        const getPlaceholder = () => {
            return filters.value.classList.length === 0? '选择教学班' : '';
        };

        onMounted(() => {
            fetchStudents();
        });

        return {
            studentInfoList,
            classList,
            totalPages,
            currentPage,
            totalRecords,
            filters,
            classSearch,
            showDropdown,
            filteredClasses,
            fetchStudents,
            nextPage,
            prevPage,
            addTag,
            removeTag,
            filterClasses,
            onBlurInput,
            handleFocus,
            getPlaceholder
        };
    }
};
</script>

<style scoped>
.student-management {
    font-family: 'Poppins', sans-serif;
    padding: 20px;
    background-color: #f7f9fc;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.filters {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    animation: fadeIn 1s ease-out;
    flex-wrap: wrap;
    min-width: 900px;
}

.filter-group-inline {
    display: flex;
    gap: 15px;
    align-items: center;
    flex: 1;
}

.input {
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    width: 100%;
    min-width: 150px;
    max-width: 220px;
    transition: all 0.3s ease;
    position: relative;
}

.input:focus {
    border-color: #007bff;
    outline: none;
}

.btn {
    padding: 10px 15px;
    font-size: 14px;
    border: none;
    border-radius: 6px;
    background-color: #ff6b6b;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    white-space: nowrap;
}

.btn.primary {
    background-color: #28a745;
}

.btn:hover {
    background-color: #0056b3;
    transform: scale(1.02);
}

.tag-select {
    position: relative;
    width: 100%;
    max-width: 220px;
}

.selected-tags-inside {
    position: absolute;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    pointer-events: none;
}

.tag-inside {
    background-color: #007bff;
    color: white;
    padding: 3px 6px;
    border-radius: 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    pointer-events: all;
}

.remove-tag-inside {
    margin-left: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 12px;
    color: #ff6b6b;
}

.dropdown {
    position: absolute;
    top: 32px;
    width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    max-height: 150px;
    overflow-y: auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    margin-top: 5px;
    transition: top 0.2s ease-in-out;
}

.dropdown-item {
    padding: 8px;
    cursor: pointer;
    background-color: #fff;
    transition: background-color 0.3s ease;
}

.dropdown-item:hover {
    background-color: #f0f0f0;
}

.student-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.student-table th,
.student-table td {
    padding: 12px 20px;
    text-align: left;
}

.student-table th {
    background-color: #f4f4f9;
    font-weight: bold;
}

.student-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-info {
    font-size: 14px;
}

.sort-icon {
    cursor: pointer;
    font-size: 12px;
}

.sort-icon.active {
    color: #007bff;
}
</style>