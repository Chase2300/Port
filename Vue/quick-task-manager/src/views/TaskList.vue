<template>
  <div class="task-list">
    <h1>Task List</h1>
    <form @submit.prevent="createOrUpdateTask" class="task-form">
      <label for="title">Title:</label>
      <input type="text" id="title" v-model="newTask.title" required>
      <label for="description">Description:</label>
      <textarea id="description" v-model="newTask.description"></textarea>
      <button type="submit" class="task-button">{{ editingTaskIndex !== null ? 'Update Task' : 'Create Task' }}</button>
    </form>
    <ul class="task-ul">
      <li v-for="(task, index) in tasks" :key="task.id" class="task-item">
        <h2>{{ task.title }}</h2>
        <p>{{ task.description }}</p>
        <button @click="editTask(index)" class="task-button">Edit</button>
        <button @click="deleteTask(index)" class="task-button">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>

import { mapState, mapActions } from "vuex";
export default {
  computed: {
    ...mapState(["tasks"]),
  },
  data() {
    return {
      newTask: {
        title: "",
        description: "",
      },
      editingTaskIndex: null,
    };
  },
  methods: {
    ...mapActions(["createTask", "updateTask", "deleteTask"]),
    createOrUpdateTask() {
      if (this.editingTaskIndex !== null) {
        this.updateTask();
      } else {
        this.createTask();
      }
    },
    createTask() {
      const newTask = {
        title: this.newTask.title,
        description: this.newTask.description,
      };
      this.$store.dispatch("createTask", newTask);
      this.newTask.title = "";
      this.newTask.description = "";
    },
    updateTask() {
      const task = this.tasks[this.editingTaskIndex];
      const updatedTask = {
        id: task.id,
        title: this.newTask.title,
        description: this.newTask.description,
      };
      this.$store.dispatch("updateTask", {
        index: this.editingTaskIndex,
        task: updatedTask,
      });
      this.editingTaskIndex = null;
      this.newTask.title = "";
      this.newTask.description = "";
    },
    editTask(index) {
      const task = this.tasks[index];
      this.editingTaskIndex = index;
      this.newTask.title = task.title;
      this.newTask.description = task.description;
    },
    deleteTask(index) {
      this.$store.dispatch("deleteTask", index);
    },
  },
};
</script>
<style src="../css/TaskList.css"></style>